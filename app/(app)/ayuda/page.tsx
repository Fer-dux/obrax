import Link from "next/link";
import { crearClienteServidor } from "@/lib/supabase/server";

export const metadata = { title: "Ayuda · OBRAX" };

type Tema = { id: string; titulo: string; icono: string; soloAdmin?: boolean; pasos: React.ReactNode[]; tip?: React.ReactNode };

const TEMAS: Tema[] = [
  {
    id: "presupuesto",
    titulo: "Hacer un presupuesto",
    icono: "₱",
    pasos: [
      <>Tocá <b>+ Presupuesto</b> (arriba a la derecha).</>,
      <>Elegí el <b>cliente</b> de la lista, o tocá <b>+</b> para crearlo en el momento. Si tiene obras cargadas, elegí la <b>obra</b>.</>,
      <>En <b>Hormigón</b>, tocá el tipo (<b>H8 a H30</b>) y escribí los m³. Con <b>📐 Calcular m³</b> cargás largo, ancho y espesor y la app calcula el volumen con 5% de desperdicio.</>,
      <>Sumá bomba, aditivos, flete o recargos escribiendo en el buscador de la sección.</>,
      <>En <b>Materiales</b>, buscá por nombre (cemento, arena, ladrillo…) y tocá el producto para agregarlo. Ajustá la cantidad.</>,
      <>Revisá el <b>total</b> a la derecha (o abajo en el celular) y tocá <b>Guardar</b>.</>,
    ],
    tip: <>Si el pedido es menor a 6 m³, la app te avisa y te ofrece agregar el <b>faltante de carga</b> con un toque.</>,
  },
  {
    id: "enviar",
    titulo: "Enviar el presupuesto por WhatsApp (PDF)",
    icono: "💬",
    pasos: [
      <>El cliente tiene que tener el <b>teléfono cargado</b> en su ficha.</>,
      <>Dentro del presupuesto tocá el botón verde <b>WhatsApp</b>.</>,
      <><b>En el celular</b> se abre el menú de compartir con el <b>PDF adjunto</b>: elegí WhatsApp y el contacto. Si aparece el aviso verde “El PDF está listo”, tocá <b>Enviar PDF</b>.</>,
      <><b>En la computadora</b> se abre el chat del cliente con el mensaje y un link que abre <b>directamente el PDF</b>.</>,
      <>El presupuesto pasa solo a estado <b>Enviado</b>. Con <b>Ver / PDF</b> lo revisás antes y con <b>Descargar PDF</b> lo guardás.</>,
    ],
    tip: <>El cliente no necesita usuario: el PDF y el link son públicos (solo los puede abrir quien tenga el link).</>,
  },
  {
    id: "estados",
    titulo: "Seguimiento: estados del presupuesto",
    icono: "📊",
    pasos: [
      <><b>Borrador</b>: lo estás armando.</>,
      <><b>Enviado</b>: ya lo tiene el cliente (se marca solo al enviarlo por WhatsApp).</>,
      <><b>Aceptado</b>: el cliente confirmó. Suma en las ventas del <b>Panel</b>.</>,
      <><b>Perdido</b>: elegí el <b>motivo</b> (precio, plazo, competencia…). Sirve para entender por qué se pierden ventas.</>,
    ],
    tip: <>Cambiá el estado desde el desplegable <b>Estado</b> dentro de cada presupuesto y tocá <b>Guardar</b>.</>,
  },
  {
    id: "consultas",
    titulo: "Consultas de la web",
    icono: "✉",
    pasos: [
      <>Cuando alguien completa el formulario de <b>obraxgroup.com.ar</b>, aparece en <b>Consultas</b> (con un número naranja en el menú) y llega un mail a contacto@.</>,
      <>Además se carga solo en <b>Clientes</b> como <b>Prospecto</b> (o se vincula al cliente que ya existe con ese teléfono o email). Cuando le aceptan un presupuesto pasa a <b>Cliente</b>.</>,
      <>Tocá <b>WhatsApp</b> para escribirle (la consulta pasa a <b>En curso</b>) o <b>Tomar</b> para marcar que la atendés vos.</>,
      <>Con <b>Hacer presupuesto</b> la app crea el cliente (o usa el que ya existe con ese teléfono o email), la obra y un presupuesto con el pedido en las notas. Solo te queda cargar los productos.</>,
      <>Si no corresponde, tocá <b>Descartar</b>. Se puede <b>Reabrir</b> después.</>,
    ],
    tip: <>Las consultas pendientes también aparecen arriba del <b>Panel</b>.</>,
  },
  {
    id: "clientes",
    titulo: "Clientes y obras",
    icono: "☺",
    pasos: [
      <>En <b>Clientes</b> tocá <b>+ Cliente</b> y completá nombre, teléfono, email, CUIT y <b>condición fiscal</b>.</>,
      <>Si es <b>Responsable Inscripto</b>, el presupuesto muestra el IVA discriminado (Factura A). Si no, el total final (Factura B).</>,
      <>Agregá sus <b>obras</b> (dirección, localidad, contacto en obra). Con el botón <b>₱</b> de cada obra creás un presupuesto directo para esa obra.</>,
      <>En la ficha ves el <b>historial</b> de todos sus presupuestos.</>,
    ],
    tip: <>La cartera de clientes es una sola para hormigón y materiales: aprovechá para ofrecer lo que todavía no te compró.</>,
  },
  {
    id: "acopio",
    titulo: "Descuentos, vigencia y acopio",
    icono: "🧾",
    pasos: [
      <><b>Descuento %</b>: se aplica sobre el total del presupuesto.</>,
      <><b>Vigencia</b>: días de validez (por defecto 7). El PDF muestra la fecha de vencimiento.</>,
      <>Marcá <b>Acopio</b> si el cliente congela precios. La app te avisa qué productos no son acopiables (por ejemplo fletes o servicios).</>,
      <>En <b>Notas y condiciones</b> escribí forma de pago, plazos y condiciones de descarga: aparecen en el PDF.</>,
    ],
  },
  {
    id: "borrar",
    titulo: "Duplicar o borrar presupuestos",
    icono: "🗑",
    pasos: [
      <>Para borrar uno: tachito <b>🗑</b> en la lista de Presupuestos o arriba dentro del presupuesto.</>,
      <>Si hay presupuestos vacíos de prueba, usá <b>Borrar borradores vacíos</b> arriba de la lista.</>,
      <>Para repetir un pedido, abrí el presupuesto y tocá <b>Duplicar</b> (abajo a la derecha).</>,
    ],
  },
  {
    id: "precios",
    titulo: "Actualizar precios",
    icono: "$",
    soloAdmin: true,
    pasos: [
      <>En <b>Precios</b> elegí <b>Hormigón</b> o <b>Materiales</b>.</>,
      <>Editá el precio de un producto y tocá <b>Guardar</b> en su fila. Los precios van <b>con IVA incluido</b>.</>,
      <>Para un aumento general, escribí el % en <b>Actualización masiva</b> y tocá <b>Aplicar</b>.</>,
      <>Con <b>+ Producto</b> agregás productos nuevos.</>,
    ],
    tip: <>Los presupuestos ya hechos no cambian: el nuevo precio se usa en los próximos.</>,
  },
  {
    id: "usuarios",
    titulo: "Dar de alta a un vendedor",
    icono: "👥",
    soloAdmin: true,
    pasos: [
      <>En <b>Usuarios</b> tocá <b>+ Usuario</b>.</>,
      <>Cargá nombre, email, teléfono, <b>rol</b>, qué vende (hormigón, materiales o ambos) y su comisión.</>,
      <>La app sugiere una <b>contraseña inicial</b>: pasásela al vendedor junto con su email.</>,
      <>Si alguien deja la empresa, tocá <b>Desactivar</b>: no puede entrar más, pero sus clientes y presupuestos quedan.</>,
    ],
  },
  {
    id: "celular",
    titulo: "Instalar OBRAX en el celular",
    icono: "📱",
    pasos: [
      <><b>iPhone</b>: abrí <b>app.obraxgroup.com.ar</b> en <b>Safari</b> → botón <b>Compartir</b> ⬆️ → <b>Agregar a pantalla de inicio</b>.</>,
      <><b>Android</b>: abrila en <b>Chrome</b> → menú <b>⋮</b> → <b>Instalar app</b>.</>,
      <>Queda el ícono de OBRAX y se abre como una app, sin la barra del navegador.</>,
    ],
  },
  {
    id: "clave",
    titulo: "Olvidé mi contraseña",
    icono: "🔑",
    pasos: [
      <>En la pantalla de ingreso tocá <b>¿Olvidaste tu contraseña?</b>.</>,
      <>Escribí tu email y revisá el correo (también en spam).</>,
      <>Abrí el link <b>en el mismo navegador</b> y elegí una contraseña nueva.</>,
    ],
    tip: <>Si no te llega el mail, pedile al administrador que te asigne una contraseña nueva desde <b>Usuarios</b>.</>,
  },
];

export default async function Ayuda() {
  const supabase = await crearClienteServidor();
  const { data } = await supabase.auth.getUser();
  const { data: perfil } = await supabase.from("perfiles").select("rol").eq("id", data.user!.id).single();
  const esAdmin = perfil?.rol === "admin";
  const temas = TEMAS.filter((t) => esAdmin || !t.soloAdmin);

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="titulo">Ayuda</h1>
        <p className="text-sm text-stone-500">Guía rápida para usar OBRAX. Tocá un tema para ver los pasos.</p>
      </div>

      <nav className="flex flex-wrap gap-2">
        {temas.map((t) => (
          <a key={t.id} href={`#${t.id}`} className="rounded-full bg-white px-3 py-1 text-sm text-stone-600 shadow-sm hover:text-naranja">
            {t.icono} {t.titulo}
          </a>
        ))}
      </nav>

      <div className="space-y-3">
        {temas.map((t, i) => (
          <details key={t.id} id={t.id} open={i === 0} className="tarjeta group scroll-mt-20 p-0 sm:p-0">
            <summary className="flex cursor-pointer list-none items-center gap-3 p-4 sm:p-5 [&::-webkit-details-marker]:hidden">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-naranja-claro text-lg">{t.icono}</span>
              <span className="flex-1 font-semibold">{t.titulo}</span>
              {t.soloAdmin && <span className="rounded bg-naranja/15 px-1.5 text-xs text-naranja-oscuro">admin</span>}
              <span className="text-stone-400 transition group-open:rotate-180">⌄</span>
            </summary>
            <div className="border-t border-stone-100 px-4 pb-5 pt-4 sm:px-5">
              <ol className="space-y-3">
                {t.pasos.map((p, n) => (
                  <li key={n} className="flex gap-3 text-sm leading-relaxed">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-grafito text-xs font-bold text-white">{n + 1}</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ol>
              {t.tip && <p className="mt-4 rounded-md bg-stone-50 p-3 text-sm text-stone-600">💡 {t.tip}</p>}
            </div>
          </details>
        ))}
      </div>

      <div className="tarjeta text-sm text-stone-600">
        ¿Algo no funciona o tenés una duda que no está acá? Escribí a{" "}
        <a href="mailto:contacto@obraxgroup.com.ar" className="text-naranja hover:underline">contacto@obraxgroup.com.ar</a>.
        <div className="mt-3"><Link href="/" className="text-naranja hover:underline">← Volver al panel</Link></div>
      </div>
    </div>
  );
}
