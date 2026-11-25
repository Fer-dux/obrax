import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

const limpiar = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const NECESITA_VALIDOS = ["Hormigón", "Materiales", "Hormigón y materiales", "Otro"];

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Datos inválidos." }, { status: 400 });
  }

  // Anti-spam: campo trampa invisible y tiempo mínimo de llenado.
  if (limpiar(body.sitio_web, 200) !== "") return NextResponse.json({ ok: true });
  const abierto = Number(body.t);
  if (Number.isFinite(abierto) && Date.now() - abierto < 2500) return NextResponse.json({ ok: true });

  const c = {
    nombre: limpiar(body.nombre, 120),
    telefono: limpiar(body.telefono, 40),
    email: limpiar(body.email, 160).toLowerCase(),
    necesita: NECESITA_VALIDOS.includes(limpiar(body.necesita, 40)) ? limpiar(body.necesita, 40) : "Otro",
    obra: limpiar(body.obra, 200),
    mensaje: limpiar(body.mensaje, 2000),
  };
  if (c.nombre.length < 2) return NextResponse.json({ ok: false, error: "Completá tu nombre." }, { status: 400 });
  if (!c.telefono && !c.email) return NextResponse.json({ ok: false, error: "Dejanos un teléfono o un email." }, { status: 400 });
  if (c.email && !/^\S+@\S+\.\S+$/.test(c.email)) return NextResponse.json({ ok: false, error: "El email no es válido." }, { status: 400 });

  const [guardada, enviada] = await Promise.all([guardar(c), enviarMail(c)]);
  if (!guardada && !enviada) {
    return NextResponse.json({ ok: false, error: "No pudimos enviar tu consulta. Escribinos a contacto@obraxgroup.com.ar." }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}

type Consulta = { nombre: string; telefono: string; email: string; necesita: string; obra: string; mensaje: string };

/** Guarda en Supabase (la web solo puede insertar, nunca leer). */
async function guardar(c: Consulta) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return false;
  try {
    const r = await fetch(`${url}/rest/v1/consultas`, {
      method: "POST",
      headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({ ...c, origen: "web" }),
    });
    if (!r.ok) console.error("consulta: supabase", r.status, await r.text());
    return r.ok;
  } catch (e) {
    console.error("consulta: supabase", e);
    return false;
  }
}

/** Envía el aviso por mail con el SMTP de LatinCloud. */
async function enviarMail(c: Consulta) {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) return false;
  const para = process.env.CONSULTAS_PARA || "contacto@obraxgroup.com.ar";
  try {
    const transporte = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.correoseguro.co",
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      requireTLS: true,
      auth: { user, pass },
    });
    const filas: [string, string][] = [
      ["Nombre", c.nombre], ["Teléfono", c.telefono], ["Email", c.email],
      ["Necesita", c.necesita], ["Obra / ubicación", c.obra], ["Mensaje", c.mensaje],
    ];
    const esc = (s: string) => s.replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch]!);
    await transporte.sendMail({
      from: `"Web OBRAX" <${user}>`,
      to: para,
      replyTo: c.email || undefined,
      subject: `Nueva consulta web: ${c.nombre} · ${c.necesita}`,
      text: filas.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join("\n"),
      html:
        `<h2 style="font-family:Arial;color:#1F2A33">Nueva consulta desde obraxgroup.com.ar</h2>` +
        `<table style="font-family:Arial;font-size:14px;border-collapse:collapse">` +
        filas.filter(([, v]) => v).map(([k, v]) =>
          `<tr><td style="padding:6px 12px;color:#777;vertical-align:top">${k}</td><td style="padding:6px 12px;white-space:pre-line">${esc(v)}</td></tr>`).join("") +
        `</table>` +
        (c.telefono ? `<p style="font-family:Arial"><a href="https://wa.me/${whats(c.telefono)}" style="background:#25D366;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none">Responder por WhatsApp</a></p>` : ""),
    });
    return true;
  } catch (e) {
    console.error("consulta: smtp", e);
    return false;
  }
}

function whats(tel: string) {
  let d = tel.replace(/\D/g, "").replace(/^00/, "");
  if (d.startsWith("549")) return d;
  if (d.startsWith("54")) return "549" + d.slice(2);
  d = d.replace(/^0/, "");
  if (d.length === 12) {
    const m = d.match(/^(\d{2,4})15(\d+)$/);
    if (m && m[1].length + m[2].length === 10) d = m[1] + m[2];
  }
  return "549" + d;
}
