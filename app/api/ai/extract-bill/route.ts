/**
 * Bill Extraction API Route
 * Extracts purchase invoice data from uploaded images using OpenAI Vision
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { generateRequestId, logInfo, logError, logWarn } from '@/lib/logger';
import { auditSuccess, auditFailure } from '@/lib/audit-logger';
import { extractBillFromImage } from '@/lib/ai/actions/purchase-bill/bill-extractor';
import { BillExtractionDataSchema } from '@/lib/ai/actions/purchase-bill/bill-action-schema';

export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds timeout for image processing

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  const route = '/api/ai/extract-bill';
  let userId: string | null = null;

  try {
    // Authenticate user
    const authHeader = request.headers.get('authorization');
    const { data: { user } } = await supabaseServer.auth.getUser(
      authHeader?.replace('Bearer ', '') || ''
    );

    if (!user) {
      logWarn('bill_extraction_unauthorized', {
        requestId,
        userId,
        route,
        entity: 'bill_extraction',
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    userId = user.id;

    // Parse form data
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;

    if (!imageFile) {
      logWarn('bill_extraction_missing_image', {
        requestId,
        userId,
        route,
        entity: 'bill_extraction',
      });
      return NextResponse.json(
        { error: 'Image file is required' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (imageFile.size > MAX_FILE_SIZE) {
      logWarn('bill_extraction_file_too_large', {
        requestId,
        userId,
        route,
        entity: 'bill_extraction',
        metadata: { fileSize: imageFile.size, maxSize: MAX_FILE_SIZE }
      });
      return NextResponse.json(
        { error: 'Image file too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // Validate file type
    const ALLOWED_MIME_TYPES = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'application/pdf',
    ];

    if (!ALLOWED_MIME_TYPES.includes(imageFile.type)) {
      logWarn('bill_extraction_invalid_file_type', {
        requestId,
        userId,
        route,
        entity: 'bill_extraction',
        metadata: { fileType: imageFile.type }
      });
      return NextResponse.json(
        { error: 'Invalid file type. Only JPG, PNG, WebP, and PDF are allowed.' },
        { status: 400 }
      );
    }

    logInfo('bill_extraction_started', {
      requestId,
      userId,
      route,
      entity: 'bill_extraction',
      metadata: {
        fileName: imageFile.name,
        fileSize: imageFile.size,
        fileType: imageFile.type
      }
    });

    // Convert image to base64
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');

    // Extract bill data using OpenAI Vision
    const extractedData = await extractBillFromImage(base64Image, imageFile.type);

    // Validate extracted data
    const validationResult = BillExtractionDataSchema.safeParse(extractedData);

    if (!validationResult.success) {
      // Check if the errors suggest this isn't a valid bill
      const errors = validationResult.error.errors;
      const hasInvoiceNumberError = errors.some(e => e.path.includes('invoiceNumber'));
      const hasAmountError = errors.some(e => e.path.includes('amount'));
      const hasDateError = errors.some(e => e.path.includes('invoiceDate'));
      const hasMajorErrors = hasInvoiceNumberError || hasAmountError || hasDateError;

      logError('bill_extraction_validation_failed', {
        requestId,
        userId,
        route,
        entity: 'bill_extraction',
        error: validationResult.error.message,
        metadata: { errors, hasMajorErrors }
      });

      await auditFailure(
        userId,
        'bill_extraction',
        'bill_extraction',
        null,
        {
          fileName: imageFile.name,
          validationErrors: errors,
        },
        requestId,
        route
      );

      // Return user-friendly error message
      const userMessage = hasMajorErrors
        ? 'This image does not appear to be a valid purchase bill or invoice. Please upload a clear photo of an invoice that includes: invoice number, date, and amount.'
        : 'Could not extract all required information from the bill. Please ensure the image is clear and contains all invoice details.';

      return NextResponse.json(
        {
          error: userMessage,
          code: 'INVALID_BILL_IMAGE',
          details: errors
        },
        { status: 422 }
      );
    }

    // Log successful extraction
    logInfo('bill_extraction_success', {
      requestId,
      userId,
      route,
      entity: 'bill_extraction',
      metadata: {
        fileName: imageFile.name,
        supplierName: extractedData.supplier.name,
        invoiceNumber: extractedData.invoiceNumber,
        amount: extractedData.amount,
        confidence: extractedData.confidence,
        detectedLanguage: extractedData.detectedLanguage
      }
    });

    await auditSuccess(
      userId,
      'bill_extraction',
      'bill_extraction',
      null,
      {
        fileName: imageFile.name,
        supplierName: extractedData.supplier.name,
        invoiceNumber: extractedData.invoiceNumber,
        confidence: extractedData.confidence,
      },
      requestId,
      route
    );

    return NextResponse.json({
      success: true,
      data: extractedData,
    });

  } catch (error: any) {
    logError('bill_extraction_failed', {
      requestId,
      userId,
      route,
      entity: 'bill_extraction',
      error: error.message || String(error)
    });

    await auditFailure(
      userId || 'unknown',
      'bill_extraction',
      'bill_extraction',
      null,
      {
        error: error.message || String(error)
      },
      requestId,
      route
    );

    return NextResponse.json(
      { error: error.message || 'Bill extraction failed' },
      { status: 500 }
    );
  }
}
