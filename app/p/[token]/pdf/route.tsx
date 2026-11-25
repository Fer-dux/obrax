import { renderToBuffer } from "@react-pdf/renderer";
import { createClient } from "@supabase/supabase-js";
import { PresupuestoPDF, type DatosPDF } from "@/lib/pdf/PresupuestoPDF";
import { numeroPresupuesto } from "@/lib/calculos";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** PDF plano del presupuesto (público, por token). */
export async function GET(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(token)) return new Response("No encontrado", { status: 404 });

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false },
  });
  const { data, error } = await supabase.rpc("presupuesto_publico", { p_token: token });
  if (error || !data) return new Response("Presupuesto no encontrado", { status: 404 });

  const datos = data as DatosPDF;
  const origen = new URL(req.url).origin;
  const pdf = await renderToBuffer(<PresupuestoPDF datos={datos} origen={origen} />);
  const nombre = `Presupuesto-${numeroPresupuesto(datos.presupuesto.numero)}-OBRAX.pdf`;
  const descargar = new URL(req.url).searchParams.has("descargar");

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${descargar ? "attachment" : "inline"}; filename="${nombre}"`,
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
