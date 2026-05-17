import { fail, redirect } from '@sveltejs/kit';
import {
  verifyResetToken,
  clearResetCookie,
  createSession,
  setSessionCookie,
  adminEmail,
  RESET_COOKIE,
} from '$lib/server/admin-auth.js';
import { setPassword, verifyPassword, hasPassword } from '$lib/server/admin-store.js';

export const load = async ({ cookies, locals }) => {
  const resetToken = cookies.get(RESET_COOKIE);
  const reset = verifyResetToken(resetToken);
  if (!locals.admin && !reset) {
    throw redirect(303, '/admin/login');
  }
  return {
    mode: locals.admin ? 'change' : 'reset',
    hasPassword: await hasPassword(),
  };
};

export const actions = {
  default: async ({ request, cookies, locals }) => {
    const form = await request.formData();
    const password = (form.get('password') || '').toString();
    const confirm = (form.get('confirm') || '').toString();
    const current = (form.get('current') || '').toString();

    if (password.length < 8) {
      return fail(400, { error: 'La contraseña debe tener al menos 8 caracteres.' });
    }
    if (password !== confirm) {
      return fail(400, { error: 'Las contraseñas no coinciden.' });
    }

    const resetToken = cookies.get(RESET_COOKIE);
    const reset = verifyResetToken(resetToken);
    const isReset = Boolean(reset);

    if (!isReset && !locals.admin) {
      throw redirect(303, '/admin/login');
    }

    if (!isReset && locals.admin && (await hasPassword())) {
      // logged-in admin changing password — require current
      if (!current) return fail(400, { error: 'Ingresá tu contraseña actual.' });
      const ok = await verifyPassword(current);
      if (!ok) return fail(401, { error: 'La contraseña actual no es correcta.' });
    }

    try {
      await setPassword(password);
    } catch (e) {
      return fail(400, { error: e.message });
    }

    if (isReset) {
      clearResetCookie(cookies);
      // log the admin in with a fresh session
      setSessionCookie(cookies, createSession(adminEmail()));
    }

    throw redirect(303, '/admin/galerias?passwordSaved=1');
  },
};
