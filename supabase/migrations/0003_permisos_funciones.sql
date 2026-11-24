-- OBRAX · Restringe la ejecución de funciones SECURITY DEFINER (recomendación del linter de Supabase).
-- presupuesto_publico queda accesible a anon a propósito (link público del presupuesto).
revoke execute on function public.crear_perfil() from public, anon, authenticated;
revoke execute on function public.proteger_rol() from public, anon, authenticated;
revoke execute on function public.es_admin() from public, anon;
revoke execute on function public.actualizar_precios(public.unidad_negocio, numeric, text) from public, anon;
grant execute on function public.es_admin() to authenticated;
grant execute on function public.actualizar_precios(public.unidad_negocio, numeric, text) to authenticated;
