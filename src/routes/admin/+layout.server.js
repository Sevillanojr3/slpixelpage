import { redirect } from '@sveltejs/kit';

export const prerender = false;
export const ssr = true;

const PUBLIC_PATHS = ['/admin/login', '/admin/verify'];

export async function load({ locals, url }) {
  const isPublic = PUBLIC_PATHS.some((p) => url.pathname === p || url.pathname.startsWith(p + '/'));
  if (!locals.admin && !isPublic) {
    throw redirect(303, '/admin/login');
  }
  if (locals.admin && isPublic) {
    throw redirect(303, '/admin/galerias');
  }
  return { admin: locals.admin };
}
