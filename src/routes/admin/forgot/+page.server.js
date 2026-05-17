import { fail, redirect } from '@sveltejs/kit';
import { issueCode, adminEmail } from '$lib/server/admin-auth.js';
import { sendMail } from '$lib/server/email.js';

export const load = async ({ url }) => {
  return { setup: url.searchParams.get('setup') === '1' };
};

export const actions = {
  default: async ({ request }) => {
    const form = await request.formData();
    const submittedEmail = (form.get('email') || '').toString().trim().toLowerCase();
    const target = adminEmail();
    if (submittedEmail && submittedEmail !== target.toLowerCase()) {
      return fail(403, { error: 'Correo no autorizado.' });
    }
    let code;
    try {
      code = issueCode(target);
    } catch (e) {
      return fail(429, { error: e.message });
    }
    try {
      await sendMail({
        to: target,
        subject: `Código de verificación · SL Pixel Admin · ${code}`,
        text: `Tu código de verificación para cambiar la contraseña del panel admin es: ${code}\n\nVence en 10 minutos. Si no fuiste vos, ignorá este correo.`,
        html: `<div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif;padding:24px;background:#f5f2ec;color:#0d0d0b">
          <h2 style="font-weight:500;margin:0 0 1rem">Código de verificación · SL Pixel Admin</h2>
          <p style="margin:0 0 1.5rem">Usá este código para cambiar la contraseña del panel. Vence en 10 minutos.</p>
          <div style="font-family:Menlo,Monaco,monospace;font-size:32px;letter-spacing:0.4em;background:#fff;padding:1.25rem;text-align:center;border:1px solid #d6cfc3">${code}</div>
          <p style="margin:1.5rem 0 0;color:#7a756c;font-size:13px">Si no fuiste vos, ignorá este correo.</p>
        </div>`,
      });
    } catch (e) {
      console.error('[admin/forgot] sendMail failed:', e.message);
      return fail(502, { error: 'No pudimos enviar el correo. Probá de nuevo.' });
    }
    throw redirect(303, '/admin/verify');
  },
};
