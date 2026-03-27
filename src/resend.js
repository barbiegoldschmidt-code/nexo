// ─── Resend Email Service ───
// Reemplazá re_123 con tu API key real de Resend
const RESEND_API_KEY = "re_123";

export const enviarEmailBienvenidaPro = async (nombre, email) => {
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({
        from: "Nexo <onboarding@resend.dev>",
        to: [email],
        subject: "¡Bienvenido a Nexo! Tu registro fue recibido",
        html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#060d1a;color:#fff;padding:40px;border-radius:12px;">
          <h1 style="font-size:32px;font-weight:300;letter-spacing:4px;text-align:center;">NEX<span style="color:#4a8fd4;">O</span></h1>
          <h2 style="color:#6cb3f5;font-weight:400;margin-top:24px;">Hola ${nombre}! 👋</h2>
          <p style="color:#b0c4d8;line-height:1.7;">Tu registro como profesional fue recibido. Nuestro equipo lo está revisando y te notificaremos cuando tu cuenta sea activada (menos de 24hs).</p>
          <div style="background:rgba(74,143,212,0.1);border:1px solid rgba(74,143,212,0.3);border-radius:10px;padding:20px;margin:24px 0;">
            <p style="color:#6cb3f5;font-weight:600;margin-bottom:8px;">¿Qué sigue?</p>
            <p style="color:#b0c4d8;font-size:14px;line-height:1.6;">1. Revisamos tu perfil y documentación<br/>2. Activamos tu cuenta<br/>3. Empezás a recibir pedidos</p>
          </div>
          <p style="color:#8a9bb0;font-size:12px;text-align:center;">© 2025 Nexo · Argentina</p>
        </div>`,
      }),
    });
  } catch(e) { console.error("Error email bienvenida pro:", e); }
};

export const enviarEmailAprobacion = async (nombre, email) => {
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({
        from: "Nexo <onboarding@resend.dev>",
        to: [email],
        subject: "✅ Tu perfil fue aprobado en Nexo",
        html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#060d1a;color:#fff;padding:40px;border-radius:12px;">
          <h1 style="font-size:32px;font-weight:300;letter-spacing:4px;text-align:center;">NEX<span style="color:#4a8fd4;">O</span></h1>
          <div style="text-align:center;margin:24px 0;font-size:52px;">🎉</div>
          <h2 style="color:#4ade80;font-weight:400;text-align:center;">¡Tu perfil fue aprobado!</h2>
          <p style="color:#b0c4d8;line-height:1.7;text-align:center;">Hola <strong style="color:#fff;">${nombre}</strong>! Tu cuenta está activa.</p>
          <div style="background:rgba(74,212,120,0.1);border:1px solid rgba(74,212,120,0.3);border-radius:10px;padding:20px;margin:24px 0;">
            <p style="color:#4ade80;font-weight:600;margin-bottom:8px;">Ya podés:</p>
            <p style="color:#b0c4d8;font-size:14px;line-height:1.6;">✓ Ver pedidos de clientes<br/>✓ Cotizar y contactar clientes<br/>✓ Recibir notificaciones</p>
          </div>
          <div style="text-align:center;margin:24px 0;">
            <a href="https://nexo-iota-three.vercel.app" style="background:linear-gradient(135deg,#4a8fd4,#1e4d82);color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:600;">Entrar a Nexo →</a>
          </div>
          <p style="color:#8a9bb0;font-size:12px;text-align:center;">© 2025 Nexo · Argentina</p>
        </div>`,
      }),
    });
  } catch(e) { console.error("Error email aprobacion:", e); }
};

export const enviarEmailBienvenidaCliente = async (nombre, email) => {
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({
        from: "Nexo <onboarding@resend.dev>",
        to: [email],
        subject: "¡Bienvenido a Nexo!",
        html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#060d1a;color:#fff;padding:40px;border-radius:12px;">
          <h1 style="font-size:32px;font-weight:300;letter-spacing:4px;text-align:center;">NEX<span style="color:#4a8fd4;">O</span></h1>
          <h2 style="color:#6cb3f5;font-weight:400;margin-top:24px;">Hola ${nombre}! 👋</h2>
          <p style="color:#b0c4d8;line-height:1.7;">Ya estás registrado en Nexo. Publicá pedidos y recibí cotizaciones de profesionales verificados. Todo gratis para vos.</p>
          <div style="background:rgba(74,143,212,0.1);border:1px solid rgba(74,143,212,0.3);border-radius:10px;padding:20px;margin:24px 0;">
            <p style="color:#6cb3f5;font-weight:600;margin-bottom:8px;">¿Cómo funciona?</p>
            <p style="color:#b0c4d8;font-size:14px;line-height:1.6;">1. Publicás lo que necesitás<br/>2. Los profesionales te cotizan<br/>3. Elegís el mejor y coordinan por chat</p>
          </div>
          <div style="text-align:center;margin:24px 0;">
            <a href="https://nexo-iota-three.vercel.app" style="background:linear-gradient(135deg,#4a8fd4,#1e4d82);color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:600;">Ir a Nexo →</a>
          </div>
          <p style="color:#8a9bb0;font-size:12px;text-align:center;">© 2025 Nexo · Argentina</p>
        </div>`,
      }),
    });
  } catch(e) { console.error("Error email cliente:", e); }
};
