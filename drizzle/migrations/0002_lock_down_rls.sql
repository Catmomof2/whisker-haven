DROP POLICY IF EXISTS "open demo access" ON public.cats;
DROP POLICY IF EXISTS "open demo access" ON public.vet_logs;
DROP POLICY IF EXISTS "open demo access" ON public.tasks;
DROP POLICY IF EXISTS "open demo access" ON public.applications;
DROP POLICY IF EXISTS "open demo access" ON public.settings;
REVOKE ALL ON public.cats, public.vet_logs, public.tasks, public.applications, public.settings FROM anon, authenticated;
DROP POLICY IF EXISTS "cat photos read" ON storage.objects;
DROP POLICY IF EXISTS "cat photos upload" ON storage.objects;