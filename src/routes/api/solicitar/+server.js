import { json } from '@sveltejs/kit';
import nodemailer from 'nodemailer';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
  try {
    const { email, paquete } = await request.json();
    
    // Validar datos
    if (!email || !paquete) {
      return json({ ok: false, error: 'Faltan datos requeridos' }, { status: 400 });
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return json({ ok: false, error: 'Email inválido' }, { status: 400 });
    }
    
    // Configurar transporter de nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_PORT === '465',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    
    // Configurar el email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'slpixelstudio@gmail.com',
      subject: `Nueva Solicitud de Fotos - ${paquete}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: #111;
              color: #fff;
              padding: 30px;
              text-align: center;
            }
            .content {
              background: #f5f5f5;
              padding: 30px;
              margin: 20px 0;
            }
            .info-row {
              margin: 15px 0;
              padding: 15px;
              background: #fff;
              border-left: 4px solid #111;
            }
            .label {
              font-weight: 600;
              color: #666;
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .value {
              font-size: 18px;
              color: #111;
              margin-top: 5px;
            }
            .footer {
              text-align: center;
              color: #888;
              font-size: 12px;
              padding: 20px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Nueva Solicitud de Fotos</h1>
          </div>
          
          <div class="content">
            <div class="info-row">
              <div class="label">Paquete Solicitado</div>
              <div class="value">${paquete}</div>
            </div>
            
            <div class="info-row">
              <div class="label">Email del Cliente</div>
              <div class="value">${email}</div>
            </div>
            
            <div class="info-row">
              <div class="label">Fecha y Hora</div>
              <div class="value">${new Date().toLocaleString('es-ES', {
                dateStyle: 'full',
                timeStyle: 'short'
              })}</div>
            </div>
          </div>
          
          <div class="footer">
            <p>Este correo fue enviado automáticamente desde el sitio web de SL Pixel</p>
            <p>&copy; ${new Date().getFullYear()} SL Pixel - Fotografía Creativa</p>
          </div>
        </body>
        </html>
      `,
      text: `
        Nueva Solicitud de Fotos
        
        Paquete: ${paquete}
        Email del Cliente: ${email}
        Fecha: ${new Date().toLocaleString('es-ES')}
        
        ---
        SL Pixel - Fotografía Creativa
      `
    };
    
    // Enviar el email
    await transporter.sendMail(mailOptions);
    
    return json({ ok: true, message: 'Solicitud enviada correctamente' });
    
  } catch (error) {
    console.error('Error al enviar correo:', error);
    return json(
      { ok: false, error: 'Error al enviar la solicitud. Intenta nuevamente.' },
      { status: 500 }
    );
  }
}

