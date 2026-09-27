'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth, useLanguage } from '@/contexts/app-context';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';

export default function LoginPage() {
  const { signIn, session, loading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && session) router.push('/admin');
  }, [session, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const { error } = await signIn(email, password);
    setSubmitting(false);
    if (error) {
      toast.error(error);
    } else {
      toast.success(t('admin.dashboard'));
      router.push('/admin');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111315] p-4 text-[#F5F7F8]">
      <Card className="w-full max-w-md border border-[#343A40] bg-[#191C1F] text-[#F5F7F8] rounded-2xl shadow-2xl">
        <CardHeader className="text-center space-y-4 pt-8">
          <div className="h-16 w-16 rounded-2xl bg-[#10B981]/15 border border-[#10B981]/30 mx-auto flex items-center justify-center text-[#10B981]">
            <Shield className="h-8 w-8 stroke-[1.8]" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-[#F5F7F8]">{t('admin.login')}</CardTitle>
            <CardDescription className="mt-2 text-[#A7ADB4]">{t('admin.dashboard')}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[#F5F7F8] mb-1.5 block">{t('admin.email')}</label>
              <div className="relative">
                <Mail className="absolute top-1/2 -translate-y-1/2 ltr:left-3 rtl:right-3 h-4 w-4 text-[#737A82] stroke-[1.8]" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="ltr:pl-10 rtl:pr-10"
                  placeholder="admin@example.com"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-[#F5F7F8] mb-1.5 block">{t('admin.password')}</label>
              <div className="relative">
                <Lock className="absolute top-1/2 -translate-y-1/2 ltr:left-3 rtl:right-3 h-4 w-4 text-[#737A82] stroke-[1.8]" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="ltr:pl-10 rtl:pr-10 pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 -translate-y-1/2 ltr:right-3 rtl:left-3 text-[#737A82] hover:text-[#F5F7F8] transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="h-4 w-4 stroke-[1.8]" /> : <Eye className="h-4 w-4 stroke-[1.8]" />}
                </button>
              </div>
            </div>
            <Button type="submit" disabled={submitting} className="w-full bg-[#10B981] hover:bg-[#22C55E] text-white shadow-sm font-semibold h-11 rounded-xl">
              {submitting ? t('common.loading') : t('admin.login')}
            </Button>

            <div className="text-center pt-2">
              <Link
                href="/forgot-password"
                className="text-sm text-[#10B981] hover:underline transition-colors"
              >
                {t('admin.forgotPassword')}
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
