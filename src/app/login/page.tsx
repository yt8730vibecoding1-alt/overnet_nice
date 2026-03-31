'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Radio } from 'lucide-react';
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

  return (
    <div className="flex min-h-full items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-900">
            <Radio className="h-6 w-6 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900">건물정보 관리</h1>
            <p className="mt-0.5 text-xs tracking-widest text-gray-400">OVERNET</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="employeeId" className="mb-1 block text-sm font-medium text-gray-700">
              사번
            </label>
            <input
              id="employeeId"
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value.replace(/\D/g, ''))}
              required
              autoComplete="username"
              className="w-full rounded-xl border border-gray-300 px-4 py-3.5 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
              placeholder="사번을 입력하세요"
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
                className="w-full rounded-xl border border-gray-300 px-4 py-3.5 pr-14 text-base focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                placeholder="비밀번호를 입력하세요"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-1.5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-gray-400"
                aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gray-900 py-4 text-base font-semibold text-white transition-colors active:bg-gray-800 disabled:opacity-50"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  );
}
