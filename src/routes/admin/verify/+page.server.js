import { fail, redirect } from '@sveltejs/kit';
import { verifyCode, createSession, setSessionCookie, adminEmail } from '$lib/server/admin-auth.js';

export const actions = {
  default: async ({ request, cookies }) => {
    const form = await request.formData();
    // Strip non-digits so spaces/hyphens from email clients don't break the match.
    const code = (form.get('code') || '').toString().replace(/\D/g, '');
    if (!/^\d{6}$/.test(code)) {
      return fail(400, { error: 'Ingresá el código de 6 dígitos.' });
    }
    const email = adminEmail();
    if (!verifyCode(email, code)) {
      return fail(401, { error: 'Código inválido o vencido.' });
    }
    const token = createSession(email);
    setSessionCookie(cookies, token);
    throw redirect(303, '/admin/galerias');
  },
};
