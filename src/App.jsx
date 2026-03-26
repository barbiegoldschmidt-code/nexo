import { useState, useRef, useEffect } from "react";
import { supabase } from './supabase';
import { crearPreferencia } from './mercadopago';

const ADMIN_PIN = "4567";

const C = {
  bg:"#060d1a", bgCard:"#0d1f35", bgHover:"#102540",
  nav:"rgba(6,13,26,0.92)", blue:"#4a8fd4", blueL:"#6cb3f5",
  blueD:"#1a3a5c", blueBtn:"#1e4d82", white:"#ffffff",
  gray:"#8a9bb0", grayL:"#b0c4d8", border:"rgba(74,143,212,0.15)",
  green:"#4ade80", red:"#f87171", yellow:"#fbbf24",
};
const F = { serif:"'Playfair Display',Georgia,serif", sans:"'DM Sans','Segoe UI',sans-serif" };

const GS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500;600&display=swap');
  *,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
  html,body{background:#060d1a;color:#fff;font-family:'DM Sans',sans-serif;-webkit-font-smoothing:antialiased;}
  ::-webkit-scrollbar{width:4px;}::-webkit-scrollbar-track{background:#060d1a;}::-webkit-scrollbar-thumb{background:#1a3a5c;border-radius:2px;}
  select,input,textarea{outline:none;color:#fff;} select option{background:#0d1f35;color:#fff;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
  @keyframes slideUp{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}
  @keyframes slideLeft{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:translateX(0)}}
  .fu{animation:fadeUp .5s ease both}.fu1{animation:fadeUp .5s .08s ease both}.fu2{animation:fadeUp .5s .16s ease both}
  .fu3{animation:fadeUp .5s .24s ease both}.fu4{animation:fadeUp .5s .32s ease both}
  .page{animation:fadeUp .35s ease both}.ov{animation:fadeIn .2s ease both}
  .mod{animation:slideUp .25s ease both}.chat{animation:slideLeft .3s ease both}
`;

const CATS = [
  {id:"hogar",nombre:"Hogar & Limpieza",icon:"🏠",color:"rgba(74,143,212,0.1)",subs:[{icon:"🧹",n:"Limpieza por hora"},{icon:"👩‍🍳",n:"Empleada doméstica"},{icon:"🪣",n:"Limpieza post obra"},{icon:"🪟",n:"Limpieza de vidrios"},{icon:"🛋️",n:"Limpieza de alfombras"},{icon:"👶",n:"Niñera"},{icon:"👴",n:"Cuidador adultos mayores"},{icon:"🍳",n:"Cocinera a domicilio"},{icon:"👗",n:"Planchado y lavado"}]},
  {id:"construccion",nombre:"Construcción",icon:"🏗️",color:"rgba(180,120,60,0.1)",subs:[{icon:"🧱",n:"Albañil"},{icon:"🪨",n:"Yesero"},{icon:"🏚️",n:"Techista"},{icon:"💧",n:"Impermeabilizador"},{icon:"🟫",n:"Colocador de pisos"},{icon:"🔲",n:"Colocador de cerámicos"},{icon:"🧩",n:"Durlock / Yeso"},{icon:"🔩",n:"Soldador"},{icon:"⚙️",n:"Herrería & Rejas"},{icon:"🚪",n:"Portones automáticos"}]},
  {id:"instalaciones",nombre:"Instalaciones",icon:"⚡",color:"rgba(255,200,50,0.08)",subs:[{icon:"🔧",n:"Plomero"},{icon:"⚡",n:"Electricista"},{icon:"🔥",n:"Gasista matriculado"},{icon:"❄️",n:"Aire acondicionado"},{icon:"🌡️",n:"Calefacción"},{icon:"🚨",n:"Instalador de alarmas"},{icon:"📹",n:"Cámaras de seguridad"},{icon:"📡",n:"Antenas & Internet"},{icon:"🚿",n:"Termotanque"}]},
  {id:"terminaciones",nombre:"Terminaciones",icon:"🎨",color:"rgba(180,74,212,0.08)",subs:[{icon:"🎨",n:"Pintor"},{icon:"🪵",n:"Carpintero"},{icon:"✨",n:"Lustrador de pisos"},{icon:"🪞",n:"Vidriero"},{icon:"🔒",n:"Cerrajero"},{icon:"🛋️",n:"Tapicero"},{icon:"🪜",n:"Colocador de cortinas"},{icon:"🔨",n:"Herrería fina"},{icon:"🖼️",n:"Decorador de interiores"}]},
  {id:"exteriores",nombre:"Exteriores & Jardín",icon:"🌿",color:"rgba(74,212,120,0.08)",subs:[{icon:"🌿",n:"Jardinero"},{icon:"🐛",n:"Fumigador"},{icon:"🦠",n:"Desinfección"},{icon:"🏊",n:"Mantenimiento de pileta"},{icon:"🌲",n:"Podador de árboles"},{icon:"🪵",n:"Colocador de deck"},{icon:"💧",n:"Sistema de riego"},{icon:"🏕️",n:"Paisajismo"}]},
  {id:"tecnicos",nombre:"Servicios Técnicos",icon:"🔧",color:"rgba(74,180,212,0.08)",subs:[{icon:"💻",n:"Técnico PC & notebooks"},{icon:"📱",n:"Reparación de celulares"},{icon:"🍳",n:"Técnico electrodomésticos"},{icon:"🚗",n:"Mecánico a domicilio"},{icon:"📺",n:"TV & electrónica"},{icon:"🖨️",n:"Impresoras & equipos"}]},
  {id:"profesionales",nombre:"Profesionales Matriculados",icon:"📐",color:"rgba(212,180,74,0.08)",subs:[{icon:"📐",n:"Agrimensor"},{icon:"🏛️",n:"Arquitecto"},{icon:"🏗️",n:"Ingeniero civil"},{icon:"⚡",n:"Electricista matriculado"},{icon:"🔥",n:"Técnico en gas mat."},{icon:"🧮",n:"Contador"},{icon:"⚖️",n:"Abogado"},{icon:"📦",n:"Despachante de aduana"},{icon:"🏢",n:"Escribano"},{icon:"🩺",n:"Médico a domicilio"}]},
  {id:"tramites",nombre:"Gestores & Trámites",icon:"📋",color:"rgba(100,200,150,0.08)",subs:[{icon:"🚗",n:"Gestor de autos"},{icon:"🛂",n:"Gestor de ciudadanía"},{icon:"✈️",n:"Gestor de visas"},{icon:"🏠",n:"Gestor inmobiliario"},{icon:"🏛️",n:"Trámites judiciales"},{icon:"📋",n:"Trámites ANSES / AFIP"},{icon:"🎓",n:"Reconocimiento de títulos"}]},
  {id:"digital",nombre:"Diseño & Digital",icon:"💻",color:"rgba(130,100,255,0.08)",subs:[{icon:"🎨",n:"Diseñador gráfico"},{icon:"🌐",n:"Diseño web"},{icon:"📱",n:"Diseño de app"},{icon:"📣",n:"Community manager"},{icon:"📸",n:"Fotógrafo profesional"},{icon:"🎬",n:"Editor de video"},{icon:"✍️",n:"Redactor & copywriter"},{icon:"📊",n:"Marketing digital"},{icon:"🤖",n:"Automatizaciones & IA"}]},
  {id:"mascotas",nombre:"Mascotas",icon:"🐾",color:"rgba(212,74,120,0.08)",subs:[{icon:"🐾",n:"Paseador de perros"},{icon:"🐶",n:"Peluquero canino"},{icon:"🐱",n:"Veterinario a domicilio"},{icon:"🛁",n:"Baño y peluquería canina"},{icon:"🏠",n:"Guardería de mascotas"},{icon:"🐕",n:"Adiestramiento canino"}]},
  {id:"bienestar",nombre:"Belleza & Bienestar",icon:"✨",color:"rgba(212,74,180,0.08)",subs:[{icon:"🧘",n:"Instructora de yoga"},{icon:"🏋️",n:"Personal trainer"},{icon:"🌸",n:"Cosmiatra"},{icon:"💅",n:"Manicura y pedicura"},{icon:"💇",n:"Peluquera a domicilio"},{icon:"🪷",n:"Esteticista"},{icon:"🧖",n:"Depilación a domicilio"},{icon:"💄",n:"Maquilladora profesional"},{icon:"💆",n:"Masajista"},{icon:"🌿",n:"Spa & relajación"}]},
  {id:"logistica",nombre:"Logística & Mudanzas",icon:"🚚",color:"rgba(74,120,212,0.08)",subs:[{icon:"🚚",n:"Mudanzas"},{icon:"🛻",n:"Fletes"},{icon:"🏍️",n:"Mensajería en moto"},{icon:"🛠️",n:"Armado muebles"},{icon:"📦",n:"Guardamuebles"},{icon:"🚗",n:"Remis & traslados"}]},
];

const RESP = ["Perfecto, te confirmo enseguida.","Dale, sin problema!","¿Me podés mandar la dirección exacta?","Listo, quedamos así.","Anotado, hasta el miércoles!"];

// ─── UI Helpers ───
const Av=({foto,nombre,size=46})=>{
  const ini=nombre?nombre.split(" ").map(n=>n[0]).slice(0,2).join("").toUpperCase():"?";
  return <div style={{width:size,height:size,borderRadius:"50%",background:"rgba(74,143,212,0.15)",border:"2px solid rgba(74,143,212,0.3)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,overflow:"hidden"}}>
    {foto?<img src={foto} alt={nombre} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontSize:size*.32,color:"#6cb3f5",fontWeight:600}}>{ini}</span>}
  </div>;
};

const Btn=({children,onClick,disabled=false,loading=false,style={}})=>(
  <button onClick={onClick} disabled={disabled||loading}
    style={{background:"linear-gradient(135deg,#4a8fd4,#1e4d82)",border:"none",color:"#fff",padding:"15px 24px",borderRadius:13,fontFamily:F.sans,fontSize:15,fontWeight:600,cursor:(disabled||loading)?"not-allowed":"pointer",width:"100%",transition:"all .2s",opacity:(disabled||loading)?.6:1,...style}}
    onMouseEnter={e=>{if(!disabled&&!loading)e.currentTarget.style.transform="translateY(-2px)"}}
    onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)"}}
  >{loading?"Procesando...":children}</button>
);

const Ghost=({children,onClick,style={}})=>(
  <button onClick={onClick} style={{background:"rgba(74,143,212,0.08)",border:"1px solid rgba(74,143,212,0.3)",color:"#6cb3f5",padding:"15px 24px",borderRadius:13,fontFamily:F.sans,fontSize:15,fontWeight:500,cursor:"pointer",width:"100%",transition:"all .2s",...style}}
    onMouseEnter={e=>e.currentTarget.style.background="rgba(74,143,212,0.15)"}
    onMouseLeave={e=>e.currentTarget.style.background="rgba(74,143,212,0.08)"}
  >{children}</button>
);

const Back=({onClick})=><button onClick={onClick} style={{background:"none",border:"none",color:"#4a8fd4",fontSize:14,cursor:"pointer",marginBottom:20,fontFamily:F.sans}}>← Volver</button>;
const Lbl=({children})=><label style={{fontSize:11,color:"#b0c4d8",letterSpacing:1.5,fontWeight:600}}>{children}</label>;

const Inp=({placeholder,type="text",value,onChange,err,style={}})=>(
  <>
    <input type={type} placeholder={placeholder} value={value} onChange={onChange}
      style={{width:"100%",marginTop:8,background:"#0d1f35",border:`1px solid ${err?"#f87171":"rgba(74,143,212,0.15)"}`,color:"#fff",padding:"13px 15px",borderRadius:10,fontFamily:F.sans,fontSize:14,...style}}/>
    {err&&<p style={{color:"#f87171",fontSize:12,marginTop:4}}>{err}</p>}
  </>
);

const Sel=({value,onChange,children,style={}})=>(
  <select value={value} onChange={onChange}
    style={{width:"100%",marginTop:8,background:"#0d1f35",border:"1px solid rgba(74,143,212,0.15)",color:"#fff",padding:"13px 15px",borderRadius:10,fontFamily:F.sans,fontSize:14,...style}}
  >{children}</select>
);

// ─── TyC Cliente ───
const TyCCliente=({onAccept,onClose})=>(
  <div className="ov" style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",zIndex:1000,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
    <div className="mod" style={{background:"#0d1f35",borderRadius:"20px 20px 0 0",padding:"28px 24px 36px",maxWidth:480,width:"100%",border:"1px solid rgba(74,143,212,0.15)",maxHeight:"85vh",display:"flex",flexDirection:"column"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <h3 style={{fontFamily:F.serif,fontSize:22,fontWeight:400,color:"#fff"}}>Términos y Condiciones</h3>
        <button onClick={onClose} style={{background:"none",border:"none",color:"#8a9bb0",fontSize:22,cursor:"pointer"}}>×</button>
      </div>
      <div style={{overflowY:"auto",flex:1,paddingRight:4,marginBottom:20}}>
        {[
          ["1. ¿Qué es Nexo?","Nexo es una plataforma que conecta personas que necesitan servicios con profesionales independientes. No somos una agencia de empleo ni garantizamos la prestación del servicio."],
          ["2. Tu responsabilidad como cliente","Al publicar un pedido, aceptás que la contratación y el acuerdo económico con el profesional son de tu exclusiva responsabilidad. Nexo actúa como intermediario de contacto."],
          ["3. Privacidad de tus datos","Tu nombre, email y teléfono serán compartidos únicamente con los profesionales que respondan a tu pedido. No vendemos ni compartimos tus datos con terceros."],
          ["4. Calificaciones","Al finalizar un servicio, podés calificar al profesional. Las calificaciones son públicas y contribuyen a la confianza de la comunidad."],
          ["5. Servicio gratuito","Publicar pedidos y contactar profesionales en Nexo es completamente gratuito para los clientes."],
          ["6. Ley aplicable","Estos términos se rigen por la legislación argentina, incluyendo la Ley 25.326 de Protección de Datos Personales."],
        ].map(([t,c])=>(
          <div key={t} style={{marginBottom:14}}>
            <div style={{fontWeight:600,fontSize:13,color:"#6cb3f5",marginBottom:4}}>{t}</div>
            <p style={{fontSize:13,color:"#b0c4d8",lineHeight:1.6,fontWeight:300}}>{c}</p>
          </div>
        ))}
      </div>
      <div style={{display:"flex",gap:10}}>
        <button onClick={onClose} style={{flex:1,background:"transparent",border:"1px solid rgba(74,143,212,0.15)",color:"#fff",padding:14,borderRadius:10,fontFamily:F.sans,fontSize:14,cursor:"pointer"}}>Cancelar</button>
        <button onClick={onAccept} style={{flex:2,background:"linear-gradient(135deg,#4a8fd4,#1e4d82)",border:"none",color:"#fff",padding:14,borderRadius:10,fontFamily:F.sans,fontSize:14,fontWeight:600,cursor:"pointer"}}>Acepto ✓</button>
      </div>
    </div>
  </div>
);

// ─── TyC Profesional ───
const TyCPro=({onAccept,onClose})=>(
  <div className="ov" style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",zIndex:1000,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
    <div className="mod" style={{background:"#0d1f35",borderRadius:"20px 20px 0 0",padding:"28px 24px 36px",maxWidth:480,width:"100%",border:"1px solid rgba(74,143,212,0.15)",maxHeight:"85vh",display:"flex",flexDirection:"column"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <h3 style={{fontFamily:F.serif,fontSize:22,fontWeight:400,color:"#fff"}}>Términos y Condiciones</h3>
        <button onClick={onClose} style={{background:"none",border:"none",color:"#8a9bb0",fontSize:22,cursor:"pointer"}}>×</button>
      </div>
      <div style={{overflowY:"auto",flex:1,paddingRight:4,marginBottom:20}}>
        {[
          ["1. Tu rol en Nexo","Nexo es una plataforma de contacto entre profesionales y clientes. No somos tu empleador ni garantizamos la relación laboral. Sos un prestador de servicios independiente."],
          ["2. Verificación de identidad","Para activar tu perfil debés completar el proceso de verificación de identidad. Tu cuenta permanecerá pendiente hasta que nuestro equipo valide tus datos."],
          ["3. Responsabilidad por el servicio","Sos responsable de la calidad, puntualidad y resultado de los trabajos que ofrecés. Nexo no asume responsabilidad por daños o incumplimientos durante la prestación."],
          ["4. Planes y suscripciones","El plan Inicio es gratuito. Los planes Profesional y Empresa se cobran mensualmente vía Mercado Pago. Podés cancelar en cualquier momento."],
          ["5. Calificaciones","Los clientes pueden calificarte luego de cada servicio. Las calificaciones son públicas. Reiteradas calificaciones negativas pueden resultar en la suspensión de tu cuenta."],
          ["6. Conducta","Queda prohibido el uso de Nexo para actividades ilegales, fraudulentas o que violen los derechos de terceros. Nexo se reserva el derecho de suspender cuentas que incumplan estas normas."],
          ["7. Privacidad","Tus datos son tratados conforme a la Ley 25.326 de Protección de Datos Personales de Argentina."],
        ].map(([t,c])=>(
          <div key={t} style={{marginBottom:14}}>
            <div style={{fontWeight:600,fontSize:13,color:"#6cb3f5",marginBottom:4}}>{t}</div>
            <p style={{fontSize:13,color:"#b0c4d8",lineHeight:1.6,fontWeight:300}}>{c}</p>
          </div>
        ))}
      </div>
      <div style={{display:"flex",gap:10}}>
        <button onClick={onClose} style={{flex:1,background:"transparent",border:"1px solid rgba(74,143,212,0.15)",color:"#fff",padding:14,borderRadius:10,fontFamily:F.sans,fontSize:14,cursor:"pointer"}}>Cancelar</button>
        <button onClick={onAccept} style={{flex:2,background:"linear-gradient(135deg,#4a8fd4,#1e4d82)",border:"none",color:"#fff",padding:14,borderRadius:10,fontFamily:F.sans,fontSize:14,fontWeight:600,cursor:"pointer"}}>Acepto ✓</button>
      </div>
    </div>
  </div>
);

// ─── PIN Admin ───
const PinPopup=({onSuccess,onClose})=>{
  const [pin,setPin]=useState("");
  const [err,setErr]=useState(false);
  const check=()=>{if(pin===ADMIN_PIN){onSuccess();}else{setErr(true);setPin("");setTimeout(()=>setErr(false),1500);}};
  return(
    <div className="ov" style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 24px"}}>
      <div className="mod" style={{background:"#0d1f35",borderRadius:20,padding:"36px 28px",maxWidth:300,width:"100%",border:"1px solid rgba(74,143,212,0.3)",textAlign:"center"}}>
        <div style={{fontSize:40,marginBottom:12}}>🔐</div>
        <h3 style={{fontFamily:F.serif,fontSize:22,color:"#fff",marginBottom:8}}>Panel Admin</h3>
        <p style={{color:"#b0c4d8",fontSize:13,marginBottom:20,fontWeight:300}}>Ingresá tu PIN</p>
        <input type="password" maxLength={4} value={pin} onChange={e=>setPin(e.target.value)} onKeyDown={e=>e.key==="Enter"&&check()} placeholder="• • • •"
          style={{width:"100%",background:"#060d1a",border:`1px solid ${err?"#f87171":"rgba(74,143,212,0.3)"}`,color:"#fff",padding:"14px",borderRadius:12,fontFamily:F.sans,fontSize:24,textAlign:"center",letterSpacing:8,marginBottom:12}}/>
        {err&&<p style={{color:"#f87171",fontSize:13,marginBottom:10}}>PIN incorrecto</p>}
        <div style={{display:"flex",gap:10}}>
          <button onClick={onClose} style={{flex:1,background:"transparent",border:"1px solid rgba(74,143,212,0.15)",color:"#fff",padding:12,borderRadius:10,fontFamily:F.sans,fontSize:14,cursor:"pointer"}}>Cancelar</button>
          <button onClick={check} style={{flex:2,background:"linear-gradient(135deg,#4a8fd4,#1e4d82)",border:"none",color:"#fff",padding:12,borderRadius:10,fontFamily:F.sans,fontSize:14,fontWeight:600,cursor:"pointer"}}>Ingresar →</button>
        </div>
      </div>
    </div>
  );
};

// ─── Registro Cliente con TyC propio ───
const RegCliente=({onClose,onSuccess})=>{
  const [n,setN]=useState("");const [e,setE]=useState("");const [t,setT]=useState("");
  const [err,setErr]=useState({});const [showTyC,setShowTyC]=useState(false);const [tycOk,setTycOk]=useState(false);
  const validar=()=>{
    const er={};
    if(!n.trim())er.n="Campo requerido";
    if(!e.trim()||!e.includes("@"))er.e="Email inválido";
    if(!t.trim())er.t="Campo requerido";
    if(!tycOk)er.tyc="Debés aceptar los términos";
    setErr(er);return Object.keys(er).length===0;
  };
  return(
    <>
    {showTyC&&<TyCCliente onAccept={()=>{setTycOk(true);setShowTyC(false);}} onClose={()=>setShowTyC(false)}/>}
    <div className="ov" style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.78)",zIndex:998,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div className="mod" style={{background:"#0d1f35",borderRadius:"20px 20px 0 0",padding:"28px 24px 36px",maxWidth:480,width:"100%",border:"1px solid rgba(74,143,212,0.15)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <h3 style={{fontFamily:F.serif,fontSize:22,fontWeight:400,color:"#fff"}}>Registrate para continuar</h3>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#8a9bb0",fontSize:22,cursor:"pointer"}}>×</button>
        </div>
        <p style={{color:"#b0c4d8",fontSize:13,marginBottom:20,fontWeight:300}}>Necesitamos saber quién sos para conectarte con los profesionales.</p>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div><Lbl>NOMBRE COMPLETO</Lbl><Inp placeholder="Tu nombre y apellido" value={n} onChange={ev=>setN(ev.target.value)} err={err.n}/></div>
          <div><Lbl>EMAIL</Lbl><Inp type="email" placeholder="tu@mail.com" value={e} onChange={ev=>setE(ev.target.value)} err={err.e}/></div>
          <div><Lbl>TELÉFONO</Lbl><Inp placeholder="+54 11 1234-5678" value={t} onChange={ev=>setT(ev.target.value)} err={err.t}/></div>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:10,marginTop:4}}>
              <div onClick={()=>tycOk?setTycOk(false):setShowTyC(true)} style={{width:20,height:20,borderRadius:5,border:`2px solid ${tycOk?"#4a8fd4":"rgba(74,143,212,0.4)"}`,background:tycOk?"#4a8fd4":"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}>
                {tycOk&&<span style={{fontSize:12,color:"#fff"}}>✓</span>}
              </div>
              <span style={{fontSize:13,color:"#b0c4d8"}}>Leí y acepto los <button onClick={()=>setShowTyC(true)} style={{background:"none",border:"none",color:"#4a8fd4",cursor:"pointer",fontSize:13,textDecoration:"underline"}}>Términos y Condiciones</button></span>
            </div>
            {err.tyc&&<p style={{color:"#f87171",fontSize:12,marginTop:4}}>{err.tyc}</p>}
          </div>
          <div style={{background:"rgba(74,143,212,0.06)",border:"1px solid rgba(74,143,212,0.15)",borderRadius:10,padding:"10px 14px",fontSize:12,color:"#b0c4d8"}}>
            🔒 Tus datos son privados. Solo los ven los profesionales que respondan a tu pedido.
          </div>
          <Btn onClick={()=>{if(validar())onSuccess({nombre:n,email:e,tel:t});}}>Continuar →</Btn>
        </div>
      </div>
    </div>
    </>
  );
};

// ─── Calificar ───
const Calificar=({nombre,onClose})=>{
  const [s,setS]=useState(0);const [h,setH]=useState(0);const [c,setC]=useState("");const [ok,setOk]=useState(false);
  if(ok)return(
    <div className="ov" style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.78)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 24px"}}>
      <div className="mod" style={{background:"#0d1f35",borderRadius:20,padding:"40px 28px",maxWidth:360,width:"100%",textAlign:"center"}}>
        <div style={{fontSize:52,marginBottom:12}}>⭐</div>
        <h3 style={{fontFamily:F.serif,fontSize:22,color:"#fff",marginBottom:8}}>¡Gracias por calificar!</h3>
        <p style={{color:"#b0c4d8",fontSize:14,marginBottom:20}}>Tu opinión ayuda a toda la comunidad.</p>
        <Btn onClick={onClose}>Cerrar</Btn>
      </div>
    </div>
  );
  return(
    <div className="ov" style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.78)",zIndex:999,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div className="mod" style={{background:"#0d1f35",borderRadius:"20px 20px 0 0",padding:"28px 24px 36px",maxWidth:480,width:"100%"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <h3 style={{fontFamily:F.serif,fontSize:22,color:"#fff"}}>Calificar a {nombre}</h3>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#8a9bb0",fontSize:22,cursor:"pointer"}}>×</button>
        </div>
        <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:12}}>
          {[1,2,3,4,5].map(n=>(
            <button key={n} onClick={()=>setS(n)} onMouseEnter={()=>setH(n)} onMouseLeave={()=>setH(0)}
              style={{background:"none",border:"none",fontSize:38,cursor:"pointer",transition:"transform .15s",transform:(h||s)>=n?"scale(1.2)":"scale(1)",filter:(h||s)>=n?"brightness(1)":"brightness(0.3)"}}>★</button>
          ))}
        </div>
        {s>0&&<div style={{textAlign:"center",color:"#6cb3f5",fontSize:13,marginBottom:12}}>{["","Malo","Regular","Bien","Muy bien","¡Excelente!"][s]}</div>}
        <Lbl>COMENTARIO (OPCIONAL)</Lbl>
        <textarea value={c} onChange={e=>setC(e.target.value)} placeholder="Contá cómo fue el trabajo..."
          style={{width:"100%",marginTop:8,marginBottom:16,background:"#060d1a",border:"1px solid rgba(74,143,212,0.15)",color:"#fff",padding:"12px 16px",borderRadius:10,fontFamily:F.sans,fontSize:14,resize:"none",minHeight:80}}/>
        <Btn onClick={()=>s>0&&setOk(true)} style={{opacity:s===0?.4:1}}>Enviar calificación</Btn>
      </div>
    </div>
  );
};

// ─── Chat con presupuesto ───
const ChatView=({pro,onClose,clienteNombre})=>{
  const [msgs,setMsgs]=useState([{id:1,de:"pro",texto:`Hola${clienteNombre?" "+clienteNombre.split(" ")[0]:""}! Vi tu pedido. ¿Cuándo necesitás que pase?`,hora:"ahora"}]);
  const [texto,setTexto]=useState("");const [pres,setPres]=useState("");const [showPres,setShowPres]=useState(false);const [typing,setTyping]=useState(false);
  const ref=useRef(null);
  useEffect(()=>{ref.current?.scrollIntoView({behavior:"smooth"});},[msgs,typing]);
  const send=(txt)=>{
    const t=txt||texto;if(!t.trim())return;
    const hora=new Date().toLocaleTimeString("es-AR",{hour:"2-digit",minute:"2-digit"});
    setMsgs(p=>[...p,{id:Date.now(),de:"cliente",texto:t.trim(),hora}]);setTexto("");setTyping(true);
    setTimeout(()=>{setTyping(false);setMsgs(p=>[...p,{id:Date.now()+1,de:"pro",texto:RESP[Math.floor(Math.random()*RESP.length)],hora:new Date().toLocaleTimeString("es-AR",{hour:"2-digit",minute:"2-digit"})}]);},1800);
  };
  return(
    <div className="chat" style={{position:"fixed",inset:0,background:"#060d1a",zIndex:200,display:"flex",flexDirection:"column",maxWidth:480,margin:"0 auto"}}>
      <div style={{background:"rgba(6,13,26,0.92)",backdropFilter:"blur(12px)",borderBottom:"1px solid rgba(74,143,212,0.15)",padding:"14px 20px",display:"flex",alignItems:"center",gap:14}}>
        <button onClick={onClose} style={{background:"none",border:"none",color:"#4a8fd4",fontSize:22,cursor:"pointer"}}>←</button>
        <Av foto={pro.foto} nombre={pro.nombre} size={40}/>
        <div style={{flex:1}}>
          <div style={{fontWeight:600,fontSize:15,color:"#fff"}}>{pro.nombre} {pro.verificado&&<span style={{fontSize:10,color:"#4a8fd4",background:"rgba(74,143,212,0.12)",padding:"2px 6px",borderRadius:20}}>✓</span>}</div>
          <div style={{fontSize:12,color:"#4ade80",marginTop:2}}>● En línea · {(pro.oficios||[pro.oficio])[0]}</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontSize:12,color:"#4a8fd4"}}>★ {pro.rating}</div>
          <div style={{fontSize:11,color:"#b0c4d8"}}>{pro.trabajos} trabajos</div>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"20px 16px",display:"flex",flexDirection:"column",gap:10}}>
        {msgs.map(m=>(
          <div key={m.id} style={{display:"flex",flexDirection:"column",alignItems:m.de==="cliente"?"flex-end":"flex-start"}}>
            <div style={{maxWidth:"78%",padding:"11px 14px",borderRadius:m.de==="cliente"?"16px 16px 4px 16px":"16px 16px 16px 4px",background:m.de==="cliente"?"linear-gradient(135deg,#4a8fd4,#1e4d82)":"#0d1f35",border:m.de==="pro"?"1px solid rgba(74,143,212,0.15)":"none",fontSize:14,lineHeight:1.55,color:"#fff"}}>{m.texto}</div>
            <span style={{fontSize:10,color:"#8a9bb0",marginTop:4}}>{m.hora}</span>
          </div>
        ))}
        {typing&&<div style={{display:"flex",gap:4,padding:"12px 16px",background:"#0d1f35",borderRadius:"16px 16px 16px 4px",width:"fit-content"}}>{[0,1,2].map(i=><span key={i} style={{width:6,height:6,borderRadius:"50%",background:"#8a9bb0",display:"inline-block",animation:`pulse 1s ${i*.2}s infinite`}}/>)}</div>}
        <div ref={ref}/>
      </div>
      {showPres&&(
        <div style={{background:"#0d1f35",borderTop:"1px solid rgba(74,143,212,0.15)",padding:"12px 16px",display:"flex",gap:10}}>
          <input value={pres} onChange={e=>setPres(e.target.value)} placeholder="Monto del presupuesto en $..."
            style={{flex:1,background:"#060d1a",border:"1px solid rgba(74,143,212,0.3)",color:"#fff",padding:"10px 14px",borderRadius:10,fontFamily:F.sans,fontSize:14}}/>
          <button onClick={()=>{if(pres.trim()){send(`💰 Presupuesto: $${pres}`);setPres("");setShowPres(false);}}} style={{background:"linear-gradient(135deg,#4ade80,#22c55e)",border:"none",color:"#fff",padding:"10px 16px",borderRadius:10,fontFamily:F.sans,fontSize:13,fontWeight:600,cursor:"pointer"}}>Enviar $</button>
          <button onClick={()=>setShowPres(false)} style={{background:"none",border:"none",color:"#8a9bb0",fontSize:20,cursor:"pointer"}}>×</button>
        </div>
      )}
      <div style={{background:"rgba(6,13,26,0.92)",borderTop:"1px solid rgba(74,143,212,0.15)",padding:"14px 16px",display:"flex",gap:10,alignItems:"flex-end"}}>
        <button onClick={()=>setShowPres(!showPres)} style={{width:42,height:42,borderRadius:10,background:"rgba(74,212,120,0.12)",border:"1px solid rgba(74,212,120,0.3)",color:"#4ade80",fontSize:18,cursor:"pointer",flexShrink:0}} title="Enviar presupuesto">💰</button>
        <textarea value={texto} onChange={e=>setTexto(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}} placeholder="Escribí un mensaje..." rows={1}
          style={{flex:1,background:"#0d1f35",border:"1px solid rgba(74,143,212,0.15)",color:"#fff",padding:"12px 16px",borderRadius:12,fontFamily:F.sans,fontSize:14,resize:"none",lineHeight:1.5,maxHeight:100}}/>
        <button onClick={()=>send()} disabled={!texto.trim()} style={{width:46,height:46,borderRadius:12,background:texto.trim()?"linear-gradient(135deg,#4a8fd4,#1e4d82)":"rgba(74,143,212,0.1)",border:"none",cursor:texto.trim()?"pointer":"default",fontSize:20,flexShrink:0,color:"#fff"}}>➤</button>
      </div>
    </div>
  );
};

// ─── Panel Profesional ───
const PanelPro=({pro,onClose})=>{
  const [tab,setTab]=useState("post");
  const [postulaciones,setPostulaciones]=useState([]);
  const [pedidos,setPedidos]=useState([]);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    // En producción esto vendría de Supabase
    setPostulaciones([]);
    setPedidos([]);
    setLoading(false);
  },[]);

  return(
    <div className="chat" style={{position:"fixed",inset:0,background:"#060d1a",zIndex:200,display:"flex",flexDirection:"column",maxWidth:480,margin:"0 auto"}}>
      <div style={{background:"rgba(6,13,26,0.92)",backdropFilter:"blur(12px)",borderBottom:"1px solid rgba(74,143,212,0.15)",padding:"14px 20px",display:"flex",alignItems:"center",gap:14}}>
        <button onClick={onClose} style={{background:"none",border:"none",color:"#4a8fd4",fontSize:22,cursor:"pointer"}}>←</button>
        <div style={{flex:1}}>
          <div style={{fontWeight:600,fontSize:16,color:"#fff"}}>Mi panel profesional</div>
          <div style={{fontSize:12,color:"#4ade80",marginTop:2}}>● Podés postularte sin importar la zona</div>
        </div>
      </div>
      <div style={{display:"flex",gap:6,margin:"14px 14px 0",background:"#0d1f35",padding:4,borderRadius:10}}>
        {[["post","Mis postulaciones"],["disp","Pedidos disponibles"]].map(([id,lbl])=>(
          <button key={id} onClick={()=>setTab(id)} style={{flex:1,padding:"9px 6px",borderRadius:8,border:"none",background:tab===id?"linear-gradient(135deg,#4a8fd4,#1e4d82)":"transparent",color:tab===id?"#fff":"#8a9bb0",fontFamily:F.sans,fontSize:12,fontWeight:600,cursor:"pointer"}}>{lbl}</button>
        ))}
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"14px",display:"flex",alignItems:"center",justifyContent:"center"}}>
        {loading?(
          <div style={{textAlign:"center",color:"#b0c4d8"}}>Cargando...</div>
        ):(
          <div style={{textAlign:"center",padding:"40px 20px",color:"#b0c4d8"}}>
            <div style={{fontSize:40,marginBottom:12}}>{tab==="post"?"📋":"🔍"}</div>
            <p style={{fontSize:14,fontWeight:300}}>{tab==="post"?"Aún no te postulaste a ningún pedido.":"No hay pedidos disponibles en este momento."}</p>
            <p style={{fontSize:12,color:"#8a9bb0",marginTop:8}}>Cuando haya pedidos en tu rubro, aparecerán acá.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Nav ───
const Nav=({setVista,noLeidas,cliente,onCerrar,onIniciar})=>(
  <nav style={{position:"sticky",top:0,zIndex:100,background:"rgba(6,13,26,0.92)",backdropFilter:"blur(12px)",borderBottom:"1px solid rgba(74,143,212,0.15)",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 20px"}}>
    <div onClick={()=>setVista("inicio")} style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}}>
      <div style={{width:36,height:36,borderRadius:8,background:"linear-gradient(135deg,#4a8fd4,#1a3a5c)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:F.serif,fontWeight:300,fontSize:20,color:"#fff"}}>N</div>
      <span style={{fontFamily:F.serif,fontWeight:300,fontSize:20,letterSpacing:3,color:"#fff"}}>NEX<span style={{color:"#4a8fd4"}}>O</span></span>
    </div>
    <div style={{display:"flex",gap:6,alignItems:"center"}}>
      <button onClick={()=>window.open("https://wa.me/5491161906655?text=Hola!%20Tengo%20una%20consulta%20sobre%20Nexo","_blank")} style={{background:"rgba(37,211,102,0.12)",border:"1px solid rgba(37,211,102,0.3)",color:"#25d366",padding:"7px 10px",borderRadius:8,fontFamily:F.sans,fontSize:13,cursor:"pointer"}}>💬</button>
      <button onClick={()=>setVista("notificaciones")} style={{position:"relative",background:"none",border:"none",cursor:"pointer",fontSize:18,padding:"4px"}}>
        🔔{noLeidas>0&&<span style={{position:"absolute",top:0,right:0,width:15,height:15,borderRadius:"50%",background:"#f87171",fontSize:9,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff"}}>{noLeidas}</span>}
      </button>
      {cliente
        ?<button onClick={onCerrar} style={{background:"rgba(248,113,113,0.12)",border:"1px solid rgba(248,113,113,0.3)",color:"#f87171",padding:"7px 10px",borderRadius:8,fontFamily:F.sans,fontSize:12,cursor:"pointer"}}>Cerrar sesión</button>
        :<button onClick={onIniciar} style={{background:"rgba(74,143,212,0.12)",border:"1px solid rgba(74,143,212,0.3)",color:"#6cb3f5",padding:"7px 10px",borderRadius:8,fontFamily:F.sans,fontSize:12,cursor:"pointer"}}>Iniciar sesión</button>
      }
    </div>
  </nav>
);

// ══════════════════════════════════
// APP PRINCIPAL
// ══════════════════════════════════
export default function App(){
  const [vista,setVista]=useState("inicio");
  const [catAb,setCatAb]=useState(null);
  const [busq,setBusq]=useState("");
  const [oficio,setOficio]=useState("");
  const [urgencia,setUrgencia]=useState(0);

  // Profesionales desde Supabase
  const [pros,setPros]=useState([]);
  const [loadingPros,setLoadingPros]=useState(true);

  // Admin
  const [adminTab,setAdminTab]=useState("verificaciones");
  const [adminSearch,setAdminSearch]=useState("");
  const [adminMsg,setAdminMsg]=useState({});
  const [showAddPro,setShowAddPro]=useState(false);
  const [apN,setApN]=useState("");const [apO,setApO]=useState("");const [apZ,setApZ]=useState("");const [apE,setApE]=useState("");
  const [showPin,setShowPin]=useState(false);
  const [adminOk,setAdminOk]=useState(false);

  const [leidas,setLeidas]=useState([]);
  const [postulados,setPostulados]=useState([]);
  const [showNotif,setShowNotif]=useState(false);
  const [notifAct,setNotifAct]=useState(null);

  const [showTyCPro,setShowTyCPro]=useState(false);
  const [tycOk,setTycOk]=useState(false);
  const [showCalif,setShowCalif]=useState(false);
  const [califNombre,setCalifNombre]=useState("");

  const [cliente,setCliente]=useState(null);
  const [showRegC,setShowRegC]=useState(false);
  const [pendNav,setPendNav]=useState(null);

  const [chat,setChat]=useState(null);
  const [showPanel,setShowPanel]=useState(false);

  // MP
  const [loadingMP,setLoadingMP]=useState(false);

  // Registro profesional
  const [rN,setRN]=useState("");const [rE,setRE]=useState("");const [rT,setRT]=useState("");const [rZ,setRZ]=useState("");
  const [rCatsSelec,setRCatsSelec]=useState([]);
  const [rOficiosSelec,setROficiosSelec]=useState([]);
  const [rFotoUrl,setRFotoUrl]=useState(null);
  const [rErr,setRErr]=useState({});

  // Cargar profesionales desde Supabase
  useEffect(()=>{
    const cargar=async()=>{
      try{
        const {data}=await supabase.from('profesionales').select('*').eq('estado','activo');
        if(data) setPros(data.map(p=>({...p,oficios:p.oficio?p.oficio.split(", "):[],foto:null,rating:p.rating||0,trabajos:p.trabajos_realizados||0,verificado:p.verificado||false})));
      }catch(e){}
      setLoadingPros(false);
    };
    cargar();
  },[]);

  const activos=pros.filter(p=>p.estado==="activo"||p.verificado);
  const pendientes=pros.filter(p=>p.estado==="pendiente");
  const noLeidas=0;

  const catsFilt=busq.trim()?CATS.map(c=>({...c,subs:c.subs.filter(s=>s.n.toLowerCase().includes(busq.toLowerCase()))})).filter(c=>c.subs.length>0):CATS;
  const prosFilt=adminSearch.trim()?pros.filter(p=>p.nombre?.toLowerCase().includes(adminSearch.toLowerCase())||(p.oficio||"").toLowerCase().includes(adminSearch.toLowerCase())):pros;

  const elegirOficio=n=>{setOficio(n);setVista("buscar");setCatAb(null);};
  const irComoCliente=dest=>{if(!cliente){setPendNav(dest);setShowRegC(true);}else setVista(dest);};

  const onClienteReg=async data=>{
    try{await supabase.from('clientes').insert([{nombre:data.nombre,email:data.email,telefono:data.tel}]);}catch(e){}
    setCliente(data);setShowRegC(false);
    if(pendNav){setVista(pendNav);setPendNav(null);}
  };

  const abrirNotif=n=>{setNotifAct(n);setShowNotif(true);setLeidas(p=>p.includes(n.id)?p:[...p,n.id]);};
  const postular=()=>{setPostulados(p=>[...p,notifAct.id]);setShowNotif(false);setNotifAct(null);};

  const verificar=id=>setPros(p=>p.map(x=>x.id===id?{...x,verificado:true,estado:"activo"}:x));
  const rechazar=id=>setPros(p=>p.map(x=>x.id===id?{...x,verificado:false,estado:"rechazado"}:x));

  const toggleCat=cat=>{setRCatsSelec(prev=>prev.includes(cat)?prev.filter(c=>c!==cat):[...prev,cat]);};
  const toggleOficio=o=>setROficiosSelec(prev=>prev.includes(o)?prev.filter(x=>x!==o):[...prev,o]);

  const validarReg=()=>{
    const e={};
    if(!rN.trim())e.n="Campo requerido";
    if(!rE.trim()||!rE.includes("@"))e.e="Email inválido";
    if(!rT.trim())e.t="Campo requerido";
    if(!rZ.trim())e.z="Seleccioná una zona";
    if(!tycOk)e.tyc="Debés aceptar los términos";
    setRErr(e);return Object.keys(e).length===0;
  };

  const handleReg=async()=>{
    if(!tycOk){setShowTyCPro(true);return;}
    if(!validarReg())return;
    const oficiosStr=rOficiosSelec.length>0?rOficiosSelec.join(", "):rCatsSelec.length>0?CATS.find(c=>c.id===rCatsSelec[0])?.subs[0].n||"General":"General";
    try{
      await supabase.from('profesionales').insert([{nombre:rN,email:rE,telefono:rT,zona:rZ,oficio:oficiosStr,verificado:false,estado:'pendiente'}]);
    }catch(e){console.error(e);}
    setVista('planes');
  };

  const addPro=async()=>{
    if(!apN.trim()||!apO.trim()||!apZ.trim())return;
    try{
      await supabase.from('profesionales').insert([{nombre:apN,email:apE,telefono:"",zona:apZ,oficio:apO,verificado:true,estado:'activo'}]);
      setPros(p=>[...p,{id:Date.now(),nombre:apN,oficios:[apO],oficio:apO,zona:apZ,email:apE,rating:0,trabajos:0,verificado:true,estado:"activo",foto:null}]);
    }catch(e){}
    setApN("");setApO("");setApZ("");setApE("");setShowAddPro(false);
  };

  // Pago con Mercado Pago
  const pagarConMP=async(plan)=>{
    setLoadingMP(true);
    try{
      const url=await crearPreferencia(plan);
      if(url) window.open(url,"_blank");
      else alert("Error al generar el pago. Intentá de nuevo.");
    }catch(e){alert("Error al conectar con Mercado Pago.");}
    setLoadingMP(false);
  };

  if(chat)return(<><style>{GS}</style><ChatView pro={chat} onClose={()=>setChat(null)} clienteNombre={cliente?.nombre}/></>);
  if(showPanel)return(<><style>{GS}</style><PanelPro pro={cliente} onClose={()=>setShowPanel(false)}/></>);

  return(
    <><style>{GS}</style>
    <div style={{minHeight:"100vh",background:"#060d1a",maxWidth:480,margin:"0 auto",color:"#fff"}}>

      <Nav setVista={setVista} noLeidas={noLeidas} cliente={cliente} onCerrar={()=>setCliente(null)} onIniciar={()=>setShowRegC(true)}/>

      {/* INICIO */}
      {vista==="inicio"&&(
        <div>
          <div style={{minHeight:"88vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 28px 60px",background:"radial-gradient(ellipse at 50% 0%,rgba(74,143,212,0.12) 0%,transparent 65%)"}}>
            <div className="fu" style={{display:"inline-flex",alignItems:"center",gap:8,border:"1px solid rgba(74,143,212,0.15)",borderRadius:20,padding:"8px 18px",marginBottom:36,background:"rgba(74,143,212,0.06)"}}>
              <span style={{width:7,height:7,borderRadius:"50%",background:"#4a8fd4",display:"inline-block",animation:"pulse 2s infinite"}}/>
              <span style={{fontSize:11,letterSpacing:2,color:"#fff",fontWeight:400}}>ARGENTINA · ZONA NORTE · CABA</span>
            </div>
            <h1 className="fu1" style={{fontFamily:F.serif,fontSize:"clamp(38px,8vw,58px)",fontWeight:300,lineHeight:1.12,textAlign:"center",marginBottom:20,color:"#fff"}}>
              El oficio que<br/>necesitás, <em style={{color:"#6cb3f5",fontStyle:"italic",fontWeight:300}}>hoy.</em>
            </h1>
            <p className="fu2" style={{textAlign:"center",color:"#b0c4d8",fontSize:16,lineHeight:1.7,marginBottom:40,maxWidth:340,fontWeight:300}}>
              Conectamos vecinos con profesionales de confianza.<br/>Publicás tu pedido y ellos cotizan. Vos elegís.
            </p>
            {cliente&&<div style={{background:"rgba(74,212,120,0.08)",border:"1px solid rgba(74,212,120,0.3)",borderRadius:10,padding:"10px 18px",marginBottom:14,fontSize:13,color:"#4ade80"}}>✓ Hola, {cliente.nombre.split(" ")[0]}!</div>}
            <div className="fu3" style={{display:"flex",flexDirection:"column",gap:12,width:"100%",maxWidth:360}}>
              <Btn onClick={()=>irComoCliente("categorias")}>Necesito un servicio</Btn>
              <Ghost onClick={()=>setVista("registro-pro")}>Soy profesional</Ghost>
            </div>
            <button onClick={()=>setShowPanel(true)} style={{marginTop:14,background:"none",border:"none",color:"#4a8fd4",fontSize:13,cursor:"pointer",fontFamily:F.sans,textDecoration:"underline"}}>
              Tengo cuenta de profesional → Mi panel
            </button>
            <div className="fu4" style={{display:"flex",marginTop:48,width:"100%",borderTop:"1px solid rgba(74,143,212,0.15)",paddingTop:32}}>
              {[["2.400+","PROFESIONALES"],["90+","OFICIOS"],["4.9★","CALIFICACIÓN"]].map(([v,l])=>(
                <div key={l} style={{flex:1,textAlign:"center"}}>
                  <div style={{fontFamily:F.serif,fontSize:28,fontWeight:400,color:"#4a8fd4"}}>{v}</div>
                  <div style={{fontSize:10,letterSpacing:1.5,color:"#fff",marginTop:4}}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{padding:"0 24px 40px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div>
                <h2 style={{fontFamily:F.serif,fontSize:24,fontWeight:400,color:"#fff"}}>¿Qué necesitás?</h2>
                <p style={{color:"#b0c4d8",fontSize:13,marginTop:4,fontWeight:300}}>12 categorías · 90+ oficios</p>
              </div>
              <button onClick={()=>setVista("categorias")} style={{background:"none",border:"1px solid rgba(74,143,212,0.15)",color:"#4a8fd4",padding:"7px 14px",borderRadius:8,fontSize:13,cursor:"pointer",fontFamily:F.sans}}>Ver todas →</button>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
              {CATS.map(cat=>(
                <button key={cat.id} onClick={()=>{setVista("categorias");setCatAb(cat.id);}}
                  style={{background:"#0d1f35",border:"1px solid rgba(74,143,212,0.15)",borderRadius:12,padding:"16px 8px",display:"flex",flexDirection:"column",alignItems:"center",gap:7,cursor:"pointer",transition:"all .2s"}}
                  onMouseEnter={e=>{e.currentTarget.style.background="#102540";e.currentTarget.style.transform="translateY(-2px)";}}
                  onMouseLeave={e=>{e.currentTarget.style.background="#0d1f35";e.currentTarget.style.transform="translateY(0)";}}
                >
                  <span style={{fontSize:24}}>{cat.icon}</span>
                  <span style={{fontSize:10,color:"#fff",textAlign:"center",lineHeight:1.3}}>{cat.nombre.split("&")[0].trim()}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{padding:"0 24px 40px"}}>
            <h2 style={{fontFamily:F.serif,fontSize:24,fontWeight:400,marginBottom:6,color:"#fff"}}>Profesionales verificados</h2>
            <p style={{color:"#b0c4d8",fontSize:13,marginBottom:20,fontWeight:300}}>Registrados y verificados en Nexo</p>
            {loadingPros?(
              <div style={{textAlign:"center",padding:"30px 0",color:"#b0c4d8"}}>Cargando profesionales...</div>
            ):activos.length===0?(
              <div style={{textAlign:"center",padding:"30px 0",color:"#b0c4d8"}}>
                <div style={{fontSize:36,marginBottom:10}}>👷</div>
                <p style={{fontSize:14}}>Pronto habrá profesionales disponibles.</p>
              </div>
            ):activos.map(p=>(
              <div key={p.id} onClick={()=>{setChat(p);}}
                style={{background:"#0d1f35",border:"1px solid rgba(74,143,212,0.15)",borderRadius:14,padding:"14px 16px",display:"flex",alignItems:"center",gap:14,cursor:"pointer",transition:"all .2s",marginBottom:10}}
                onMouseEnter={e=>e.currentTarget.style.background="#102540"}
                onMouseLeave={e=>e.currentTarget.style.background="#0d1f35"}
              >
                <Av foto={p.foto} nombre={p.nombre} size={46}/>
                <div style={{flex:1}}>
                  <div style={{fontWeight:600,fontSize:15,color:"#fff"}}>{p.nombre} {p.verificado&&<span style={{fontSize:11,color:"#4a8fd4",background:"rgba(74,143,212,0.12)",padding:"2px 7px",borderRadius:20}}>✓</span>}</div>
                  <div style={{color:"#b0c4d8",fontSize:12,marginTop:2}}>{p.oficio} · {p.zona}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  {p.rating>0&&<div style={{color:"#4a8fd4",fontWeight:600}}>★ {p.rating}</div>}
                  <div style={{color:"#b0c4d8",fontSize:11,marginTop:2}}>💬 Chatear</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CATEGORÍAS */}
      {vista==="categorias"&&(
        <div className="page" style={{padding:"24px 20px 60px"}}>
          <Back onClick={()=>setVista("inicio")}/>
          <h2 style={{fontFamily:F.serif,fontSize:28,fontWeight:400,marginBottom:4,color:"#fff"}}>Todos los oficios</h2>
          <p style={{color:"#b0c4d8",fontSize:13,marginBottom:20}}>12 categorías · 90+ profesiones</p>
          <div style={{position:"relative",marginBottom:22}}>
            <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",color:"#8a9bb0"}}>🔍</span>
            <input value={busq} onChange={e=>setBusq(e.target.value)} placeholder="Buscar oficio..."
              style={{width:"100%",background:"#0d1f35",border:"1px solid rgba(74,143,212,0.15)",color:"#fff",padding:"13px 40px 13px 42px",borderRadius:12,fontFamily:F.sans,fontSize:15}}/>
            {busq&&<button onClick={()=>setBusq("")} style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"#8a9bb0",cursor:"pointer",fontSize:20}}>×</button>}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {catsFilt.map(cat=>(
              <div key={cat.id} style={{borderRadius:14,overflow:"hidden",border:`1px solid ${catAb===cat.id?"rgba(74,143,212,0.4)":"rgba(74,143,212,0.15)"}`}}>
                <button onClick={()=>setCatAb(p=>p===cat.id?null:cat.id)}
                  style={{width:"100%",background:catAb===cat.id?"rgba(74,143,212,0.1)":"#0d1f35",border:"none",padding:"16px 18px",display:"flex",alignItems:"center",gap:14,cursor:"pointer"}}>
                  <div style={{width:42,height:42,borderRadius:10,fontSize:20,background:cat.color,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{cat.icon}</div>
                  <div style={{flex:1,textAlign:"left"}}>
                    <div style={{fontWeight:600,fontSize:15,color:"#fff"}}>{cat.nombre}</div>
                    <div style={{fontSize:12,color:"#b0c4d8",marginTop:2}}>{cat.subs.length} servicios</div>
                  </div>
                  <span style={{color:"#4a8fd4",fontSize:20,transition:"transform .25s",transform:catAb===cat.id?"rotate(180deg)":"rotate(0deg)",display:"inline-block"}}>⌄</span>
                </button>
                {(catAb===cat.id||busq)&&(
                  <div style={{background:"rgba(6,13,26,0.7)",borderTop:"1px solid rgba(74,143,212,0.15)",display:"grid",gridTemplateColumns:"repeat(3,1fr)"}}>
                    {cat.subs.map((sub,idx)=>(
                      <button key={sub.n} onClick={()=>elegirOficio(sub.n)}
                        style={{background:"transparent",border:"none",borderRight:idx%3!==2?"1px solid rgba(74,143,212,0.15)":"none",borderBottom:idx<cat.subs.length-3?"1px solid rgba(74,143,212,0.15)":"none",padding:"15px 8px",display:"flex",flexDirection:"column",alignItems:"center",gap:6,cursor:"pointer"}}
                        onMouseEnter={e=>e.currentTarget.style.background="rgba(74,143,212,0.1)"}
                        onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                      >
                        <span style={{fontSize:22}}>{sub.icon}</span>
                        <span style={{fontSize:10,color:"#fff",textAlign:"center",lineHeight:1.3}}>{sub.n}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BUSCAR */}
      {vista==="buscar"&&(
        <div className="page" style={{padding:"32px 24px 60px"}}>
          <Back onClick={()=>setVista("categorias")}/>
          {cliente&&<div style={{background:"rgba(74,212,120,0.08)",border:"1px solid rgba(74,212,120,0.3)",borderRadius:10,padding:"10px 14px",marginBottom:20,display:"flex",alignItems:"center",gap:8}}><span style={{color:"#4ade80"}}>✓</span><span style={{fontSize:13,color:"#4ade80"}}>Hola, {cliente.nombre.split(" ")[0]}! Tu pedido quedará registrado.</span></div>}
          <h2 style={{fontFamily:F.serif,fontSize:28,fontWeight:400,marginBottom:6,color:"#fff"}}>{oficio||"Publicar pedido"}</h2>
          <p style={{color:"#b0c4d8",fontSize:14,marginBottom:28,fontWeight:300}}>Los profesionales te cotizan en minutos</p>
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <div>
              <Lbl>SERVICIO</Lbl>
              <div onClick={()=>setVista("categorias")} style={{marginTop:8,background:"#0d1f35",border:"1px solid #4a8fd4",borderRadius:10,padding:"14px 16px",color:"#6cb3f5",fontSize:15,cursor:"pointer"}}>
                {oficio} <span style={{color:"#b0c4d8",fontWeight:300,fontSize:13}}>· cambiar</span>
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
              <textarea placeholder="Describí qué necesitás con el mayor detalle posible..."
                style={{width:"100%",marginTop:8,background:"#0d1f35",border:"1px solid rgba(74,143,212,0.15)",color:"#fff",padding:"14px 16px",borderRadius:10,fontFamily:F.sans,fontSize:14,resize:"none",minHeight:100,lineHeight:1.6}}/>
            </div>
            <div>
              <Lbl>URGENCIA</Lbl>
              <div style={{display:"flex",gap:8,marginTop:8}}>
                {["Urgente (hoy)","Esta semana","Sin apuro"].map((u,i)=>(
                  <button key={u} onClick={()=>setUrgencia(i)}
                    style={{flex:1,padding:"10px 4px",background:urgencia===i?"rgba(74,143,212,0.15)":"#0d1f35",border:`1px solid ${urgencia===i?"#4a8fd4":"rgba(74,143,212,0.15)"}`,borderRadius:8,color:urgencia===i?"#6cb3f5":"#fff",fontSize:11,fontFamily:F.sans,cursor:"pointer",transition:"all .2s"}}>{u}</button>
                ))}
              </div>
            </div>
            <Btn onClick={()=>setVista("cotizaciones")} style={{marginTop:4}}>Publicar pedido →</Btn>
          </div>
        </div>
      )}

      {/* COTIZACIONES */}
      {vista==="cotizaciones"&&(
        <div className="page" style={{padding:"32px 24px 60px"}}>
          <Back onClick={()=>setVista("buscar")}/>
          <h2 style={{fontFamily:F.serif,fontSize:28,fontWeight:400,marginBottom:8,color:"#fff"}}>Profesionales disponibles</h2>
          <p style={{color:"#b0c4d8",fontSize:14,marginBottom:24,fontWeight:300}}>Tu pedido fue publicado. Los profesionales te van a contactar en breve.</p>
          {activos.length===0?(
            <div style={{textAlign:"center",padding:"40px 0",color:"#b0c4d8"}}>
              <div style={{fontSize:40,marginBottom:12}}>⏳</div>
              <p style={{fontSize:14}}>Estamos buscando profesionales en tu zona...</p>
            </div>
          ):activos.map(p=>(
            <div key={p.id} style={{background:"#0d1f35",border:"1px solid rgba(74,143,212,0.15)",borderRadius:14,padding:18,marginBottom:12}}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
                <Av foto={p.foto} nombre={p.nombre} size={46}/>
                <div style={{flex:1}}>
                  <div style={{fontWeight:600,fontSize:15,color:"#fff"}}>{p.nombre} {p.verificado&&<span style={{color:"#4a8fd4"}}>✓</span>}</div>
                  <div style={{color:"#b0c4d8",fontSize:12}}>{p.oficio} · {p.zona}</div>
                </div>
              </div>
              <button onClick={()=>setChat(p)} style={{width:"100%",background:"linear-gradient(135deg,#4a8fd4,#1e4d82)",border:"none",color:"#fff",padding:12,borderRadius:10,fontFamily:F.sans,fontSize:13,fontWeight:600,cursor:"pointer"}}>💬 Contactar a {p.nombre.split(" ")[0]}</button>
            </div>
          ))}
        </div>
      )}

      {/* REGISTRO PROFESIONAL */}
      {vista==="registro-pro"&&(
        <div className="page" style={{padding:"32px 24px 60px"}}>
          <Back onClick={()=>setVista("inicio")}/>
          <h2 style={{fontFamily:F.serif,fontSize:30,fontWeight:300,marginBottom:8,color:"#fff"}}>Sumate como<br/><em style={{color:"#6cb3f5",fontStyle:"italic"}}>profesional</em></h2>
          <p style={{color:"#b0c4d8",fontSize:14,marginBottom:24,fontWeight:300}}>Empezá gratis. Recibí pedidos en tu zona.</p>
          {tycOk&&<div style={{background:"rgba(74,212,120,0.08)",border:"1px solid rgba(74,212,120,0.3)",borderRadius:10,padding:"10px 14px",marginBottom:20,display:"flex",alignItems:"center",gap:8}}><span style={{color:"#4ade80"}}>✓</span><span style={{fontSize:13,color:"#4ade80"}}>Términos aceptados</span></div>}

          {/* Foto */}
          <div style={{marginBottom:20,display:"flex",flexDirection:"column",alignItems:"center",gap:10}}>
            <div style={{width:80,height:80,borderRadius:"50%",background:"#0d1f35",border:`2px dashed ${rFotoUrl?"#4a8fd4":"rgba(74,143,212,0.3)"}`,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",cursor:"pointer"}} onClick={()=>document.getElementById('fi').click()}>
              {rFotoUrl?<img src={rFotoUrl} alt="foto" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontSize:28}}>📷</span>}
            </div>
            <input id="fi" type="file" accept="image/*" capture="user" onChange={e=>{const f=e.target.files[0];if(f)setRFotoUrl(URL.createObjectURL(f));}} style={{display:"none"}}/>
            <button onClick={()=>document.getElementById('fi').click()} style={{background:"none",border:"none",color:"#4a8fd4",fontSize:13,cursor:"pointer",fontFamily:F.sans,textDecoration:"underline"}}>{rFotoUrl?"Cambiar foto":"Subir foto de perfil"}</button>
          </div>

          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div><Lbl>NOMBRE COMPLETO</Lbl><Inp placeholder="Tu nombre y apellido" value={rN} onChange={e=>setRN(e.target.value)} err={rErr.n}/></div>
            <div><Lbl>EMAIL</Lbl><Inp type="email" placeholder="tu@mail.com" value={rE} onChange={e=>setRE(e.target.value)} err={rErr.e}/></div>
            <div><Lbl>TELÉFONO</Lbl><Inp placeholder="+54 11 1234-5678" value={rT} onChange={e=>setRT(e.target.value)} err={rErr.t}/></div>
            <div>
              <Lbl>ZONA DE TRABAJO</Lbl>
              <Sel value={rZ} onChange={e=>setRZ(e.target.value)} style={{color:rZ?"#fff":"#8a9bb0",border:`1px solid ${rErr.z?"#f87171":"rgba(74,143,212,0.15)"}`}}>
                <option value="">Seleccioná tu zona...</option>
                {["CABA - Palermo","CABA - Belgrano","CABA - Caballito","CABA - Villa Crespo","CABA - Flores","CABA - Villa Urquiza","GBA - Zona Norte","GBA - Zona Oeste","GBA - Zona Sur"].map(z=><option key={z} value={z}>{z}</option>)}
              </Sel>
              {rErr.z&&<p style={{color:"#f87171",fontSize:12,marginTop:4}}>{rErr.z}</p>}
            </div>

            <div>
              <Lbl>CATEGORÍAS QUE OFRECÉS</Lbl>
              <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:8}}>
                {CATS.map(c=>(
                  <button key={c.id} onClick={()=>toggleCat(c.id)}
                    style={{padding:"7px 12px",borderRadius:20,border:`1px solid ${rCatsSelec.includes(c.id)?"#4a8fd4":"rgba(74,143,212,0.2)"}`,background:rCatsSelec.includes(c.id)?"rgba(74,143,212,0.2)":"transparent",color:rCatsSelec.includes(c.id)?"#6cb3f5":"#b0c4d8",fontSize:12,cursor:"pointer",fontFamily:F.sans}}>
                    {c.icon} {c.nombre.split("&")[0].trim()}
                  </button>
                ))}
              </div>
            </div>

            {rCatsSelec.length>0&&(
              <div>
                <Lbl>OFICIOS ESPECÍFICOS</Lbl>
                <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:8}}>
                  {CATS.filter(c=>rCatsSelec.includes(c.id)).flatMap(c=>c.subs).map(s=>(
                    <button key={s.n} onClick={()=>toggleOficio(s.n)}
                      style={{padding:"6px 11px",borderRadius:20,border:`1px solid ${rOficiosSelec.includes(s.n)?"#4ade80":"rgba(74,143,212,0.2)"}`,background:rOficiosSelec.includes(s.n)?"rgba(74,212,120,0.15)":"transparent",color:rOficiosSelec.includes(s.n)?"#4ade80":"#b0c4d8",fontSize:11,cursor:"pointer",fontFamily:F.sans}}>
                      {s.icon} {s.n}
                    </button>
                  ))}
                </div>
                {rOficiosSelec.length>0&&<p style={{fontSize:12,color:"#4ade80",marginTop:8}}>✓ {rOficiosSelec.length} oficio{rOficiosSelec.length>1?"s":""} seleccionado{rOficiosSelec.length>1?"s":""}</p>}
              </div>
            )}

            <div>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div onClick={()=>tycOk?setTycOk(false):setShowTyCPro(true)} style={{width:20,height:20,borderRadius:5,border:`2px solid ${tycOk?"#4a8fd4":"rgba(74,143,212,0.4)"}`,background:tycOk?"#4a8fd4":"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}>
                  {tycOk&&<span style={{fontSize:12,color:"#fff"}}>✓</span>}
                </div>
                <span style={{fontSize:13,color:"#b0c4d8"}}>Leí y acepto los <button onClick={()=>setShowTyCPro(true)} style={{background:"none",border:"none",color:"#4a8fd4",cursor:"pointer",fontSize:13,textDecoration:"underline"}}>Términos y Condiciones</button></span>
              </div>
              {rErr.tyc&&<p style={{color:"#f87171",fontSize:12,marginTop:4}}>{rErr.tyc}</p>}
            </div>

            <Btn onClick={handleReg} style={{marginTop:4}}>Ver planes →</Btn>
          </div>
        </div>
      )}

      {/* NOTIFICACIONES */}
      {vista==="notificaciones"&&(
        <div className="page" style={{padding:"24px 20px 60px"}}>
          <Back onClick={()=>setVista("inicio")}/>
          <h2 style={{fontFamily:F.serif,fontSize:28,fontWeight:400,marginBottom:4,color:"#fff"}}>Notificaciones</h2>
          <div style={{textAlign:"center",padding:"40px 0",color:"#b0c4d8"}}>
            <div style={{fontSize:40,marginBottom:12}}>🔔</div>
            <p style={{fontSize:14}}>No hay notificaciones nuevas.</p>
          </div>
        </div>
      )}

      {/* PLANES — SOLO PARA PROFESIONALES */}
      {vista==="planes"&&(
        <div className="page" style={{padding:"32px 24px 60px"}}>
          <Back onClick={()=>setVista("inicio")}/>
          <h2 style={{fontFamily:F.serif,fontSize:32,fontWeight:300,marginBottom:6,color:"#fff"}}>Elegí tu plan</h2>
          <p style={{color:"#b0c4d8",fontSize:14,marginBottom:8,fontWeight:300}}>Solo para profesionales · Clientes siempre gratis</p>
          <div style={{background:"rgba(74,212,120,0.06)",border:"1px solid rgba(74,212,120,0.2)",borderRadius:10,padding:"10px 14px",marginBottom:28,fontSize:13,color:"#4ade80"}}>
            ✓ Publicar pedidos como cliente es siempre gratuito en Nexo.
          </div>
          {[
            {nombre:"Inicio",precio:0,sub:"7 días sin costo",dest:false,tag:null,features:["3 contactos por mes","Perfil verificado ✓","Notificaciones de pedidos","Acceso a todas las categorías"]},
            {nombre:"Profesional",precio:2500,sub:"por mes",dest:true,tag:"MÁS POPULAR",features:["Contactos ilimitados","Badge destacado","Chat con clientes","Soporte prioritario","Estadísticas básicas","Sin límite de zona"]},
            {nombre:"Empresa",precio:18000,sub:"por mes",dest:false,tag:"PARA EMPRESAS",features:["Todo Profesional","Hasta 5 usuarios del equipo","Primero en búsquedas","Estadísticas avanzadas","Panel de empresa"]},
          ].map(p=>(
            <div key={p.nombre} style={{background:p.dest?"linear-gradient(135deg,rgba(74,143,212,0.18),rgba(30,77,130,0.18))":"#0d1f35",border:`1px solid ${p.dest?"#4a8fd4":p.nombre==="Empresa"?"rgba(212,180,74,0.4)":"rgba(74,143,212,0.15)"}`,borderRadius:16,padding:24,position:"relative",boxShadow:p.dest?"0 0 40px rgba(74,143,212,0.15)":"none",marginBottom:16}}>
              {p.tag&&<div style={{position:"absolute",top:-12,left:"50%",transform:"translateX(-50%)",background:p.dest?"#4a8fd4":"rgba(212,180,74,0.9)",color:"#fff",fontSize:11,fontWeight:600,padding:"4px 16px",borderRadius:20,whiteSpace:"nowrap"}}>{p.tag}</div>}
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:16}}>
                <div>
                  <div style={{fontFamily:F.serif,fontSize:22,color:"#fff"}}>{p.nombre}</div>
                  <div style={{color:"#b0c4d8",fontSize:12,marginTop:2}}>{p.sub}</div>
                </div>
                <div style={{fontFamily:F.serif,fontSize:28,fontWeight:600,color:p.dest?"#6cb3f5":"#fff"}}>{p.precio===0?"Gratis":`$${p.precio.toLocaleString()}`}</div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>
                {p.features.map(f=><div key={f} style={{display:"flex",alignItems:"center",gap:8,fontSize:13,color:"#b0c4d8"}}><span style={{color:p.dest?"#4a8fd4":"#8a9bb0"}}>✓</span> {f}</div>)}
              </div>
              <Btn
                loading={loadingMP&&p.precio>0}
                onClick={async()=>{
                  if(p.precio===0){setVista("inicio");return;}
                  if(p.nombre==="Empresa"){window.open("https://wa.me/5491161906655?text=Hola!%20Quiero%20info%20sobre%20el%20plan%20Empresa%20de%20Nexo","_blank");return;}
                  await pagarConMP({nombre:p.nombre,precio:p.precio});
                }}
                style={{background:p.dest?"linear-gradient(135deg,#4a8fd4,#1e4d82)":p.nombre==="Empresa"?"rgba(212,180,74,0.15)":"rgba(74,143,212,0.08)",border:p.dest?"none":p.nombre==="Empresa"?"1px solid rgba(212,180,74,0.4)":"1px solid rgba(74,143,212,0.3)",color:p.dest?"#fff":p.nombre==="Empresa"?"#fbbf24":"#6cb3f5"}}
              >
                {p.precio===0?"Comenzar gratis":p.nombre==="Empresa"?"Contactar por WhatsApp →":"🔒 Pagar con Mercado Pago"}
              </Btn>
            </div>
          ))}
        </div>
      )}

      {/* ADMIN */}
      {vista==="admin"&&adminOk&&(
        <div className="page" style={{padding:"24px 20px 60px"}}>
          <Back onClick={()=>setVista("inicio")}/>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <h2 style={{fontFamily:F.serif,fontSize:26,fontWeight:400,color:"#fff"}}>Panel Admin</h2>
              <span style={{fontSize:11,background:"rgba(74,143,212,0.15)",color:"#4a8fd4",padding:"3px 10px",borderRadius:20,fontWeight:600}}>NEXO HQ</span>
            </div>
            <button onClick={()=>setShowAddPro(true)} style={{background:"linear-gradient(135deg,#4a8fd4,#1e4d82)",border:"none",color:"#fff",padding:"8px 14px",borderRadius:10,fontFamily:F.sans,fontSize:12,fontWeight:600,cursor:"pointer"}}>+ Pro gratis</button>
          </div>
          <p style={{color:"#b0c4d8",fontSize:13,marginBottom:24,fontWeight:300}}>Gestión interna · Solo vos podés ver esto</p>

          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:24}}>
            {[{val:pros.filter(p=>p.verificado).length,label:"Activos",color:"#4ade80"},{val:pendientes.length,label:"Pendientes",color:"#fbbf24"},{val:pros.length,label:"Total pros",color:"#4a8fd4"}].map(s=>(
              <div key={s.label} style={{background:"#0d1f35",border:"1px solid rgba(74,143,212,0.15)",borderRadius:12,padding:"12px 8px",textAlign:"center"}}>
                <div style={{fontFamily:F.serif,fontSize:22,color:s.color}}>{s.val}</div>
                <div style={{fontSize:10,color:"#fff",marginTop:4}}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{display:"flex",gap:6,marginBottom:20,background:"#0d1f35",padding:4,borderRadius:10}}>
            {[{id:"verificaciones",label:"Pendientes"},{id:"profesionales",label:"Todos"}].map(t=>(
              <button key={t.id} onClick={()=>setAdminTab(t.id)} style={{flex:1,padding:"9px 6px",borderRadius:8,border:"none",background:adminTab===t.id?"linear-gradient(135deg,#4a8fd4,#1e4d82)":"transparent",color:adminTab===t.id?"#fff":"#b0c4d8",fontFamily:F.sans,fontSize:12,fontWeight:600,cursor:"pointer"}}>{t.label}</button>
            ))}
          </div>

          {adminTab==="verificaciones"&&(
            <div>
              {pendientes.length===0?(
                <div style={{textAlign:"center",padding:"40px 0",color:"#b0c4d8"}}>
                  <div style={{fontSize:36,marginBottom:10}}>✅</div>
                  <div>No hay verificaciones pendientes</div>
                </div>
              ):pendientes.map(p=>(
                <div key={p.id} style={{background:"#0d1f35",border:"1px solid rgba(251,191,36,0.2)",borderRadius:14,padding:18,marginBottom:12}}>
                  <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
                    <Av foto={p.foto} nombre={p.nombre} size={46}/>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:600,fontSize:15,color:"#fff"}}>{p.nombre} <span style={{fontSize:10,color:"#fbbf24",background:"rgba(251,191,36,0.12)",padding:"2px 8px",borderRadius:20}}>PENDIENTE</span></div>
                      <div style={{color:"#b0c4d8",fontSize:12,marginTop:2}}>{p.oficio} · {p.zona}</div>
                    </div>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14,fontSize:12,color:"#b0c4d8"}}>
                    <div><span style={{color:"#8a9bb0"}}>Email: </span>{p.email}</div>
                    <div><span style={{color:"#8a9bb0"}}>Tel: </span>{p.telefono}</div>
                  </div>
                  <div style={{marginBottom:12}}>
                    <Lbl>MENSAJE AL PROFESIONAL (OPCIONAL)</Lbl>
                    <textarea value={adminMsg[p.id]||""} onChange={e=>setAdminMsg(prev=>({...prev,[p.id]:e.target.value}))} placeholder="Ej: Bienvenido a Nexo! Tu perfil fue verificado."
                      style={{width:"100%",marginTop:8,background:"#060d1a",border:"1px solid rgba(74,143,212,0.15)",color:"#fff",padding:"11px 14px",borderRadius:10,fontFamily:F.sans,fontSize:13,resize:"none",minHeight:56}}/>
                  </div>
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={()=>rechazar(p.id)} style={{flex:1,background:"rgba(248,113,113,0.1)",border:"1px solid rgba(248,113,113,0.3)",color:"#f87171",padding:12,borderRadius:10,fontFamily:F.sans,fontSize:13,fontWeight:600,cursor:"pointer"}}>✗ Rechazar</button>
                    <button onClick={()=>verificar(p.id)} style={{flex:2,background:"linear-gradient(135deg,rgba(74,212,120,0.3),rgba(74,212,120,0.15))",border:"1px solid rgba(74,212,120,0.4)",color:"#4ade80",padding:12,borderRadius:10,fontFamily:F.sans,fontSize:13,fontWeight:600,cursor:"pointer"}}>✓ Verificar y activar</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {adminTab==="profesionales"&&(
            <div>
              <input value={adminSearch} onChange={e=>setAdminSearch(e.target.value)} placeholder="Buscar por nombre u oficio..."
                style={{width:"100%",background:"#0d1f35",border:"1px solid rgba(74,143,212,0.15)",color:"#fff",padding:"12px 16px",borderRadius:10,fontFamily:F.sans,fontSize:13,marginBottom:14}}/>
              {prosFilt.length===0?(
                <div style={{textAlign:"center",padding:"30px 0",color:"#b0c4d8"}}>No hay profesionales registrados aún.</div>
              ):prosFilt.map(p=>(
                <div key={p.id} style={{background:"#0d1f35",border:"1px solid rgba(74,143,212,0.15)",borderRadius:14,padding:"14px 16px",marginBottom:10,display:"flex",alignItems:"center",gap:12}}>
                  <Av foto={p.foto} nombre={p.nombre} size={42}/>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:600,fontSize:14,color:"#fff"}}>{p.nombre}</div>
                    <div style={{color:"#b0c4d8",fontSize:12}}>{p.oficio} · {p.zona}</div>
                    {p.email&&<div style={{color:"#8a9bb0",fontSize:11,marginTop:2}}>{p.email}</div>}
                  </div>
                  <span style={{fontSize:11,padding:"3px 10px",borderRadius:20,fontWeight:600,background:p.verificado?"rgba(74,212,120,0.1)":p.estado==="pendiente"?"rgba(251,191,36,0.1)":"rgba(248,113,113,0.1)",color:p.verificado?"#4ade80":p.estado==="pendiente"?"#fbbf24":"#f87171"}}>{p.verificado?"activo":p.estado||"pendiente"}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* POPUPS */}
      {showPin&&<PinPopup onSuccess={()=>{setAdminOk(true);setShowPin(false);setVista("admin");}} onClose={()=>setShowPin(false)}/>}
      {showTyCPro&&<TyCPro onAccept={()=>{setTycOk(true);setShowTyCPro(false);}} onClose={()=>setShowTyCPro(false)}/>}
      {showCalif&&<Calificar nombre={califNombre} onClose={()=>setShowCalif(false)}/>}
      {showRegC&&<RegCliente onClose={()=>setShowRegC(false)} onSuccess={onClienteReg}/>}

      {showAddPro&&(
        <div className="ov" style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.78)",zIndex:999,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
          <div className="mod" style={{background:"#0d1f35",borderRadius:"20px 20px 0 0",padding:"28px 24px 36px",maxWidth:480,width:"100%",border:"1px solid rgba(74,143,212,0.15)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <h3 style={{fontFamily:F.serif,fontSize:22,color:"#fff"}}>Agregar profesional gratis</h3>
              <button onClick={()=>setShowAddPro(false)} style={{background:"none",border:"none",color:"#8a9bb0",fontSize:22,cursor:"pointer"}}>×</button>
            </div>
            <p style={{color:"#b0c4d8",fontSize:13,marginBottom:18,fontWeight:300}}>Se activará verificado y sin cargo.</p>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div><Lbl>NOMBRE</Lbl><Inp placeholder="Nombre y apellido" value={apN} onChange={e=>setApN(e.target.value)}/></div>
              <div><Lbl>OFICIO</Lbl><Inp placeholder="Ej: Plomero, Electricista" value={apO} onChange={e=>setApO(e.target.value)}/></div>
              <div><Lbl>ZONA</Lbl><Inp placeholder="Ej: Palermo, CABA" value={apZ} onChange={e=>setApZ(e.target.value)}/></div>
              <div><Lbl>EMAIL (OPCIONAL)</Lbl><Inp placeholder="correo@mail.com" value={apE} onChange={e=>setApE(e.target.value)}/></div>
              <div style={{background:"rgba(74,212,120,0.06)",border:"1px solid rgba(74,212,120,0.2)",borderRadius:10,padding:"10px 14px",fontSize:12,color:"#4ade80"}}>✓ Se activará verificado sin pasar por el proceso de revisión</div>
              <Btn onClick={addPro}>Agregar →</Btn>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER con botón admin */}
      <div style={{textAlign:"center",padding:"20px 0 30px",borderTop:"1px solid rgba(74,143,212,0.08)"}}>
        <p style={{fontSize:11,color:"rgba(74,143,212,0.3)",marginBottom:8}}>© 2025 Nexo · Argentina</p>
        <button onClick={()=>{if(adminOk)setVista("admin");else setShowPin(true);}} style={{background:"none",border:"1px solid rgba(74,143,212,0.15)",color:"rgba(74,143,212,0.4)",padding:"6px 14px",borderRadius:8,fontFamily:F.sans,fontSize:11,cursor:"pointer"}}>
          {adminOk?"⚙️ Panel admin":"🔐 Admin"}
        </button>
      </div>

    </div></>
  );
}
