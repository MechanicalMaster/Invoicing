import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { createClient } from '@supabase/supabase-js';
import { generateRequestId, logInfo, logWarn, logError } from '@/lib/logger';
import { auditFile } from '@/lib/audit-logger';

// Handle file upload with validation
export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  const route = '/api/storage/upload';
  let userId: string | null = null;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const bucket = formData.get('bucket') as string;
    const path = formData.get('path') as string;

    if (!file || !bucket || !path) {
      logWarn('file_upload_missing_params', {
        requestId,
        userId,
        route,
        entity: 'file',
        metadata: { bucket, path, hasFile: !!file },
      });
      return NextResponse.json(
        { error: 'File, bucket, and path are required' },
        { status: 400 }
      );
    }

    // Get the authenticated user from the request
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      logWarn('file_upload_no_auth', {
        requestId,
        userId,
        route,
        entity: 'file',
        metadata: { bucket, path },
      });
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    // Create a client with the user's token to verify authentication
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const token = authHeader.replace('Bearer ', '');

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    // Verify user is authenticated
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !user) {
      logWarn('file_upload_invalid_token', {
        requestId,
        userId,
        route,
        entity: 'file',
        metadata: { error: userError?.message },
      });
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    userId = user.id;

    // Verify the path belongs to the user
    if (!path.startsWith(`${user.id}/`)) {
      logWarn('file_upload_forbidden_path', {
        requestId,
        userId,
        route,
        entity: 'file',
        metadata: { bucket, path, reason: 'Path does not belong to user' },
      });
      await auditFile('file_upload', userId, `${bucket}/${path}`, {
        fileName: file.name,
        size: file.size,
        type: file.type,
        reason: 'Forbidden path',
      }, false, requestId, route);
      return NextResponse.json(
        { error: 'Forbidden: You can only upload to your own directory' },
        { status: 403 }
      );
    }

    // Server-side file validation
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_MIME_TYPES = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
    ];

    if (file.size > MAX_FILE_SIZE) {
      logWarn('file_upload_too_large', {
        requestId,
        userId,
        route,
        entity: 'file',
        metadata: { fileName: file.name, size: file.size, maxSize: MAX_FILE_SIZE },
      });
      await auditFile('file_upload', userId, `${bucket}/${path}`, {
        fileName: file.name,
        size: file.size,
        type: file.type,
        reason: 'File too large',
      }, false, requestId, route);
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      logWarn('file_upload_invalid_type', {
        requestId,
        userId,
        route,
        entity: 'file',
        metadata: { fileName: file.name, type: file.type, allowedTypes: ALLOWED_MIME_TYPES },
      });
      await auditFile('file_upload', userId, `${bucket}/${path}`, {
        fileName: file.name,
        size: file.size,
        type: file.type,
        reason: 'Invalid file type',
      }, false, requestId, route);
      return NextResponse.json(
        { error: 'Invalid file type. Only images and PDFs are allowed.' },
        { status: 400 }
      );
    }

    // Log upload attempt
    logInfo('file_upload_started', {
      requestId,
      userId,
      route,
      entity: 'file',
      entityId: `${bucket}/${path}`,
      metadata: { fileName: file.name, size: file.size, type: file.type },
    });

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload file using service role client
    const { data, error } = await supabaseServer.storage
      .from(bucket)
      .upload(path, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      logError('file_upload_failed', {
        requestId,
        userId,
        route,
        entity: 'file',
        entityId: `${bucket}/${path}`,
        metadata: { fileName: file.name, size: file.size, type: file.type },
        error: error.message,
      });
      await auditFile('file_upload', userId, `${bucket}/${path}`, {
        fileName: file.name,
        size: file.size,
        type: file.type,
        error: error.message,
      }, false, requestId, route);
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      );
    }

    // Generate a signed URL for the uploaded file (valid for 1 hour)
    const { data: signedUrlData, error: signedUrlError } = await supabaseServer.storage
      .from(bucket)
      .createSignedUrl(path, 3600);

    if (signedUrlError) {
      logError('file_upload_signed_url_failed', {
        requestId,
        userId,
        route,
        entity: 'file',
        entityId: `${bucket}/${path}`,
        metadata: { fileName: file.name },
        error: signedUrlError.message,
      });
      return NextResponse.json(
        { error: 'File uploaded but failed to create signed URL' },
        { status: 500 }
      );
    }

    // Log successful upload
    logInfo('file_upload_success', {
      requestId,
      userId,
      route,
      entity: 'file',
      entityId: `${bucket}/${path}`,
      metadata: { fileName: file.name, size: file.size, type: file.type, path: data.path },
    });

    // Audit successful upload
    await auditFile('file_upload', userId, `${bucket}/${path}`, {
      fileName: file.name,
      size: file.size,
      type: file.type,
      path: data.path,
    }, true, requestId, route);

    return NextResponse.json({
      path: data.path,
      signedUrl: signedUrlData.signedUrl,
    });
  } catch (error) {
    logError('file_upload_unhandled_error', {
      requestId,
      userId,
      route,
      entity: 'file',
      error: error instanceof Error ? error : String(error),
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

