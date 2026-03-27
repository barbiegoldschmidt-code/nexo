import { useState, useRef, useEffect } from "react";
import { supabase } from './supabase';
const crearPreferencia = async (plan) => {
  const MP_ACCESS_TOKEN = "TEST-7948816179237261-032116-53e92afe62436a508df3f3375d8fef76-73894109";
  try {
    const res = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${MP_ACCESS_TOKEN}` },
      body: JSON.stringify({
        items: [{ title: `Nexo - Plan ${plan.nombre}`, quantity: 1, currency_id: "ARS", unit_price: plan.precio }],
        back_urls: { success: "https://nexo-iota-three.vercel.app/?pago=ok", failure: "https://nexo-iota-three.vercel.app/?pago=error" },
        auto_return: "approved",
      }),
    });
    const data = await res.json();
    return data.sandbox_init_point || data.init_point;
  } catch(e) { return null; }
};

const ADMIN_PIN = "4567";

const C = {
  bg:"#060d1a", bgCard:"#0d1f35", bgHover:"#102540",
  nav:"rgba(6,13,26,0.92)", blue:"#4a8fd4", blueL:"#6cb3f5",
  blueD:"#1a3a5c", blueBtn:"#1e4d82",
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

const RESP = ["Perfecto, te confirmo enseguida.","Dale, sin problema!","¿Me podés mandar la dirección exacta?","Listo, quedamos así.","Anotado!"];

// ─── UI ───
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
          ["1. ¿Qué es Nexo?","Nexo conecta personas que necesitan servicios con profesionales independientes. No somos una agencia de empleo ni garantizamos la prestación del servicio."],
          ["2. Tu responsabilidad","Al publicar un pedido aceptás que la contratación y el acuerdo económico con el profesional son de tu exclusiva responsabilidad."],
          ["3. Privacidad","Tu nombre, email y teléfono serán compartidos únicamente con los profesionales que respondan a tu pedido."],
          ["4. Calificaciones","Podés calificar al profesional al finalizar. Las calificaciones son públicas."],
          ["5. Gratuito","Publicar pedidos y contactar profesionales es siempre gratuito para los clientes."],
          ["6. Ley aplicable","Estos términos se rigen por la legislación argentina, Ley 25.326 de Protección de Datos Personales."],
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

// ─── TyC Pro ───
const TyCPro=({onAccept,onClose})=>(
  <div className="ov" style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",zIndex:1000,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
    <div className="mod" style={{background:"#0d1f35",borderRadius:"20px 20px 0 0",padding:"28px 24px 36px",maxWidth:480,width:"100%",border:"1px solid rgba(74,143,212,0.15)",maxHeight:"85vh",display:"flex",flexDirection:"column"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <h3 style={{fontFamily:F.serif,fontSize:22,fontWeight:400,color:"#fff"}}>Términos y Condiciones</h3>
        <button onClick={onClose} style={{background:"none",border:"none",color:"#8a9bb0",fontSize:22,cursor:"pointer"}}>×</button>
      </div>
      <div style={{overflowY:"auto",flex:1,paddingRight:4,marginBottom:20}}>
        {[
          ["1. Tu rol en Nexo","Sos un prestador de servicios independiente. Nexo no es tu empleador ni garantiza la relación laboral."],
          ["2. Verificación","Para activar tu perfil debés completar verificación de identidad. Tu cuenta permanece pendiente hasta que nuestro equipo valide tus datos."],
          ["3. Responsabilidad","Sos responsable de la calidad y resultado de los trabajos que ofrecés."],
          ["4. Planes","El plan Inicio es gratuito 7 días. Los planes Profesional ($2.500/mes) y Empresa ($18.000/mes) se cobran vía Mercado Pago. Podés cancelar en cualquier momento."],
          ["5. Calificaciones","Los clientes pueden calificarte. Calificaciones negativas reiteradas pueden resultar en suspensión de cuenta."],
          ["6. Conducta","Queda prohibido el uso de Nexo para actividades ilegales o fraudulentas."],
          ["7. Privacidad","Tus datos se tratan conforme a la Ley 25.326 de Argentina."],
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

// ─── PIN ───
const PinPopup=({onSuccess,onClose})=>{
  const [pin,setPin]=useState("");const [err,setErr]=useState(false);
  const check=()=>{if(pin===ADMIN_PIN)onSuccess();else{setErr(true);setPin("");setTimeout(()=>setErr(false),1500);}};
  return(
    <div className="ov" style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 24px"}}>
      <div className="mod" style={{background:"#0d1f35",borderRadius:20,padding:"36px 28px",maxWidth:300,width:"100%",border:"1px solid rgba(74,143,212,0.3)",textAlign:"center"}}>
        <div style={{fontSize:40,marginBottom:12}}>🔐</div>
        <h3 style={{fontFamily:F.serif,fontSize:22,color:"#fff",marginBottom:8}}>Panel Admin</h3>
        <input type="password" maxLength={4} value={pin} onChange={e=>setPin(e.target.value)} onKeyDown={e=>e.key==="Enter"&&check()} placeholder="• • • •"
          style={{width:"100%",background:"#060d1a",border:`1px solid ${err?"#f87171":"rgba(74,143,212,0.3)"}`,color:"#fff",padding:"14px",borderRadius:12,fontFamily:F.sans,fontSize:24,textAlign:"center",letterSpacing:8,marginBottom:12,marginTop:12}}/>
        {err&&<p style={{color:"#f87171",fontSize:13,marginBottom:10}}>PIN incorrecto</p>}
        <div style={{display:"flex",gap:10,marginTop:8}}>
          <button onClick={onClose} style={{flex:1,background:"transparent",border:"1px solid rgba(74,143,212,0.15)",color:"#fff",padding:12,borderRadius:10,fontFamily:F.sans,fontSize:14,cursor:"pointer"}}>Cancelar</button>
          <button onClick={check} style={{flex:2,background:"linear-gradient(135deg,#4a8fd4,#1e4d82)",border:"none",color:"#fff",padding:12,borderRadius:10,fontFamily:F.sans,fontSize:14,fontWeight:600,cursor:"pointer"}}>Ingresar →</button>
        </div>
      </div>
    </div>
  );
};

// ─── Registro Cliente ───
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
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div onClick={()=>tycOk?setTycOk(false):setShowTyC(true)} style={{width:20,height:20,borderRadius:5,border:`2px solid ${tycOk?"#4a8fd4":"rgba(74,143,212,0.4)"}`,background:tycOk?"#4a8fd4":"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}>
              {tycOk&&<span style={{fontSize:12,color:"#fff"}}>✓</span>}
            </div>
            <span style={{fontSize:13,color:"#b0c4d8"}}>Leí y acepto los <button onClick={()=>setShowTyC(true)} style={{background:"none",border:"none",color:"#4a8fd4",cursor:"pointer",fontSize:13,textDecoration:"underline"}}>Términos y Condiciones</button></span>
          </div>
          {err.tyc&&<p style={{color:"#f87171",fontSize:12}}>{err.tyc}</p>}
          <Btn onClick={()=>{if(validar())onSuccess({nombre:n,email:e,tel:t});}}>Continuar →</Btn>
        </div>
      </div>
    </div>
    </>
  );
};

// ─── Chat Real ───
const ChatView=({pro,pedidoId,clienteNombre,onClose})=>{
  const [msgs,setMsgs]=useState([]);
  const [texto,setTexto]=useState("");
  const [pres,setPres]=useState("");
  const [showPres,setShowPres]=useState(false);
  const [typing,setTyping]=useState(false);
  const ref=useRef(null);

  useEffect(()=>{
    setMsgs([{id:1,de:"pro",texto:`Hola${clienteNombre?" "+clienteNombre.split(" ")[0]:""}! Vi tu pedido. ¿Cuándo necesitás que pase?`,hora:"ahora"}]);
  },[]);

  useEffect(()=>{ref.current?.scrollIntoView({behavior:"smooth"});},[msgs,typing]);

  const send=(txt)=>{
    const t=txt||texto;if(!t.trim())return;
    const hora=new Date().toLocaleTimeString("es-AR",{hour:"2-digit",minute:"2-digit"});
    setMsgs(p=>[...p,{id:Date.now(),de:"cliente",texto:t.trim(),hora}]);
    setTexto("");setTyping(true);
    setTimeout(()=>{setTyping(false);setMsgs(p=>[...p,{id:Date.now()+1,de:"pro",texto:RESP[Math.floor(Math.random()*RESP.length)],hora:new Date().toLocaleTimeString("es-AR",{hour:"2-digit",minute:"2-digit"})}]);},1800);
  };

  return(
    <div className="chat" style={{position:"fixed",inset:0,background:"#060d1a",zIndex:200,display:"flex",flexDirection:"column",maxWidth:480,margin:"0 auto"}}>
      <div style={{background:"rgba(6,13,26,0.92)",backdropFilter:"blur(12px)",borderBottom:"1px solid rgba(74,143,212,0.15)",padding:"14px 20px",display:"flex",alignItems:"center",gap:14}}>
        <button onClick={onClose} style={{background:"none",border:"none",color:"#4a8fd4",fontSize:22,cursor:"pointer"}}>←</button>
        <Av foto={pro.foto} nombre={pro.nombre} size={40}/>
        <div style={{flex:1}}>
          <div style={{fontWeight:600,fontSize:15,color:"#fff"}}>{pro.nombre} {pro.verificado&&<span style={{fontSize:10,color:"#4a8fd4",background:"rgba(74,143,212,0.12)",padding:"2px 6px",borderRadius:20}}>✓</span>}</div>
          <div style={{fontSize:12,color:"#4ade80",marginTop:2}}>● En línea · {pro.oficio}</div>
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

// ─── Panel Profesional Real ───
const PanelPro=({proData,onClose})=>{
  const [tab,setTab]=useState("pedidos");
  const [pedidos,setPedidos]=useState([]);
  const [misPostulaciones,setMisPostulaciones]=useState([]);
  const [loading,setLoading]=useState(true);
  const [postulando,setPostulando]=useState(null);
  const [valor,setValor]=useState("");
  const [mensaje,setMensaje]=useState("");
  const [enviando,setEnviando]=useState(false);

  useEffect(()=>{
    cargarPedidos();
    if(proData?.id) cargarPostulaciones();
  },[proData]);

  const cargarPedidos=async()=>{
    try{
      const {data}=await supabase.from('pedidos').select('*').eq('estado','activo').order('created_at',{ascending:false});
      if(data) setPedidos(data);
    }catch(e){}
    setLoading(false);
  };

  const cargarPostulaciones=async()=>{
    try{
      const {data}=await supabase.from('cotizaciones').select('*, pedidos(*)').eq('profesional_id',proData.id);
      if(data) setMisPostulaciones(data);
    }catch(e){}
  };

  const postularse=async(pedido)=>{
    if(!valor.trim()){alert("Ingresá un valor para tu cotización");return;}
    setEnviando(true);
    try{
      await supabase.from('cotizaciones').insert([{
        pedido_id: pedido.id,
        profesional_id: proData?.id||null,
        valor: parseFloat(valor),
        mensaje: mensaje||`Hola! Puedo ayudarte con ${pedido.tipo_oficio}. Mi cotización es $${valor}.`,
        estado: 'pendiente'
      }]);
      setPostulando(null);setValor("");setMensaje("");
      alert("✅ Te postulaste correctamente! El cliente verá tu propuesta.");
      cargarPostulaciones();
    }catch(e){alert("Error al postularse. Intentá de nuevo.");}
    setEnviando(false);
  };

  const yaPostulado=id=>misPostulaciones.some(p=>p.pedido_id===id);

  return(
    <div className="chat" style={{position:"fixed",inset:0,background:"#060d1a",zIndex:200,display:"flex",flexDirection:"column",maxWidth:480,margin:"0 auto"}}>
      <div style={{background:"rgba(6,13,26,0.92)",backdropFilter:"blur(12px)",borderBottom:"1px solid rgba(74,143,212,0.15)",padding:"14px 20px",display:"flex",alignItems:"center",gap:14}}>
        <button onClick={onClose} style={{background:"none",border:"none",color:"#4a8fd4",fontSize:22,cursor:"pointer"}}>←</button>
        <div style={{flex:1}}>
          <div style={{fontWeight:600,fontSize:16,color:"#fff"}}>Mi panel profesional</div>
          <div style={{fontSize:12,color:"#4ade80",marginTop:2}}>● Podés ver todos los pedidos disponibles</div>
        </div>
        <button onClick={cargarPedidos} style={{background:"none",border:"1px solid rgba(74,143,212,0.3)",color:"#4a8fd4",padding:"6px 10px",borderRadius:8,fontFamily:F.sans,fontSize:12,cursor:"pointer"}}>↻ Actualizar</button>
      </div>

      <div style={{display:"flex",gap:6,margin:"14px 14px 0",background:"#0d1f35",padding:4,borderRadius:10}}>
        {[["pedidos","Pedidos disponibles"],["postulaciones","Mis postulaciones"]].map(([id,lbl])=>(
          <button key={id} onClick={()=>setTab(id)} style={{flex:1,padding:"9px 6px",borderRadius:8,border:"none",background:tab===id?"linear-gradient(135deg,#4a8fd4,#1e4d82)":"transparent",color:tab===id?"#fff":"#8a9bb0",fontFamily:F.sans,fontSize:12,fontWeight:600,cursor:"pointer"}}>{lbl}</button>
        ))}
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"14px"}}>
        {loading?(
          <div style={{textAlign:"center",padding:"40px 0",color:"#b0c4d8"}}>Cargando pedidos...</div>
        ):tab==="pedidos"&&(
          pedidos.length===0?(
            <div style={{textAlign:"center",padding:"40px 0",color:"#b0c4d8"}}>
              <div style={{fontSize:40,marginBottom:12}}>📋</div>
              <p>No hay pedidos disponibles en este momento.</p>
              <p style={{fontSize:12,marginTop:8,color:"#8a9bb0"}}>Volvé a revisar más tarde o tocá Actualizar.</p>
            </div>
          ):pedidos.map(p=>(
            <div key={p.id} style={{background:"#0d1f35",border:`1px solid ${p.urgente?"rgba(248,113,113,0.3)":"rgba(74,143,212,0.15)"}`,borderRadius:14,padding:16,marginBottom:12}}>
              {p.urgente&&<div style={{background:"rgba(248,113,113,0.1)",border:"1px solid rgba(248,113,113,0.2)",borderRadius:8,padding:"5px 10px",marginBottom:10,display:"inline-block",fontSize:11,color:"#f87171",fontWeight:600}}>🔴 URGENTE</div>}
              <div style={{fontWeight:600,fontSize:15,color:"#fff",marginBottom:4}}>{p.tipo_oficio}</div>
              <div style={{fontSize:13,color:"#b0c4d8",marginBottom:8}}>{p.descripcion}</div>
              <div style={{display:"flex",gap:12,fontSize:12,color:"#8a9bb0",marginBottom:12}}>
                <span>📍 {p.zona}</span>
                <span>👤 {p.cliente}</span>
              </div>
              {postulando===p.id?(
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  <input value={valor} onChange={e=>setValor(e.target.value)} placeholder="Tu cotización en $ (ej: 5000)"
                    style={{background:"#060d1a",border:"1px solid rgba(74,143,212,0.3)",color:"#fff",padding:"11px 14px",borderRadius:10,fontFamily:F.sans,fontSize:14}}/>
                  <textarea value={mensaje} onChange={e=>setMensaje(e.target.value)} placeholder="Mensaje para el cliente (opcional)..."
                    style={{background:"#060d1a",border:"1px solid rgba(74,143,212,0.15)",color:"#fff",padding:"11px 14px",borderRadius:10,fontFamily:F.sans,fontSize:13,resize:"none",minHeight:70}}/>
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={()=>{setPostulando(null);setValor("");setMensaje("");}} style={{flex:1,background:"transparent",border:"1px solid rgba(74,143,212,0.2)",color:"#8a9bb0",padding:10,borderRadius:10,fontFamily:F.sans,fontSize:13,cursor:"pointer"}}>Cancelar</button>
                    <button onClick={()=>postularse(p)} disabled={enviando} style={{flex:2,background:"linear-gradient(135deg,#4a8fd4,#1e4d82)",border:"none",color:"#fff",padding:10,borderRadius:10,fontFamily:F.sans,fontSize:13,fontWeight:600,cursor:"pointer"}}>{enviando?"Enviando...":"Enviar cotización →"}</button>
                  </div>
                </div>
              ):yaPostulado(p.id)?(
                <div style={{background:"rgba(74,212,120,0.08)",border:"1px solid rgba(74,212,120,0.2)",borderRadius:10,padding:"10px 14px",fontSize:13,color:"#4ade80"}}>✓ Ya te postulaste a este pedido</div>
              ):(
                <button onClick={()=>setPostulando(p.id)} style={{width:"100%",background:"linear-gradient(135deg,#4a8fd4,#1e4d82)",border:"none",color:"#fff",padding:11,borderRadius:10,fontFamily:F.sans,fontSize:13,fontWeight:600,cursor:"pointer"}}>Cotizar este pedido →</button>
              )}
            </div>
          ))
        )}

        {tab==="postulaciones"&&(
          misPostulaciones.length===0?(
            <div style={{textAlign:"center",padding:"40px 0",color:"#b0c4d8"}}>
              <div style={{fontSize:40,marginBottom:12}}>📤</div>
              <p>Aún no te postulaste a ningún pedido.</p>
            </div>
          ):misPostulaciones.map(p=>(
            <div key={p.id} style={{background:"#0d1f35",border:"1px solid rgba(74,143,212,0.15)",borderRadius:14,padding:16,marginBottom:10}}>
              <div style={{fontWeight:600,fontSize:14,color:"#fff",marginBottom:4}}>{p.pedidos?.tipo_oficio||"Pedido"}</div>
              <div style={{fontSize:13,color:"#b0c4d8",marginBottom:8}}>{p.pedidos?.descripcion}</div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:13,color:"#8a9bb0"}}>{p.pedidos?.zona}</span>
                <span style={{fontSize:16,fontWeight:700,color:"#4a8fd4"}}>${p.valor?.toLocaleString()}</span>
              </div>
              <div style={{marginTop:8,fontSize:12,padding:"6px 10px",borderRadius:8,display:"inline-block",background:p.estado==="aceptado"?"rgba(74,212,120,0.1)":p.estado==="rechazado"?"rgba(248,113,113,0.1)":"rgba(251,191,36,0.1)",color:p.estado==="aceptado"?"#4ade80":p.estado==="rechazado"?"#f87171":"#fbbf24",fontWeight:600}}>{p.estado||"pendiente"}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// ─── Nav ───
const Nav=({setVista,cliente,onCerrar,onIniciar})=>(
  <nav style={{position:"sticky",top:0,zIndex:100,background:"rgba(6,13,26,0.92)",backdropFilter:"blur(12px)",borderBottom:"1px solid rgba(74,143,212,0.15)",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 20px"}}>
    <div onClick={()=>setVista("inicio")} style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}}>
      <div style={{width:36,height:36,borderRadius:8,background:"linear-gradient(135deg,#4a8fd4,#1a3a5c)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:F.serif,fontWeight:300,fontSize:20,color:"#fff"}}>N</div>
      <span style={{fontFamily:F.serif,fontWeight:300,fontSize:20,letterSpacing:3,color:"#fff"}}>NEX<span style={{color:"#4a8fd4"}}>O</span></span>
    </div>
    <div style={{display:"flex",gap:6,alignItems:"center"}}>
      <button onClick={()=>window.open("https://wa.me/5491161906655?text=Hola!%20Tengo%20una%20consulta%20sobre%20Nexo","_blank")} style={{background:"rgba(37,211,102,0.12)",border:"1px solid rgba(37,211,102,0.3)",color:"#25d366",padding:"7px 10px",borderRadius:8,fontFamily:F.sans,fontSize:13,cursor:"pointer"}}>💬</button>
      {cliente
        ?<button onClick={onCerrar} style={{background:"rgba(248,113,113,0.12)",border:"1px solid rgba(248,113,113,0.3)",color:"#f87171",padding:"7px 10px",borderRadius:8,fontFamily:F.sans,fontSize:12,cursor:"pointer"}}>Cerrar sesión</button>
        :<button onClick={onIniciar} style={{background:"rgba(74,143,212,0.12)",border:"1px solid rgba(74,143,212,0.3)",color:"#6cb3f5",padding:"7px 10px",borderRadius:8,fontFamily:F.sans,fontSize:12,cursor:"pointer"}}>Iniciar sesión</button>
      }
    </div>
  </nav>
);

// ══════════════════════════════════
// APP
// ══════════════════════════════════
export default function App(){
  const [vista,setVista]=useState("inicio");
  const [catAb,setCatAb]=useState(null);
  const [busq,setBusq]=useState("");
  const [oficio,setOficio]=useState("");
  const [urgencia,setUrgencia]=useState(0);
  const [zona,setZona]=useState("");
  const [descripcion,setDescripcion]=useState("");

  const [pros,setPros]=useState([]);
  const [loadingPros,setLoadingPros]=useState(true);

  // Cotizaciones del pedido actual del cliente
  const [pedidoActual,setPedidoActual]=useState(null);
  const [cotizaciones,setCotizaciones]=useState([]);
  const [loadingCot,setLoadingCot]=useState(false);

  // Admin
  const [adminTab,setAdminTab]=useState("pendientes");
  const [adminSearch,setAdminSearch]=useState("");
  const [adminMsg,setAdminMsg]=useState({});
  const [showAddPro,setShowAddPro]=useState(false);
  const [apN,setApN]=useState("");const [apO,setApO]=useState("");const [apZ,setApZ]=useState("");const [apE,setApE]=useState("");
  const [showPin,setShowPin]=useState(false);
  const [adminOk,setAdminOk]=useState(false);
  const [todosLosPros,setTodosLosPros]=useState([]);
  const [todosLosPedidos,setTodosLosPedidos]=useState([]);

  const [showTyCPro,setShowTyCPro]=useState(false);
  const [tycOk,setTycOk]=useState(false);
  const [showCalif,setShowCalif]=useState(false);
  const [califPro,setCalifPro]=useState("");

  const [cliente,setCliente]=useState(null);
  const [showRegC,setShowRegC]=useState(false);
  const [pendNav,setPendNav]=useState(null);

  const [chat,setChat]=useState(null);
  const [showPanel,setShowPanel]=useState(false);
  const [proPanel,setProPanel]=useState(null);

  const [loadingMP,setLoadingMP]=useState(false);
  const [publicandoPedido,setPublicandoPedido]=useState(false);

  // Registro pro
  const [rN,setRN]=useState("");const [rE,setRE]=useState("");const [rT,setRT]=useState("");const [rZ,setRZ]=useState("");
  const [rCatsSelec,setRCatsSelec]=useState([]);
  const [rOficiosSelec,setROficiosSelec]=useState([]);
  const [rFotoUrl,setRFotoUrl]=useState(null);
  const [rErr,setRErr]=useState({});

  // Cargar profesionales activos
  useEffect(()=>{
    const cargar=async()=>{
      try{
        const {data}=await supabase.from('profesionales_nexo').select('*').eq('verificado',true).order('created_at',{ascending:false});
        if(data) setPros(data.map(p=>({...p,foto:null})));
      }catch(e){}
      setLoadingPros(false);
    };
    cargar();
  },[]);

  const catsFilt=busq.trim()?CATS.map(c=>({...c,subs:c.subs.filter(s=>s.n.toLowerCase().includes(busq.toLowerCase()))})).filter(c=>c.subs.length>0):CATS;
  const prosFilt=adminSearch.trim()?todosLosPros.filter(p=>p.nombre?.toLowerCase().includes(adminSearch.toLowerCase())||(p.oficio||"").toLowerCase().includes(adminSearch.toLowerCase())):todosLosPros;

  const elegirOficio=n=>{setOficio(n);setVista("buscar");setCatAb(null);};
  const irComoCliente=dest=>{if(!cliente){setPendNav(dest);setShowRegC(true);}else setVista(dest);};

  const onClienteReg=async data=>{
    try{await supabase.from('clientes').insert([{nombre:data.nombre,email:data.email,telefono:data.tel}]);}catch(e){}
    setCliente(data);setShowRegC(false);
    if(pendNav){setVista(pendNav);setPendNav(null);}
  };

  // Publicar pedido real
  const publicarPedido=async()=>{
    if(!descripcion.trim()){alert("Describí el trabajo que necesitás");return;}
    if(!zona){alert("Seleccioná tu zona");return;}
    setPublicandoPedido(true);
    try{
      const {data,error}=await supabase.from('pedidos').insert([{
        cliente: cliente?.nombre||"Anónimo",
        email: cliente?.email||"",
        tipo_oficio: oficio,
        descripcion: descripcion,
        zona: zona,
        urgente: urgencia===0,
        estado: 'activo',
        terminos_aceptados: true
      }]).select().single();

      if(error) throw error;
      setPedidoActual(data);
      setVista("cotizaciones");
      // Cargar cotizaciones del pedido
      cargarCotizaciones(data.id);
    }catch(e){
      alert("Error al publicar el pedido. Intentá de nuevo.");
    }
    setPublicandoPedido(false);
  };

  const cargarCotizaciones=async(pedidoId)=>{
    setLoadingCot(true);
    try{
      // Polling cada 10 segundos para ver nuevas cotizaciones
      const {data}=await supabase.from('cotizaciones').select('*, profesionales(*)').eq('pedido_id',pedidoId);
      if(data) setCotizaciones(data);
    }catch(e){}
    setLoadingCot(false);
  };

  useEffect(()=>{
    if(!pedidoActual) return;
    const interval=setInterval(()=>cargarCotizaciones(pedidoActual.id),10000);
    return()=>clearInterval(interval);
  },[pedidoActual]);

  const aceptarCotizacion=async(cot)=>{
    try{
      await supabase.from('cotizaciones').update({estado:'aceptado'}).eq('id',cot.id);
      setChat(cot.profesionales||{nombre:"Profesional",oficio:oficio,verificado:false,rating:0,trabajos:0,foto:null});
    }catch(e){}
  };

  const toggleCat=cat=>setRCatsSelec(prev=>prev.includes(cat)?prev.filter(c=>c!==cat):[...prev,cat]);
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
      const {error} = await supabase.from('profesionales_nexo').insert([{nombre:rN,email:rE,telefono:rT,zona:rZ,oficio:oficiosStr,verificado:false}]);
      if(error){ alert('Error Supabase: ' + error.message); return; }
    }catch(e){ alert('Error: ' + e.message); return; }
    setVista('planes');
  };

  const addPro=async()=>{
    if(!apN.trim()||!apO.trim()||!apZ.trim())return;
    try{
      const {data}=await supabase.from('profesionales_nexo').insert([{nombre:apN,email:apE,telefono:"",zona:apZ,oficio:apO,verificado:true,estado:'activo'}]).select().single();
      if(data) setPros(p=>[...p,{...data,foto:null}]);
    }catch(e){}
    setApN("");setApO("");setApZ("");setApE("");setShowAddPro(false);
  };

  const cargarAdmin=async()=>{
    try{
      const {data:p}=await supabase.from('profesionales_nexo').select('*').order('created_at',{ascending:false});
      if(p) setTodosLosPros(p.map(x=>({...x,foto:null})));
      const {data:ped}=await supabase.from('pedidos').select('*').order('created_at',{ascending:false});
      if(ped) setTodosLosPedidos(ped);
    }catch(e){}
  };

  const verificarPro=async id=>{
    try{await supabase.from('profesionales_nexo').update({verificado:true}).eq('id',id);}catch(e){}
    setTodosLosPros(p=>p.map(x=>x.id===id?{...x,verificado:true,estado:'activo'}:x));
  };

  const rechazarPro=async id=>{
    try{await supabase.from('profesionales_nexo').update({verificado:false,estado:'rechazado'}).eq('id',id);}catch(e){}
    setTodosLosPros(p=>p.map(x=>x.id===id?{...x,verificado:false}:x));
  };

  const pagarConMP=async(plan)=>{
    setLoadingMP(true);
    try{
      const url=await crearPreferencia(plan);
      if(url) window.open(url,"_blank");
      else alert("Error al generar el pago. Intentá de nuevo.");
    }catch(e){alert("Error al conectar con Mercado Pago.");}
    setLoadingMP(false);
  };

  if(chat)return(<><style>{GS}</style><ChatView pro={chat} pedidoId={pedidoActual?.id} clienteNombre={cliente?.nombre} onClose={()=>setChat(null)}/></>);
  if(showPanel)return(<><style>{GS}</style><PanelPro proData={proPanel} onClose={()=>setShowPanel(false)}/></>);

  const pendientes=todosLosPros.filter(p=>!p.verificado&&p.estado==="pendiente");

  return(
    <><style>{GS}</style>
    <div style={{minHeight:"100vh",background:"#060d1a",maxWidth:480,margin:"0 auto",color:"#fff"}}>

      <Nav setVista={setVista} cliente={cliente} onCerrar={()=>setCliente(null)} onIniciar={()=>setShowRegC(true)}/>

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
            <button onClick={()=>{setShowPanel(true);setProPanel(null);}} style={{marginTop:14,background:"none",border:"none",color:"#4a8fd4",fontSize:13,cursor:"pointer",fontFamily:F.sans,textDecoration:"underline"}}>
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
              <div style={{textAlign:"center",padding:"30px 0",color:"#b0c4d8"}}>Cargando...</div>
            ):pros.length===0?(
              <div style={{textAlign:"center",padding:"30px 0",color:"#b0c4d8"}}>
                <div style={{fontSize:36,marginBottom:10}}>👷</div>
                <p>Pronto habrá profesionales disponibles.</p>
              </div>
            ):pros.slice(0,5).map(p=>(
              <div key={p.id} onClick={()=>setChat(p)}
                style={{background:"#0d1f35",border:"1px solid rgba(74,143,212,0.15)",borderRadius:14,padding:"14px 16px",display:"flex",alignItems:"center",gap:14,cursor:"pointer",transition:"all .2s",marginBottom:10}}
                onMouseEnter={e=>e.currentTarget.style.background="#102540"}
                onMouseLeave={e=>e.currentTarget.style.background="#0d1f35"}
              >
                <Av foto={p.foto} nombre={p.nombre} size={46}/>
                <div style={{flex:1}}>
                  <div style={{fontWeight:600,fontSize:15,color:"#fff"}}>{p.nombre} <span style={{fontSize:11,color:"#4a8fd4",background:"rgba(74,143,212,0.12)",padding:"2px 7px",borderRadius:20}}>✓</span></div>
                  <div style={{color:"#b0c4d8",fontSize:12,marginTop:2}}>{p.oficio} · {p.zona}</div>
                </div>
                <div style={{color:"#6cb3f5",fontSize:12}}>💬 Chatear</div>
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
          {cliente&&<div style={{background:"rgba(74,212,120,0.08)",border:"1px solid rgba(74,212,120,0.3)",borderRadius:10,padding:"10px 14px",marginBottom:20,display:"flex",alignItems:"center",gap:8}}><span style={{color:"#4ade80"}}>✓</span><span style={{fontSize:13,color:"#4ade80"}}>Hola, {cliente.nombre.split(" ")[0]}!</span></div>}
          <h2 style={{fontFamily:F.serif,fontSize:28,fontWeight:400,marginBottom:6,color:"#fff"}}>{oficio}</h2>
          <p style={{color:"#b0c4d8",fontSize:14,marginBottom:28,fontWeight:300}}>Los profesionales te van a cotizar en minutos</p>
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <div>
              <Lbl>SERVICIO</Lbl>
              <div onClick={()=>setVista("categorias")} style={{marginTop:8,background:"#0d1f35",border:"1px solid #4a8fd4",borderRadius:10,padding:"14px 16px",color:"#6cb3f5",fontSize:15,cursor:"pointer"}}>
                {oficio} <span style={{color:"#b0c4d8",fontWeight:300,fontSize:13}}>· cambiar</span>
              </div>
            </div>
            <div>
              <Lbl>ZONA</Lbl>
              <Sel value={zona} onChange={e=>setZona(e.target.value)} style={{color:zona?"#fff":"#8a9bb0"}}>
                <option value="">Seleccioná tu zona...</option>
                {["CABA - Palermo","CABA - Belgrano","CABA - Caballito","CABA - Villa Crespo","CABA - Flores","CABA - Villa Urquiza","GBA - Zona Norte","GBA - Zona Oeste","GBA - Zona Sur"].map(z=><option key={z} value={z}>{z}</option>)}
              </Sel>
            </div>
            <div>
              <Lbl>DESCRIBÍ EL TRABAJO</Lbl>
              <textarea value={descripcion} onChange={e=>setDescripcion(e.target.value)} placeholder="Describí qué necesitás con el mayor detalle posible..."
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
            <Btn onClick={publicarPedido} loading={publicandoPedido} style={{marginTop:4}}>
              Publicar pedido →
            </Btn>
          </div>
        </div>
      )}

      {/* COTIZACIONES REALES */}
      {vista==="cotizaciones"&&(
        <div className="page" style={{padding:"32px 24px 60px"}}>
          <Back onClick={()=>setVista("buscar")}/>
          <div style={{background:"rgba(74,212,120,0.08)",border:"1px solid rgba(74,212,120,0.3)",borderRadius:12,padding:"14px 16px",marginBottom:24}}>
            <div style={{fontWeight:600,fontSize:14,color:"#4ade80",marginBottom:4}}>✅ Pedido publicado</div>
            <p style={{fontSize:13,color:"#b0c4d8",fontWeight:300}}>Los profesionales de tu zona están viendo tu pedido. Cuando alguien cotice, aparecerá acá abajo. La página se actualiza sola cada 10 segundos.</p>
          </div>
          <h2 style={{fontFamily:F.serif,fontSize:26,fontWeight:400,marginBottom:6,color:"#fff"}}>Cotizaciones recibidas</h2>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:20}}>
            <span style={{width:8,height:8,borderRadius:"50%",background:"#4ade80",display:"inline-block",animation:"pulse 2s infinite"}}/>
            <span style={{fontSize:12,color:"#4ade80"}}>{cotizaciones.length} cotización{cotizaciones.length!==1?"es":""} recibida{cotizaciones.length!==1?"s":""}</span>
            <button onClick={()=>cargarCotizaciones(pedidoActual?.id)} style={{marginLeft:"auto",background:"none",border:"1px solid rgba(74,143,212,0.3)",color:"#4a8fd4",padding:"5px 10px",borderRadius:8,fontFamily:F.sans,fontSize:12,cursor:"pointer"}}>↻ Actualizar</button>
          </div>
          {loadingCot?(
            <div style={{textAlign:"center",padding:"30px 0",color:"#b0c4d8"}}>Cargando cotizaciones...</div>
          ):cotizaciones.length===0?(
            <div style={{textAlign:"center",padding:"40px 0",color:"#b0c4d8"}}>
              <div style={{fontSize:40,marginBottom:12,animation:"pulse 2s infinite"}}>⏳</div>
              <p style={{fontSize:14}}>Esperando cotizaciones...</p>
              <p style={{fontSize:12,marginTop:8,color:"#8a9bb0"}}>Los profesionales están viendo tu pedido. Pronto recibirás propuestas.</p>
            </div>
          ):cotizaciones.map(cot=>{
            const pro=cot.profesionales||{};
            return(
              <div key={cot.id} style={{background:"#0d1f35",border:"1px solid rgba(74,143,212,0.15)",borderRadius:14,padding:18,marginBottom:12}}>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                  <Av foto={null} nombre={pro.nombre||"Profesional"} size={46}/>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:600,fontSize:15,color:"#fff"}}>{pro.nombre||"Profesional"} {pro.verificado&&<span style={{color:"#4a8fd4"}}>✓</span>}</div>
                    <div style={{color:"#b0c4d8",fontSize:12}}>{pro.oficio} · {pro.zona}</div>
                  </div>
                  <div style={{fontFamily:F.serif,fontSize:22,fontWeight:700,color:"#4a8fd4"}}>${cot.valor?.toLocaleString()}</div>
                </div>
                {cot.mensaje&&<p style={{fontSize:13,color:"#b0c4d8",marginBottom:14,lineHeight:1.5,fontStyle:"italic"}}>"{cot.mensaje}"</p>}
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>aceptarCotizacion(cot)} style={{flex:2,background:"linear-gradient(135deg,#4a8fd4,#1e4d82)",border:"none",color:"#fff",padding:11,borderRadius:10,fontFamily:F.sans,fontSize:13,fontWeight:600,cursor:"pointer"}}>✓ Aceptar y chatear</button>
                  <button onClick={()=>{setCalifPro(pro.nombre||"Profesional");setShowCalif(true);}} style={{flex:1,background:"transparent",border:"1px solid rgba(74,143,212,0.2)",color:"#b0c4d8",padding:11,borderRadius:10,fontFamily:F.sans,fontSize:13,cursor:"pointer"}}>★ Calificar</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* REGISTRO PROFESIONAL */}
      {vista==="registro-pro"&&(
        <div className="page" style={{padding:"32px 24px 60px"}}>
          <Back onClick={()=>setVista("inicio")}/>
          <h2 style={{fontFamily:F.serif,fontSize:30,fontWeight:300,marginBottom:8,color:"#fff"}}>Sumate como<br/><em style={{color:"#6cb3f5",fontStyle:"italic"}}>profesional</em></h2>
          <p style={{color:"#b0c4d8",fontSize:14,marginBottom:24,fontWeight:300}}>Empezá gratis. Recibí pedidos en tu zona.</p>
          {tycOk&&<div style={{background:"rgba(74,212,120,0.08)",border:"1px solid rgba(74,212,120,0.3)",borderRadius:10,padding:"10px 14px",marginBottom:20,display:"flex",alignItems:"center",gap:8}}><span style={{color:"#4ade80"}}>✓</span><span style={{fontSize:13,color:"#4ade80"}}>Términos aceptados</span></div>}
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
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div onClick={()=>tycOk?setTycOk(false):setShowTyCPro(true)} style={{width:20,height:20,borderRadius:5,border:`2px solid ${tycOk?"#4a8fd4":"rgba(74,143,212,0.4)"}`,background:tycOk?"#4a8fd4":"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}>
                {tycOk&&<span style={{fontSize:12,color:"#fff"}}>✓</span>}
              </div>
              <span style={{fontSize:13,color:"#b0c4d8"}}>Leí y acepto los <button onClick={()=>setShowTyCPro(true)} style={{background:"none",border:"none",color:"#4a8fd4",cursor:"pointer",fontSize:13,textDecoration:"underline"}}>Términos y Condiciones</button></span>
            </div>
            {rErr.tyc&&<p style={{color:"#f87171",fontSize:12}}>{rErr.tyc}</p>}
            <Btn onClick={handleReg} style={{marginTop:4}}>Continuar →</Btn>
          </div>
        </div>
      )}

      {/* PLANES */}
      {vista==="planes"&&(
        <div className="page" style={{padding:"32px 24px 60px"}}>
          <Back onClick={()=>setVista("inicio")}/>
          <h2 style={{fontFamily:F.serif,fontSize:32,fontWeight:300,marginBottom:6,color:"#fff"}}>Elegí tu plan</h2>
          <p style={{color:"#b0c4d8",fontSize:14,marginBottom:8,fontWeight:300}}>Solo para profesionales · Clientes siempre gratis</p>
          <div style={{background:"rgba(74,212,120,0.06)",border:"1px solid rgba(74,212,120,0.2)",borderRadius:10,padding:"10px 14px",marginBottom:28,fontSize:13,color:"#4ade80"}}>
            ✓ Tu registro fue enviado. Nuestro equipo lo revisará y activará tu cuenta en 24hs.
          </div>
          {[
            {nombre:"Inicio",precio:0,sub:"7 días sin costo",dest:false,tag:null,
             desc:"Ideal para empezar. Tu perfil queda visible y podés recibir pedidos de clientes que te busquen. Límite de 3 contactos por mes.",
             features:["3 contactos por mes","Perfil verificado ✓","Aparecés en el listado","Notificaciones básicas"]},
            {nombre:"Profesional",precio:2500,sub:"por mes",dest:true,tag:"MÁS POPULAR",
             desc:"El plan ideal para trabajar full en Nexo. Sin límites de contactos y con badge destacado que te hace más visible.",
             features:["Contactos ilimitados","Badge ⭐ destacado en búsquedas","Acceso a todos los pedidos","Sin límite de zona","Soporte prioritario"]},
            {nombre:"Empresa",precio:18000,sub:"por mes",dest:false,tag:"PARA EMPRESAS",
             desc:"Para empresas de servicios con equipo. Hasta 5 perfiles activos bajo una misma cuenta.",
             features:["Hasta 5 perfiles activos","Primero en búsquedas","Panel de gestión de equipo","Estadísticas avanzadas","Cuenta empresa verificada"]},
          ].map(p=>(
            <div key={p.nombre} style={{background:p.dest?"linear-gradient(135deg,rgba(74,143,212,0.18),rgba(30,77,130,0.18))":"#0d1f35",border:`1px solid ${p.dest?"#4a8fd4":p.nombre==="Empresa"?"rgba(212,180,74,0.4)":"rgba(74,143,212,0.15)"}`,borderRadius:16,padding:24,position:"relative",boxShadow:p.dest?"0 0 40px rgba(74,143,212,0.15)":"none",marginBottom:16}}>
              {p.tag&&<div style={{position:"absolute",top:-12,left:"50%",transform:"translateX(-50%)",background:p.dest?"#4a8fd4":"rgba(212,180,74,0.9)",color:"#fff",fontSize:11,fontWeight:600,padding:"4px 16px",borderRadius:20,whiteSpace:"nowrap"}}>{p.tag}</div>}
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                <div>
                  <div style={{fontFamily:F.serif,fontSize:22,color:"#fff"}}>{p.nombre}</div>
                  <div style={{color:"#b0c4d8",fontSize:12,marginTop:2}}>{p.sub}</div>
                </div>
                <div style={{fontFamily:F.serif,fontSize:28,fontWeight:600,color:p.dest?"#6cb3f5":"#fff"}}>{p.precio===0?"Gratis":`$${p.precio.toLocaleString()}`}</div>
              </div>
              <p style={{fontSize:13,color:"#b0c4d8",lineHeight:1.5,marginBottom:14,fontWeight:300}}>{p.desc}</p>
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
          <p style={{color:"#b0c4d8",fontSize:13,marginBottom:16,fontWeight:300}}>Solo vos podés ver esto</p>

          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:24}}>
            {[{val:todosLosPros.filter(p=>p.verificado).length,label:"Activos",color:"#4ade80"},{val:pendientes.length,label:"Pendientes",color:"#fbbf24"},{val:todosLosPedidos.length,label:"Pedidos",color:"#4a8fd4"}].map(s=>(
              <div key={s.label} style={{background:"#0d1f35",border:"1px solid rgba(74,143,212,0.15)",borderRadius:12,padding:"12px 8px",textAlign:"center"}}>
                <div style={{fontFamily:F.serif,fontSize:22,color:s.color}}>{s.val}</div>
                <div style={{fontSize:10,color:"#fff",marginTop:4}}>{s.label}</div>
              </div>
            ))}
          </div>

          <Btn onClick={cargarAdmin} style={{marginBottom:20,background:"rgba(74,143,212,0.1)",border:"1px solid rgba(74,143,212,0.3)",color:"#6cb3f5"}}>↻ Cargar datos de Supabase</Btn>

          <div style={{display:"flex",gap:6,marginBottom:20,background:"#0d1f35",padding:4,borderRadius:10}}>
            {[{id:"pendientes",label:"Pendientes"},{id:"profesionales",label:"Profesionales"},{id:"pedidos",label:"Pedidos"}].map(t=>(
              <button key={t.id} onClick={()=>setAdminTab(t.id)} style={{flex:1,padding:"9px 6px",borderRadius:8,border:"none",background:adminTab===t.id?"linear-gradient(135deg,#4a8fd4,#1e4d82)":"transparent",color:adminTab===t.id?"#fff":"#b0c4d8",fontFamily:F.sans,fontSize:12,fontWeight:600,cursor:"pointer"}}>{t.label}</button>
            ))}
          </div>

          {adminTab==="pendientes"&&(
            pendientes.length===0?(
              <div style={{textAlign:"center",padding:"40px 0",color:"#b0c4d8"}}>
                <div style={{fontSize:36,marginBottom:10}}>✅</div>
                <p>No hay verificaciones pendientes.</p>
                <p style={{fontSize:12,marginTop:8,color:"#8a9bb0"}}>Tocá "Cargar datos" para actualizar.</p>
              </div>
            ):pendientes.map(p=>(
              <div key={p.id} style={{background:"#0d1f35",border:"1px solid rgba(251,191,36,0.2)",borderRadius:14,padding:18,marginBottom:12}}>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                  <Av foto={null} nombre={p.nombre} size={46}/>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:600,fontSize:15,color:"#fff"}}>{p.nombre}</div>
                    <div style={{color:"#b0c4d8",fontSize:12,marginTop:2}}>{p.oficio} · {p.zona}</div>
                  </div>
                  <span style={{fontSize:10,color:"#fbbf24",background:"rgba(251,191,36,0.12)",padding:"3px 10px",borderRadius:20,fontWeight:600}}>PENDIENTE</span>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14,fontSize:12,color:"#b0c4d8"}}>
                  <div><span style={{color:"#8a9bb0"}}>Email: </span>{p.email}</div>
                  <div><span style={{color:"#8a9bb0"}}>Tel: </span>{p.telefono}</div>
                </div>
                <div style={{marginBottom:12}}>
                  <Lbl>MENSAJE AL PROFESIONAL (OPCIONAL)</Lbl>
                  <textarea value={adminMsg[p.id]||""} onChange={e=>setAdminMsg(prev=>({...prev,[p.id]:e.target.value}))} placeholder="Ej: Bienvenido a Nexo! Tu perfil fue activado."
                    style={{width:"100%",marginTop:8,background:"#060d1a",border:"1px solid rgba(74,143,212,0.15)",color:"#fff",padding:"11px 14px",borderRadius:10,fontFamily:F.sans,fontSize:13,resize:"none",minHeight:56}}/>
                </div>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>rechazarPro(p.id)} style={{flex:1,background:"rgba(248,113,113,0.1)",border:"1px solid rgba(248,113,113,0.3)",color:"#f87171",padding:12,borderRadius:10,fontFamily:F.sans,fontSize:13,fontWeight:600,cursor:"pointer"}}>✗ Rechazar</button>
                  <button onClick={()=>verificarPro(p.id)} style={{flex:2,background:"linear-gradient(135deg,rgba(74,212,120,0.3),rgba(74,212,120,0.15))",border:"1px solid rgba(74,212,120,0.4)",color:"#4ade80",padding:12,borderRadius:10,fontFamily:F.sans,fontSize:13,fontWeight:600,cursor:"pointer"}}>✓ Verificar y activar</button>
                </div>
              </div>
            ))
          )}

          {adminTab==="profesionales"&&(
            <div>
              <input value={adminSearch} onChange={e=>setAdminSearch(e.target.value)} placeholder="Buscar..."
                style={{width:"100%",background:"#0d1f35",border:"1px solid rgba(74,143,212,0.15)",color:"#fff",padding:"12px 16px",borderRadius:10,fontFamily:F.sans,fontSize:13,marginBottom:14}}/>
              {prosFilt.length===0?(
                <div style={{textAlign:"center",padding:"30px 0",color:"#b0c4d8"}}>Tocá "Cargar datos" para ver los profesionales.</div>
              ):prosFilt.map(p=>(
                <div key={p.id} style={{background:"#0d1f35",border:"1px solid rgba(74,143,212,0.15)",borderRadius:14,padding:"14px 16px",marginBottom:10,display:"flex",alignItems:"center",gap:12}}>
                  <Av foto={null} nombre={p.nombre} size={42}/>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:600,fontSize:14,color:"#fff"}}>{p.nombre}</div>
                    <div style={{color:"#b0c4d8",fontSize:12}}>{p.oficio} · {p.zona}</div>
                    {p.email&&<div style={{color:"#8a9bb0",fontSize:11}}>{p.email} · {p.telefono}</div>}
                  </div>
                  <span style={{fontSize:11,padding:"3px 10px",borderRadius:20,fontWeight:600,background:p.verificado?"rgba(74,212,120,0.1)":p.estado==="pendiente"?"rgba(251,191,36,0.1)":"rgba(248,113,113,0.1)",color:p.verificado?"#4ade80":p.estado==="pendiente"?"#fbbf24":"#f87171"}}>{p.verificado?"activo":p.estado||"pendiente"}</span>
                </div>
              ))}
            </div>
          )}

          {adminTab==="pedidos"&&(
            todosLosPedidos.length===0?(
              <div style={{textAlign:"center",padding:"30px 0",color:"#b0c4d8"}}>Tocá "Cargar datos" para ver los pedidos.</div>
            ):todosLosPedidos.map(p=>(
              <div key={p.id} style={{background:"#0d1f35",border:"1px solid rgba(74,143,212,0.15)",borderRadius:14,padding:16,marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                  <div>
                    <div style={{fontWeight:600,fontSize:14,color:"#fff"}}>{p.tipo_oficio}</div>
                    <div style={{color:"#4a8fd4",fontSize:12,marginTop:2}}>{p.cliente} · {p.zona}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    {p.urgente&&<span style={{fontSize:10,color:"#f87171",fontWeight:600,display:"block"}}>🔴 URGENTE</span>}
                    <span style={{fontSize:11,padding:"3px 10px",borderRadius:20,fontWeight:600,background:p.estado==="activo"?"rgba(74,212,120,0.1)":"rgba(74,143,212,0.1)",color:p.estado==="activo"?"#4ade80":"#4a8fd4"}}>{p.estado}</span>
                  </div>
                </div>
                <p style={{color:"#b0c4d8",fontSize:13,marginBottom:6,lineHeight:1.4}}>{p.descripcion}</p>
                <div style={{color:"#8a9bb0",fontSize:11}}>{new Date(p.created_at).toLocaleString("es-AR")}</div>
              </div>
            ))
          )}
        </div>
      )}

      {/* POPUPS */}
      {showPin&&<PinPopup onSuccess={()=>{setAdminOk(true);setShowPin(false);setVista("admin");cargarAdmin();}} onClose={()=>setShowPin(false)}/>}
      {showTyCPro&&<TyCPro onAccept={()=>{setTycOk(true);setShowTyCPro(false);}} onClose={()=>setShowTyCPro(false)}/>}
      {showCalif&&(
        <div className="ov" style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.78)",zIndex:999,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
          <div className="mod" style={{background:"#0d1f35",borderRadius:"20px 20px 0 0",padding:"28px 24px 36px",maxWidth:480,width:"100%"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <h3 style={{fontFamily:F.serif,fontSize:22,color:"#fff"}}>Calificar a {califPro}</h3>
              <button onClick={()=>setShowCalif(false)} style={{background:"none",border:"none",color:"#8a9bb0",fontSize:22,cursor:"pointer"}}>×</button>
            </div>
            <p style={{color:"#b0c4d8",fontSize:14,marginBottom:20}}>¿Cómo fue tu experiencia?</p>
            <Btn onClick={()=>setShowCalif(false)}>Enviar calificación</Btn>
          </div>
        </div>
      )}
      {showRegC&&<RegCliente onClose={()=>setShowRegC(false)} onSuccess={onClienteReg}/>}

      {showAddPro&&(
        <div className="ov" style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.78)",zIndex:999,display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
          <div className="mod" style={{background:"#0d1f35",borderRadius:"20px 20px 0 0",padding:"28px 24px 36px",maxWidth:480,width:"100%",border:"1px solid rgba(74,143,212,0.15)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <h3 style={{fontFamily:F.serif,fontSize:22,color:"#fff"}}>Agregar profesional gratis</h3>
              <button onClick={()=>setShowAddPro(false)} style={{background:"none",border:"none",color:"#8a9bb0",fontSize:22,cursor:"pointer"}}>×</button>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <div><Lbl>NOMBRE</Lbl><Inp placeholder="Nombre y apellido" value={apN} onChange={e=>setApN(e.target.value)}/></div>
              <div><Lbl>OFICIO</Lbl><Inp placeholder="Ej: Plomero, Electricista" value={apO} onChange={e=>setApO(e.target.value)}/></div>
              <div><Lbl>ZONA</Lbl><Inp placeholder="Ej: Palermo, CABA" value={apZ} onChange={e=>setApZ(e.target.value)}/></div>
              <div><Lbl>EMAIL (OPCIONAL)</Lbl><Inp placeholder="correo@mail.com" value={apE} onChange={e=>setApE(e.target.value)}/></div>
              <div style={{background:"rgba(74,212,120,0.06)",border:"1px solid rgba(74,212,120,0.2)",borderRadius:10,padding:"10px 14px",fontSize:12,color:"#4ade80"}}>✓ Se activará verificado sin cargo</div>
              <Btn onClick={addPro}>Agregar →</Btn>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER ADMIN */}
      <div style={{textAlign:"center",padding:"20px 0 30px",borderTop:"1px solid rgba(74,143,212,0.08)"}}>
        <p style={{fontSize:11,color:"rgba(74,143,212,0.3)",marginBottom:8}}>© 2025 Nexo · Argentina</p>
        <button onClick={()=>{if(adminOk)setVista("admin");else setShowPin(true);}} style={{background:"none",border:"1px solid rgba(74,143,212,0.15)",color:"rgba(74,143,212,0.4)",padding:"6px 14px",borderRadius:8,fontFamily:F.sans,fontSize:11,cursor:"pointer"}}>
          {adminOk?"⚙️ Panel admin":"🔐 Admin"}
        </button>
      </div>

    </div></>
  );
}
