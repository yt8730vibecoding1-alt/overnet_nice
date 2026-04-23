'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function SessionGuard() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/login' || pathname === '/signup') return;

    const loginDate = localStorage.getItem('overnet_login_date');
    const today = new Date().toISOString().split('T')[0];

    if (loginDate && loginDate !== today) {
      const supabase = createClient();
      supabase.auth.signOut().then(() => {
        localStorage.removeItem('overnet_login_date');
        router.push('/login');
        router.refresh();
      });
      return;
    }

    const now = new Date();
    const midnight = new Date(now);
    midnight.setDate(midnight.getDate() + 1);
    midnight.setHours(0, 0, 0, 0);
    const msUntilMidnight = midnight.getTime() - now.getTime();

    const timer = setTimeout(() => {
      const supabase = createClient();
      supabase.auth.signOut().then(() => {
        localStorage.removeItem('overnet_login_date');
        router.push('/login');
        router.refresh();
      });
    }, msUntilMidnight);

    return () => clearTimeout(timer);
  }, [router, pathname]);

  return null;
}
