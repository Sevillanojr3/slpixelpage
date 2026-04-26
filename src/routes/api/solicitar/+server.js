import { json } from '@sveltejs/kit';
import nodemailer from 'nodemailer';
import { env } from '$env/dynamic/private';

const STUDIO_EMAIL = 'info@slpixel.com';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: 'JSON inválido' }, { status: 400 });
  }

  const email = (body?.email || '').trim();
  const paquete = (body?.paquete || '').trim();
  const mensaje = (body?.mensaje || '').trim();

  if (!email || !paquete) {
    return json({ ok: false, error: 'Faltan datos requeridos' }, { status: 400 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return json({ ok: false, error: 'Email inválido' }, { status: 400 });
  }

  const host = env.EMAIL_HOST || 'smtp.gmail.com';
  const port = parseInt(env.EMAIL_PORT || '587', 10);
  const user = env.EMAIL_USER;
  const pass = env.EMAIL_PASS;

  // SMTP not configured — return a structured fallback so the UI can
  // offer a mailto link instead of silently failing.
  if (!user || !pass) {
    return json(
      {
        ok: false,
        error: 'El envío automático no está configurado en este momento.',
        fallback: buildFallback({ email, paquete, mensaje }),
      },
      { status: 503 },
    );
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    await transporter.sendMail({
      from: `SL Pixel Web <${user}>`,
      to: STUDIO_EMAIL,
      replyTo: email,
      subject: `Solicitud de fotos HD — ${paquete}`,
      text: buildPlainBody({ email, paquete, mensaje }),
      html: buildHtmlBody({ email, paquete, mensaje }),
    });

    return json({ ok: true });
  } catch (err) {
    console.error('[/api/solicitar] sendMail error:', err);
    return json(
      {
        ok: false,
        error: 'No se pudo enviar la solicitud. Probá de nuevo o escribinos directamente.',
        fallback: buildFallback({ email, paquete, mensaje }),
      },
      { status: 502 },
    );
  }
}

function buildFallback({ email, paquete, mensaje }) {
  return {
    mailto: STUDIO_EMAIL,
    subject: `Solicitud de fotos en alta resolución — ${paquete}`,
    body: buildPlainBody({ email, paquete, mensaje }),
  };
}

function buildPlainBody({ email, paquete, mensaje }) {
  const lines = [
    'Nueva solicitud de fotos en alta resolución',
    '',
    `Paquete: ${paquete}`,
    `Cliente: ${email}`,
    `Fecha:   ${new Date().toLocaleString('es-PA')}`,
  ];
  if (mensaje) {
    lines.push('', 'Mensaje:', mensaje);
  }
  lines.push('', '— SL Pixel Web');
  return lines.join('\n');
}

function buildHtmlBody({ email, paquete, mensaje }) {
  const safeMsg = mensaje
    ? `<tr><td class="label">Mensaje</td><td class="value">${escapeHtml(mensaje).replace(/\n/g, '<br>')}</td></tr>`
    : '';
  return `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; background:#f5f2ec; color:#0d0d0b; margin:0; padding:32px 16px; }
  .card { max-width: 560px; margin: 0 auto; background:#fff; border:1px solid #d6cfc3; }
  .head { background:#0d0d0b; color:#f5f2ec; padding:24px 28px; }
  .head h1 { margin:0; font-size:18px; letter-spacing:0.04em; font-weight:500; }
  table { width:100%; border-collapse:collapse; }
  td { padding:14px 28px; border-top:1px solid #ecE7DE; vertical-align:top; }
  .label { width:120px; font-size:11px; text-transform:uppercase; letter-spacing:0.18em; color:#7a756c; }
  .value { font-size:15px; color:#0d0d0b; }
  .foot { padding:18px 28px; font-size:12px; color:#7a756c; }
</style></head><body>
  <div class="card">
    <div class="head"><h1>Nueva solicitud de fotos HD</h1></div>
    <table>
      <tr><td class="label">Paquete</td><td class="value">${escapeHtml(paquete)}</td></tr>
      <tr><td class="label">Cliente</td><td class="value"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
      <tr><td class="label">Fecha</td><td class="value">${escapeHtml(new Date().toLocaleString('es-PA'))}</td></tr>
      ${safeMsg}
    </table>
    <div class="foot">SL Pixel — Estudio de Fotografía Editorial · Panamá</div>
  </div>
</body></html>`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
