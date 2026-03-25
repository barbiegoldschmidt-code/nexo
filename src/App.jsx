import { useState, useRef, useEffect } from "react";
import { supabase } from './supabase';

const C = {
  bg:          "#060d1a",
  bgCard:      "#0d1f35",
  bgCardHover: "#102540",
  nav:         "rgba(6,13,26,0.92)",
  blue:        "#4a8fd4",
  blueLight:   "#6cb3f5",
  blueDark:    "#1a3a5c",
  blueBtn:     "#1e4d82",
  white:       "#ffffff",
  gray:        "#8a9bb0",
  grayLight:   "#b0c4d8",
  border:      "rgba(74,143,212,0.15)",
  green:       "#4ade80",
  red:         "#f87171",
  yellow:      "#fbbf24",
};

const F = {
  serif: "'Playfair Display', Georgia, serif",
  sans:  "'DM Sans', 'Segoe UI', sans-serif",
};

const GS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@200;300;400;500;600&display=swap');
  *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
  html, body { background: #060d1a; color: #ffffff; font-family: 'DM Sans', 'Segoe UI', sans-serif; -webkit-font-smoothing: antialiased; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: #060d1a; }
  ::-webkit-scrollbar-thumb { background: #1a3a5c; border-radius: 2px; }
  select, input, textarea { outline: none; color: #ffffff; }
  select option { background: #0d1f35; color: #fff; }
  button { color: inherit; }
  h1,h2,h3,h4,h5,h6,p,span,div,label { color: inherit; }
  @keyframes fadeUp   { from { opacity:0; transform:translateY(22px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
  @keyframes pulse    { 0%,100% { opacity:1; } 50% { opacity:.4; } }
  @keyframes slideUp  { from { opacity:0; transform:translateY(40px); } to { opacity:1; transform:translateY(0); } }
  @keyframes slideLeft{ from { opacity:0; transform:translateX(40px); } to { opacity:1; transform:translateX(0); } }
  .fu   { animation: fadeUp  .5s        ease both; }
  .fu1  { animation: fadeUp  .5s  .08s  ease both; }
  .fu2  { animation: fadeUp  .5s  .16s  ease both; }
  .fu3  { animation: fadeUp  .5s  .24s  ease both; }
  .fu4  { animation: fadeUp  .5s  .32s  ease both; }
  .page { animation: fadeUp  .35s       ease both; }
  .ov   { animation: fadeIn  .2s        ease both; }
  .mod  { animation: slideUp .25s       ease both; }
  .chat { animation: slideLeft .3s      ease both; }
`;

const CATEGORIAS = [
  { id:"hogar", nombre:"Hogar & Limpieza", icon:"🏠", color:"rgba(74,143,212,0.12)",
    subs:[{icon:"🧹",n:"Limpieza por hora"},{icon:"👩‍🍳",n:"Empleada doméstica"},{icon:"🪣",n:"Limpieza post obra"},{icon:"🪟",n:"Limpieza de vidrios"},{icon:"🛋️",n:"Limpieza de alfombras"},{icon:"👶",n:"Niñera"},{icon:"👴",n:"Cuidador adultos mayores"},{icon:"🍳",n:"Cocinera a domicilio"},{icon:"👗",n:"Planchado y lavado"}]},
  { id:"construccion", nombre:"Construcción & Refacciones", icon:"🏗️", color:"rgba(180,120,60,0.1)",
    subs:[{icon:"🧱",n:"Albañil"},{icon:"🪨",n:"Yesero"},{icon:"🏚️",n:"Techadista"},{icon:"💧",n:"Impermeabilizador"},{icon:"🟫",n:"Colocador de pisos"},{icon:"🔲",n:"Colocador de cerámicos"},{icon:"🧩",n:"Durlock / Yeso"},{icon:"🔩",n:"Soldador"},{icon:"⚙️",n:"Herrería & Rejas"},{icon:"🚪",n:"Portones automáticos"}]},
  { id:"instalaciones", nombre:"Instalaciones", icon:"⚡", color:"rgba(255,200,50,0.08)",
    subs:[{icon:"🔧",n:"Plomero"},{icon:"⚡",n:"Electricista"},{icon:"🔥",n:"Gasista matriculado"},{icon:"❄️",n:"Aire acondicionado"},{icon:"🌡️",n:"Calefacción"},{icon:"🚨",n:"Instalador de alarmas"},{icon:"📹",n:"Cámaras de seguridad"},{icon:"📡",n:"Antenas & Internet"},{icon:"🚿",n:"Termotanque"}]},
  { id:"terminaciones", nombre:"Terminaciones & Acabados", icon:"🎨", color:"rgba(180,74,212,0.08)",
    subs:[{icon:"🎨",n:"Pintor"},{icon:"🪵",n:"Carpintero"},{icon:"✨",n:"Lustrador de pisos"},{icon:"🪞",n:"Vidriero"},{icon:"🔒",n:"Cerrajero"},{icon:"🛋️",n:"Tapicero"},{icon:"🪜",n:"Colocador de cortinas"},{icon:"🔨",n:"Herrería fina"},{icon:"🖼️",n:"Decorador de interiores"}]},
  { id:"exteriores", nombre:"Exteriores & Jardín", icon:"🌿", color:"rgba(74,212,120,0.08)",
    subs:[{icon:"🌿",n:"Jardinero"},{icon:"🐛",n:"Fumigador"},{icon:"🦠",n:"Desinfección"},{icon:"🏊",n:"Mantenimiento de pileta"},{icon:"🌲",n:"Podador de árboles"},{icon:"🪵",n:"Colocador de deck"},{icon:"💧",n:"Sistema de riego"},{icon:"🏕️",n:"Paisajismo"}]},
  { id:"tecnicos", nombre:"Servicios Técnicos", icon:"🔧", color:"rgba(74,180,212,0.08)",
    subs:[{icon:"💻",n:"Técnico PC & notebooks"},{icon:"📱",n:"Reparación de celulares"},{icon:"🍳",n:"Técnico electrodomésticos"},{icon:"🚗",n:"Mecánico a domicilio"},{icon:"📺",n:"TV & electrónica"},{icon:"🖨️",n:"Impresoras & equipos"}]},
  { id:"profesionales", nombre:"Profesionales Matriculados", icon:"📐", color:"rgba(212,180,74,0.08)",
    subs:[{icon:"📐",n:"Agrimensor"},{icon:"🏛️",n:"Arquitecto"},{icon:"🏗️",n:"Ingeniero civil"},{icon:"⚡",n:"Electricista matriculado"},{icon:"🔥",n:"Técnico en gas mat."},{icon:"🧮",n:"Contador"},{icon:"⚖️",n:"Abogado"},{icon:"📦",n:"Despachante de aduana"},{icon:"🏢",n:"Escribano"},{icon:"🩺",n:"Médico a domicilio"}]},
  { id:"tramites", nombre:"Gestores & Trámites", icon:"📋", color:"rgba(100,200,150,0.08)",
    subs:[{icon:"🚗",n:"Gestor de autos"},{icon:"🛂",n:"Gestor de ciudadanía"},{icon:"✈️",n:"Gestor de visas"},{icon:"🏠",n:"Gestor inmobiliario"},{icon:"📄",n:"Gestor de herencias"},{icon:"🏛️",n:"Trámites judiciales"},{icon:"💼",n:"Gestor comercial"},{icon:"🌐",n:"Apostillas & legalizaciones"},{icon:"📋",n:"Trámites ANSES / AFIP"},{icon:"🎓",n:"Reconocimiento de títulos"}]},
  { id:"mascotas", nombre:"Mascotas", icon:"🐾", color:"rgba(212,74,120,0.08)",
    subs:[{icon:"🐾",n:"Paseador de perros"},{icon:"🐶",n:"Peluquero canino"},{icon:"🐱",n:"Veterinario a domicilio"},{icon:"🛁",n:"Baño y peluquería canina"},{icon:"🏠",n:"Guardería de mascotas"},{icon:"🐕",n:"Adiestramiento canino"}]},
  { id:"bienestar", nombre:"Belleza & Bienestar", icon:"✨", color:"rgba(212,74,180,0.08)",
    subs:[{icon:"🧘",n:"Instructora de yoga"},{icon:"🏋️",n:"Personal trainer"},{icon:"🌸",n:"Cosmiatra"},{icon:"💅",n:"Manicura y pedicura"},{icon:"💇",n:"Peluquera a domicilio"},{icon:"🪷",n:"Esteticista"},{icon:"🧖",n:"Depilación a domicilio"},{icon:"💄",n:"Maquilladora profesional"},{icon:"💆",n:"Masajista"},{icon:"🌿",n:"Spa & relajación"}]},
  { id:"logistica", nombre:"Logística & Mudanzas", icon:"🚚", color:"rgba(74,120,212,0.08)",
    subs:[{icon:"🚚",n:"Mudanzas"},{icon:"🛻",n:"Fletes"},{icon:"🏍️",n:"Mensajería en moto"},{icon:"🛠️",n:"Armado muebles"},{icon:"📦",n:"Guardamuebles"},{icon:"🚗",n:"Remis & traslados"}]},
];

const PROFESIONALES = [
  { id:1, nombre:"Carlos M.", oficio:"Electricista", zona:"Palermo",     rating:4.9, trabajos:87,  verificado:true,  estado:"activo", foto:null, email:"carlos@mail.com", tel:"+54 11 4444-1111", dni:"28.333.444", fecha:"10/03/2025" },
  { id:2, nombre:"Ana R.",    oficio:"Pintora",      zona:"Belgrano",    rating:5.0, trabajos:134, verificado:true,  estado:"activo", foto:null, email:"ana@mail.com",    tel:"+54 11 5555-2222", dni:"32.111.222", fecha:"08/03/2025" },
  { id:3, nombre:"Marcos T.", oficio:"Plomero",      zona:"Caballito",   rating:4.8, trabajos:62,  verificado:false, estado:"pendiente", foto:null, email:"marcos@mail.com", tel:"+54 11 6666-3333", dni:"35.777.888", fecha:"15/03/2025" },
  { id:4, nombre:"Laura G.",  oficio:"Limpieza",     zona:"Villa Crespo",rating:4.9, trabajos:210, verificado:false, estado:"pendiente", foto:null, email:"laura@mail.com",  tel:"+54 11 7777-4444", dni:"29.555.666", fecha:"16/03/2025" },
  { id:5, nombre:"Diego F.",  oficio:"Gasista",      zona:"Flores",      rating:0,   trabajos:0,   verificado:false, estado:"rechazado", foto:null, email:"diego@mail.com",  tel:"+54 11 8888-5555", dni:"40.123.456", fecha:"12/03/2025" },
];

const NOTIFICACIONES = [
  { id:1, tipo:"urgente", titulo:"Nuevo pedido: Electricista en Palermo", desc:"Un vecino necesita revisión del tablero hoy. Presupuesto estimado $8.000", tiempo:"hace 5 min",  rubro:"Electricista" },
  { id:2, tipo:"normal",  titulo:"Pedido: Instalación de luces LED",       desc:"Departamento en Belgrano. Flexible en horario.",                          tiempo:"hace 1 hora", rubro:"Electricista" },
  { id:3, tipo:"normal",  titulo:"Pedido: Reparación tomacorriente",        desc:"Casa en Villa Urquiza. 3 tomacorrientes quemados.",                       tiempo:"hace 3 horas",rubro:"Electricista" },
];

const PEDIDOS_ADMIN = [
  { id:1, cliente:"Martín L.",  oficio:"Plomero",      zona:"Palermo",  desc:"Pérdida en baño urgente",  fecha:"hoy 10:30", estado:"activo"  },
  { id:2, cliente:"Sofía P.",   oficio:"Electricista", zona:"Belgrano", desc:"Tablero sin luz en cocina", fecha:"hoy 09:15", estado:"activo"  },
  { id:3, cliente:"Roberto K.", oficio:"Pintor",        zona:"Caballito",desc:"3 ambientes a pintar",     fecha:"ayer",      estado:"cerrado" },
];

const CHAT_INIT = {
  1: [
    { id:1, de:"pro",    texto:"Hola! Vi tu pedido. ¿Para qué día necesitás la revisión del tablero?", hora:"10:32" },
    { id:2, de:"cliente",texto:"Buenas! Idealmente hoy a la tarde, si podés.",                          hora:"10:35" },
    { id:3, de:"pro",    texto:"A las 17hs te queda bien? ¿Cuál es la dirección?",                      hora:"10:36" },
  ],
  2: [{ id:1, de:"pro", texto:"Hola, te contacto por el trabajo de luces LED.", hora:"09:15" }],
};

const RESPUESTAS = ["Perfecto, te confirmo enseguida.","Dale, sin problema!","¿Me podés mandar la dirección exacta?","Listo, quedamos así entonces.","Anotado, hasta el miércoles!"];

// ─── Avatar ───
const Avatar = ({ foto, nombre, size=46, fontSize=20 }) => {
  const iniciales = nombre ? nombre.split(" ").map(n=>n[0]).slice(0,2).join("").toUpperCase() : "?";
  return (
    <div style={{ width:size, height:size, borderRadius:size/4, background:"rgba(74,143,212,0.15)", border:`1px solid rgba(74,143,212,0.3)`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, overflow:"hidden" }}>
      {foto
        ? <img src={foto} alt={nombre} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
        : <span style={{ fontSize:fontSize, color:C.blueLight, fontWeight:600, fontFamily:F.sans }}>{iniciales}</span>
      }
    </div>
  );
};

// ─── Buttons ───
const PrimaryBtn = ({ children, onClick, disabled=false, style={} }) => (
  <button onClick={onClick} disabled={disabled}
    style={{ background:`linear-gradient(135deg,${C.blue},${C.blueBtn})`, border:"none", color:"#ffffff", padding:"16px 24px", borderRadius:13, fontFamily:F.sans, fontSize:15, fontWeight:600, cursor:disabled?"not-allowed":"pointer", width:"100%", boxShadow:"0 8px 32px rgba(74,143,212,0.25)", transition:"all .22s", opacity:disabled?0.5:1, ...style }}
    onMouseEnter={e=>{ if(!disabled) e.currentTarget.style.transform="translateY(-2px)"; }}
    onMouseLeave={e=>{ e.currentTarget.style.transform="translateY(0)"; }}
  >{children}</button>
);

const GhostBtn = ({ children, onClick, style={} }) => (
  <button onClick={onClick}
    style={{ background:"rgba(74,143,212,0.08)", border:"1px solid rgba(74,143,212,0.3)", color:C.blueLight, padding:"16px 24px", borderRadius:13, fontFamily:F.sans, fontSize:15, fontWeight:500, cursor:"pointer", width:"100%", transition:"all .22s", ...style }}
    onMouseEnter={e=>e.currentTarget.style.background="rgba(74,143,212,0.15)"}
    onMouseLeave={e=>e.currentTarget.style.background="rgba(74,143,212,0.08)"}
  >{children}</button>
);

const BackBtn = ({ onClick }) => (
  <button onClick={onClick} style={{ background:"none", border:"none", color:C.blue, fontSize:14, cursor:"pointer", marginBottom:22, fontFamily:F.sans }}>← Volver</button>
);

const Lbl = ({ children }) => (
  <label style={{ fontSize:11, color:C.grayLight, letterSpacing:1.5, fontWeight:600 }}>{children}</label>
);

const Inp = ({ placeholder, type="text", value, onChange, err, style={} }) => (
  <>
    <input type={type} placeholder={placeholder} value={value} onChange={onChange}
      style={{ width:"100%", marginTop:8, background:C.bgCard, border:`1px solid ${err?C.red:C.border}`, color:"#ffffff", padding:"13px 15px", borderRadius:10, fontFamily:F.sans, fontSize:14, ...style }}/>
    {err && <p style={{ color:C.red, fontSize:12, marginTop:4 }}>{err}</p>}
  </>
);

const Sel = ({ value, onChange, children, style={} }) => (
  <select value={value} onChange={onChange}
    style={{ width:"100%", marginTop:8, background:C.bgCard, border:`1px solid ${C.border}`, color:"#ffffff", padding:"13px 15px", borderRadius:10, fontFamily:F.sans, fontSize:14, ...style }}
  >{children}</select>
);

// ─── Nav ───
const Nav = ({ setVista, noLeidas }) => (
  <nav style={{ position:"sticky", top:0, zIndex:100, background:C.nav, backdropFilter:"blur(12px)", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 20px" }}>
    <div onClick={()=>setVista("inicio")} style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }}>
      {/* Logo N más fino */}
      <div style={{ width:36, height:36, borderRadius:8, background:`linear-gradient(135deg,${C.blue},${C.blueDark})`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:F.serif, fontWeight:300, fontSize:20, color:"#ffffff" }}>N</div>
      <span style={{ fontFamily:F.serif, fontWeight:300, fontSize:20, letterSpacing:3, color:"#ffffff" }}>NEX<span style={{color:C.blue}}>O</span></span>
    </div>
    <div style={{ display:"flex", gap:8, alignItems:"center" }}>
      <button onClick={()=>setVista("notificaciones")} style={{ position:"relative", background:"none", border:"none", cursor:"pointer", fontSize:20, padding:"4px" }}>
        🔔
        {noLeidas>0 && <span style={{ position:"absolute", top:0, right:0, width:16, height:16, borderRadius:"50%", background:C.red, fontSize:10, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff" }}>{noLeidas}</span>}
      </button>
      <button onClick={()=>window.open("https://wa.me/5491161906655?text=Hola!%20Tengo%20una%20consulta%20sobre%20Nexo","_blank")} style={{ background:"rgba(37,211,102,0.12)", border:"1px solid rgba(37,211,102,0.3)", color:"#25d366", padding:"7px 12px", borderRadius:8, fontFamily:F.sans, fontSize:13, cursor:"pointer" }}>💬</button>
      <button onClick={()=>setVista("planes")} style={{ background:"transparent", border:`1px solid ${C.border}`, color:"#ffffff", padding:"7px 14px", borderRadius:8, fontFamily:F.sans, fontSize:13, cursor:"pointer" }}>Planes</button>
      <button onClick={()=>setVista("admin")} style={{ background:"rgba(74,143,212,0.1)", border:`1px solid ${C.border}`, color:C.blue, padding:"7px 12px", borderRadius:8, fontFamily:F.sans, fontSize:13, cursor:"pointer" }}>⚙️</button>
    </div>
  </nav>
);

// ─── TyC Popup ───
const TyCPopup = ({ onAccept, onClose }) => (
  <div className="ov" style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.78)", zIndex:999, display:"flex", alignItems:"flex-end", justifyContent:"center" }}>
    <div className="mod" style={{ background:C.bgCard, borderRadius:"20px 20px 0 0", padding:"28px 24px 36px", maxWidth:480, width:"100%", border:`1px solid ${C.border}`, maxHeight:"85vh", display:"flex", flexDirection:"column" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <h3 style={{ fontFamily:F.serif, fontSize:22, fontWeight:400, color:"#ffffff" }}>Términos y Condiciones</h3>
        <button onClick={onClose} style={{ background:"none", border:"none", color:C.gray, fontSize:22, cursor:"pointer" }}>×</button>
      </div>
      <div style={{ overflowY:"auto", flex:1, paddingRight:4, marginBottom:20 }}>
        {[
          ["1. Uso de la plataforma","Nexo es una plataforma de conexión entre clientes y profesionales. No somos empleadores ni garantizamos la relación laboral entre las partes."],
          ["2. Verificación de identidad","Para operar como profesional en Nexo, debés completar el proceso de verificación de identidad y aceptar que nuestro equipo valide tus datos manualmente."],
          ["3. Responsabilidad del profesional","Sos responsable de la calidad, puntualidad y resultados de los trabajos que ofrecés. Nexo no asume responsabilidad por daños ocasionados durante la prestación del servicio."],
          ["4. Comisiones y pagos","Durante el período de lanzamiento, Nexo es gratuito. Los planes de suscripción se activarán conforme se comunique con anticipación por mail."],
          ["5. Notificaciones","Al registrarte, aceptás recibir notificaciones sobre pedidos en tu rubro, novedades de la plataforma y comunicaciones operativas."],
          ["6. Calificaciones","Los clientes podrán calificarte luego de cada servicio. Las calificaciones son públicas."],
          ["7. Cancelación de cuenta","Nexo se reserva el derecho de suspender o cancelar cuentas que violen estos términos."],
          ["8. Privacidad","Tus datos personales serán tratados conforme a la Ley 25.326 de Protección de Datos Personales de Argentina."],
        ].map(([t,c])=>(
          <div key={t} style={{ marginBottom:16 }}>
            <div style={{ fontWeight:600, fontSize:13, color:C.blueLight, marginBottom:4 }}>{t}</div>
            <p style={{ fontSize:13, color:C.grayLight, lineHeight:1.65, fontWeight:300 }}>{c}</p>
          </div>
        ))}
      </div>
      <div style={{ display:"flex", gap:10 }}>
        <button onClick={onClose} style={{ flex:1, background:"transparent", border:`1px solid ${C.border}`, color:"#ffffff", padding:14, borderRadius:10, fontFamily:F.sans, fontSize:14, cursor:"pointer" }}>Cancelar</button>
        <button onClick={onAccept} style={{ flex:2, background:`linear-gradient(135deg,${C.blue},${C.blueBtn})`, border:"none", color:"#ffffff", padding:14, borderRadius:10, fontFamily:F.sans, fontSize:14, fontWeight:600, cursor:"pointer" }}>Acepto los términos ✓</button>
      </div>
    </div>
  </div>
);

// ─── Registro Cliente Popup ───
const RegistroClientePopup = ({ onClose, onSuccess }) => {
  const [nombre, setNombre] = useState("");
  const [email,  setEmail]  = useState("");
  const [tel,    setTel]    = useState("");
  const [err,    setErr]    = useState({});

  const validar = () => {
    const e = {};
    if (!nombre.trim()) e.nombre="Campo requerido";
    if (!email.trim()||!email.includes("@")) e.email="Email inválido";
    if (!tel.trim()) e.tel="Campo requerido";
    setErr(e);
    return Object.keys(e).length===0;
  };

  return (
    <div className="ov" style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.78)", zIndex:999, display:"flex", alignItems:"flex-end", justifyContent:"center" }}>
      <div className="mod" style={{ background:C.bgCard, borderRadius:"20px 20px 0 0", padding:"28px 24px 36px", maxWidth:480, width:"100%", border:`1px solid ${C.border}` }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
          <h3 style={{ fontFamily:F.serif, fontSize:22, fontWeight:400, color:"#ffffff" }}>Registrate para continuar</h3>
          <button onClick={onClose} style={{ background:"none", border:"none", color:C.gray, fontSize:22, cursor:"pointer" }}>×</button>
        </div>
        <p style={{ color:C.grayLight, fontSize:13, marginBottom:20, fontWeight:300 }}>Necesitamos saber quién sos para que los profesionales puedan contactarte.</p>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div><Lbl>NOMBRE COMPLETO</Lbl><Inp placeholder="Ej: Martín López" value={nombre} onChange={e=>setNombre(e.target.value)} err={err.nombre}/></div>
          <div><Lbl>EMAIL</Lbl><Inp type="email" placeholder="tu@mail.com" value={email} onChange={e=>setEmail(e.target.value)} err={err.email}/></div>
          <div><Lbl>TELÉFONO</Lbl><Inp placeholder="+54 11 1234-5678" value={tel} onChange={e=>setTel(e.target.value)} err={err.tel}/></div>
          <div style={{ background:"rgba(74,143,212,0.06)", border:`1px solid ${C.border}`, borderRadius:10, padding:"10px 14px", fontSize:12, color:C.grayLight }}>
            🔒 Tus datos son privados. Solo los ven los profesionales con quienes te contactés.
          </div>
          <PrimaryBtn onClick={()=>{ if(validar()) onSuccess({ nombre, email, tel }); }}>Continuar →</PrimaryBtn>
        </div>
      </div>
    </div>
  );
};

// ─── Calificar Popup ───
const CalificarPopup = ({ nombre, onClose }) => {
  const [stars,  setStars]   = useState(0);
  const [hover,  setHover]   = useState(0);
  const [com,    setCom]     = useState("");
  const [enviado,setEnviado] = useState(false);

  if (enviado) return (
    <div className="ov" style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.78)", zIndex:999, display:"flex", alignItems:"center", justifyContent:"center", padding:"0 24px" }}>
      <div className="mod" style={{ background:C.bgCard, borderRadius:20, padding:"40px 28px", maxWidth:380, width:"100%", textAlign:"center", border:`1px solid ${C.border}` }}>
        <div style={{ fontSize:52, marginBottom:16 }}>⭐</div>
        <h3 style={{ fontFamily:F.serif, fontSize:24, marginBottom:8, color:"#ffffff" }}>¡Gracias por calificar!</h3>
        <p style={{ color:C.grayLight, fontSize:14, marginBottom:24, fontWeight:300 }}>Tu opinión ayuda a toda la comunidad Nexo.</p>
        <PrimaryBtn onClick={onClose}>Cerrar</PrimaryBtn>
      </div>
    </div>
  );

  return (
    <div className="ov" style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.78)", zIndex:999, display:"flex", alignItems:"flex-end", justifyContent:"center" }}>
      <div className="mod" style={{ background:C.bgCard, borderRadius:"20px 20px 0 0", padding:"28px 24px 36px", maxWidth:480, width:"100%", border:`1px solid ${C.border}` }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <h3 style={{ fontFamily:F.serif, fontSize:22, fontWeight:400, color:"#ffffff" }}>Calificar a {nombre}</h3>
          <button onClick={onClose} style={{ background:"none", border:"none", color:C.gray, fontSize:22, cursor:"pointer" }}>×</button>
        </div>
        <div style={{ display:"flex", gap:8, justifyContent:"center", marginBottom:16 }}>
          {[1,2,3,4,5].map(n=>(
            <button key={n} onClick={()=>setStars(n)} onMouseEnter={()=>setHover(n)} onMouseLeave={()=>setHover(0)}
              style={{ background:"none", border:"none", fontSize:40, cursor:"pointer", transition:"transform .15s", transform:(hover||stars)>=n?"scale(1.2)":"scale(1)", filter:(hover||stars)>=n?"brightness(1)":"brightness(0.3)" }}>★</button>
          ))}
        </div>
        {stars>0 && <div style={{ textAlign:"center", color:C.blueLight, fontSize:13, marginBottom:16, fontWeight:500 }}>{["","Malo","Regular","Bien","Muy bien","¡Excelente!"][stars]}</div>}
        <div style={{ marginBottom:20 }}>
          <Lbl>COMENTARIO (OPCIONAL)</Lbl>
          <textarea value={com} onChange={e=>setCom(e.target.value)} placeholder="Contá cómo fue el trabajo..."
            style={{ width:"100%", marginTop:8, background:C.bg, border:`1px solid ${C.border}`, color:"#ffffff", padding:"13px 16px", borderRadius:10, fontFamily:F.sans, fontSize:14, resize:"none", minHeight:80, lineHeight:1.6 }}/>
        </div>
        <PrimaryBtn onClick={()=>stars>0&&setEnviado(true)} style={{ opacity:stars===0?0.4:1 }}>Enviar calificación</PrimaryBtn>
      </div>
    </div>
  );
};

// ─── Notif Popup ───
const NotifPopup = ({ notif, onClose, onPostular }) => (
  <div className="ov" style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.78)", zIndex:999, display:"flex", alignItems:"center", justifyContent:"center", padding:"0 24px" }}>
    <div className="mod" style={{ background:C.bgCard, borderRadius:20, padding:"28px 24px", maxWidth:400, width:"100%", border:`1px solid ${notif.tipo==="urgente"?"rgba(248,113,113,0.4)":C.border}` }}>
      {notif.tipo==="urgente" && (
        <div style={{ background:"rgba(248,113,113,0.15)", border:"1px solid rgba(248,113,113,0.3)", borderRadius:8, padding:"8px 14px", marginBottom:16, display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ animation:"pulse 1s infinite", fontSize:14 }}>🔴</span>
          <span style={{ fontSize:12, color:C.red, fontWeight:600, letterSpacing:1 }}>PEDIDO URGENTE</span>
        </div>
      )}
      <h3 style={{ fontFamily:F.serif, fontSize:20, fontWeight:400, marginBottom:8, color:"#ffffff" }}>{notif.titulo}</h3>
      <p style={{ color:C.grayLight, fontSize:14, lineHeight:1.6, marginBottom:18, fontWeight:300 }}>{notif.desc}</p>
      <div style={{ display:"flex", gap:10 }}>
        <button onClick={onClose} style={{ flex:1, background:"transparent", border:`1px solid ${C.border}`, color:"#ffffff", padding:"13px", borderRadius:10, fontFamily:F.sans, fontSize:14, cursor:"pointer" }}>Ignorar</button>
        <button onClick={onPostular} style={{ flex:2, background:`linear-gradient(135deg,${C.blue},${C.blueBtn})`, border:"none", color:"#ffffff", padding:"13px", borderRadius:10, fontFamily:F.sans, fontSize:14, fontWeight:600, cursor:"pointer" }}>Postularme →</button>
      </div>
    </div>
  </div>
);

// ─── Chat ───
const ChatView = ({ pro, initMsgs, onClose }) => {
  const [msgs,   setMsgs]   = useState(initMsgs||[]);
  const [texto,  setTexto]  = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef           = useRef(null);

  useEffect(()=>{ bottomRef.current?.scrollIntoView({ behavior:"smooth" }); },[msgs,typing]);

  const send = () => {
    if (!texto.trim()) return;
    const hora = new Date().toLocaleTimeString("es-AR",{hour:"2-digit",minute:"2-digit"});
    setMsgs(p=>[...p,{ id:Date.now(), de:"cliente", texto:texto.trim(), hora }]);
    setTexto("");
    setTyping(true);
    setTimeout(()=>{
      setTyping(false);
      setMsgs(p=>[...p,{ id:Date.now()+1, de:"pro", texto:RESPUESTAS[Math.floor(Math.random()*RESPUESTAS.length)], hora:new Date().toLocaleTimeString("es-AR",{hour:"2-digit",minute:"2-digit"}) }]);
    },1800);
  };

  return (
    <div className="chat" style={{ position:"fixed", inset:0, background:C.bg, zIndex:200, display:"flex", flexDirection:"column", maxWidth:480, margin:"0 auto" }}>
      <div style={{ background:C.nav, backdropFilter:"blur(12px)", borderBottom:`1px solid ${C.border}`, padding:"14px 20px", display:"flex", alignItems:"center", gap:14 }}>
        <button onClick={onClose} style={{ background:"none", border:"none", color:C.blue, fontSize:22, cursor:"pointer" }}>←</button>
        <Avatar foto={pro.foto} nombre={pro.nombre} size={40} fontSize={16}/>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:600, fontSize:15, color:"#ffffff" }}>{pro.nombre} {pro.verificado&&<span style={{fontSize:10,color:C.blue,background:"rgba(74,143,212,0.12)",padding:"2px 6px",borderRadius:20}}>✓</span>}</div>
          <div style={{ fontSize:12, color:C.green, marginTop:2 }}>● En línea · {pro.oficio}</div>
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ fontSize:12, color:C.blue }}>★ {pro.rating}</div>
          <div style={{ fontSize:11, color:C.grayLight }}>{pro.trabajos} trabajos</div>
        </div>
      </div>
      <div style={{ flex:1, overflowY:"auto", padding:"20px 16px", display:"flex", flexDirection:"column", gap:10 }}>
        {msgs.map(m=>(
          <div key={m.id} style={{ display:"flex", flexDirection:"column", alignItems:m.de==="cliente"?"flex-end":"flex-start" }}>
            <div style={{ maxWidth:"78%", padding:"11px 14px", borderRadius:m.de==="cliente"?"16px 16px 4px 16px":"16px 16px 16px 4px", background:m.de==="cliente"?`linear-gradient(135deg,${C.blue},${C.blueBtn})`:C.bgCard, border:m.de==="pro"?`1px solid ${C.border}`:"none", fontSize:14, lineHeight:1.55, color:"#ffffff" }}>{m.texto}</div>
            <span style={{ fontSize:10, color:C.gray, marginTop:4 }}>{m.hora}</span>
          </div>
        ))}
        {typing && (
          <div style={{ display:"flex", gap:4, padding:"12px 16px", background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:"16px 16px 16px 4px", width:"fit-content" }}>
            {[0,1,2].map(i=><span key={i} style={{ width:6, height:6, borderRadius:"50%", background:C.gray, display:"inline-block", animation:`pulse 1s ${i*.2}s infinite` }}/>)}
          </div>
        )}
        <div ref={bottomRef}/>
      </div>
      <div style={{ background:C.nav, borderTop:`1px solid ${C.border}`, padding:"14px 16px", display:"flex", gap:10, alignItems:"flex-end" }}>
        <textarea value={texto} onChange={e=>setTexto(e.target.value)} onKeyDown={e=>{ if(e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); send(); }}} placeholder="Escribí un mensaje..." rows={1}
          style={{ flex:1, background:C.bgCard, border:`1px solid ${C.border}`, color:"#ffffff", padding:"12px 16px", borderRadius:12, fontFamily:F.sans, fontSize:14, resize:"none", lineHeight:1.5, maxHeight:100 }}/>
        <button onClick={send} disabled={!texto.trim()} style={{ width:46, height:46, borderRadius:12, background:texto.trim()?`linear-gradient(135deg,${C.blue},${C.blueBtn})`:"rgba(74,143,212,0.1)", border:"none", cursor:texto.trim()?"pointer":"default", fontSize:20, flexShrink:0, color:"#ffffff" }}>➤</button>
      </div>
    </div>
  );
};

// ─── Panel Profesional ───
const PanelProfesional = ({ onClose }) => {
  const [tab, setTab] = useState("postulaciones");
  const postulaciones = [
    { id:1, titulo:"Revisión de tablero - Palermo", cliente:"Martín L.", fecha:"hoy 10:30", estado:"pendiente", presupuesto:"$8.000" },
    { id:2, titulo:"Instalación luces LED - Belgrano", cliente:"Sofía P.", fecha:"hoy 09:00", estado:"aceptado", presupuesto:"$12.000" },
    { id:3, titulo:"Reparación tomacorriente - Villa Urquiza", cliente:"Roberto K.", fecha:"ayer", estado:"finalizado", presupuesto:"$4.500" },
  ];
  const pedidosDisponibles = [
    { id:4, titulo:"Urgente: corte de luz en PH", zona:"Palermo", presupuesto:"$6.000-$10.000", tiempo:"hace 10 min" },
    { id:5, titulo:"Instalación aire acondicionado", zona:"Belgrano", presupuesto:"$15.000", tiempo:"hace 30 min" },
    { id:6, titulo:"Tablero eléctrico nuevo", zona:"Caballito", presupuesto:"$20.000", tiempo:"hace 1 hora" },
  ];

  const colorEstado = e => e==="aceptado"?C.green:e==="pendiente"?C.yellow:C.gray;

  return (
    <div className="chat" style={{ position:"fixed", inset:0, background:C.bg, zIndex:200, display:"flex", flexDirection:"column", maxWidth:480, margin:"0 auto" }}>
      <div style={{ background:C.nav, backdropFilter:"blur(12px)", borderBottom:`1px solid ${C.border}`, padding:"14px 20px", display:"flex", alignItems:"center", gap:14 }}>
        <button onClick={onClose} style={{ background:"none", border:"none", color:C.blue, fontSize:22, cursor:"pointer" }}>←</button>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:600, fontSize:16, color:"#ffffff" }}>Mi panel</div>
          <div style={{ fontSize:12, color:C.green, marginTop:2 }}>● Modo profesional activo</div>
        </div>
      </div>

      <div style={{ display:"flex", gap:6, margin:"16px 16px 0", background:C.bgCard, padding:4, borderRadius:10, border:`1px solid ${C.border}` }}>
        {[{id:"postulaciones",label:"Mis postulaciones"},{id:"disponibles",label:"Pedidos disponibles"}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{ flex:1, padding:"9px 6px", borderRadius:8, border:"none", background:tab===t.id?`linear-gradient(135deg,${C.blue},${C.blueBtn})`:"transparent", color:tab===t.id?"#ffffff":C.gray, fontFamily:F.sans, fontSize:12, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap" }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ flex:1, overflowY:"auto", padding:"16px" }}>
        {tab==="postulaciones" && (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {postulaciones.map(p=>(
              <div key={p.id} style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:14, padding:16 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                  <div style={{ fontWeight:600, fontSize:14, color:"#ffffff", flex:1, marginRight:8 }}>{p.titulo}</div>
                  <span style={{ fontSize:11, padding:"3px 10px", borderRadius:20, fontWeight:600, background:`${colorEstado(p.estado)}22`, color:colorEstado(p.estado), whiteSpace:"nowrap" }}>{p.estado}</span>
                </div>
                <div style={{ fontSize:12, color:C.grayLight, marginBottom:4 }}>Cliente: {p.cliente}</div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontSize:12, color:C.gray }}>{p.fecha}</span>
                  <span style={{ fontSize:14, fontWeight:700, color:C.blue }}>{p.presupuesto}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab==="disponibles" && (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            <p style={{ fontSize:13, color:C.grayLight, marginBottom:8, fontWeight:300 }}>Pedidos en tu zona que podés tomar</p>
            {pedidosDisponibles.map(p=>(
              <div key={p.id} style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:14, padding:16 }}>
                <div style={{ fontWeight:600, fontSize:14, color:"#ffffff", marginBottom:6 }}>{p.titulo}</div>
                <div style={{ fontSize:12, color:C.grayLight, marginBottom:10 }}>📍 {p.zona} · {p.tiempo}</div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontSize:13, color:C.blue, fontWeight:600 }}>{p.presupuesto}</span>
                  <button style={{ background:`linear-gradient(135deg,${C.blue},${C.blueBtn})`, border:"none", color:"#ffffff", padding:"8px 16px", borderRadius:8, fontFamily:F.sans, fontSize:12, fontWeight:600, cursor:"pointer" }}>
                    Postularme →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── APP ───
export default function App() {
  const [vista,       setVista]      = useState("inicio");
  const [catAbierta,  setCatAbierta] = useState(null);
  const [busqueda,    setBusqueda]   = useState("");
  const [oficio,      setOficio]     = useState("");

  const [pros,        setPros]       = useState(PROFESIONALES);
  const [adminTab,    setAdminTab]   = useState("verificaciones");
  const [adminSearch, setAdminSearch]= useState("");
  const [adminMsg,    setAdminMsg]   = useState({});

  // Admin agregar profesional
  const [showAddPro,  setShowAddPro] = useState(false);
  const [apNombre,    setApNombre]   = useState("");
  const [apOficio,    setApOficio]   = useState("");
  const [apZona,      setApZona]     = useState("");
  const [apEmail,     setApEmail]    = useState("");

  const [leidas,      setLeidas]     = useState([]);
  const [postulados,  setPostulados] = useState([]);
  const [showNotif,   setShowNotif]  = useState(false);
  const [notifActiva, setNotifActiva]= useState(null);

  const [showTyC,     setShowTyC]    = useState(false);
  const [tycOk,       setTycOk]      = useState(false);
  const [showCalif,   setShowCalif]  = useState(false);

  const [clienteData,    setClienteData]    = useState(null);
  const [showRegCliente, setShowRegCliente] = useState(false);
  const [pendingNav,     setPendingNav]     = useState(null);

  const [chat,        setChat]       = useState(null);
  const [showPanel,   setShowPanel]  = useState(false);

  // Registro profesional
  const [rNombre, setRNombre] = useState("");
  const [rEmail,  setREmail]  = useState("");
  const [rTel,    setRTel]    = useState("");
  const [rZona,   setRZona]   = useState("");
  const [rCat,    setRCat]    = useState(0);
  const [rFoto,   setRFoto]   = useState(null);
  const [rFotoUrl,setRFotoUrl]= useState(null);
  const [rErr,    setRErr]    = useState({});

  const activos    = pros.filter(p=>p.estado==="activo");
  const pendientes = pros.filter(p=>p.estado==="pendiente");
  const noLeidas   = NOTIFICACIONES.filter(n=>!leidas.includes(n.id)).length;

  const catsFiltradas = busqueda.trim()
    ? CATEGORIAS.map(c=>({...c,subs:c.subs.filter(s=>s.n.toLowerCase().includes(busqueda.toLowerCase()))})).filter(c=>c.subs.length>0)
    : CATEGORIAS;

  const prosFiltrados = adminSearch.trim()
    ? pros.filter(p=>p.nombre.toLowerCase().includes(adminSearch.toLowerCase())||p.oficio.toLowerCase().includes(adminSearch.toLowerCase()))
    : pros;

  const elegirOficio = nombre => { setOficio(nombre); setVista("buscar"); setCatAbierta(null); };

  const navegarComoCliente = destino => {
    if (!clienteData) { setPendingNav(destino); setShowRegCliente(true); }
    else setVista(destino);
  };

  const onClienteRegistrado = async data => {
    await supabase.from('clientes').insert([{
      nombre: data.nombre,
      email: data.email,
      telefono: data.telefono,
    }]);
    setClienteData(data);
    setShowRegCliente(false);
    if (pendingNav) { setVista(pendingNav); setPendingNav(null); }
  };

  const abrirNotif = n => {
    setNotifActiva(n);
    setShowNotif(true);
    setLeidas(p=>p.includes(n.id)?p:[...p,n.id]);
  };

  const postular = () => { setPostulados(p=>[...p,notifActiva.id]); setShowNotif(false); setNotifActiva(null); };

  const verificarPro = id => setPros(p=>p.map(x=>x.id===id?{...x,verificado:true,estado:"activo"}:x));
  const rechazarPro  = id => setPros(p=>p.map(x=>x.id===id?{...x,verificado:false,estado:"rechazado"}:x));

  const handleFoto = e => {
    const file = e.target.files[0];
    if (!file) return;
    setRFoto(file);
    setRFotoUrl(URL.createObjectURL(file));
  };

  const validarRegistro = () => {
    const e = {};
    if (!rNombre.trim()) e.nombre="Campo requerido";
    if (!rEmail.trim()||!rEmail.includes("@")) e.email="Email inválido";
    if (!rTel.trim()) e.tel="Campo requerido";
    if (!rZona.trim()) e.zona="Seleccioná una zona";
    setRErr(e);
    return Object.keys(e).length===0;
  };

  const handleAceptarTyC = () => {
    setTycOk(true);
    setShowTyC(false);
    const e = {};
    if (!rNombre.trim()) e.nombre="Campo requerido";
    if (!rEmail.trim()||!rEmail.includes("@")) e.email="Email inválido";
    if (!rTel.trim()) e.tel="Campo requerido";
    if (!rZona.trim()) e.zona="Seleccioná una zona";
    setRErr(e);
    if (Object.keys(e).length===0) setVista("planes");
  };

  const handleRegistro = async () => {
    if (!tycOk) { setShowTyC(true); return; }
    if (!validarRegistro()) return;
    const { error } = await supabase
      .from('profesionales')
      .insert([{
        nombre: rNombre,
        email: rEmail,
        telefono: rTel,
        zona: rZona,
        oficio: CATEGORIAS[rCat].subs[0].n,
        verificado: false,
        estado: 'pendiente'
      }]);
    if (error) { alert('Error al registrar. Intentá de nuevo.'); return; }
    setVista('planes');
  };

  // Admin agregar profesional sin cargo
  const handleAddPro = () => {
    if (!apNombre.trim()||!apOficio.trim()||!apZona.trim()) return;
    const nuevo = {
      id: Date.now(),
      nombre: apNombre,
      oficio: apOficio,
      zona: apZona,
      email: apEmail,
      rating: 0,
      trabajos: 0,
      verificado: true,
      estado: "activo",
      foto: null,
    };
    setPros(p=>[...p, nuevo]);
    setApNombre(""); setApOficio(""); setApZona(""); setApEmail("");
    setShowAddPro(false);
  };

  if (chat) return (
    <><style>{GS}</style>
    <ChatView pro={chat} initMsgs={CHAT_INIT[chat.id]||[]} onClose={()=>setChat(null)}/></>
  );

  if (showPanel) return (
    <><style>{GS}</style>
    <PanelProfesional onClose={()=>setShowPanel(false)}/></>
  );

  return (
    <><style>{GS}</style>
    <div style={{ minHeight:"100vh", background:C.bg, maxWidth:480, margin:"0 auto", color:"#ffffff" }}>
      <Nav setVista={setVista} noLeidas={noLeidas}/>

      {/* ══════════ INICIO ══════════ */}
      {vista==="inicio" && (
        <div>
          <div style={{ minHeight:"88vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"40px 28px 60px", background:"radial-gradient(ellipse at 50% 0%, rgba(74,143,212,0.12) 0%, transparent 65%)" }}>
            <div className="fu" style={{ display:"inline-flex", alignItems:"center", gap:8, border:`1px solid ${C.border}`, borderRadius:20, padding:"8px 18px", marginBottom:36, background:"rgba(74,143,212,0.06)" }}>
              <span style={{ width:7, height:7, borderRadius:"50%", background:C.blue, display:"inline-block", animation:"pulse 2s infinite" }}/>
              <span style={{ fontSize:11, letterSpacing:2, color:"#ffffff", fontWeight:400 }}>ARGENTINA · ZONA NORTE · CABA</span>
            </div>
            {/* Título fino en blanco */}
            <h1 className="fu1" style={{ fontFamily:F.serif, fontSize:"clamp(38px,8vw,58px)", fontWeight:300, lineHeight:1.12, textAlign:"center", marginBottom:20, color:"#ffffff" }}>
              El oficio que<br/>necesitás, <em style={{color:C.blueLight,fontStyle:"italic",fontWeight:300}}>hoy.</em>
            </h1>
            <p className="fu2" style={{ textAlign:"center", color:C.grayLight, fontSize:16, lineHeight:1.7, marginBottom:40, maxWidth:340, fontWeight:300 }}>
              Conectamos vecinos con profesionales de confianza.<br/>Publicás tu pedido y ellos cotizan. Vos elegís.
            </p>
            <div className="fu3" style={{ display:"flex", flexDirection:"column", gap:12, width:"100%", maxWidth:360 }}>
              <PrimaryBtn onClick={()=>navegarComoCliente("categorias")}>Necesito un servicio</PrimaryBtn>
              <GhostBtn onClick={()=>setVista("registro-pro")}>Soy profesional</GhostBtn>
            </div>
            {/* Link panel profesional */}
            <button onClick={()=>setShowPanel(true)} style={{ marginTop:16, background:"none", border:"none", color:C.blue, fontSize:13, cursor:"pointer", fontFamily:F.sans, textDecoration:"underline" }}>
              Tengo cuenta de profesional → Mi panel
            </button>
            {clienteData && (
              <button onClick={()=>setClienteData(null)} style={{ marginTop:8, background:"none", border:"none", color:C.red, fontSize:12, cursor:"pointer", fontFamily:F.sans }}>
                Cerrar sesión · {clienteData.nombre.split(" ")[0]}
              </button>
            )}
            <div className="fu4" style={{ display:"flex", marginTop:48, width:"100%", borderTop:`1px solid ${C.border}`, paddingTop:32 }}>
              {[["2.400+","PROFESIONALES"],["80+","OFICIOS"],["4.9★","CALIFICACIÓN"]].map(([v,l])=>(
                <div key={l} style={{ flex:1, textAlign:"center" }}>
                  <div style={{ fontFamily:F.serif, fontSize:28, fontWeight:400, color:C.blue }}>{v}</div>
                  <div style={{ fontSize:10, letterSpacing:1.5, color:"#ffffff", marginTop:4, fontWeight:400 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding:"0 24px 40px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <div>
                <h2 style={{ fontFamily:F.serif, fontSize:24, fontWeight:400, color:"#ffffff" }}>¿Qué necesitás?</h2>
                <p style={{ color:C.grayLight, fontSize:13, marginTop:4, fontWeight:300 }}>11 categorías · 80+ oficios</p>
              </div>
              <button onClick={()=>setVista("categorias")} style={{ background:"none", border:`1px solid ${C.border}`, color:C.blue, padding:"7px 14px", borderRadius:8, fontSize:13, cursor:"pointer", fontFamily:F.sans }}>Ver todas →</button>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
              {CATEGORIAS.map(cat=>(
                <button key={cat.id} onClick={()=>{ setVista("categorias"); setCatAbierta(cat.id); }}
                  style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:12, padding:"16px 8px", display:"flex", flexDirection:"column", alignItems:"center", gap:7, cursor:"pointer", transition:"all .2s" }}
                  onMouseEnter={e=>{ e.currentTarget.style.background=C.bgCardHover; e.currentTarget.style.transform="translateY(-2px)"; }}
                  onMouseLeave={e=>{ e.currentTarget.style.background=C.bgCard; e.currentTarget.style.transform="translateY(0)"; }}
                >
                  <span style={{ fontSize:24 }}>{cat.icon}</span>
                  <span style={{ fontSize:10, color:"#ffffff", fontWeight:400, textAlign:"center", lineHeight:1.3 }}>{cat.nombre.split("&")[0].trim()}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ padding:"0 24px 60px" }}>
            <h2 style={{ fontFamily:F.serif, fontSize:24, fontWeight:400, marginBottom:6, color:"#ffffff" }}>Profesionales top</h2>
            <p style={{ color:C.grayLight, fontSize:13, marginBottom:20, fontWeight:300 }}>Los mejor calificados esta semana</p>
            {activos.map(p=>(
              <div key={p.id} onClick={()=>setVista("perfil")}
                style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:14, padding:"14px 16px", display:"flex", alignItems:"center", gap:14, cursor:"pointer", transition:"all .2s", marginBottom:10 }}
                onMouseEnter={e=>e.currentTarget.style.background=C.bgCardHover}
                onMouseLeave={e=>e.currentTarget.style.background=C.bgCard}
              >
                <Avatar foto={p.foto} nombre={p.nombre} size={46} fontSize={18}/>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, fontSize:15, color:"#ffffff" }}>{p.nombre} {p.verificado&&<span style={{fontSize:11,color:C.blue,background:"rgba(74,143,212,0.12)",padding:"2px 7px",borderRadius:20}}>✓</span>}</div>
                  <div style={{ color:C.grayLight, fontSize:12, marginTop:2 }}>{p.oficio} · {p.zona}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ color:C.blue, fontWeight:600 }}>★ {p.rating}</div>
                  <div style={{ color:C.grayLight, fontSize:11, marginTop:2 }}>{p.trabajos} trabajos</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════ CATEGORÍAS ══════════ */}
      {vista==="categorias" && (
        <div className="page" style={{ padding:"24px 20px 60px" }}>
          <BackBtn onClick={()=>setVista("inicio")}/>
          <h2 style={{ fontFamily:F.serif, fontSize:28, fontWeight:400, marginBottom:4, color:"#ffffff" }}>Todos los oficios</h2>
          <p style={{ color:C.grayLight, fontSize:13, marginBottom:20, fontWeight:300 }}>11 categorías · 80+ profesiones</p>
          <div style={{ position:"relative", marginBottom:22 }}>
            <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:C.gray }}>🔍</span>
            <input value={busqueda} onChange={e=>setBusqueda(e.target.value)} placeholder="Buscar oficio..."
              style={{ width:"100%", background:C.bgCard, border:`1px solid ${C.border}`, color:"#ffffff", padding:"13px 40px 13px 42px", borderRadius:12, fontFamily:F.sans, fontSize:15 }}/>
            {busqueda && <button onClick={()=>setBusqueda("")} style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:C.gray, cursor:"pointer", fontSize:20 }}>×</button>}
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {catsFiltradas.map(cat=>(
              <div key={cat.id} style={{ borderRadius:14, overflow:"hidden", border:`1px solid ${catAbierta===cat.id?"rgba(74,143,212,0.4)":C.border}` }}>
                <button onClick={()=>setCatAbierta(p=>p===cat.id?null:cat.id)}
                  style={{ width:"100%", background:catAbierta===cat.id?"rgba(74,143,212,0.1)":C.bgCard, border:"none", padding:"16px 18px", display:"flex", alignItems:"center", gap:14, cursor:"pointer" }}>
                  <div style={{ width:42, height:42, borderRadius:10, fontSize:20, background:cat.color, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{cat.icon}</div>
                  <div style={{ flex:1, textAlign:"left" }}>
                    <div style={{ fontWeight:600, fontSize:15, color:"#ffffff" }}>{cat.nombre}</div>
                    <div style={{ fontSize:12, color:C.grayLight, marginTop:2 }}>{cat.subs.length} servicios</div>
                  </div>
                  <span style={{ color:C.blue, fontSize:20, transition:"transform .25s", transform:catAbierta===cat.id?"rotate(180deg)":"rotate(0deg)", display:"inline-block" }}>⌄</span>
                </button>
                {(catAbierta===cat.id||busqueda) && (
                  <div style={{ background:"rgba(6,13,26,0.7)", borderTop:`1px solid ${C.border}`, display:"grid", gridTemplateColumns:"repeat(3,1fr)" }}>
                    {cat.subs.map((sub,idx)=>(
                      <button key={sub.n} onClick={()=>elegirOficio(sub.n)}
                        style={{ background:"transparent", border:"none", borderRight:idx%3!==2?`1px solid ${C.border}`:"none", borderBottom:idx<cat.subs.length-3?`1px solid ${C.border}`:"none", padding:"15px 8px", display:"flex", flexDirection:"column", alignItems:"center", gap:6, cursor:"pointer" }}
                        onMouseEnter={e=>e.currentTarget.style.background="rgba(74,143,212,0.1)"}
                        onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                      >
                        <span style={{ fontSize:22 }}>{sub.icon}</span>
                        <span style={{ fontSize:10, color:"#ffffff", textAlign:"center", lineHeight:1.3, fontWeight:400 }}>{sub.n}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════ BUSCAR ══════════ */}
      {vista==="buscar" && (
        <div className="page" style={{ padding:"32px 24px 60px" }}>
          <BackBtn onClick={()=>setVista("categorias")}/>
          {clienteData && (
            <div style={{ background:"rgba(74,212,120,0.08)", border:"1px solid rgba(74,212,120,0.3)", borderRadius:10, padding:"10px 14px", marginBottom:20, display:"flex", alignItems:"center", gap:8 }}>
              <span style={{color:C.green}}>✓</span>
              <span style={{ fontSize:13, color:C.green }}>Hola, {clienteData.nombre.split(" ")[0]}! Tu pedido quedará registrado a tu nombre.</span>
            </div>
          )}
          <h2 style={{ fontFamily:F.serif, fontSize:28, fontWeight:400, marginBottom:6, color:"#ffffff" }}>{oficio||"Publicar pedido"}</h2>
          <p style={{ color:C.grayLight, fontSize:14, marginBottom:28, fontWeight:300 }}>Los profesionales te cotizan en minutos</p>
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div>
              <Lbl>SERVICIO</Lbl>
              <div onClick={()=>setVista("categorias")} style={{ marginTop:8, background:C.bgCard, border:`1px solid ${C.blue}`, borderRadius:10, padding:"14px 16px", color:C.blueLight, fontSize:15, fontWeight:500, cursor:"pointer" }}>
                {oficio} <span style={{ color:C.grayLight, fontWeight:300, fontSize:13 }}>· cambiar</span>
              </div>
            </div>
            <div>
              <Lbl>ZONA</Lbl>
              <Sel value="" onChange={()=>{}}>
                {["CABA - Palermo","CABA - Belgrano","CABA - Caballito","CABA - Villa Crespo","GBA - Zona Norte","GBA - Zona Oeste","GBA - Zona Sur"].map(z=><option key={z}>{z}</option>)}
              </Sel>
            </div>
            <div>
              <Lbl>DESCRIBÍ EL TRABAJO</Lbl>
              <textarea placeholder="Ej: Tengo una pérdida en el baño, urgente..."
                style={{ width:"100%", marginTop:8, background:C.bgCard, border:`1px solid ${C.border}`, color:"#ffffff", padding:"14px 16px", borderRadius:10, fontFamily:F.sans, fontSize:14, resize:"none", minHeight:100, lineHeight:1.6 }}/>
            </div>
            <div>
              <Lbl>URGENCIA</Lbl>
              <div style={{ display:"flex", gap:8, marginTop:8 }}>
                {["Urgente (hoy)","Esta semana","Sin apuro"].map((u,i)=>(
                  <button key={u} style={{ flex:1, padding:"10px 4px", background:i===0?"rgba(74,143,212,0.15)":C.bgCard, border:`1px solid ${i===0?C.blue:C.border}`, borderRadius:8, color:i===0?C.blueLight:"#ffffff", fontSize:11, fontFamily:F.sans, cursor:"pointer" }}>{u}</button>
                ))}
              </div>
            </div>
            <PrimaryBtn onClick={()=>setVista("cotizaciones")} style={{ marginTop:4 }}>Publicar pedido →</PrimaryBtn>
          </div>
        </div>
      )}

      {/* ══════════ COTIZACIONES ══════════ */}
      {vista==="cotizaciones" && (
        <div className="page" style={{ padding:"32px 24px 60px" }}>
          <BackBtn onClick={()=>setVista("buscar")}/>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
            <span style={{ width:8, height:8, borderRadius:"50%", background:C.green, display:"inline-block", animation:"pulse 2s infinite" }}/>
            <span style={{ fontSize:12, color:C.green, fontWeight:500 }}>3 profesionales disponibles ahora</span>
          </div>
          <h2 style={{ fontFamily:F.serif, fontSize:28, fontWeight:400, marginBottom:24, color:"#ffffff" }}>Cotizaciones</h2>
          {activos.slice(0,3).map((p,i)=>(
            <div key={p.id} style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:14, padding:18, marginBottom:12 }}>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
                <Avatar foto={p.foto} nombre={p.nombre} size={46} fontSize={18}/>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, fontSize:15, color:"#ffffff" }}>{p.nombre} {p.verificado&&<span style={{color:C.blue}}>✓</span>}</div>
                  <div style={{ color:C.grayLight, fontSize:12 }}>{p.oficio} · ★ {p.rating}</div>
                </div>
                <div style={{ fontFamily:F.serif, fontSize:22, fontWeight:700, color:C.blue }}>${[8000,12000,6500][i].toLocaleString()}</div>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={()=>setVista("perfil")} style={{ flex:1, background:`linear-gradient(135deg,${C.blue},${C.blueBtn})`, border:"none", color:"#ffffff", padding:11, borderRadius:10, fontFamily:F.sans, fontSize:13, fontWeight:600, cursor:"pointer" }}>Ver perfil</button>
                <button onClick={()=>setChat(p)} style={{ flex:1, background:"rgba(74,143,212,0.08)", border:"1px solid rgba(74,143,212,0.3)", color:C.blueLight, padding:11, borderRadius:10, fontFamily:F.sans, fontSize:13, fontWeight:600, cursor:"pointer" }}>💬 Chat</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ══════════ PERFIL ══════════ */}
      {vista==="perfil" && (
        <div className="page">
          <div style={{ background:"linear-gradient(180deg,rgba(74,143,212,0.15) 0%,transparent 100%)", padding:"32px 24px 24px" }}>
            <BackBtn onClick={()=>setVista("cotizaciones")}/>
            <div style={{ display:"flex", alignItems:"center", gap:16 }}>
              <Avatar foto={activos[0].foto} nombre={activos[0].nombre} size={72} fontSize={28}/>
              <div>
                <div style={{ fontFamily:F.serif, fontSize:24, fontWeight:400, color:"#ffffff" }}>Carlos M. <span style={{color:C.blue,fontSize:16}}>✓</span></div>
                <div style={{ color:C.grayLight, fontSize:14 }}>Electricista · Palermo</div>
                <div style={{ color:C.blue, fontSize:14, marginTop:4 }}>★ 4.9 · 87 trabajos</div>
              </div>
            </div>
          </div>
          <div style={{ padding:"0 24px 60px" }}>
            <div style={{ display:"flex", gap:8, marginBottom:20, marginTop:8, flexWrap:"wrap" }}>
              {["Instalaciones","Reparaciones","Urgencias 24hs","Matriculado"].map(tag=>(
                <span key={tag} style={{ fontSize:11, color:C.blueLight, background:"rgba(74,143,212,0.1)", padding:"4px 10px", borderRadius:20 }}>{tag}</span>
              ))}
            </div>
            <p style={{ color:C.grayLight, fontSize:14, lineHeight:1.7, marginBottom:28, fontWeight:300 }}>Electricista matriculado con 12 años de experiencia. Instalaciones domiciliarias, tableros y urgencias. Garantía escrita en todos los trabajos.</p>
            <div style={{ display:"flex", gap:8 }}>
              <PrimaryBtn style={{ flex:2 }} onClick={()=>setChat(activos[0])}>💬 Chatear con Carlos</PrimaryBtn>
              <button onClick={()=>setShowCalif(true)} style={{ flex:1, background:"transparent", border:`1px solid ${C.border}`, color:"#ffffff", padding:14, borderRadius:13, fontFamily:F.sans, fontSize:14, cursor:"pointer" }}>★ Calificar</button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ REGISTRO PROFESIONAL ══════════ */}
      {vista==="registro-pro" && (
        <div className="page" style={{ padding:"32px 24px 60px" }}>
          <BackBtn onClick={()=>setVista("inicio")}/>
          <h2 style={{ fontFamily:F.serif, fontSize:30, fontWeight:300, marginBottom:8, color:"#ffffff" }}>Sumate como<br/><em style={{color:C.blueLight,fontStyle:"italic",fontWeight:300}}>profesional</em></h2>
          <p style={{ color:C.grayLight, fontSize:14, marginBottom:24, fontWeight:300 }}>Empezá gratis. Recibí pedidos en tu zona.</p>
          {tycOk && (
            <div style={{ background:"rgba(74,212,120,0.08)", border:"1px solid rgba(74,212,120,0.3)", borderRadius:10, padding:"10px 14px", marginBottom:20, display:"flex", alignItems:"center", gap:8 }}>
              <span style={{color:C.green}}>✓</span>
              <span style={{ fontSize:13, color:C.green }}>Términos y condiciones aceptados</span>
            </div>
          )}

          {/* Foto de perfil */}
          <div style={{ marginBottom:20, display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
            <div style={{ width:80, height:80, borderRadius:"50%", background:C.bgCard, border:`2px dashed ${rFotoUrl?C.blue:C.border}`, display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", cursor:"pointer" }}
              onClick={()=>document.getElementById('fotoInput').click()}>
              {rFotoUrl
                ? <img src={rFotoUrl} alt="foto" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                : <span style={{ fontSize:28 }}>📷</span>
              }
            </div>
            <input id="fotoInput" type="file" accept="image/*" capture="user" onChange={handleFoto} style={{ display:"none" }}/>
            <button onClick={()=>document.getElementById('fotoInput').click()} style={{ background:"none", border:"none", color:C.blue, fontSize:13, cursor:"pointer", fontFamily:F.sans, textDecoration:"underline" }}>
              {rFotoUrl ? "Cambiar foto" : "Subir foto de perfil"}
            </button>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div><Lbl>NOMBRE COMPLETO</Lbl><Inp placeholder="Ej: Carlos Martínez" value={rNombre} onChange={e=>setRNombre(e.target.value)} err={rErr.nombre}/></div>
            <div>
              <Lbl>EMAIL</Lbl>
              <Inp type="email" placeholder="tu@mail.com" value={rEmail} onChange={e=>setREmail(e.target.value)} err={rErr.email}/>
              {!tycOk && <button onClick={()=>setShowTyC(true)} style={{ marginTop:8, background:"none", border:"none", color:C.blue, fontSize:13, cursor:"pointer", padding:0, textDecoration:"underline", fontFamily:F.sans }}>Leer y aceptar Términos y Condiciones →</button>}
            </div>
            <div><Lbl>TELÉFONO</Lbl><Inp placeholder="+54 11 1234-5678" value={rTel} onChange={e=>setRTel(e.target.value)} err={rErr.tel}/></div>
            <div>
              <Lbl>ZONA DE TRABAJO</Lbl>
              <Sel value={rZona} onChange={e=>setRZona(e.target.value)} style={{ color:rZona?"#ffffff":C.gray, border:`1px solid ${rErr.zona?C.red:C.border}` }}>
                <option value="">Seleccioná tu zona...</option>
                {["CABA - Palermo","CABA - Belgrano","CABA - Caballito","CABA - Villa Crespo","CABA - Flores","CABA - Villa Urquiza","GBA - Zona Norte","GBA - Zona Oeste","GBA - Zona Sur"].map(z=><option key={z} value={z}>{z}</option>)}
              </Sel>
              {rErr.zona && <p style={{ color:C.red, fontSize:12, marginTop:4 }}>{rErr.zona}</p>}
            </div>
            <div>
              <Lbl>CATEGORÍA</Lbl>
              <Sel value={rCat} onChange={e=>setRCat(Number(e.target.value))}>
                {CATEGORIAS.map((c,i)=><option key={c.id} value={i}>{c.icon} {c.nombre}</option>)}
              </Sel>
            </div>
            <div>
              <Lbl>OFICIO PRINCIPAL</Lbl>
              <Sel value="" onChange={()=>{}}>
                {CATEGORIAS[rCat].subs.map(s=><option key={s.n} value={s.n}>{s.icon} {s.n}</option>)}
              </Sel>
            </div>
            <PrimaryBtn onClick={handleRegistro} style={{ marginTop:4, opacity:tycOk?1:0.7 }}>
              {tycOk?"Ver planes →":"Aceptar T&C para continuar"}
            </PrimaryBtn>
          </div>
        </div>
      )}

      {/* ══════════ NOTIFICACIONES ══════════ */}
      {vista==="notificaciones" && (
        <div className="page" style={{ padding:"24px 20px 60px" }}>
          <BackBtn onClick={()=>setVista("inicio")}/>
          <h2 style={{ fontFamily:F.serif, fontSize:28, fontWeight:400, marginBottom:4, color:"#ffffff" }}>Mis pedidos</h2>
          <p style={{ color:C.grayLight, fontSize:13, marginBottom:20, fontWeight:300 }}>Pedidos nuevos en tu rubro</p>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {NOTIFICACIONES.map(n=>{
              const postulado=postulados.includes(n.id);
              return (
                <div key={n.id} onClick={()=>!postulado&&abrirNotif(n)}
                  style={{ background:leidas.includes(n.id)?C.bgCard:"rgba(74,143,212,0.08)", border:`1px solid ${n.tipo==="urgente"&&!leidas.includes(n.id)?"rgba(248,113,113,0.35)":leidas.includes(n.id)?C.border:"rgba(74,143,212,0.3)"}`, borderRadius:14, padding:"16px 18px", cursor:postulado?"default":"pointer" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                    <div style={{ display:"flex", gap:8 }}>
                      {n.tipo==="urgente"&&!leidas.includes(n.id)&&<span style={{ fontSize:10, color:C.red, background:"rgba(248,113,113,0.15)", padding:"2px 8px", borderRadius:20, fontWeight:600 }}>URGENTE</span>}
                      {postulado&&<span style={{ fontSize:10, color:C.green, background:"rgba(74,212,120,0.12)", padding:"2px 8px", borderRadius:20, fontWeight:600 }}>✓ POSTULADO</span>}
                    </div>
                    <span style={{ fontSize:12, color:C.grayLight }}>{n.tiempo}</span>
                  </div>
                  <div style={{ fontWeight:600, fontSize:14, marginBottom:4, color:"#ffffff" }}>{n.titulo}</div>
                  <div style={{ color:C.grayLight, fontSize:13, lineHeight:1.5 }}>{n.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════ PLANES ══════════ */}
      {vista==="planes" && (
        <div className="page" style={{ padding:"32px 24px 60px" }}>
          <BackBtn onClick={()=>setVista("inicio")}/>
          <h2 style={{ fontFamily:F.serif, fontSize:32, fontWeight:300, marginBottom:6, color:"#ffffff" }}>Elegí tu plan</h2>
          <p style={{ color:C.grayLight, fontSize:14, marginBottom:36, fontWeight:300 }}>Todos los planes incluyen verificación de identidad ✓</p>
          {[
            { nombre:"Inicio",      precio:"Gratis",   sub:"7 días sin costo",  dest:false, tag:null,           mp:null,      features:["3 contactos por mes","Perfil con verificación ✓","Badge verificado","Notificaciones de pedidos"] },
            { nombre:"Profesional", precio:"$2.500",   sub:"por mes",           dest:true,  tag:"MÁS POPULAR",  mp:"2500",    features:["Contactos ilimitados","Perfil verificado ✓","Badge destacado","Chat con clientes","Soporte prioritario","Estadísticas básicas"] },
            { nombre:"Empresa",     precio:"$18.000",  sub:"por mes",           dest:false, tag:"PARA EMPRESAS", mp:"18000",   features:["Todo Profesional","Hasta 5 usuarios del equipo","Primero en búsquedas","Estadísticas avanzadas","Gestión de agenda","Panel de empresa"] },
          ].map(p=>(
            <div key={p.nombre} style={{ background:p.dest?"linear-gradient(135deg,rgba(74,143,212,0.18),rgba(30,77,130,0.18))":C.bgCard, border:`1px solid ${p.dest?C.blue:p.nombre==="Empresa"?"rgba(212,180,74,0.4)":C.border}`, borderRadius:16, padding:24, position:"relative", boxShadow:p.dest?"0 0 40px rgba(74,143,212,0.15)":"none", marginBottom:16 }}>
              {p.tag && <div style={{ position:"absolute", top:-12, left:"50%", transform:"translateX(-50%)", background:p.dest?C.blue:"rgba(212,180,74,0.9)", color:"#ffffff", fontSize:11, fontWeight:600, padding:"4px 16px", borderRadius:20, letterSpacing:1, whiteSpace:"nowrap" }}>{p.tag}</div>}
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}>
                <div>
                  <div style={{ fontFamily:F.serif, fontSize:22, fontWeight:400, color:"#ffffff" }}>{p.nombre}</div>
                  <div style={{ color:C.grayLight, fontSize:12, marginTop:2 }}>{p.sub}</div>
                </div>
                <div style={{ fontFamily:F.serif, fontSize:28, fontWeight:600, color:p.dest?C.blueLight:"#ffffff" }}>{p.precio}</div>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:20 }}>
                {p.features.map(f=><div key={f} style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, color:C.grayLight }}><span style={{color:p.dest?C.blue:C.gray}}>✓</span> {f}</div>)}
              </div>
              <button
                onClick={()=>{
                  if (p.nombre==="Inicio") { setVista("inicio"); return; }
                  if (p.nombre==="Empresa") { window.open("https://wa.me/5491161906655?text=Hola!%20Quiero%20info%20sobre%20el%20plan%20Empresa%20de%20Nexo","_blank"); return; }
                  window.open(`https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=NEXO_PLAN_${p.mp}`,"_blank");
                }}
                style={{ width:"100%", background:p.dest?`linear-gradient(135deg,${C.blue},${C.blueBtn})`:p.nombre==="Empresa"?"rgba(212,180,74,0.15)":"rgba(74,143,212,0.08)", border:p.dest?"none":p.nombre==="Empresa"?"1px solid rgba(212,180,74,0.4)":`1px solid ${C.border}`, color:p.dest?"#ffffff":p.nombre==="Empresa"?C.yellow:C.blueLight, padding:14, borderRadius:10, fontFamily:F.sans, fontSize:14, fontWeight:600, cursor:"pointer" }}>
                {p.nombre==="Inicio"?"Comenzar gratis":p.nombre==="Empresa"?"Contactar por WhatsApp →":`Pagar con Mercado Pago →`}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ══════════ ADMIN ══════════ */}
      {vista==="admin" && (
        <div className="page" style={{ padding:"24px 20px 60px" }}>
          <BackBtn onClick={()=>setVista("inicio")}/>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <h2 style={{ fontFamily:F.serif, fontSize:26, fontWeight:400, color:"#ffffff" }}>Panel Admin</h2>
              <span style={{ fontSize:11, background:"rgba(74,143,212,0.15)", color:C.blue, padding:"3px 10px", borderRadius:20, fontWeight:600 }}>NEXO HQ</span>
            </div>
            <button onClick={()=>setShowAddPro(true)} style={{ background:`linear-gradient(135deg,${C.blue},${C.blueBtn})`, border:"none", color:"#ffffff", padding:"8px 14px", borderRadius:10, fontFamily:F.sans, fontSize:12, fontWeight:600, cursor:"pointer" }}>
              + Agregar pro
            </button>
          </div>
          <p style={{ color:C.grayLight, fontSize:13, marginBottom:24, fontWeight:300 }}>Gestión de verificaciones, pedidos y profesionales</p>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginBottom:24 }}>
            {[
              { val:activos.length, label:"Activos", color:C.green },
              { val:pendientes.length, label:"Pendientes", color:C.yellow },
              { val:PEDIDOS_ADMIN.filter(p=>p.estado==="activo").length, label:"Pedidos", color:C.blue },
              { val:pros.filter(p=>p.estado==="rechazado").length, label:"Rechazados", color:C.red },
            ].map(s=>(
              <div key={s.label} style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:12, padding:"12px 8px", textAlign:"center" }}>
                <div style={{ fontFamily:F.serif, fontSize:22, fontWeight:400, color:s.color }}>{s.val}</div>
                <div style={{ fontSize:10, color:"#ffffff", marginTop:4 }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display:"flex", gap:6, marginBottom:20, background:C.bgCard, padding:4, borderRadius:10, border:`1px solid ${C.border}` }}>
            {[{id:"verificaciones",label:"Verificaciones"},{id:"profesionales",label:"Profesionales"},{id:"pedidos",label:"Pedidos"}].map(tab=>(
              <button key={tab.id} onClick={()=>setAdminTab(tab.id)}
                style={{ flex:1, padding:"9px 6px", borderRadius:8, border:"none", background:adminTab===tab.id?`linear-gradient(135deg,${C.blue},${C.blueBtn})`:"transparent", color:adminTab===tab.id?"#ffffff":C.grayLight, fontFamily:F.sans, fontSize:12, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap" }}>
                {tab.label}
              </button>
            ))}
          </div>

          {adminTab==="verificaciones" && (
            <div>
              {pendientes.length===0 ? (
                <div style={{ textAlign:"center", padding:"40px 0", color:C.grayLight }}>
                  <div style={{ fontSize:36, marginBottom:10 }}>✅</div>
                  <div>No hay verificaciones pendientes</div>
                </div>
              ) : pendientes.map(p=>(
                <div key={p.id} style={{ background:C.bgCard, border:`1px solid ${C.yellow}33`, borderRadius:14, padding:18, marginBottom:12 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
                    <Avatar foto={p.foto} nombre={p.nombre} size={46} fontSize={18}/>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:600, fontSize:15, color:"#ffffff" }}>{p.nombre} <span style={{ fontSize:10, color:C.yellow, background:"rgba(251,191,36,0.12)", padding:"2px 8px", borderRadius:20 }}>PENDIENTE</span></div>
                      <div style={{ color:C.grayLight, fontSize:12, marginTop:2 }}>{p.oficio} · {p.zona}</div>
                    </div>
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:14, fontSize:12, color:C.grayLight }}>
                    <div><span style={{color:C.gray}}>Email: </span>{p.email}</div>
                    <div><span style={{color:C.gray}}>Tel: </span>{p.tel}</div>
                    <div><span style={{color:C.gray}}>DNI: </span>{p.dni}</div>
                    <div><span style={{color:C.gray}}>Solicitud: </span>{p.fecha}</div>
                  </div>
                  <div style={{ marginBottom:12 }}>
                    <Lbl>MENSAJE AL PROFESIONAL</Lbl>
                    <textarea value={adminMsg[p.id]||""} onChange={e=>setAdminMsg(prev=>({...prev,[p.id]:e.target.value}))} placeholder="Mensaje opcional..."
                      style={{ width:"100%", marginTop:8, background:C.bg, border:`1px solid ${C.border}`, color:"#ffffff", padding:"11px 14px", borderRadius:10, fontFamily:F.sans, fontSize:13, resize:"none", minHeight:56 }}/>
                  </div>
                  <div style={{ display:"flex", gap:8 }}>
                    <button onClick={()=>rechazarPro(p.id)} style={{ flex:1, background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.3)", color:C.red, padding:12, borderRadius:10, fontFamily:F.sans, fontSize:13, fontWeight:600, cursor:"pointer" }}>✗ Rechazar</button>
                    <button onClick={()=>verificarPro(p.id)} style={{ flex:2, background:"linear-gradient(135deg,rgba(74,212,120,0.3),rgba(74,212,120,0.15))", border:"1px solid rgba(74,212,120,0.4)", color:C.green, padding:12, borderRadius:10, fontFamily:F.sans, fontSize:13, fontWeight:600, cursor:"pointer" }}>✓ Verificar y activar</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {adminTab==="profesionales" && (
            <div>
              <div style={{ position:"relative", marginBottom:14 }}>
                <input value={adminSearch} onChange={e=>setAdminSearch(e.target.value)} placeholder="Buscar por nombre u oficio..."
                  style={{ width:"100%", background:C.bgCard, border:`1px solid ${C.border}`, color:"#ffffff", padding:"12px 12px 12px 36px", borderRadius:10, fontFamily:F.sans, fontSize:13 }}/>
              </div>
              {prosFiltrados.map(p=>(
                <div key={p.id} style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:14, padding:"14px 16px", marginBottom:10, display:"flex", alignItems:"center", gap:12 }}>
                  <Avatar foto={p.foto} nombre={p.nombre} size={42} fontSize={16}/>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:600, fontSize:14, color:"#ffffff" }}>{p.nombre}</div>
                    <div style={{ color:C.grayLight, fontSize:12 }}>{p.oficio} · {p.zona}</div>
                  </div>
                  <span style={{ fontSize:11, padding:"3px 10px", borderRadius:20, fontWeight:600, background:p.estado==="activo"?"rgba(74,212,120,0.1)":p.estado==="pendiente"?"rgba(251,191,36,0.1)":"rgba(248,113,113,0.1)", color:p.estado==="activo"?C.green:p.estado==="pendiente"?C.yellow:C.red }}>{p.estado}</span>
                </div>
              ))}
            </div>
          )}

          {adminTab==="pedidos" && (
            <div>
              {PEDIDOS_ADMIN.map(p=>(
                <div key={p.id} style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:14, padding:16, marginBottom:10 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                    <div>
                      <div style={{ fontWeight:600, fontSize:14, color:"#ffffff" }}>{p.cliente}</div>
                      <div style={{ color:C.blue, fontSize:12, marginTop:2 }}>{p.oficio} · {p.zona}</div>
                    </div>
                    <span style={{ fontSize:11, padding:"3px 10px", borderRadius:20, fontWeight:600, background:p.estado==="activo"?"rgba(74,212,120,0.1)":"rgba(74,143,212,0.1)", color:p.estado==="activo"?C.green:C.blue }}>{p.estado}</span>
                  </div>
                  <div style={{ color:C.grayLight, fontSize:13, marginBottom:8 }}>{p.desc}</div>
                  <div style={{ color:C.gray, fontSize:11 }}>{p.fecha}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════════ POPUPS ══════════ */}
      {showTyC      && <TyCPopup onAccept={handleAceptarTyC} onClose={()=>setShowTyC(false)}/>}
      {showCalif    && <CalificarPopup nombre="Carlos M." onClose={()=>setShowCalif(false)}/>}
      {showNotif && notifActiva && <NotifPopup notif={notifActiva} onClose={()=>{ setShowNotif(false); setNotifActiva(null); }} onPostular={postular}/>}
      {showRegCliente && <RegistroClientePopup onClose={()=>setShowRegCliente(false)} onSuccess={onClienteRegistrado}/>}

      {/* ══════════ POPUP AGREGAR PROFESIONAL (ADMIN) ══════════ */}
      {showAddPro && (
        <div className="ov" style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.78)", zIndex:999, display:"flex", alignItems:"flex-end", justifyContent:"center" }}>
          <div className="mod" style={{ background:C.bgCard, borderRadius:"20px 20px 0 0", padding:"28px 24px 36px", maxWidth:480, width:"100%", border:`1px solid ${C.border}` }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <h3 style={{ fontFamily:F.serif, fontSize:22, fontWeight:400, color:"#ffffff" }}>Agregar profesional</h3>
              <button onClick={()=>setShowAddPro(false)} style={{ background:"none", border:"none", color:C.gray, fontSize:22, cursor:"pointer" }}>×</button>
            </div>
            <p style={{ color:C.grayLight, fontSize:13, marginBottom:20, fontWeight:300 }}>Este profesional quedará activo y verificado sin costo.</p>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <div><Lbl>NOMBRE</Lbl><Inp placeholder="Ej: Juan Pérez" value={apNombre} onChange={e=>setApNombre(e.target.value)}/></div>
              <div><Lbl>OFICIO</Lbl><Inp placeholder="Ej: Plomero" value={apOficio} onChange={e=>setApOficio(e.target.value)}/></div>
              <div><Lbl>ZONA</Lbl><Inp placeholder="Ej: Palermo" value={apZona} onChange={e=>setApZona(e.target.value)}/></div>
              <div><Lbl>EMAIL (OPCIONAL)</Lbl><Inp placeholder="correo@mail.com" value={apEmail} onChange={e=>setApEmail(e.target.value)}/></div>
              <div style={{ background:"rgba(74,212,120,0.06)", border:"1px solid rgba(74,212,120,0.2)", borderRadius:10, padding:"10px 14px", fontSize:12, color:C.green }}>
                ✓ Se activará directo como verificado y sin cargo
              </div>
              <PrimaryBtn onClick={handleAddPro}>Agregar profesional →</PrimaryBtn>
            </div>
          </div>
        </div>
      )}

    </div></>
  );
}
