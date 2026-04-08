'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

export default function SignupPage() {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
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

    if (password.length < 6) {
      setError('비밀번호는 6자리 이상이어야 합니다.');
      return;
    }

    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email: `${idTrimmed}@overnet.com`,
      password,
    });

    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        setError('이미 등록된 사번입니다.');
      } else {
        setError('가입에 실패했습니다. 다시 시도해주세요.');
      }
      setLoading(false);
      return;
    }

    toast.success('가입 완료! 로그인해주세요.');
    router.push('/login');
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
          <h1 className="text-2xl font-bold text-primary-dark">회원가입</h1>
          <p className="mt-1 text-sm text-gray-500">오버넷 건물정보 관리 시스템</p>
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
                minLength={6}
                autoComplete="new-password"
                className={inputClass}
                placeholder="비밀번호 (6자리 이상)"
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

          <div>
            <label htmlFor="passwordConfirm" className="mb-1 block text-sm font-medium text-gray-700">
              비밀번호 확인
            </label>
            <input
              id="passwordConfirm"
              type={showPassword ? 'text' : 'password'}
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              className={inputClass}
              placeholder="비밀번호를 다시 입력하세요"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary py-3 text-base font-semibold text-white transition-colors hover:bg-primary-light disabled:opacity-50"
          >
            {loading ? '가입 중...' : '가입하기'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          이미 계정이 있나요?{' '}
          <Link href="/login" className="font-medium text-primary">
            로그인
          </Link>
        </p>
      </div>
    </div>
  );
}
