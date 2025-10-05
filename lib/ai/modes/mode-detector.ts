/**
 * Hook for detecting current chat mode based on auth state and pathname
 */

'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import { useMemo } from 'react';
import { ChatMode, getModeForUser } from './mode-config';

export function useChatMode(): ChatMode {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();

  const mode = useMemo(() => {
    if (isLoading) return 'sales'; // Default while loading

    return getModeForUser(!!user, pathname);
  }, [user, isLoading, pathname]);

  return mode;
}
