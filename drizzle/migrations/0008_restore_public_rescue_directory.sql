CREATE OR REPLACE FUNCTION public.public_rescue_directory() RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT coalesce(jsonb_agg(
    jsonb_build_object(
      'id', s.id,
      'name', s.name,
      'slug', s.slug,
      'available_count', (SELECT count(*) FROM public.cats c WHERE c.shelter_id = s.id AND c.stage = 'available')
    ) ORDER BY s.name
  ), '[]'::jsonb)
  FROM public.shelters s
$$;
REVOKE ALL ON FUNCTION public.public_rescue_directory() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.public_rescue_directory() TO anon, authenticated, service_role;