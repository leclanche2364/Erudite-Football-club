import { createServerClient, type CookieMethodsServer } from '@supabase/ssr';
import type { AstroCookies } from 'astro';

export function supabaseForRequest(request: Request, cookies: AstroCookies) {
  const url = import.meta.env.PUBLIC_SUPABASE_URL;
  const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  const cookieHeader = request.headers.get('cookie') || '';
  const cookieMethods: CookieMethodsServer = {
    getAll: () => cookieHeader.split(';').filter(Boolean).map((part) => {
      const index = part.indexOf('=');
      return { name: part.slice(0, index).trim(), value: part.slice(index + 1).trim() };
    }),
    setAll: (values) => values.forEach(({ name, value, options }) => cookies.set(name, value, options as Parameters<typeof cookies.set>[2])),
  };
  return createServerClient(url, key, {
    cookies: cookieMethods,
  });
}
