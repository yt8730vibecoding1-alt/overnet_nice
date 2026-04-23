'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const idTrimmed = employeeId.trim();
    if (!/^\d{4,10}$/.test(idTrimmed)) {
      setError('사번은 4~10자리 숫자입니다.');
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: `${idTrimmed}@overnet.com`,
      password,
    });

    if (authError) {
      setError('사번 또는 비밀번호가 올바르지 않습니다.');
      setLoading(false);
      return;
    }

    localStorage.setItem('overnet_login_date', new Date().toISOString().split('T')[0]);
    router.push('/');
    router.refresh();
  };

  const inputClass = 'w-full rounded-lg border border-gray-300 px-4 py-3 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none';

  return (
    <div className="flex min-h-full items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* 로고 & 브랜드 */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
            <span className="text-2xl font-black tracking-tight text-white">O</span>
          </div>
          <h1 className="text-2xl font-bold text-primary-dark">오버넷</h1>
          <p className="mt-1 text-sm text-gray-500">건물정보 관리 시스템</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="employeeId" className="mb-1 block text-sm font-medium text-gray-700">
              사번
            </label>
            <input
              id="employeeId"
              type="text"
              inputMode="numeric"
              pattern="\d*"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value.replace(/\D/g, ''))}
              required
              maxLength={10}
              autoComplete="username"
              className={inputClass}
              placeholder="사번을 입력하세요 (숫자)"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
              비밀번호
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className={inputClass}
                placeholder="비밀번호를 입력하세요"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center"
              >
                {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary py-3 text-base font-semibold text-white transition-colors hover:bg-primary-light disabled:opacity-50"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          계정이 없나요?{' '}
          <Link href="/signup" className="font-medium text-primary">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
}
