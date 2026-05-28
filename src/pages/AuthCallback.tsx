import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LoaderCircle, ShieldCheck, TriangleAlert } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('正在完成登录，请稍候...');

  useEffect(() => {
    async function completeSignIn() {
      if (!supabase) {
        setStatus('error');
        setMessage('Supabase 未配置，无法完成登录。');
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');

      if (window.location.hash.includes('access_token=')) {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          setStatus('error');
          setMessage(error.message);
          return;
        }
        if (data.session) {
          setStatus('success');
          setMessage('登录成功，正在返回首页...');
          window.setTimeout(() => navigate('/', { replace: true }), 800);
          return;
        }
      }

      if (!code) {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          setStatus('success');
          setMessage('登录成功，正在返回首页...');
          window.setTimeout(() => navigate('/', { replace: true }), 800);
          return;
        }
        setStatus('error');
        setMessage('登录链接缺少 code，可能已过期或 Redirect URL 未配置正确。');
        return;
      }

      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        setStatus('error');
        setMessage(error.message);
        return;
      }

      setStatus('success');
      setMessage('登录成功，正在返回首页...');
      window.setTimeout(() => navigate('/', { replace: true }), 800);
    }

    void completeSignIn();
  }, [navigate]);

  return (
    <div className="mx-auto max-w-xl">
      <section className="score-card p-8 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-lg bg-fifaBlue text-white">
          {status === 'loading' ? <LoaderCircle className="h-8 w-8 animate-spin" /> : null}
          {status === 'success' ? <ShieldCheck className="h-8 w-8 text-sun" /> : null}
          {status === 'error' ? <TriangleAlert className="h-8 w-8 text-red" /> : null}
        </div>
        <h1 className="mt-5 text-3xl font-black text-ink">
          {status === 'loading' ? '正在登录' : status === 'success' ? '登录成功' : '登录失败'}
        </h1>
        <p className="mt-3 leading-7 text-ink/65">{message}</p>
        {status === 'error' ? (
          <Link to="/" className="angled-button mt-6 inline-flex bg-sun px-5 py-3 font-black text-night">
            返回首页重新登录
          </Link>
        ) : null}
      </section>
    </div>
  );
}
