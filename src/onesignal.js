// ─── OneSignal Push Notifications ───
const ONESIGNAL_APP_ID = "878c9c0f-7ba1-4fc3-9b34-b2a5252d06fa";
const ONESIGNAL_API_KEY = "os_v2_app_q6gjyd33ufh4hgzuwkssklig7ltscxaedcke7zmxsqauijpyozsmkwhywlfvva3t7qgs6vubxlpes5rczolnczvx5twmer3cxp3ifdy";

// Notificar a todos los profesionales cuando se publica un pedido
export const notificarNuevoPedido = async (oficio, zona, urgente) => {
  try {
    await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Key ${ONESIGNAL_API_KEY}`,
      },
      body: JSON.stringify({
        app_id: ONESIGNAL_APP_ID,
        included_segments: ["All"],
        headings: { es: urgente ? "🔴 Pedido URGENTE en Nexo" : "📋 Nuevo pedido en Nexo" },
        contents: { es: `${oficio} en ${zona}. ¡Entrá a cotizar!` },
        url: "https://nexo-iota-three.vercel.app",
        chrome_web_icon: "https://nexo-iota-three.vercel.app/favicon.svg",
      }),
    });
  } catch(e) {
    console.error("Error enviando notificación:", e);
  }
};
