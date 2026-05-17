import { redirect } from '@sveltejs/kit';
import { verifyResetToken, RESET_COOKIE } from '$lib/server/admin-auth.js';

export const prerender = false;
export const ssr = true;

const PUBLIC_PATHS = ['/admin/login', '/admin/forgot', '/admin/verify'];

export async function load({ locals, url, cookies }) {
  const isPublic = PUBLIC_PATHS.some((p) => url.pathname === p || url.pathname.startsWith(p + '/'));
  const isPasswordPage = url.pathname === '/admin/password' || url.pathname.startsWith('/admin/password/');
  const hasReset = Boolean(verifyResetToken(cookies.get(RESET_COOKIE)));

  if (!locals.admin && !isPublic) {
    // The /admin/password page is accessible while holding a valid reset token (post-MFA).
    if (!(isPasswordPage && hasReset)) {
      throw redirect(303, '/admin/login');
    }
  }
  if (locals.admin && isPublic) {
    throw redirect(303, '/admin/galerias');
  }
  return { admin: locals.admin };
}
