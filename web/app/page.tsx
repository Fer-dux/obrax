import { Logo } from "@/components/Logo";
import { Calculadora } from "@/components/Calculadora";
import { Bomba, Camion, Casco, Chat, Escudo, Ladrillos, Mixer, Reloj } from "@/components/Iconos";
import { DATOS, linkWhatsApp } from "@/lib/datos";

const HORMIGONES = [
  { tipo: "H8", uso: "Hormigón de limpieza y rellenos" },
  { tipo: "H13", uso: "Contrapisos y veredas" },
  { tipo: "H17", uso: "Pisos y bases de bajo requerimiento" },
  { tipo: "H21", uso: "Losas, vigas y columnas de viviendas" },
  { tipo: "H25", uso: "Estructuras y pavimentos" },
  { tipo: "H30", uso: "Estructuras de alta exigencia e industriales" },
];

const MATERIALES = [
  { nombre: "Cemento y cales", detalle: "Cemento portland, cal aérea e hidráulica, hidrófugos" },
  { nombre: "Áridos", detalle: "Arena, piedra partida y cascote, a granel o en bolsón" },
  { nombre: "Ladrillos", detalle: "Comunes, huecos y portantes" },
  { nombre: "Hierros", detalle: "Barras, mallas y estribos para estructura" },
  { nombre: "Adhesivos y yesos", detalle: "Pegamentos para cerámicos y porcellanato, yesos" },
  { nombre: "Impermeabilizantes", detalle: "Membranas líquidas, Ceresita, Sika y más" },
];

export default function Inicio() {
  const wa = linkWhatsApp();
  const ctaHref = wa ?? "#contacto";
  const ctaExterno = wa ? { target: "_blank", rel: "noopener" } : {};

  return (
    <>
      {/* ───── Encabezado ───── */}
      <header className="sticky top-0 z-30 border-b border-white/5 bg-grafito/95 backdrop-blur">
        <div className="contenedor flex h-16 items-center gap-6">
          <a href="#inicio" aria-label="OBRAX inicio"><Logo className="h-7" claro /></a>
          <nav className="ml-auto hidden items-center gap-6 text-sm font-semibold text-stone-300 md:flex">
            <a href="#hormigon" className="hover:text-white">Hormigón</a>
            <a href="#materiales" className="hover:text-white">Materiales</a>
            <a href="#calculadora" className="hover:text-white">Calculadora</a>
            <a href="#contacto" className="hover:text-white">Contacto</a>
          </nav>
          <a href={ctaHref} {...ctaExterno} className="btn-naranja ml-auto px-4 py-2 md:ml-0">
            {wa && <Chat />} Presupuesto
          </a>
        </div>
      </header>

      <main id="inicio">
        {/* ───── Portada ───── */}
        <section className="hormigon relative overflow-hidden text-white">
          <div className="pointer-events-none absolute inset-x-0 top-0 bottom-12 hidden overflow-hidden xl:block">
            <div className="absolute -right-10 top-0 h-full w-24 -skew-x-12 bg-grafito-oscuro/80" />
            <div className="absolute right-16 top-0 h-full w-3 -skew-x-12 bg-naranja" />
          </div>
          <div className="contenedor relative z-10 grid items-center gap-10 py-16 sm:py-24 lg:grid-cols-2">
            <div>
              <p className="eyebrow">Soluciones para la construcción</p>
              <h1 className="mt-4 text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl">
                Hormigón y materiales para tu obra, <span className="text-naranja">en un solo lugar.</span>
              </h1>
              <p className="mt-5 max-w-xl text-lg text-stone-300">
                Hormigón elaborado con servicio de bombeo y todos los materiales que necesitás, con un único
                interlocutor desde la cotización hasta la entrega.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href={ctaHref} {...ctaExterno} className="btn-naranja">{wa && <Chat />} Pedí tu presupuesto</a>
                <a href="#calculadora" className="btn-borde">Calculá tus m³</a>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Tarjeta icono={<Mixer className="h-14 w-20" />} titulo="Hormigón elaborado" texto="H8 a H30, con bomba y adicionales." />
              <Tarjeta icono={<Ladrillos className="h-14 w-20" />} titulo="Materiales" texto="Cemento, áridos, ladrillos, hierros y más." />
              <Tarjeta icono={<Bomba className="h-14 w-20" />} titulo="Bombeo" texto="Bomba pluma y de arrastre." />
              <Tarjeta icono={<Camion className="h-12 w-12" />} titulo="Entregas" texto="Coordinadas en obra." />
            </div>
          </div>
          <div className="relative z-10 border-t border-white/10 bg-grafito-oscuro">
            <div className="contenedor flex flex-wrap items-center justify-center gap-x-6 gap-y-1 py-3 text-xs font-semibold uppercase tracking-[0.35em] text-stone-300">
              <span>Solidez</span><span className="text-naranja">|</span><span>Confianza</span><span className="text-naranja">|</span><span>Respaldo</span>
            </div>
          </div>
        </section>

        {/* ───── Hormigón ───── */}
        <section id="hormigon" className="py-16 sm:py-24">
          <div className="contenedor">
            <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-start">
              <div>
                <p className="eyebrow">Unidad 1</p>
                <h2 className="titulo-seccion">Hormigón elaborado</h2>
                <p className="mt-4 text-stone-600">
                  Hormigón de planta, dosificado y controlado, entregado en tu obra con mixer. Sumamos servicio de bomba,
                  aditivos y asesoramiento para que elijas el hormigón correcto para cada parte de tu proyecto.
                </p>
                <ul className="mt-6 space-y-3 text-sm">
                  {["Bomba pluma y bomba de arrastre", "Aditivos hidrófugos y acelerantes", "Relevamiento técnico de la obra", "Programación de entregas"].map((x) => (
                    <li key={x} className="flex items-center gap-3"><span className="h-2 w-2 rotate-45 bg-naranja" />{x}</li>
                  ))}
                </ul>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {HORMIGONES.map((h) => (
                  <div key={h.tipo} className="group flex items-center gap-4 rounded-xl border border-stone-200 p-4 transition hover:border-naranja hover:shadow-md">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-grafito text-lg font-black text-white group-hover:bg-naranja">{h.tipo}</div>
                    <p className="text-sm font-medium text-stone-700">{h.uso}</p>
                  </div>
                ))}
                <p className="text-xs text-stone-500 sm:col-span-2">Usos orientativos. El tipo de hormigón lo define el profesional a cargo de la obra.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ───── Calculadora ───── */}
        <section id="calculadora" className="hormigon py-16 text-white sm:py-24">
          <div className="contenedor grid items-center gap-10 lg:grid-cols-2">
            <div>
              <p className="eyebrow">Herramienta</p>
              <h2 className="titulo-seccion">¿Cuántos m³ necesitás?</h2>
              <p className="mt-4 max-w-md text-stone-300">
                Ingresá las medidas de tu losa, platea o contrapiso y te calculamos el volumen aproximado de hormigón.
                Con un toque nos mandás el pedido y te cotizamos.
              </p>
            </div>
            <Calculadora />
          </div>
        </section>

        {/* ───── Materiales ───── */}
        <section id="materiales" className="bg-stone-50 py-16 sm:py-24">
          <div className="contenedor">
            <div className="max-w-2xl">
              <p className="eyebrow">Unidad 2</p>
              <h2 className="titulo-seccion">Materiales para la construcción</h2>
              <p className="mt-4 text-stone-600">
                Todo lo que tu obra necesita además del hormigón. Pedí todo junto y coordinamos una sola entrega.
              </p>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {MATERIALES.map((m) => (
                <div key={m.nombre} className="rounded-xl border-l-4 border-naranja bg-white p-5 shadow-sm">
                  <h3 className="font-bold">{m.nombre}</h3>
                  <p className="mt-1 text-sm text-stone-600">{m.detalle}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 rounded-xl bg-grafito p-6 text-white sm:flex sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-bold">Acopio de materiales</h3>
                <p className="text-sm text-stone-300">Congelá el precio de tus materiales y retiralos a medida que avanza la obra.</p>
              </div>
              <a href={ctaHref} {...ctaExterno} className="btn-naranja mt-4 sm:mt-0">Consultar acopio</a>
            </div>
          </div>
        </section>

        {/* ───── Por qué OBRAX ───── */}
        <section className="py-16 sm:py-24">
          <div className="contenedor">
            <div className="text-center">
              <p className="eyebrow">Por qué OBRAX</p>
              <h2 className="titulo-seccion">Una sola empresa para toda tu obra</h2>
            </div>
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <Beneficio icono={<Casco />} titulo="Todo en un lugar" texto="Hormigón y materiales con un solo contacto y un solo presupuesto." />
              <Beneficio icono={<Escudo />} titulo="Respaldo técnico" texto="Te asesoramos en el tipo de hormigón y las cantidades." />
              <Beneficio icono={<Reloj />} titulo="Respuesta rápida" texto="Presupuestos claros, enviados por WhatsApp en el día." />
              <Beneficio icono={<Camion />} titulo="Entregas coordinadas" texto="Programamos camiones y materiales según tu obra." />
            </div>
          </div>
        </section>

        {/* ───── Contacto ───── */}
        <section id="contacto" className="bg-grafito py-16 text-white sm:py-24">
          <div className="contenedor grid gap-10 lg:grid-cols-2">
            <div>
              <p className="eyebrow">Contacto</p>
              <h2 className="titulo-seccion">Pedí tu presupuesto</h2>
              <p className="mt-4 max-w-md text-stone-300">
                Contanos qué necesitás para tu obra y te respondemos con un presupuesto detallado.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {wa && <a href={wa} target="_blank" rel="noopener" className="btn-naranja"><Chat /> WhatsApp</a>}
                {DATOS.telefono && <a href={`tel:${DATOS.telefono.replace(/[^\d+]/g, "")}`} className="btn-borde">Llamar</a>}
                {DATOS.email && <a href={`mailto:${DATOS.email}`} className="btn-borde">Email</a>}
              </div>
              {!wa && !DATOS.telefono && !DATOS.email && (
                <p className="mt-6 rounded-lg border border-dashed border-naranja/60 p-4 text-sm text-naranja">
                  Próximamente: WhatsApp, teléfono y email de contacto.
                </p>
              )}
            </div>
            <dl className="grid gap-6 rounded-2xl bg-white/5 p-6 sm:grid-cols-2">
              {DATOS.telefono && <Dato titulo="Teléfono" valor={DATOS.telefono} />}
              {DATOS.email && <Dato titulo="Email" valor={DATOS.email} />}
              {(DATOS.direccion || DATOS.localidad) && <Dato titulo="Dirección" valor={[DATOS.direccion, DATOS.localidad].filter(Boolean).join(", ")} />}
              <Dato titulo="Horarios" valor={DATOS.horarios} />
              <div className="sm:col-span-2">
                <dt className="text-xs font-bold uppercase tracking-widest text-naranja">Zonas de entrega</dt>
                <dd className="mt-2 flex flex-wrap gap-2">
                  {DATOS.zonas.map((z) => <span key={z} className="rounded-full bg-white/10 px-3 py-1 text-sm">{z}</span>)}
                </dd>
              </div>
            </dl>
          </div>
        </section>
      </main>

      {/* ───── Pie ───── */}
      <footer className="border-t-4 border-naranja bg-grafito-oscuro py-8 text-sm text-stone-400">
        <div className="contenedor flex flex-col items-center justify-between gap-4 sm:flex-row">
          <Logo className="h-6" claro />
          <p>© {new Date().getFullYear()} OBRAX · Soluciones para la construcción</p>
          <a href={DATOS.app} className="hover:text-white">Acceso equipo →</a>
        </div>
      </footer>

      {/* WhatsApp flotante (solo si hay número) */}
      {wa && (
        <a href={wa} target="_blank" rel="noopener" aria-label="Escribinos por WhatsApp"
          className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl transition hover:scale-105">
          <Chat className="h-7 w-7" />
        </a>
      )}
    </>
  );
}

function Tarjeta({ icono, titulo, texto }: { icono: React.ReactNode; titulo: string; texto: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-grafito/80 p-4 backdrop-blur sm:p-5">
      <div className="text-naranja">{icono}</div>
      <h3 className="mt-3 font-bold">{titulo}</h3>
      <p className="mt-1 text-sm text-stone-300">{texto}</p>
    </div>
  );
}

function Beneficio({ icono, titulo, texto }: { icono: React.ReactNode; titulo: string; texto: string }) {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-naranja-claro text-naranja">{icono}</div>
      <h3 className="mt-4 font-bold">{titulo}</h3>
      <p className="mt-1 text-sm text-stone-600">{texto}</p>
    </div>
  );
}

function Dato({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-widest text-naranja">{titulo}</dt>
      <dd className="mt-1">{valor}</dd>
    </div>
  );
}
