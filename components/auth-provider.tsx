'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    // Ensure store is hydrated from localStorage
    const unsubscribe = useAuthStore.subscribe(
      (state) => state,
      () => {
        setMounted(true);
      },
      {
        equalityFn: () => false,
      }
    );
    
    // Mark as mounted after a micro task to ensure hydration has started
    setTimeout(() => {
      setMounted(true);
    }, 0);

    return () => unsubscribe?.();
  }, []);

  // Only render children after component is mounted on client
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return <>{children}</>;
}
