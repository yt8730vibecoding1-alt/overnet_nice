'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    localStorage.removeItem('overnet_login_date');
    router.push('/login');
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className="flex h-11 w-11 items-center justify-center rounded-lg text-gray-400 transition-colors active:bg-gray-800"
      aria-label="로그아웃"
    >
      <LogOut className="h-5 w-5" />
    </button>
  );
}
