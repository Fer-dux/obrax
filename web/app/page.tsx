import Image from "next/image";
import { Logo } from "@/components/Logo";
import { Encabezado } from "@/components/Encabezado";
import { Calculadora } from "@/components/Calculadora";
import { FormularioConsulta } from "@/components/FormularioConsulta";
import {
  Apreton, Bolsa, Bomba, Calculadora as IconoCalculadora, Camion, Capas, Casco, Chat, Escudo, Flecha, Gota,
  Hierros, Ladrillos, Mas, Mensaje, Mixer, Piedras,
} from "@/components/Iconos";
import { DATOS, RESPALDO, linkWhatsApp } from "@/lib/datos";

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

const BENEFICIOS = [
  { icono: <Casco className="h-9 w-9" />, titulo: "Experiencia comprobada", texto: "Dos empresas del rubro" },
  { icono: <Capas className="h-9 w-9" />, titulo: "Solución integral", texto: "Hormigón y materiales" },
  { icono: <Camion className="h-9 w-9" />, titulo: "Logística coordinada", texto: "Entregas en obra" },
  { icono: <Apreton className="h-9 w-9" />, titulo: "Acompañamiento técnico", texto: "En cada etapa" },
  { icono: <Escudo className="h-9 w-9" />, titulo: "Confianza y respaldo", texto: "Un grupo sólido y local" },
];

/** Categorías ofrecidas en el sitio (unidades de hormigón y materiales). */
const CATEGORIAS = [
  { icono: <Mixer className="h-9 w-12" />, nombre: "Hormigón elaborado", href: "#hormigon" },
  { icono: <Bomba className="h-9 w-12" />, nombre: "Bombeo de hormigón", href: "#hormigon" },
  { icono: <Bolsa />, nombre: "Cemento y cales", href: "#materiales" },
  { icono: <Piedras />, nombre: "Áridos", href: "#materiales" },
  { icono: <Hierros />, nombre: "Hierros", href: "#materiales" },
  { icono: <Ladrillos className="h-9 w-12" />, nombre: "Ladrillos", href: "#materiales" },
  { icono: <Gota />, nombre: "Impermeabilizantes", href: "#materiales" },
  { icono: <Mas />, nombre: "Y más", href: "#materiales" },
];

const hormaco = RESPALDO.find((r) => r.unidad === "Hormigón")!;
const palermo = RESPALDO.find((r) => r.unidad === "Materiales")!;

export default function Inicio() {
  const wa = linkWhatsApp();

  return (
    <>
      <a href="#contenido" className="sr-only z-50 rounded bg-naranja px-4 py-2 font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Saltar al contenido
      </a>
      <Encabezado appHref={DATOS.app} />

      <main id="contenido">
        {/* ───── Hero ───── */}
        <section id="inicio" className="relative isolate overflow-hidden bg-carbon text-white">
          {/* Celular y tablet: foto de fondo completa, degradado hacia abajo donde va el texto */}
          <div className="absolute inset-0 -z-10 lg:hidden">
            <Image src="/img/obra-principal.webp" alt="" width={934} height={414} priority
              sizes="(max-width: 1023px) 100vw, 1px" className="h-[300px] w-full object-cover object-[72%_center] sm:h-[440px]" />
            <div className="absolute inset-x-0 top-0 h-[300px] bg-gradient-to-t from-carbon via-carbon/20 to-transparent sm:h-[440px]" />
          </div>
          {/* Escritorio: foto a la derecha con degradado hacia el texto */}
          <div className="absolute inset-y-0 right-0 -z-10 hidden w-[68%] lg:block">
            <Image src="/img/obra-principal.webp" alt="" width={934} height={414} priority
              sizes="(min-width: 1024px) 68vw, 1px" className="h-full w-full object-cover object-[65%_center]" />
            <div className="absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r from-carbon via-carbon/60 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-carbon/50 to-transparent" />
          </div>
          <div className="contenedor flex flex-col justify-end pb-10 pt-[220px] sm:pt-[360px] lg:min-h-[560px] lg:justify-center lg:py-20">
            <div className="max-w-xl">
              <h1 className="font-titulo text-[2.6rem] font-extrabold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
                La fuerza de construir <span className="text-naranja">juntos.</span>
              </h1>
              <p className="mt-4 max-w-lg text-[17px] text-stone-200 sm:mt-5 sm:text-xl">
                Hormigón elaborado, materiales y logística integrada para que tu obra avance, con un solo grupo.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row">
                <a href="#contacto" className="btn-naranja px-6 py-3.5 text-base">Solicitá tu presupuesto <Flecha /></a>
                <a href="#calculadora" className="btn-borde bg-carbon/30 px-6 py-3.5 text-base backdrop-blur-sm"><IconoCalculadora /> Calculá tu hormigón</a>
              </div>
            </div>
          </div>
        </section>

        {/* ───── Beneficios ───── */}
        <section aria-label="Por qué OBRAX Group" className="border-y border-white/5 bg-grafito text-white">
          <ul className="contenedor grid grid-cols-2 gap-x-3 gap-y-4 py-5 sm:gap-y-5 sm:py-7 lg:grid-cols-5 lg:divide-x lg:divide-white/10">
            {BENEFICIOS.map((b, i) => (
              <li key={b.titulo} className={`flex items-center gap-2.5 sm:gap-4 lg:justify-center lg:px-4 ${i === BENEFICIOS.length - 1 ? "col-span-2 justify-center lg:col-span-1" : ""}`}>
                <span className="shrink-0 text-white/90 [&>svg]:h-7 [&>svg]:w-7 sm:[&>svg]:h-9 sm:[&>svg]:w-9">{b.icono}</span>
                <span className="min-w-0">
                  <span className="block font-titulo text-[13px] font-bold leading-tight sm:text-[15px]">{b.titulo}</span>
                  <span className="block text-xs text-acero sm:text-sm">{b.texto}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* ───── Las dos empresas del grupo ───── */}
        <section id="grupo" aria-label="Las empresas de OBRAX Group" className="bg-white">
          <h2 className="sr-only">Hormaco y Palermo Materiales</h2>
          <div className="grid lg:grid-cols-2">
            <PanelEmpresa
              foto="/img/planta-hormaco.webp" fotoAncho={259} fotoAlto={250}
              fotoAlt="Ilustración de una planta de hormigón elaborado"
              logo={hormaco.logo!} nombre={hormaco.nombre} acento="bg-hormaco"
              texto="Hormigón elaborado de calidad, con capacidad productiva, bombeo y asesoramiento técnico."
              href="#hormigon" web={hormaco.web}
            />
            <PanelEmpresa
              foto="/img/deposito-palermo.webp" fotoAncho={313} fotoAlto={245}
              fotoAlt="Ilustración de un depósito de materiales para la construcción"
              logo={palermo.logo!} nombre={palermo.nombre} acento="bg-naranja" altoLogo="h-16 sm:h-[4.5rem]"
              texto="Materiales para la construcción, con amplio stock, primeras marcas y entrega en obra."
              href="#materiales" web={palermo.web}
            />
          </div>
          <p className="border-t border-stone-100 px-4 py-4 text-center text-sm text-stone-500">
            OBRAX Group nace de la unión de <b className="text-grafito">Hormaco</b> y <b className="text-grafito">Palermo Materiales</b>: un solo socio para abastecer tu obra.
          </p>
        </section>

        {/* ───── Categorías ───── */}
        <section aria-labelledby="titulo-categorias" className="mineral border-y border-stone-200">
          <div className="contenedor grid items-center gap-8 py-10 lg:grid-cols-[auto_1fr] lg:gap-12">
            <h2 id="titulo-categorias" className="font-titulo text-3xl font-extrabold leading-tight tracking-tight lg:border-r lg:border-stone-300 lg:pr-12">
              Todo para tu obra.<br /><span className="text-naranja">Un solo grupo.</span>
            </h2>
            <ul className="grid grid-cols-3 gap-x-2 gap-y-6 sm:grid-cols-4 lg:grid-cols-8 lg:gap-x-1">
              {CATEGORIAS.map((c) => (
                <li key={c.nombre}>
                  <a href={c.href} className="group flex flex-col items-center gap-2 rounded-lg p-1 text-center">
                    <span className="flex h-12 items-center text-grafito transition group-hover:text-naranja">{c.icono}</span>
                    <span className={`font-bold leading-tight ${c.nombre.length > 14 && !c.nombre.includes(" ") ? "text-[11px] sm:text-sm lg:text-[12px] xl:text-sm" : "text-xs sm:text-sm lg:text-[13px] xl:text-sm"}`}>{c.nombre}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ───── Hormigón ───── */}
        <section id="hormigon" className="py-16 sm:py-24">
          <div className="contenedor">
            <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-start">
              <div>
                <p className="eyebrow">Hormigón elaborado · Hormaco</p>
                <h2 className="titulo-seccion">Hormigón para cada etapa de tu obra</h2>
                <p className="mt-4 text-stone-600">
                  Hormigón de planta, dosificado y controlado, entregado en tu obra con mixer. Sumamos servicio de bomba,
                  aditivos y asesoramiento para que elijas el hormigón correcto para cada parte de tu proyecto.
                </p>
                <ul className="mt-6 space-y-3 text-sm">
                  {["Bomba pluma y bomba de arrastre", "Aditivos hidrófugos y acelerantes", "Relevamiento técnico de la obra", "Programación de entregas"].map((x) => (
                    <li key={x} className="flex items-center gap-3"><span className="h-2 w-2 rotate-45 bg-naranja" />{x}</li>
                  ))}
                </ul>
                <a href="#calculadora" className="btn-oscuro mt-8"><IconoCalculadora /> Calculá tu hormigón</a>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {HORMIGONES.map((h) => (
                  <div key={h.tipo} className="group flex items-center gap-4 rounded-xl border border-stone-200 bg-white p-4 transition hover:border-naranja hover:shadow-md">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-grafito font-titulo text-lg font-extrabold text-white group-hover:bg-naranja">{h.tipo}</div>
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
        <section id="materiales" className="bg-mineral py-16 sm:py-24">
          <div className="contenedor">
            <div className="max-w-2xl">
              <p className="eyebrow">Materiales · Palermo Materiales</p>
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
              <a href="#contacto" className="btn-naranja mt-4 sm:mt-0">Consultar acopio</a>
            </div>
          </div>
        </section>

        {/* ───── Contacto ───── */}
        <section id="contacto" className="hormigon py-16 text-white sm:py-24">
          <div className="contenedor grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-start">
            <div>
              <p className="eyebrow">Contacto</p>
              <h2 className="titulo-seccion">Solicitá tu presupuesto</h2>
              <p className="mt-4 max-w-md text-stone-300">
                Completá el formulario con lo que necesitás para tu obra y te respondemos con un presupuesto detallado.
              </p>
              <dl className="mt-8 grid gap-6 rounded-2xl bg-white/5 p-6">
                {DATOS.email && (
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-widest text-naranja">Email</dt>
                    <dd className="mt-1"><a href={`mailto:${DATOS.email}`} className="hover:underline">{DATOS.email}</a></dd>
                  </div>
                )}
                {DATOS.telefono && <Dato titulo="Teléfono" valor={DATOS.telefono} />}
                {(DATOS.direccion || DATOS.localidad) && <Dato titulo="Dirección" valor={[DATOS.direccion, DATOS.localidad].filter(Boolean).join(", ")} />}
                <Dato titulo="Horarios" valor={DATOS.horarios} />
                <div>
                  <dt className="text-xs font-bold uppercase tracking-widest text-naranja">Zonas de entrega</dt>
                  <dd className="mt-2 flex flex-wrap gap-2">
                    {DATOS.zonas.map((z) => <span key={z} className="rounded-full bg-white/10 px-3 py-1 text-sm">{z}</span>)}
                  </dd>
                </div>
              </dl>
            </div>
            <FormularioConsulta />
          </div>
        </section>
      </main>

      {/* ───── Pie ───── */}
      <footer className="border-t-4 border-naranja bg-carbon py-10 text-sm text-stone-400">
        <div className="contenedor grid gap-8 md:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <Logo className="h-7" claro />
            <p className="mt-3 max-w-xs">Soluciones integrales para la construcción. Hormigón elaborado y materiales con un solo grupo.</p>
          </div>
          <div>
            <p className="font-titulo font-bold text-white">El grupo</p>
            <ul className="mt-3 space-y-2">
              {RESPALDO.map((r) => (
                <li key={r.nombre}><a href={r.web} target="_blank" rel="noopener" className="hover:text-white">{r.nombre} · {r.rubro}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-titulo font-bold text-white">Contacto</p>
            <ul className="mt-3 space-y-2">
              {DATOS.email && <li><a href={`mailto:${DATOS.email}`} className="hover:text-white">{DATOS.email}</a></li>}
              <li><a href="#contacto" className="hover:text-white">Solicitá tu presupuesto</a></li>
              <li><a href={DATOS.app} className="hover:text-white">Acceso equipo →</a></li>
            </ul>
          </div>
        </div>
        <div className="contenedor mt-8 border-t border-white/10 pt-6 text-xs">
          © {new Date().getFullYear()} OBRAX Group · Con el respaldo de {RESPALDO.map((r) => r.nombre).join(" y ")}
        </div>
      </footer>

      {/* WhatsApp flotante (solo si hay número cargado) */}
      {wa && (
        <a href={wa} target="_blank" rel="noopener" aria-label="Escribinos por WhatsApp"
          className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl transition hover:scale-105">
          <Chat className="h-7 w-7" />
        </a>
      )}
    </>
  );
}

function PanelEmpresa({ foto, fotoAncho, fotoAlto, fotoAlt, logo, nombre, acento, texto, href, web, altoLogo = "h-12 sm:h-14" }: {
  foto: string; fotoAncho: number; fotoAlto: number; fotoAlt: string; altoLogo?: string;
  logo: { src: string; ancho: number; alto: number }; nombre: string; acento: string;
  texto: string; href: string; web: string;
}) {
  return (
    <article className="group grid border-b border-stone-100 sm:grid-cols-[46%_1fr] lg:border-b-0">
      {/* Foto con corte diagonal y franja de acento: solo CSS (clip-path), sin deformar la imagen */}
      <div className="relative h-56 overflow-hidden sm:h-auto sm:min-h-[280px]">
        <div className="absolute inset-0 sm:[clip-path:polygon(0_0,100%_0,80%_100%,0_100%)]">
          <Image src={foto} alt={fotoAlt} width={fotoAncho} height={fotoAlto} loading="lazy"
            sizes="(min-width: 1024px) 23vw, (min-width: 640px) 46vw, 100vw"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
        </div>
        <div className={`absolute inset-y-0 right-[2%] hidden w-[22%] ${acento} sm:block [clip-path:polygon(88%_0,100%_0,12%_100%,0_100%)]`} aria-hidden />
        <div className={`absolute inset-x-0 bottom-0 h-1.5 ${acento} sm:hidden`} aria-hidden />
      </div>
      <div className="flex flex-col justify-center gap-4 px-6 py-8 sm:pl-2 sm:pr-8 lg:pr-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo.src} alt={nombre} width={logo.ancho} height={logo.alto} loading="lazy"
          className={`${altoLogo} w-auto max-w-[90%] object-contain object-left`} />
        <p className="max-w-sm text-[17px] leading-snug text-grafito">{texto}</p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <a href={href} className="inline-flex items-center gap-2 font-titulo text-xl font-bold text-naranja transition-all hover:gap-3">
            Conocé más <Flecha className="h-5 w-5" />
          </a>
          <a href={web} target="_blank" rel="noopener" className="text-xs text-stone-500 hover:text-grafito">{web.replace("https://", "")} ↗</a>
        </div>
      </div>
    </article>
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
