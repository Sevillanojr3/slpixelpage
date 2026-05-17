import { fail, redirect } from '@sveltejs/kit';
import { createSession, setSessionCookie, adminEmail } from '$lib/server/admin-auth.js';
import { hasPassword, verifyPassword } from '$lib/server/admin-store.js';

export const load = async () => {
  return {
    hasPassword: await hasPassword(),
    adminEmail: adminEmail(),
  };
};

export const actions = {
  default: async ({ request, cookies }) => {
    if (!(await hasPassword())) {
      // No password set yet — push the user through the code path so they can set one.
      throw redirect(303, '/admin/forgot?setup=1');
    }
    const form = await request.formData();
    const password = (form.get('password') || '').toString();
    if (!password) return fail(400, { error: 'Ingresá tu contraseña.' });
    const ok = await verifyPassword(password);
    if (!ok) return fail(401, { error: 'Contraseña incorrecta.' });
    const token = createSession(adminEmail());
    setSessionCookie(cookies, token);
    throw redirect(303, '/admin/galerias');
  },
};
