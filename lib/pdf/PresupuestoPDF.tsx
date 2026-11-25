import { Document, Image, Page, Path, StyleSheet, Svg, Text, View } from "@react-pdf/renderer";
import { discriminaIva, fechaAR, importe, numeroPresupuesto, pesos, totales, venceEl } from "@/lib/calculos";
import { NOMBRE_CONDICION, NOMBRE_UNIDAD, type CondicionFiscal, type Item, type Presupuesto, type UnidadNegocio } from "@/lib/tipos";

export type DatosPDF = {
  presupuesto: Presupuesto;
  cliente: { nombre: string; cuit: string; condicion_fiscal: CondicionFiscal; telefono: string } | null;
  obra: { nombre: string; direccion: string; localidad: string } | null;
  vendedor: { nombre: string; telefono: string } | null;
  items: Item[];
};

const NARANJA = "#EE7623";
const GRAFITO = "#1F2A33";
const GRIS = "#78716c";

const RESPALDO: Record<UnidadNegocio, { nombre: string; logo: string; ratio: number }> = {
  hormigon: { nombre: "Hormaco", logo: "/logos/hormaco.png", ratio: 429 / 89 },
  materiales: { nombre: "Palermo Materiales", logo: "/logos/palermo-materiales.png", ratio: 199 / 61 },
};

const s = StyleSheet.create({
  pagina: { fontFamily: "Helvetica", fontSize: 9.5, color: GRAFITO, paddingBottom: 60 },
  encabezado: { height: 86, paddingHorizontal: 32, paddingTop: 26, position: "relative" },
  subtitulo: { fontSize: 7, letterSpacing: 2.2, color: GRIS, marginTop: 4 },
  banda: { backgroundColor: GRAFITO, color: "white", paddingHorizontal: 32, paddingVertical: 7, flexDirection: "row", justifyContent: "space-between", fontSize: 8, letterSpacing: 1.6 },
  bloque: { paddingHorizontal: 32 },
  etiqueta: { fontSize: 7, letterSpacing: 1.2, color: GRIS, fontFamily: "Helvetica-Bold", marginBottom: 2 },
  negrita: { fontFamily: "Helvetica-Bold" },
  seccionTitulo: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", borderBottomWidth: 1.5, paddingBottom: 3, marginBottom: 4, marginTop: 14 },
  fila: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: "#e7e5e4", paddingVertical: 4 },
  cabecera: { flexDirection: "row", paddingVertical: 3, fontSize: 7, color: GRIS, fontFamily: "Helvetica-Bold", letterSpacing: 0.6 },
  cDesc: { flex: 1, paddingRight: 6 },
  cCant: { width: 42, textAlign: "right" },
  cUn: { width: 46, paddingLeft: 6, color: GRIS },
  cPrecio: { width: 78, textAlign: "right" },
  cImporte: { width: 84, textAlign: "right" },
  totales: { alignSelf: "flex-end", width: 220, marginTop: 14 },
  linea: { flexDirection: "row", justifyContent: "space-between", marginBottom: 3 },
  total: { flexDirection: "row", justifyContent: "space-between", backgroundColor: GRAFITO, color: "white", paddingHorizontal: 10, paddingVertical: 7, fontFamily: "Helvetica-Bold", fontSize: 11, marginTop: 4 },
  notas: { marginTop: 16, fontSize: 8, color: "#57534e", lineHeight: 1.4 },
  respaldo: { marginTop: 18, borderWidth: 0.75, borderColor: "#e7e5e4", borderRadius: 6, paddingVertical: 10, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", justifyContent: "center" },
  pie: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: GRAFITO, borderTopWidth: 3, borderTopColor: NARANJA, color: "#d6d3d1", paddingHorizontal: 32, paddingVertical: 10, flexDirection: "row", justifyContent: "space-between", fontSize: 7.5 },
});

function LogoObrax() {
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <Svg width={40} height={30} viewBox="0 8 56 40">
        <Path d="M14 8h22l-8 14h-8L8 48H0L14 8z" fill={GRAFITO} />
        <Path d="M38 8h12c4 0 6 3 5 6L46 40c-1 5-5 8-10 8H18l6-12h10l6-16h-8l6-12z" fill={NARANJA} />
      </Svg>
      <Text style={{ fontFamily: "Helvetica-BoldOblique", fontSize: 26, marginLeft: 6 }}>
        OBRA<Text style={{ color: NARANJA }}>X</Text>
      </Text>
    </View>
  );
}

export function PresupuestoPDF({ datos, origen }: { datos: DatosPDF; origen: string }) {
  const { presupuesto: p, cliente, obra, vendedor, items } = datos;
  const t = totales(items, p.descuento);
  const conIva = discriminaIva(cliente?.condicion_fiscal);
  const unidades = (["hormigon", "materiales"] as UnidadNegocio[]).filter((u) => items.some((i) => i.unidad_negocio === u));
  const url = (ruta: string) => `${origen}${ruta}`;

  return (
    <Document title={`Presupuesto ${numeroPresupuesto(p.numero)} · OBRAX`} author="OBRAX" creator="OBRAX">
      <Page size="A4" style={s.pagina}>
        {/* Encabezado con franjas de marca */}
        <View style={s.encabezado}>
          <Svg width={200} height={86} style={{ position: "absolute", right: 0, top: 0 }} viewBox="0 0 200 86">
            <Path d="M70 0 L200 0 L200 86 L48 86 Z" fill={GRAFITO} />
            <Path d="M52 0 L66 0 L44 86 L30 86 Z" fill={NARANJA} />
          </Svg>
          <LogoObrax />
          <Text style={s.subtitulo}>SOLUCIONES PARA LA CONSTRUCCIÓN</Text>
        </View>
        <View style={s.banda}>
          <Text>HORMIGÓN ELABORADO · MATERIALES</Text>
          <Text style={{ color: NARANJA, fontFamily: "Helvetica-Bold" }}>PRESUPUESTO {numeroPresupuesto(p.numero)}</Text>
        </View>

        {/* Cliente / fechas */}
        <View style={[s.bloque, { flexDirection: "row", justifyContent: "space-between", marginTop: 16 }]}>
          <View style={{ maxWidth: 300 }}>
            <Text style={s.etiqueta}>CLIENTE</Text>
            <Text style={s.negrita}>{cliente?.nombre ?? "—"}</Text>
            {cliente?.cuit ? <Text>CUIT/DNI: {cliente.cuit}</Text> : null}
            {cliente ? <Text>{NOMBRE_CONDICION[cliente.condicion_fiscal]}</Text> : null}
            {obra ? (
              <View style={{ marginTop: 8 }}>
                <Text style={s.etiqueta}>OBRA</Text>
                <Text style={s.negrita}>{obra.nombre}</Text>
                <Text>{[obra.direccion, obra.localidad].filter(Boolean).join(", ")}</Text>
              </View>
            ) : null}
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={s.etiqueta}>FECHA</Text>
            <Text>{fechaAR(p.fecha)}</Text>
            <Text style={[s.etiqueta, { marginTop: 8 }]}>VÁLIDO HASTA</Text>
            <Text style={s.negrita}>{fechaAR(venceEl(p.fecha, p.vigencia_dias))}</Text>
            {p.es_acopio ? <Text style={{ marginTop: 8, color: NARANJA, fontFamily: "Helvetica-Bold" }}>ACOPIO</Text> : null}
          </View>
        </View>

        {/* Ítems por unidad */}
        <View style={s.bloque}>
          {unidades.map((u) => (
            <View key={u} wrap={false}>
              <View style={[s.seccionTitulo, { borderBottomColor: u === "hormigon" ? GRAFITO : NARANJA }]}>
                <Text style={[s.negrita, { fontSize: 10, letterSpacing: 1.2 }]}>{NOMBRE_UNIDAD[u].toUpperCase()}</Text>
                <Image src={url(RESPALDO[u].logo)} style={{ height: 14, width: 14 * RESPALDO[u].ratio }} />
              </View>
              <View style={s.cabecera}>
                <Text style={s.cDesc}>DESCRIPCIÓN</Text><Text style={s.cCant}>CANT.</Text><Text style={s.cUn}>UN.</Text>
                <Text style={s.cPrecio}>PRECIO UNIT.</Text><Text style={s.cImporte}>IMPORTE</Text>
              </View>
              {items.filter((i) => i.unidad_negocio === u).map((i) => (
                <View key={i.id} style={s.fila}>
                  <Text style={s.cDesc}>{i.descripcion}</Text>
                  <Text style={s.cCant}>{Number(i.cantidad).toLocaleString("es-AR")}</Text>
                  <Text style={s.cUn}>{i.unidad}</Text>
                  <Text style={s.cPrecio}>{pesos(i.precio)}</Text>
                  <Text style={[s.cImporte, s.negrita]}>{pesos(importe(i))}</Text>
                </View>
              ))}
            </View>
          ))}

          {/* Totales */}
          <View style={s.totales} wrap={false}>
            {t.descuento > 0 ? (
              <>
                <View style={s.linea}><Text style={{ color: GRIS }}>Subtotal</Text><Text>{pesos(t.bruto)}</Text></View>
                <View style={s.linea}><Text style={{ color: GRIS }}>Descuento {p.descuento}%</Text><Text>- {pesos(t.descuento)}</Text></View>
              </>
            ) : null}
            {conIva ? (
              <>
                <View style={s.linea}><Text style={{ color: GRIS }}>Neto gravado</Text><Text>{pesos(t.neto)}</Text></View>
                <View style={s.linea}><Text style={{ color: GRIS }}>IVA</Text><Text>{pesos(t.iva)}</Text></View>
              </>
            ) : null}
            <View style={s.total}><Text>TOTAL</Text><Text>{pesos(t.total)}</Text></View>
            <Text style={{ fontSize: 7, color: GRIS, textAlign: "right", marginTop: 3 }}>Precios en pesos argentinos, IVA incluido.</Text>
          </View>

          {/* Notas */}
          <View style={s.notas}>
            {p.notas ? <Text>{p.notas}</Text> : null}
            {p.es_acopio ? (
              <Text style={{ marginTop: 3 }}>
                Acopio: precios congelados por el plazo acordado; vencido el mismo se actualizan por índice CAC. El hierro no se acopia y se cobra a precio de lista vigente.
              </Text>
            ) : null}
            <Text style={{ marginTop: 3 }}>Pedidos con 48/72 horas de anticipación. Precios sujetos a disponibilidad de stock.</Text>
          </View>

          {/* Respaldo */}
          <View style={s.respaldo} wrap={false}>
            <Text style={{ fontSize: 7, letterSpacing: 2, color: GRIS, fontFamily: "Helvetica-Bold", marginRight: 18 }}>CON EL RESPALDO DE</Text>
            {(["hormigon", "materiales"] as UnidadNegocio[]).map((u) => (
              <Image key={u} src={url(RESPALDO[u].logo)} style={{ height: 22, width: 22 * RESPALDO[u].ratio, marginHorizontal: 12 }} />
            ))}
          </View>
        </View>

        {/* Pie fijo en cada página */}
        <View style={s.pie} fixed>
          <Text>{vendedor?.nombre ? `Atendido por ${vendedor.nombre}${vendedor.telefono ? " · " + vendedor.telefono : ""}` : "OBRAX · obraxgroup.com.ar"}</Text>
          <Text style={{ letterSpacing: 1.8 }}>SOLIDEZ | CONFIANZA | RESPALDO</Text>
        </View>
      </Page>
    </Document>
  );
}
