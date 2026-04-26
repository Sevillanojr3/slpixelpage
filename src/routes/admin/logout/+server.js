import { redirect } from '@sveltejs/kit';
import { clearSessionCookie } from '$lib/server/admin-auth.js';

export const POST = async ({ cookies }) => {
  clearSessionCookie(cookies);
  throw redirect(303, '/admin/login');
};
