CREATE TABLE public.cats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  photo_url text,
  microchip_id text,
  color text,
  breed text,
  tags text[] NOT NULL DEFAULT '{}',
  age_years numeric,
  sex text,
  temperament text,
  health_notes text,
  intake_location text,
  intake_date date NOT NULL DEFAULT current_date,
  priority boolean NOT NULL DEFAULT false,
  stage text NOT NULL DEFAULT 'intake',
  spay_neuter boolean NOT NULL DEFAULT false,
  vaccinations text,
  medications text,
  diet text,
  bio text,
  caption text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.vet_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cat_id uuid NOT NULL REFERENCES public.cats(id) ON DELETE CASCADE,
  visit_date date NOT NULL DEFAULT current_date,
  note text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL DEFAULT 'feeding',
  time_slot text,
  done boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cat_id uuid REFERENCES public.cats(id) ON DELETE SET NULL,
  applicant_name text NOT NULL,
  email text NOT NULL,
  phone text,
  home_type text,
  other_pets text,
  message text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.settings (
  id int PRIMARY KEY DEFAULT 1,
  capacity int NOT NULL DEFAULT 40,
  staff_email text
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cats, public.vet_logs, public.tasks, public.applications, public.settings TO anon, authenticated;
GRANT ALL ON public.cats, public.vet_logs, public.tasks, public.applications, public.settings TO service_role;
ALTER TABLE public.cats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vet_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "open demo access" ON public.cats FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "open demo access" ON public.vet_logs FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "open demo access" ON public.tasks FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "open demo access" ON public.applications FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "open demo access" ON public.settings FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

INSERT INTO public.settings (id, capacity) VALUES (1, 40);
INSERT INTO public.cats (name, color, breed, tags, age_years, sex, temperament, health_notes, intake_location, priority, stage, spay_neuter, vaccinations, medications, diet, microchip_id) VALUES
('Marmalade','Orange tabby','Domestic Shorthair','{lap cat,calm}',6,'Male','Gentle, loves sunbeams','Healthy, mild dental tartar','Oak St colony',false,'available',true,'FVRCP 2026-08, Rabies 2026-08','None','Adult dry, 2x daily','985112004455678'),
('Juniper','Tortoiseshell','Domestic Medium Hair','{shy,independent}',9,'Female','Reserved at first, then affectionate','Hyperthyroid, managed','Owner surrender',false,'medical',true,'FVRCP 2026-09','Methimazole 2.5mg AM/PM','Senior wet food','985112004455111'),
('Ziggy','Black','Domestic Shorthair','{playful,vocal}',3,'Male','High energy, chatty','Upper respiratory infection','Highway 9 rescue',true,'intake',false,'Pending','Doxycycline 1x daily','Kitten-adult transition','—'),
('Pearl','White','Turkish Angora mix','{deaf,sweet}',7,'Female','Very affectionate, deaf','Deaf, otherwise healthy','Animal control transfer',false,'foster',true,'FVRCP 2026-07, Rabies 2026-07','None','Sensitive stomach formula','985112004455222'),
('Biscuit','Cream point','Siamese mix','{talkative,friendly}',5,'Male','Social and curious','Healthy','Maple Ave stray',false,'adopted',true,'Up to date','None','Adult dry','985112004455333'),
('Olive','Gray tabby','Domestic Shorthair','{calm,good with cats}',4,'Female','Easygoing','Healthy','Owner surrender',false,'available',true,'Up to date','None','Adult dry + wet','985112004455444');
INSERT INTO public.tasks (title, category, time_slot) VALUES
('Morning feeding – Room A','feeding','7:00 AM'),
('Morning feeding – Room B','feeding','7:30 AM'),
('Juniper: Methimazole AM','medication','8:00 AM'),
('Ziggy: Doxycycline','medication','9:00 AM'),
('Clean litter boxes – Room A','cleaning','10:00 AM'),
('Sanitize intake kennels','cleaning','11:00 AM'),
('Evening feeding – all rooms','feeding','5:00 PM'),
('Juniper: Methimazole PM','medication','8:00 PM');
INSERT INTO public.applications (cat_id, applicant_name, email, phone, home_type, other_pets, message)
SELECT id, 'Dana Whitfield','dana@example.com','555-0142','House with yard','One senior cat','Marmalade looks like the perfect lap buddy!' FROM public.cats WHERE name='Marmalade';