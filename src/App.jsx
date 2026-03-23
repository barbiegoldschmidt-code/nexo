import { useState, useEffect } from "react";
import { supabase } from "./supabase";

const OFICIOS = ["Plomero","Electricista","Gasista","Pintor","Albañil","Carpintero","Cerrajero","Climatización","Herrería","Jardinero"];
const ZONAS = ["Pilar Centro","Del Viso","Villa Rosa","Escobar","Tigre","San Isidro","Palermo","Belgrano","CABA","Córdoba","Rosario"];

const TERMINOS = `TÉRMINOS Y CONDICIONES — NEXO

1. OBJETO
NEXO es una plataforma digital que conecta a personas que necesitan servicios del hogar ("Clientes") con profesionales independientes ("Profesionales"). NEXO no presta servicios directamente ni es empleador de los Profesionales.

2. RESPONSABILIDAD
NEXO actúa como intermediario. No se responsabiliza por la calidad, resultado o incumplimiento de los trabajos realizados. Cada Profesional es responsable de su trabajo de forma independiente.

3. REGISTRO Y VERIFICACIÓN
Los Profesionales deben verificar su identidad con DNI y foto. NEXO se reserva el derecho de rechazar o dar de baja perfiles que no cumplan los requisitos o que reciban denuncias.

4. DATOS PERSONALES
Los datos son tratados conforme a la Ley 25.326 de Protección de Datos Personales de Argentina. No se comparten con terceros salvo requerimiento judicial.

5. COTIZACIONES Y PAGOS
Las cotizaciones son acuerdos directos entre Cliente y Profesional. NEXO cobra una suscripción mensual al Profesional por el uso de la plataforma. El precio del trabajo lo define el Profesional libremente.

6. PROHIBICIONES
Está prohibido publicar información falsa, contactar usuarios fuera de la plataforma para evadir comisiones, o usar la plataforma para actividades ilegales.

7. CANCELACIÓN
NEXO puede suspender o eliminar cuentas que violen estos términos, sin previo aviso ni reembolso.

8. JURISDICCIÓN
Ante cualquier conflicto, las partes se someten a los tribunales ordinarios de la Ciudad Autónoma de Buenos Aires, renunciando a cualquier otro fuero.`;

export default function App() {
  const [vista, setVista] = useState("inicio");
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [profesional, setProfesional] = useState(null);
  const [form, setForm] = useState({ tipo:"Plomero", descripcion:"", zona:"Pilar Centro", nombre:"", urgente:false });
  const [regProf, setRegProf] = useState({ nombre:"", oficio:"Plomero", zona:"Pilar Centro", telefono:"", dni:"", descripcion:"" });
  const [mostrarTerminos, setMostrarTerminos] = useState(true);
  const [terminosAceptados, setTerminosAceptados] = useState(false);
  const [cotizaciones, setCotizaciones] = useState([]);
  const [modalCotizar, setModalCotizar] = useState(null);
  const [cotForm, setCotForm] = useState({ monto:"", mensaje:"" });
  const [misCotz, setMisCotz] = useState([]);
  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [dniFiles, setDniFiles] = useState({ frente:null, dorso:null, selfie:null });
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [profesionales, setProfesionales] = useState([]);

  const F = { h:"'Cormorant Garamond', serif", b:"'Jost', sans-serif" };
  const inp = { padding:"12px 14px", background:"#070d1c", border:"1px solid #1a4a8a", borderRadius:"9px", color:"#e8edf5", fontSize:"14px", width:"100%", boxSizing:"border-box", fontFamily:F.b };
  const btn = { padding:"15px", background:"#0f2d5e", color:"#fff", border:"1px solid #1a4a8a", borderRadius:"12px", fontSize:"15px", cursor:"pointer", fontWeight:"600", width:"100%", fontFamily:F.b };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        cargarProfesional(session.user.id);
        verificarTerminos(session.user.id);
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        cargarProfesional(session.user.id);
        verificarTerminos(session.user.id);
      } else setProfesional(null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (vista === "explorar" || vista === "pedidos-prof") cargarPedidos();
    if (vista === "mis-cotizaciones") cargarMisCotizaciones();
    if (vista === "admin") cargarProfesionales();
  }, [vista]);

  const verificarTerminos = (uid) => {
    const key = `terminos_aceptados_${uid}`;
    const yaAcepto = localStorage.getItem(key);
    if (!yaAcepto) setMostrarTerminos(true);
  };

  const cargarProfesional = async (uid) => {
    const { data } = await supabase
  .from("profesionales")
  .select("*")
  .eq("id", uid)
  .maybeSingle();
    setProfesional(data);
    if (data?.foto_url) setFotoPreview(data.foto_url);
  };

  const cargarProfesionales = async () => {
    const { data } = await supabase.from("profesionales").select("*").order("created_at", { ascending: false });
    if (data) setProfesionales(data);
  };

  const loginGoogle = async () => {
    await supabase.auth.signInWithOAuth({ provider:"google", options:{ redirectTo: window.location.origin } });
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setVista("inicio");
    setProfesional(null);
    setFotoPreview(null);
  };

  const cargarPedidos = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("pedidos").select("*").order("created_at", { ascending: false });
    if (!error) setPedidos(data);
    setLoading(false);
  };

  const cargarMisCotizaciones = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("cotizaciones")
      .select("*, pedidos(*)")
      .eq("profesional_id", user.id)
      .order("created_at", { ascending: false });
    if (data) setMisCotz(data);
    setLoading(false);
  };

  const aceptarTerminos = () => {
    if (!terminosAceptados) { alert("Tenés que aceptar los términos para continuar."); return; }
    localStorage.setItem(`terminos_aceptados_${user.id}`, "true");
    setMostrarTerminos(true);
  };

  const subirFotoPerfil = async (file) => {
    if (!file || !user) return null;
    setSubiendoFoto(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/avatar.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (error) { alert("Error al subir foto: " + error.message); setSubiendoFoto(false); return null; }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    await supabase.from("profesionales").update({ foto_url: data.publicUrl }).eq("id", user.id);
    setSubiendoFoto(false);
    return data.publicUrl;
  };

  const publicar = async () => {
    if (!form.descripcion.trim() || !form.nombre.trim()) { alert("Completá todos los campos"); return; }
    const clienteId = user?.id ?? null;
    const clienteEmail = user?.email ?? null;
    const { error } = await supabase.from("pedidos").insert([{
      tipo: form.tipo,
      descripcion: form.descripcion,
      zona: form.zona,
      urgente: form.urgente,
      estado: "activo",
      cliente_id: clienteId,
      cliente_email: clienteEmail,
      terminos_aceptados: true
    }]);
    if (!error) {
      alert("¡Pedido publicado!");
      setForm({ tipo:"Plomero", descripcion:"", zona:"Pilar Centro", nombre:"", urgente:false });
      setVista("explorar");
    } else alert("Error: " + error.message);
  };

  const enviarCotizacion = async () => {
    if (!cotForm.monto || !cotForm.mensaje.trim()) { alert("Completá monto y mensaje"); return; }
    const { error } = await supabase.from("cotizaciones").insert([{
      pedido_id: modalCotizar.id,
      profesional_id: user.id,
      monto: parseFloat(cotForm.monto),
      mensaje: cotForm.mensaje,
      estado: "pendiente"
    }]);
    if (!error) {
      alert("¡Cotización enviada!");
      setModalCotizar(null);
      setCotForm({ monto:"", mensaje:"" });
    } else alert("Error: " + error.message);
  };

  const aprobarProfesional = async (id) => {
    await supabase.from("profesionales").update({ verificado: true }).eq("id", id);
    cargarProfesionales();
  };

  const rechazarProfesional = async (id) => {
    await supabase.from("profesionales").update({ verificado: false }).eq("id", id);
    cargarProfesionales();
  };

  const registrarProfesional = async () => {
    if (!regProf.nombre || !regProf.dni || !regProf.telefono) { alert("Completá todos los campos"); return; }
    let fotoUrl = null;
    if (fotoFile) fotoUrl = await subirFotoPerfil(fotoFile);
    const { error } = await supabase.from("profesionales").insert([{
      id: user.id,
      nombre: regProf.nombre,
      oficio: regProf.oficio,
      zona: regProf.zona,
      telefono: regProf.telefono,
      dni: regProf.dni,
      descripcion: regProf.descripcion,
      verificado: false,
      terminos_aceptados: true,
      foto_url: fotoUrl
    }]);
    if (!error) {
      await cargarProfesional(user.id);
      setVista("pendiente-prof");
    } else alert("Error: " + error.message);
  };

  const irProfesional = () => {
    if (!user) { setVista("login-prof"); return; }
    if (!profesional) { setVista("registro-prof"); return; }
    if (!profesional.verificado) { setVista("pendiente-prof"); return; }
    setVista("pedidos-prof");
  };

  const planes = [
    { nombre:"Prueba", precio:"Gratis", subprecio:"30 días", color:"#1a4a8a", destacado:false, features:["✓ 2 cotizaciones incluidas","✓ Verificación de identidad obligatoria","✓ Perfil básico visible","✓ Al vencer: mail de aviso + 7 días extra","✗ Sin renovación automática"] },
    { nombre:"Pro", precio:"$2.500", subprecio:"por mes", color:"#4a8fd4", destacado:true, features:["✓ Cotizaciones ilimitadas","✓ Verificación de identidad incluida","✓ Perfil destacado en búsquedas","✓ Badge verificado en tu perfil","✓ Soporte por WhatsApp"] },
    { nombre:"Business", precio:"$5.000", subprecio:"por mes", color:"#6b9fd4", destacado:false, features:["✓ Todo lo de Pro","✓ Hasta 3 oficios distintos","✓ Panel de analytics","✓ Soporte prioritario 24hs","✓ Aparecés primero en tu zona"] },
  ];

  return (
    <div style={{ minHeight:"100vh", background:"#040810", color:"#e8edf5", fontFamily:F.b }}>

      {/* MODAL TÉRMINOS Y CONDICIONES */}
      {true && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" }}>
          <div style={{ background:"#070d1c", border:"1px solid #1a4a8a", borderRadius:"16px", width:"100%", maxWidth:"520px", maxHeight:"85vh", display:"flex", flexDirection:"column" }}>
            <div style={{ padding:"24px 28px 0" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"20px" }}>
                <div style={{ width:"42px", height:"42px", background:"#0f2d5e", borderRadius:"10px", display:"flex", alignItems:"center", justifyContent:"center", border:"1px solid #1a4a8a" }}>
                  <span style={{ fontFamily:F.h, fontSize:"22px", fontWeight:"700" }}>N</span>
                </div>
                <div>
                  <h2 style={{ fontFamily:F.h, fontSize:"24px", margin:0, fontWeight:"600" }}>Términos y Condiciones</h2>
                  <p style={{ color:"#6b7fa0", fontSize:"12px", margin:0, fontWeight:"300" }}>Leé y aceptá para continuar</p>
                </div>
              </div>
            </div>
            <div style={{ overflowY:"auto", padding:"0 28px", flex:1 }}>
              <pre style={{ whiteSpace:"pre-wrap", fontSize:"12px", color:"#b8c8d8", lineHeight:"1.8", fontFamily:F.b, fontWeight:"300" }}>{TERMINOS}</pre>
            </div>
            <div style={{ padding:"20px 28px 24px", borderTop:"1px solid rgba(255,255,255,0.06)", marginTop:"12px" }}>
              <label style={{ display:"flex", alignItems:"center", gap:"10px", cursor:"pointer", marginBottom:"16px" }}>
                <input type="checkbox" checked={terminosAceptados} onChange={e => setTerminosAceptados(e.target.checked)} style={{ width:"16px", height:"16px" }} />
                <span style={{ fontSize:"13px", color:"#b8c8d8" }}>Leí y acepto los Términos y Condiciones de NEXO</span>
              </label>
              <button onClick={aceptarTerminos} style={{ ...btn, opacity: terminosAceptados ? 1 : 0.5 }}>Continuar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL COTIZAR */}
      {modalCotizar && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" }}>
          <div style={{ background:"#070d1c", border:"1px solid #1a4a8a", borderRadius:"16px", width:"100%", maxWidth:"460px", padding:"28px" }}>
            <h3 style={{ fontFamily:F.h, fontSize:"28px", fontWeight:"600", marginBottom:"8px" }}>Enviar cotización</h3>
            <p style={{ color:"#6b7fa0", fontSize:"13px", marginBottom:"20px", fontWeight:"300" }}>{modalCotizar.tipo} · {modalCotizar.zona}</p>
            <div style={{ background:"rgba(74,143,212,0.06)", border:"1px solid rgba(74,143,212,0.15)", borderRadius:"10px", padding:"14px", marginBottom:"20px" }}>
              <p style={{ fontSize:"13px", color:"#b8c8d8", margin:0, fontWeight:"300", lineHeight:"1.7" }}>{modalCotizar.descripcion}</p>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:"12px", marginBottom:"20px" }}>
              <input placeholder="Monto de tu cotización ($)" type="number" value={cotForm.monto} onChange={e => setCotForm({...cotForm, monto:e.target.value})} style={inp} />
              <textarea placeholder="Mensaje para el cliente (experiencia, disponibilidad, etc.)" value={cotForm.mensaje} onChange={e => setCotForm({...cotForm, mensaje:e.target.value})} style={{ ...inp, minHeight:"90px", resize:"vertical" }} />
            </div>
            <div style={{ display:"flex", gap:"10px" }}>
              <button onClick={() => setModalCotizar(null)} style={{ ...btn, background:"transparent", color:"#6b7fa0", borderColor:"rgba(255,255,255,0.1)", flex:1 }}>Cancelar</button>
              <button onClick={enviarCotizacion} style={{ ...btn, flex:2 }}>Enviar cotización</button>
            </div>
          </div>
        </div>
      )}

      {/* NAV */}
      <nav style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"18px 28px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
        <div onClick={() => setVista("inicio")} style={{ display:"flex", alignItems:"center", gap:"12px", cursor:"pointer" }}>
          <div style={{ width:"42px", height:"42px", background:"#0f2d5e", borderRadius:"10px", display:"flex", alignItems:"center", justifyContent:"center", border:"1px solid #1a4a8a" }}>
            <span style={{ fontFamily:F.h, fontSize:"22px", fontWeight:"700", color:"#e8edf5" }}>N</span>
          </div>
          <span style={{ fontFamily:F.h, fontSize:"24px", fontWeight:"600", letterSpacing:"3px" }}>NEX<span style={{ color:"#4a8fd4" }}>O</span></span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:"4px" }}>
          <button onClick={() => setVista("planes")} style={{ background:"none", border:"none", color:"#b8c8d8", cursor:"pointer", fontSize:"14px", fontFamily:F.b, fontWeight:"500", padding:"8px 16px" }}>Planes</button>
          {user && profesional?.verificado && (
            <button onClick={() => setVista("mis-cotizaciones")} style={{ background:"none", border:"none", color:"#b8c8d8", cursor:"pointer", fontSize:"14px", fontFamily:F.b, fontWeight:"500", padding:"8px 16px" }}>Mis cotizaciones</button>
          )}
          {user && user.email === "tu-email-nexoprofesional26@gmail.com" && (
            <button onClick={() => setVista("admin")} style={{ background:"none", border:"none", color:"#f08080", cursor:"pointer", fontSize:"14px", fontFamily:F.b, fontWeight:"500", padding:"8px 16px" }}>Admin</button>
          )}
          <div style={{ width:"1px", height:"20px", background:"rgba(255,255,255,0.15)", margin:"0 4px" }}></div>
          {user ? (
            <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
              {fotoPreview && <img src={fotoPreview} alt="perfil" style={{ width:"32px", height:"32px", borderRadius:"50%", objectFit:"cover", border:"2px solid #1a4a8a" }} />}
              <button onClick={logout} style={{ background:"none", border:"none", color:"#6b7fa0", cursor:"pointer", fontSize:"14px", fontFamily:F.b, padding:"8px 12px" }}>Salir</button>
            </div>
          ) : (
            <button onClick={loginGoogle} style={{ background:"none", border:"none", color:"#6b7fa0", cursor:"pointer", fontSize:"14px", fontFamily:F.b, padding:"8px 16px" }}>Ingresar</button>
          )}
        </div>
      </nav>

      {/* INICIO */}
      {vista === "inicio" && (
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"60px 24px 40px", textAlign:"center" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:"8px", background:"rgba(15,45,94,0.5)", border:"1px solid rgba(74,143,212,0.25)", borderRadius:"8px", padding:"10px 24px", marginBottom:"44px" }}>
            <span style={{ width:"6px", height:"6px", borderRadius:"50%", background:"#4a8fd4", display:"inline-block" }}></span>
            <span style={{ fontSize:"11px", letterSpacing:"3px", color:"#4a8fd4", fontWeight:"500" }}>ARGENTINA · ZONA NORTE · CABA</span>
          </div>
          <h1 style={{ fontFamily:F.h, fontSize:"clamp(52px, 8vw, 84px)", fontWeight:"600", lineHeight:"1.1", margin:"0 0 28px", maxWidth:"700px", color:"#e8edf5" }}>
            El oficio que<br />necesitás,{" "}
            <em style={{ color:"#4a8fd4", fontStyle:"italic" }}>hoy.</em>
          </h1>
          <p style={{ color:"#6b7fa0", fontSize:"16px", fontWeight:"300", lineHeight:"1.9", maxWidth:"480px", margin:"0 0 52px" }}>
            Conectamos vecinos con profesionales de confianza.<br />Publicás tu pedido y ellos cotizan. Vos elegís.
          </p>
          <div style={{ display:"flex", flexDirection:"column", gap:"12px", width:"100%", maxWidth:"420px", marginBottom:"64px" }}>
            <button onClick={() => setVista("publicar")} style={btn}>Necesito un servicio</button>
            <button onClick={irProfesional} style={{ ...btn, background:"rgba(15,45,94,0.4)", color:"#4a8fd4", border:"1px solid rgba(74,143,212,0.25)" }}>Soy profesional</button>
          </div>
          <div style={{ display:"flex", justifyContent:"center", gap:"56px", borderTop:"1px solid rgba(255,255,255,0.06)", paddingTop:"40px", width:"100%", maxWidth:"500px" }}>
            {[["2.400+","PROFESIONALES"],["14","OFICIOS"],["4.9★","CALIFICACIÓN"]].map(([n,l]) => (
              <div key={l} style={{ textAlign:"center" }}>
                <div style={{ fontSize:"30px", fontWeight:"600", color:"#4a8fd4", fontFamily:F.h }}>{n}</div>
                <div style={{ fontSize:"10px", color:"#6b7fa0", marginTop:"6px", letterSpacing:"2px" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LOGIN PROF */}
      {vista === "login-prof" && (
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"70vh", padding:"40px 24px", textAlign:"center" }}>
          <div style={{ width:"100%", maxWidth:"400px" }}>
            <button onClick={() => setVista("inicio")} style={{ background:"none", border:"none", color:"#6b7fa0", cursor:"pointer", marginBottom:"32px", fontSize:"14px", fontFamily:F.b, display:"block" }}>← Volver</button>
            <div style={{ width:"56px", height:"56px", background:"#0f2d5e", borderRadius:"14px", display:"flex", alignItems:"center", justifyContent:"center", border:"1px solid #1a4a8a", margin:"0 auto 24px" }}>
              <span style={{ fontFamily:F.h, fontSize:"28px", fontWeight:"700" }}>N</span>
            </div>
            <h2 style={{ fontFamily:F.h, fontSize:"34px", fontWeight:"600", marginBottom:"8px" }}>Área profesional</h2>
            <p style={{ color:"#6b7fa0", fontWeight:"300", marginBottom:"36px", fontSize:"15px" }}>Ingresá con Google para acceder a los pedidos de tu zona.</p>
            <button onClick={loginGoogle} style={{ ...btn, background:"#fff", color:"#333", border:"1px solid #ddd", display:"flex", alignItems:"center", justifyContent:"center", gap:"10px" }}>
              <span style={{ fontSize:"16px", fontWeight:"700" }}>G</span> Continuar con Google
            </button>
          </div>
        </div>
      )}

      {/* REGISTRO PROF */}
      {vista === "registro-prof" && (
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"40px 24px 60px" }}>
          <div style={{ width:"100%", maxWidth:"500px" }}>
            <button onClick={() => setVista("inicio")} style={{ background:"none", border:"none", color:"#6b7fa0", cursor:"pointer", marginBottom:"24px", fontSize:"14px", fontFamily:F.b }}>← Volver</button>
            <h2 style={{ fontFamily:F.h, fontSize:"36px", fontWeight:"600", marginBottom:"8px" }}>Registrate como profesional</h2>
            <p style={{ color:"#6b7fa0", fontWeight:"300", marginBottom:"28px", fontSize:"14px" }}>Tu identidad será verificada antes de poder cotizar.</p>

            {/* FOTO DE PERFIL */}
            <div style={{ display:"flex", alignItems:"center", gap:"20px", marginBottom:"24px", padding:"20px", background:"#070d1c", border:"1px solid #1a4a8a", borderRadius:"12px" }}>
              <div style={{ position:"relative" }}>
                {fotoPreview ? (
                  <img src={fotoPreview} alt="perfil" style={{ width:"72px", height:"72px", borderRadius:"50%", objectFit:"cover", border:"2px solid #1a4a8a" }} />
                ) : (
                  <div style={{ width:"72px", height:"72px", borderRadius:"50%", background:"#0f2d5e", border:"2px dashed #1a4a8a", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <span style={{ fontSize:"28px" }}>👤</span>
                  </div>
                )}
              </div>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:"13px", color:"#b8c8d8", margin:"0 0 8px", fontWeight:"500" }}>Foto de perfil</p>
                <p style={{ fontSize:"11px", color:"#6b7fa0", margin:"0 0 12px", fontWeight:"300" }}>Aparece en tus cotizaciones. Da más confianza al cliente.</p>
                <label style={{ display:"inline-flex", alignItems:"center", gap:"6px", background:"#0f2d5e", border:"1px solid #1a4a8a", borderRadius:"8px", padding:"8px 14px", cursor:"pointer", fontSize:"12px", color:"#4a8fd4" }}>
                  📷 Subir foto
                  <input type="file" accept="image/*" style={{ display:"none" }} onChange={e => {
                    const file = e.target.files[0];
                    if (file) { setFotoFile(file); setFotoPreview(URL.createObjectURL(file)); }
                  }} />
                </label>
              </div>
            </div>

            <div style={{ background:"rgba(74,143,212,0.06)", border:"1px solid rgba(74,143,212,0.2)", borderRadius:"10px", padding:"14px 18px", marginBottom:"24px" }}>
              <p style={{ fontSize:"12px", color:"#4a8fd4", margin:"0", lineHeight:"1.7" }}>🔒 <strong>Verificación obligatoria:</strong> Necesitamos foto de tu DNI (frente y dorso) y una selfie.</p>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
              <input placeholder="Nombre completo" value={regProf.nombre} onChange={e => setRegProf({...regProf, nombre:e.target.value})} style={inp} />
              <input placeholder="Número de DNI" value={regProf.dni} onChange={e => setRegProf({...regProf, dni:e.target.value})} style={inp} />
              <input placeholder="Teléfono / WhatsApp" value={regProf.telefono} onChange={e => setRegProf({...regProf, telefono:e.target.value})} style={inp} />
              <select value={regProf.oficio} onChange={e => setRegProf({...regProf, oficio:e.target.value})} style={inp}>{OFICIOS.map(o => <option key={o}>{o}</option>)}</select>
              <select value={regProf.zona} onChange={e => setRegProf({...regProf, zona:e.target.value})} style={inp}>{ZONAS.map(z => <option key={z}>{z}</option>)}</select>
              <textarea placeholder="Contá tu experiencia brevemente..." value={regProf.descripcion} onChange={e => setRegProf({...regProf, descripcion:e.target.value})} style={{ ...inp, minHeight:"80px", resize:"vertical" }} />
              <div style={{ background:"#070d1c", border:"1px solid #1a4a8a", borderRadius:"9px", padding:"16px" }}>
                <p style={{ fontSize:"13px", color:"#6b7fa0", margin:"0 0 12px", fontWeight:"300" }}>📎 Documentación requerida</p>
                <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                  {[["frente","DNI frente"],["dorso","DNI dorso"],["selfie","Selfie con DNI en mano"]].map(([key, doc]) => (
                    <label key={key} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 14px", background: dniFiles[key] ? "rgba(74,143,212,0.08)" : "rgba(255,255,255,0.03)", borderRadius:"7px", cursor:"pointer", border: dniFiles[key] ? "1px solid rgba(74,143,212,0.4)" : "1px dashed rgba(74,143,212,0.3)" }}>
                      <span style={{ fontSize:"13px", color:"#b8c8d8" }}>{doc}</span>
                      <span style={{ fontSize:"11px", color: dniFiles[key] ? "#4adf94" : "#4a8fd4" }}>{dniFiles[key] ? "✓ Subido" : "Subir foto →"}</span>
                      <input type="file" accept="image/*" style={{ display:"none" }} onChange={e => {
                        if (e.target.files[0]) setDniFiles(prev => ({...prev, [key]: e.target.files[0]}));
                      }} />
                    </label>
                  ))}
                </div>
              </div>
              <button onClick={registrarProfesional} style={{ ...btn, opacity: subiendoFoto ? 0.6 : 1 }} disabled={subiendoFoto}>
                {subiendoFoto ? "Subiendo..." : "Enviar solicitud de verificación"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PENDIENTE */}
      {vista === "pendiente-prof" && (
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"70vh", padding:"40px 24px", textAlign:"center" }}>
          <div style={{ width:"100%", maxWidth:"420px" }}>
            <div style={{ fontSize:"48px", marginBottom:"20px" }}>⏳</div>
            <h2 style={{ fontFamily:F.h, fontSize:"34px", fontWeight:"600", marginBottom:"12px" }}>Solicitud enviada</h2>
            <p style={{ color:"#6b7fa0", fontWeight:"300", lineHeight:"1.8", marginBottom:"32px" }}>Estamos revisando tu documentación. En las próximas <strong style={{ color:"#e8edf5" }}>24 a 48 horas</strong> recibirás un mail con el resultado.</p>
            <button onClick={() => setVista("inicio")} style={{ ...btn, background:"transparent", color:"#4a8fd4", borderColor:"rgba(74,143,212,0.3)" }}>Volver al inicio</button>
          </div>
        </div>
      )}

      {/* PEDIDOS PROF */}
      {vista === "pedidos-prof" && (
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"40px 24px" }}>
          <div style={{ width:"100%", maxWidth:"600px" }}>
            {/* Perfil del profesional */}
            {profesional && (
              <div style={{ display:"flex", alignItems:"center", gap:"16px", background:"#070d1c", border:"1px solid #1a4a8a", borderRadius:"14px", padding:"20px", marginBottom:"28px" }}>
                {profesional.foto_url ? (
                  <img src={profesional.foto_url} alt="perfil" style={{ width:"64px", height:"64px", borderRadius:"50%", objectFit:"cover", border:"2px solid #1a4a8a" }} />
                ) : (
                  <div style={{ width:"64px", height:"64px", borderRadius:"50%", background:"#0f2d5e", border:"2px dashed #1a4a8a", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"24px" }}>👤</div>
                )}
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:F.h, fontSize:"20px", fontWeight:"600" }}>{profesional.nombre}</div>
                  <div style={{ color:"#6b7fa0", fontSize:"13px", fontWeight:"300" }}>{profesional.oficio} · {profesional.zona}</div>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:"6px", background:"rgba(74,143,212,0.08)", border:"1px solid rgba(74,143,212,0.2)", borderRadius:"100px", padding:"5px 14px" }}>
                  <span style={{ width:"6px", height:"6px", borderRadius:"50%", background:"#4a8fd4", display:"inline-block" }}></span>
                  <span style={{ fontSize:"11px", color:"#4a8fd4", letterSpacing:"1px" }}>VERIFICADO</span>
                </div>
              </div>
            )}

            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px" }}>
              <h2 style={{ fontFamily:F.h, fontSize:"32px", fontWeight:"600", margin:"0" }}>Pedidos disponibles</h2>
            </div>

            {loading && <p style={{ color:"#6b7fa0" }}>Cargando...</p>}
            {!loading && pedidos.length === 0 && <p style={{ color:"#6b7fa0", fontWeight:"300" }}>No hay pedidos en tu zona todavía.</p>}
            {pedidos.map(p => (
              <div key={p.id} style={{ background:"#070d1c", border:"1px solid #1a4a8a", borderRadius:"14px", padding:"18px 22px", marginBottom:"12px" }}>
                <div style={{ display:"flex", gap:"8px", marginBottom:"10px", flexWrap:"wrap" }}>
                  <span style={{ background:"#0f2d5e", color:"#4a8fd4", padding:"3px 10px", borderRadius:"5px", fontSize:"11px", fontWeight:"600", letterSpacing:"1px" }}>{p.tipo}</span>
                  <span style={{ background:"rgba(255,255,255,0.04)", color:"#6b7fa0", padding:"3px 10px", borderRadius:"5px", fontSize:"11px" }}>{p.zona}</span>
                  {p.urgente && <span style={{ background:"rgba(224,85,85,0.1)", color:"#f08080", padding:"3px 10px", borderRadius:"5px", fontSize:"11px", fontWeight:"600" }}>Urgente</span>}
                </div>
                <p style={{ fontSize:"14px", color:"#b8c8d8", lineHeight:"1.7", margin:"0 0 14px", fontWeight:"300" }}>{p.descripcion}</p>
                <button onClick={() => setModalCotizar(p)} style={{ ...btn, padding:"10px", fontSize:"13px", width:"auto", paddingLeft:"20px", paddingRight:"20px" }}>Enviar cotización</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MIS COTIZACIONES */}
      {vista === "mis-cotizaciones" && (
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"40px 24px" }}>
          <div style={{ width:"100%", maxWidth:"600px" }}>
            <button onClick={() => setVista("pedidos-prof")} style={{ background:"none", border:"none", color:"#6b7fa0", cursor:"pointer", marginBottom:"24px", fontSize:"14px", fontFamily:F.b }}>← Volver</button>
            <h2 style={{ fontFamily:F.h, fontSize:"36px", fontWeight:"600", marginBottom:"24px" }}>Mis cotizaciones</h2>
            {loading && <p style={{ color:"#6b7fa0" }}>Cargando...</p>}
            {!loading && misCotz.length === 0 && <p style={{ color:"#6b7fa0", fontWeight:"300" }}>Todavía no enviaste cotizaciones.</p>}
            {misCotz.map(c => (
              <div key={c.id} style={{ background:"#070d1c", border:"1px solid #1a4a8a", borderRadius:"14px", padding:"18px 22px", marginBottom:"12px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"10px" }}>
                  <div>
                    <span style={{ background:"#0f2d5e", color:"#4a8fd4", padding:"3px 10px", borderRadius:"5px", fontSize:"11px", fontWeight:"600" }}>{c.pedidos?.tipo}</span>
                    <span style={{ color:"#6b7fa0", fontSize:"12px", marginLeft:"10px" }}>{c.pedidos?.zona}</span>
                  </div>
                  <span style={{ color: c.estado === "aceptada" ? "#4adf94" : c.estado === "rechazada" ? "#f08080" : "#6b7fa0", fontSize:"12px", fontWeight:"600", letterSpacing:"1px" }}>
                    {c.estado.toUpperCase()}
                  </span>
                </div>
                <p style={{ fontSize:"13px", color:"#b8c8d8", margin:"0 0 8px", fontWeight:"300" }}>{c.pedidos?.descripcion}</p>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ color:"#4a8fd4", fontSize:"18px", fontWeight:"700", fontFamily:F.h }}>${c.monto.toLocaleString()}</span>
                  <span style={{ color:"#6b7fa0", fontSize:"12px" }}>{new Date(c.created_at).toLocaleDateString("es-AR")}</span>
                </div>
                {c.mensaje && <p style={{ fontSize:"12px", color:"#6b7fa0", margin:"8px 0 0", fontWeight:"300", fontStyle:"italic" }}>"{c.mensaje}"</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PUBLICAR */}
      {vista === "publicar" && (
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"40px 24px" }}>
          <div style={{ width:"100%", maxWidth:"480px" }}>
            <button onClick={() => setVista("inicio")} style={{ background:"none", border:"none", color:"#6b7fa0", cursor:"pointer", marginBottom:"24px", fontSize:"14px", fontFamily:F.b }}>← Volver</button>
            <h2 style={{ fontFamily:F.h, fontSize:"38px", fontWeight:"600", marginBottom:"28px" }}>Publicar pedido</h2>
            <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
              <select value={form.tipo} onChange={e => setForm({...form, tipo:e.target.value})} style={inp}>{OFICIOS.map(o => <option key={o}>{o}</option>)}</select>
              <select value={form.zona} onChange={e => setForm({...form, zona:e.target.value})} style={inp}>{ZONAS.map(z => <option key={z}>{z}</option>)}</select>
              <input placeholder="Tu nombre" value={form.nombre} onChange={e => setForm({...form, nombre:e.target.value})} style={inp} />
              <textarea placeholder="Describí el trabajo..." value={form.descripcion} onChange={e => setForm({...form, descripcion:e.target.value})} style={{ ...inp, minHeight:"100px", resize:"vertical" }} />
              <label style={{ display:"flex", alignItems:"center", gap:"8px", color:"#f08080", fontSize:"13px", cursor:"pointer" }}>
                <input type="checkbox" checked={form.urgente} onChange={e => setForm({...form, urgente:e.target.checked})} />
                Es urgente
              </label>
              <button onClick={publicar} style={btn}>Publicar pedido</button>
            </div>
          </div>
        </div>
      )}

      {/* EXPLORAR */}
      {vista === "explorar" && (
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"40px 24px" }}>
          <div style={{ width:"100%", maxWidth:"560px" }}>
            <button onClick={() => setVista("inicio")} style={{ background:"none", border:"none", color:"#6b7fa0", cursor:"pointer", marginBottom:"24px", fontSize:"14px", fontFamily:F.b }}>← Volver</button>
            <h2 style={{ fontFamily:F.h, fontSize:"38px", fontWeight:"600", marginBottom:"24px" }}>Pedidos disponibles</h2>
            {loading && <p style={{ color:"#6b7fa0" }}>Cargando...</p>}
            {!loading && pedidos.length === 0 && <p style={{ color:"#6b7fa0", fontWeight:"300" }}>No hay pedidos todavía.</p>}
            {pedidos.map(p => (
              <div key={p.id} style={{ background:"#070d1c", border:"1px solid #1a4a8a", borderRadius:"14px", padding:"18px 22px", marginBottom:"12px" }}>
                <div style={{ display:"flex", gap:"8px", marginBottom:"10px", flexWrap:"wrap" }}>
                  <span style={{ background:"#0f2d5e", color:"#4a8fd4", padding:"3px 10px", borderRadius:"5px", fontSize:"11px", fontWeight:"600", letterSpacing:"1px" }}>{p.tipo}</span>
                  <span style={{ background:"rgba(255,255,255,0.04)", color:"#6b7fa0", padding:"3px 10px", borderRadius:"5px", fontSize:"11px" }}>{p.zona}</span>
                  {p.urgente && <span style={{ background:"rgba(224,85,85,0.1)", color:"#f08080", padding:"3px 10px", borderRadius:"5px", fontSize:"11px", fontWeight:"600" }}>Urgente</span>}
                </div>
                <p style={{ fontSize:"14px", color:"#b8c8d8", lineHeight:"1.7", margin:"0", fontWeight:"300" }}>{p.descripcion}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PLANES */}
      {vista === "planes" && (
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"40px 24px 60px" }}>
          <div style={{ width:"100%", maxWidth:"640px" }}>
            <button onClick={() => setVista("inicio")} style={{ background:"none", border:"none", color:"#6b7fa0", cursor:"pointer", marginBottom:"32px", fontSize:"14px", fontFamily:F.b, display:"block" }}>← Volver</button>
            <div style={{ textAlign:"center", marginBottom:"48px" }}>
              <h2 style={{ fontFamily:F.h, fontSize:"44px", fontWeight:"600", marginBottom:"8px" }}>Planes</h2>
              <p style={{ color:"#6b7fa0", fontWeight:"300" }}>Empezá con el período de prueba. Sin tarjeta requerida.</p>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
              {planes.map(p => (
                <div key={p.nombre} style={{ background: p.destacado ? "rgba(74,143,212,0.07)" : "#070d1c", border:`1px solid ${p.color}`, borderRadius:"16px", padding:"28px", position:"relative" }}>
                  {p.destacado && <span style={{ position:"absolute", top:"-13px", right:"24px", background:"#4a8fd4", color:"#fff", fontSize:"10px", padding:"4px 14px", borderRadius:"100px", letterSpacing:"1px" }}>RECOMENDADO</span>}
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"20px" }}>
                    <div>
                      <div style={{ fontFamily:F.h, fontSize:"26px", fontWeight:"600", marginBottom:"2px" }}>{p.nombre}</div>
                      <div style={{ fontSize:"11px", color:"#6b7fa0", letterSpacing:"1px" }}>{p.subprecio}</div>
                    </div>
                    <div style={{ color:"#4a8fd4", fontSize:"22px", fontWeight:"700", fontFamily:F.h }}>{p.precio}</div>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:"8px", marginBottom:"20px" }}>
                    {p.features.map(f => (
                      <div key={f} style={{ fontSize:"13px", color: f.startsWith("✓") ? "#b8c8d8" : "#4a5568", fontWeight:"300" }}>{f}</div>
                    ))}
                  </div>
                  <button style={{ ...btn, background: p.destacado ? "#0f2d5e" : "transparent", color: p.destacado ? "#fff" : "#4a8fd4", borderColor: p.color, padding:"12px" }}>
                    {p.nombre === "Prueba" ? "Comenzar prueba gratuita" : `Suscribirse a ${p.nombre}`}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ADMIN */}
      {vista === "admin" && (
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"40px 24px" }}>
          <div style={{ width:"100%", maxWidth:"700px" }}>
            <button onClick={() => setVista("inicio")} style={{ background:"none", border:"none", color:"#6b7fa0", cursor:"pointer", marginBottom:"24px", fontSize:"14px", fontFamily:F.b }}>← Volver</button>
            <h2 style={{ fontFamily:F.h, fontSize:"36px", fontWeight:"600", marginBottom:"8px" }}>Panel Admin</h2>
            <p style={{ color:"#6b7fa0", fontSize:"14px", marginBottom:"28px", fontWeight:"300" }}>Verificación de profesionales</p>
            {profesionales.length === 0 && <p style={{ color:"#6b7fa0" }}>No hay solicitudes pendientes.</p>}
            {profesionales.map(p => (
              <div key={p.id} style={{ background:"#070d1c", border:`1px solid ${p.verificado ? "rgba(74,223,148,0.3)" : "#1a4a8a"}`, borderRadius:"14px", padding:"20px", marginBottom:"12px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"14px", marginBottom:"14px" }}>
                  {p.foto_url ? (
                    <img src={p.foto_url} alt="perfil" style={{ width:"52px", height:"52px", borderRadius:"50%", objectFit:"cover", border:"2px solid #1a4a8a" }} />
                  ) : (
                    <div style={{ width:"52px", height:"52px", borderRadius:"50%", background:"#0f2d5e", border:"2px dashed #1a4a8a", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"20px" }}>👤</div>
                  )}
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:"600", fontSize:"16px" }}>{p.nombre}</div>
                    <div style={{ color:"#6b7fa0", fontSize:"13px" }}>{p.oficio} · {p.zona} · DNI: {p.dni}</div>
                    <div style={{ color:"#6b7fa0", fontSize:"12px" }}>Tel: {p.telefono}</div>
                  </div>
                  <span style={{ fontSize:"12px", fontWeight:"600", color: p.verificado ? "#4adf94" : "#f08080", letterSpacing:"1px" }}>
                    {p.verificado ? "✓ VERIFICADO" : "PENDIENTE"}
                  </span>
                </div>
                {p.descripcion && <p style={{ fontSize:"13px", color:"#b8c8d8", margin:"0 0 14px", fontWeight:"300" }}>{p.descripcion}</p>}
                {!p.verificado && (
                  <div style={{ display:"flex", gap:"10px" }}>
                    <button onClick={() => aprobarProfesional(p.id)} style={{ ...btn, padding:"10px", fontSize:"13px", background:"rgba(74,223,148,0.1)", color:"#4adf94", borderColor:"rgba(74,223,148,0.3)", flex:1 }}>✓ Aprobar</button>
                    <button onClick={() => rechazarProfesional(p.id)} style={{ ...btn, padding:"10px", fontSize:"13px", background:"rgba(240,128,128,0.1)", color:"#f08080", borderColor:"rgba(240,128,128,0.3)", flex:1 }}>✗ Rechazar</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}