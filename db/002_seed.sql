-- =====================================================================
-- Driftskärm 2 – Arbetsordrar
-- Seed-data (PostgreSQL). Speglar nuvarande mockdata i lib/mock-data.ts.
--
-- Kör EFTER 001_schema.sql:
--   psql "$DATABASE_URL" -f db/002_seed.sql
--
-- Skriptet är idempotent: det tömmer tabellerna först (TRUNCATE ... CASCADE)
-- och laddar sedan om allt. Kör bara mot dev/test – inte mot prod.
--
-- Statusmappning (UI-prototypens status+phase  ->  arende_status):
--   submitted     + arbetsbegaran  ->  inskickad
--   needs_more_info + arbetsbegaran ->  komplettering_ab
--   planned       + driftorder     ->  do_skriven
--   ready         + driftorder     ->  arbete_utfors
--   needs_more_info + driftorder   ->  komplettering_do
-- =====================================================================

BEGIN;

TRUNCATE TABLE
  notifieringar,
  audit_log,
  bilagor,
  arende_aktorer,
  driftorder,
  arbetsbegaran,
  arenden,
  users
RESTART IDENTITY CASCADE;

-- ---------------------------------------------------------------------
-- Användare
-- ---------------------------------------------------------------------

INSERT INTO users (id, entra_id, namn, epost, roll, mail_only, aktiv) VALUES
  ('11111111-1111-1111-1111-111111111111', 'entra-anna',  'Anna Lindqvist',  'anna.lindqvist@moelndalenergi.se',  'bestallare',  false, true),
  ('22222222-2222-2222-2222-222222222222', 'entra-per',   'Per Nilsson',     'per.nilsson@moelndalenergi.se',     'bestallare',  false, true),
  ('33333333-3333-3333-3333-333333333333', 'entra-karin', 'Karin Bergstrom', 'karin.bergstrom@moelndalenergi.se', 'bestallare',  false, true),
  ('44444444-4444-4444-4444-444444444444', 'entra-erik',  'Erik Johansson',  'erik.johansson@moelndalenergi.se',  'driftledare', false, true),
  ('55555555-5555-5555-5555-555555555555', 'entra-maria', 'Maria Svensson',  'maria.svensson@moelndalenergi.se',  'driftledare', false, true),
  ('66666666-6666-6666-6666-666666666666', 'entra-kontroll', 'Kontrollrum Syd', 'kontrollrum@moelndalenergi.se',  'kontrollrum', false, true),
  ('77777777-7777-7777-7777-777777777777', 'entra-admin', 'System Admin',    'admin@moelndalenergi.se',           'admin',       false, true),
  -- Väntar på behörighet (roll = NULL).
  ('88888888-8888-8888-8888-888888888888', NULL,          'Ny Anvandare',    'ny.anvandare@moelndalenergi.se',    NULL,          false, true);

-- ---------------------------------------------------------------------
-- Ärenden
-- ---------------------------------------------------------------------

INSERT INTO arenden (id, arende_nr, status, created_at, updated_at) VALUES
  ('a0000001-0000-0000-0000-000000000000', 'ARB-1001', 'do_skriven',       '2026-02-10T08:30:00+01', '2026-02-14T14:22:00+01'),
  ('a0000003-0000-0000-0000-000000000000', 'ARB-1003', 'komplettering_ab', '2026-02-05T14:00:00+01', '2026-02-15T09:30:00+01'),
  ('a0000007-0000-0000-0000-000000000000', 'ARB-1007', 'inskickad',        '2026-02-17T08:00:00+01', '2026-02-17T08:00:00+01'),
  ('a0000008-0000-0000-0000-000000000000', 'ARB-1008', 'inskickad',        '2026-02-17T09:00:00+01', '2026-02-17T09:00:00+01'),
  ('a0000009-0000-0000-0000-000000000000', 'ARB-1009', 'inskickad',        '2026-02-17T10:00:00+01', '2026-02-17T10:00:00+01'),
  ('a0000010-0000-0000-0000-000000000000', 'ARB-1010', 'do_skriven',       '2026-02-18T08:00:00+01', '2026-02-18T08:00:00+01'),
  ('a0000011-0000-0000-0000-000000000000', 'ARB-1011', 'do_skriven',       '2026-02-18T09:00:00+01', '2026-02-18T09:00:00+01'),
  ('a0000012-0000-0000-0000-000000000000', 'ARB-1012', 'do_skriven',       '2026-02-18T10:00:00+01', '2026-02-18T10:00:00+01'),
  ('a0000013-0000-0000-0000-000000000000', 'ARB-1013', 'arbete_utfors',    '2026-02-15T08:00:00+01', '2026-02-19T08:00:00+01'),
  ('a0000014-0000-0000-0000-000000000000', 'ARB-1014', 'arbete_utfors',    '2026-02-14T09:00:00+01', '2026-02-19T09:00:00+01'),
  ('a0000015-0000-0000-0000-000000000000', 'ARB-1015', 'arbete_utfors',    '2026-02-13T10:00:00+01', '2026-02-18T10:00:00+01'),
  ('a0000006-0000-0000-0000-000000000000', 'ARB-1006', 'komplettering_do', '2026-02-16T06:00:00+01', '2026-02-16T06:00:00+01');

-- ---------------------------------------------------------------------
-- Arbetsbegäran (1:1 med ärende)
-- AB för DO-ärenden är godkänd (godkand_av/godkand_at satta).
-- ---------------------------------------------------------------------

INSERT INTO arbetsbegaran
  (arende_id, bestallare_id, kontakt_namn, kontakt_email, anlaggning, objekt,
   beskrivning, onskat_startdatum, varaktighet_timmar, risk_niva, risk_beskrivning,
   riskanalys_bifogad, arbetsschema_godkant, godkand_av, godkand_at,
   nekad_av, nekad_at, nekad_kommentar, created_at)
VALUES
  -- ARB-1001 (DO skriven -> AB godkänd)
  ('a0000001-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   'Anna Lindqvist', 'anna.lindqvist@moelndalenergi.se', 'Anlaggning C - Kylsystem', 'V-4021',
   'Ventil V-4021 visar tecken pa lackage och behover bytas. Arbetet kraver dranering av delkrets och installning av temporar bypass.',
   '2026-02-20', 8.0, 'medel', 'Kylkapacitet reducerad under arbetet. Backup-krets tillganglig.',
   true, true, '44444444-4444-4444-4444-444444444444', '2026-02-13T10:00:00+01',
   NULL, NULL, NULL, '2026-02-10T08:30:00+01'),

  -- ARB-1003 (komplettering AB)
  ('a0000003-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222',
   'Per Nilsson', 'per.nilsson@moelndalenergi.se', 'Anlaggning A - Reaktor 1', 'R1-SC-04',
   'Byte av PLC-modul i styrskap R1-SC-04. Kraver nedstangning av delsystem och noggrant igangkorningsforfarande.',
   '2026-03-05', 16.0, 'hog', 'Reaktordelsystem ur drift under arbetet. Kravs samordning med driftcentral.',
   true, false, NULL, NULL, NULL, NULL, NULL, '2026-02-05T14:00:00+01'),

  -- ARB-1007 (inskickad)
  ('a0000007-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   'Anna Lindqvist', 'anna.lindqvist@moelndalenergi.se', 'Anlaggning A - Reaktor 1', 'AO-001',
   'Arbetsbegaran 1 beskrivning.', '2026-02-20', 4.0, 'lag', 'Ingen driftpaverkan.',
   false, false, NULL, NULL, NULL, NULL, NULL, '2026-02-17T08:00:00+01'),

  -- ARB-1008 (inskickad)
  ('a0000008-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333',
   'Karin Bergstrom', 'karin.bergstrom@moelndalenergi.se', 'Anlaggning B - Turbin 2', 'AO-002',
   'Arbetsbegaran 2 beskrivning.', '2026-02-21', 3.0, 'lag', 'Ingen driftpaverkan.',
   false, false, NULL, NULL, NULL, NULL, NULL, '2026-02-17T09:00:00+01'),

  -- ARB-1009 (inskickad)
  ('a0000009-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222',
   'Per Nilsson', 'per.nilsson@moelndalenergi.se', 'Anlaggning C - Kylsystem', 'AO-003',
   'Arbetsbegaran 3 beskrivning.', '2026-02-22', 2.0, 'lag', 'Ingen driftpaverkan.',
   false, false, NULL, NULL, NULL, NULL, NULL, '2026-02-17T10:00:00+01'),

  -- ARB-1010 (DO skriven -> AB godkänd)
  ('a0000010-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   'Anna Lindqvist', 'anna.lindqvist@moelndalenergi.se', 'Anlaggning A - Reaktor 1', 'SD-001',
   'Skriven driftorder 1 beskrivning.', '2026-02-23', 5.0, 'lag', 'Ingen driftpaverkan.',
   true, true, '44444444-4444-4444-4444-444444444444', '2026-02-18T07:30:00+01',
   NULL, NULL, NULL, '2026-02-18T08:00:00+01'),

  -- ARB-1011 (DO skriven -> AB godkänd)
  ('a0000011-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333',
   'Karin Bergstrom', 'karin.bergstrom@moelndalenergi.se', 'Anlaggning B - Turbin 2', 'SD-002',
   'Skriven driftorder 2 beskrivning.', '2026-02-24', 4.0, 'lag', 'Ingen driftpaverkan.',
   true, true, '55555555-5555-5555-5555-555555555555', '2026-02-18T08:30:00+01',
   NULL, NULL, NULL, '2026-02-18T09:00:00+01'),

  -- ARB-1012 (DO skriven -> AB godkänd)
  ('a0000012-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222',
   'Per Nilsson', 'per.nilsson@moelndalenergi.se', 'Anlaggning C - Kylsystem', 'SD-003',
   'Skriven driftorder 3 beskrivning.', '2026-02-25', 3.0, 'lag', 'Ingen driftpaverkan.',
   true, true, '44444444-4444-4444-4444-444444444444', '2026-02-18T09:30:00+01',
   NULL, NULL, NULL, '2026-02-18T10:00:00+01'),

  -- ARB-1013 (arbete utförs -> AB godkänd)
  ('a0000013-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111',
   'Anna Lindqvist', 'anna.lindqvist@moelndalenergi.se', 'Anlaggning D - Elforsorjning', 'DU-001',
   'Driftorder under utforande 1 beskrivning.', '2026-02-19', 6.0, 'medel', 'Arbete pagar.',
   true, true, '44444444-4444-4444-4444-444444444444', '2026-02-16T10:00:00+01',
   NULL, NULL, NULL, '2026-02-15T08:00:00+01'),

  -- ARB-1014 (arbete utförs -> AB godkänd)
  ('a0000014-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333',
   'Karin Bergstrom', 'karin.bergstrom@moelndalenergi.se', 'Anlaggning A - Reaktor 1', 'DU-002',
   'Driftorder under utforande 2 beskrivning.', '2026-02-19', 8.0, 'medel', 'Arbete pagar.',
   true, true, '55555555-5555-5555-5555-555555555555', '2026-02-16T11:00:00+01',
   NULL, NULL, NULL, '2026-02-14T09:00:00+01'),

  -- ARB-1015 (arbete utförs -> AB godkänd)
  ('a0000015-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222',
   'Per Nilsson', 'per.nilsson@moelndalenergi.se', 'Anlaggning B - Turbin 2', 'DU-003',
   'Driftorder under utforande 3 beskrivning.', '2026-02-18', 4.0, 'lag', 'Arbete pagar.',
   true, true, '44444444-4444-4444-4444-444444444444', '2026-02-15T10:00:00+01',
   NULL, NULL, NULL, '2026-02-13T10:00:00+01'),

  -- ARB-1006 (komplettering DO -> AB godkänd)
  ('a0000006-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333',
   'Karin Bergstrom', 'karin.bergstrom@moelndalenergi.se', 'Anlaggning B - Turbin 2', 'VS-3',
   'Planerat filterbyte i ventilationssystem VS-3. Standardunderhall.',
   '2026-02-28', 3.0, 'lag', 'Ventilationskapacitet temporart reducerad.',
   true, true, '55555555-5555-5555-5555-555555555555', '2026-02-16T05:30:00+01',
   NULL, NULL, NULL, '2026-02-16T06:00:00+01');

-- ---------------------------------------------------------------------
-- Driftorder (endast för ärenden i DO-fas)
-- skapad_av = DL1, kontrollerad_av = DL2 (fyra ögon).
-- ---------------------------------------------------------------------

INSERT INTO driftorder
  (arende_id, do_nummer, sammanfattning, skapad_av, planerat_startdatum,
   word_sharepoint_url, word_item_id,
   kontrollerad_av, kontrollerad_at, komplettering_kommentar,
   utfors_av, utfors_at, slutford_av, slutford_at, ar_utkast, created_at)
VALUES
  -- ARB-1001: do_skriven (ej kontrollerad ännu)
  ('a0000001-0000-0000-0000-000000000000', NULL,
   'Driftorder for byte av ventil V-4021.', '44444444-4444-4444-4444-444444444444', '2026-02-20',
   'https://sharepoint.example/sites/driftorder/ARB-1001.docx', 'sp-item-1001',
   NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '2026-02-14T14:22:00+01'),

  -- ARB-1010: do_skriven
  ('a0000010-0000-0000-0000-000000000000', NULL,
   'Skriven driftorder 1.', '44444444-4444-4444-4444-444444444444', '2026-02-23',
   'https://sharepoint.example/sites/driftorder/ARB-1010.docx', 'sp-item-1010',
   NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '2026-02-18T08:00:00+01'),

  -- ARB-1011: do_skriven
  ('a0000011-0000-0000-0000-000000000000', NULL,
   'Skriven driftorder 2.', '55555555-5555-5555-5555-555555555555', '2026-02-24',
   'https://sharepoint.example/sites/driftorder/ARB-1011.docx', 'sp-item-1011',
   NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '2026-02-18T09:00:00+01'),

  -- ARB-1012: do_skriven
  ('a0000012-0000-0000-0000-000000000000', NULL,
   'Skriven driftorder 3.', '44444444-4444-4444-4444-444444444444', '2026-02-25',
   'https://sharepoint.example/sites/driftorder/ARB-1012.docx', 'sp-item-1012',
   NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, '2026-02-18T10:00:00+01'),

  -- ARB-1013: arbete_utfors (kontrollerad + startad). DL1 Erik, DL2 Maria.
  ('a0000013-0000-0000-0000-000000000000', 'DO-2026-013',
   'Driftorder under utforande 1.', '44444444-4444-4444-4444-444444444444', '2026-02-19',
   'https://sharepoint.example/sites/driftorder/ARB-1013.docx', 'sp-item-1013',
   '55555555-5555-5555-5555-555555555555', '2026-02-18T15:00:00+01', NULL,
   '44444444-4444-4444-4444-444444444444', '2026-02-19T08:00:00+01', NULL, NULL, false, '2026-02-17T12:00:00+01'),

  -- ARB-1014: arbete_utfors. DL1 Maria, DL2 Erik.
  ('a0000014-0000-0000-0000-000000000000', 'DO-2026-014',
   'Driftorder under utforande 2.', '55555555-5555-5555-5555-555555555555', '2026-02-19',
   'https://sharepoint.example/sites/driftorder/ARB-1014.docx', 'sp-item-1014',
   '44444444-4444-4444-4444-444444444444', '2026-02-18T16:00:00+01', NULL,
   '55555555-5555-5555-5555-555555555555', '2026-02-19T09:00:00+01', NULL, NULL, false, '2026-02-17T13:00:00+01'),

  -- ARB-1015: arbete_utfors. DL1 Erik, DL2 Maria.
  ('a0000015-0000-0000-0000-000000000000', 'DO-2026-015',
   'Driftorder under utforande 3.', '44444444-4444-4444-4444-444444444444', '2026-02-18',
   'https://sharepoint.example/sites/driftorder/ARB-1015.docx', 'sp-item-1015',
   '55555555-5555-5555-5555-555555555555', '2026-02-17T15:00:00+01', NULL,
   '44444444-4444-4444-4444-444444444444', '2026-02-18T10:00:00+01', NULL, NULL, false, '2026-02-16T12:00:00+01'),

  -- ARB-1006: komplettering_do (utkast, komplettering begärd, ej kontrollerad -> do_nummer får vara NULL)
  ('a0000006-0000-0000-0000-000000000000', NULL,
   'Filterbyte ventilationssystem VS-3.', '55555555-5555-5555-5555-555555555555', '2026-02-28',
   'https://sharepoint.example/sites/driftorder/ARB-1006.docx', 'sp-item-1006',
   NULL, NULL, 'Komplettera med uppdaterad riskanalys och bekrafta reservdelar innan kontroll.',
   NULL, NULL, NULL, NULL, true, '2026-02-16T06:00:00+01');

-- ---------------------------------------------------------------------
-- Aktörer (exempel på ett par ärenden)
-- ---------------------------------------------------------------------

INSERT INTO arende_aktorer (arende_id, roll, user_id, namn, epost) VALUES
  ('a0000013-0000-0000-0000-000000000000', 'kopplingsledare',    '44444444-4444-4444-4444-444444444444', 'Erik Johansson',  'erik.johansson@moelndalenergi.se'),
  ('a0000013-0000-0000-0000-000000000000', 'elsakerhetsledare',  '55555555-5555-5555-5555-555555555555', 'Maria Svensson',  'maria.svensson@moelndalenergi.se'),
  ('a0000013-0000-0000-0000-000000000000', 'delgiven_kannedom',  NULL,                                   'Extern Entreprenor', 'entreprenor@example.se'),
  ('a0000014-0000-0000-0000-000000000000', 'kopplingsledare',    '55555555-5555-5555-5555-555555555555', 'Maria Svensson',  'maria.svensson@moelndalenergi.se'),
  ('a0000014-0000-0000-0000-000000000000', 'kopplingsbitrade',   '44444444-4444-4444-4444-444444444444', 'Erik Johansson',  'erik.johansson@moelndalenergi.se');

-- ---------------------------------------------------------------------
-- Bilagor
-- ---------------------------------------------------------------------

INSERT INTO bilagor (arende_id, agare, namn, fil_typ, storlek_bytes, sharepoint_url, version, uppladdad_av, uppladdad_at) VALUES
  ('a0000001-0000-0000-0000-000000000000', 'arbetsbegaran', 'Riskanalys_V4021.pdf',  'pdf', 2516582, 'https://sharepoint.example/bilagor/Riskanalys_V4021.pdf',  1, '11111111-1111-1111-1111-111111111111', '2026-02-10T08:35:00+01'),
  ('a0000001-0000-0000-0000-000000000000', 'arbetsbegaran', 'Ritning_Kylkrets2.dwg', 'dwg', 16567500, 'https://sharepoint.example/bilagor/Ritning_Kylkrets2.dwg', 1, '11111111-1111-1111-1111-111111111111', '2026-02-10T08:40:00+01'),
  ('a0000001-0000-0000-0000-000000000000', 'driftorder',    'Driftorder_ARB-1001.docx', 'docx', 45056, 'https://sharepoint.example/sites/driftorder/ARB-1001.docx', 1, '44444444-4444-4444-4444-444444444444', '2026-02-14T14:22:00+01'),
  ('a0000003-0000-0000-0000-000000000000', 'arbetsbegaran', 'Riskanalys_R1SC04.pdf', 'pdf', 3355443, 'https://sharepoint.example/bilagor/Riskanalys_R1SC04.pdf', 1, '22222222-2222-2222-2222-222222222222', '2026-02-05T14:15:00+01'),
  ('a0000003-0000-0000-0000-000000000000', 'arbetsbegaran', 'PLC_Specifikation.pdf', 'pdf', 5872025, 'https://sharepoint.example/bilagor/PLC_Specifikation.pdf', 1, '22222222-2222-2222-2222-222222222222', '2026-02-05T14:20:00+01'),
  ('a0000013-0000-0000-0000-000000000000', 'driftorder',    'Driftorder_ARB-1013.docx', 'docx', 51200, 'https://sharepoint.example/sites/driftorder/ARB-1013.docx', 1, '44444444-4444-4444-4444-444444444444', '2026-02-17T12:00:00+01');

-- ---------------------------------------------------------------------
-- Audit-logg (representativa händelser med status-övergångar)
-- ---------------------------------------------------------------------

INSERT INTO audit_log (arende_id, user_id, handling, fran_status, till_status, kommentar, created_at) VALUES
  -- ARB-1001
  ('a0000001-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'Skapade arbetsbegaran',   NULL,               'utkast',     NULL, '2026-02-10T08:30:00+01'),
  ('a0000001-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'Skickade in',             'utkast',           'inskickad',  NULL, '2026-02-10T09:00:00+01'),
  ('a0000001-0000-0000-0000-000000000000', '44444444-4444-4444-4444-444444444444', 'Godkande arbetsbegaran',  'inskickad',        'godkand_ab', NULL, '2026-02-13T10:00:00+01'),
  ('a0000001-0000-0000-0000-000000000000', '44444444-4444-4444-4444-444444444444', 'Skrev driftorder',        'godkand_ab',       'do_skriven', NULL, '2026-02-14T14:22:00+01'),

  -- ARB-1003 (komplettering AB)
  ('a0000003-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222', 'Skapade arbetsbegaran',   NULL,               'utkast',           NULL, '2026-02-05T14:00:00+01'),
  ('a0000003-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222', 'Skickade in',             'utkast',           'inskickad',        NULL, '2026-02-05T15:00:00+01'),
  ('a0000003-0000-0000-0000-000000000000', '55555555-5555-5555-5555-555555555555', 'Begarde komplettering',   'inskickad',        'komplettering_ab', 'Vg bifoga uppdaterat arbetsschema for PLC-byte samt bekrafta leveransdatum for PLC-modul.', '2026-02-15T09:30:00+01'),

  -- ARB-1013 (arbete utförs)
  ('a0000013-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'Skapade arbetsbegaran',   NULL,               'utkast',           NULL, '2026-02-15T08:00:00+01'),
  ('a0000013-0000-0000-0000-000000000000', '44444444-4444-4444-4444-444444444444', 'Godkande arbetsbegaran',  'inskickad',        'godkand_ab',       NULL, '2026-02-16T10:00:00+01'),
  ('a0000013-0000-0000-0000-000000000000', '44444444-4444-4444-4444-444444444444', 'Skrev driftorder',        'godkand_ab',       'do_skriven',       NULL, '2026-02-17T12:00:00+01'),
  ('a0000013-0000-0000-0000-000000000000', '55555555-5555-5555-5555-555555555555', 'Kontrollerade driftorder','do_skriven',       'do_kontrollerad',  NULL, '2026-02-18T15:00:00+01'),
  ('a0000013-0000-0000-0000-000000000000', '44444444-4444-4444-4444-444444444444', 'Startade arbetet',        'do_kontrollerad',  'arbete_utfors',    NULL, '2026-02-19T08:00:00+01'),

  -- ARB-1006 (komplettering DO)
  ('a0000006-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333', 'Skapade arbetsbegaran',   NULL,               'utkast',           NULL, '2026-02-16T06:00:00+01'),
  ('a0000006-0000-0000-0000-000000000000', '44444444-4444-4444-4444-444444444444', 'Begarde komplettering DO','do_skriven',       'komplettering_do', 'Komplettera med uppdaterad riskanalys och bekrafta reservdelar innan kontroll.', '2026-02-16T06:00:00+01');

-- ---------------------------------------------------------------------
-- Notifieringar
-- ---------------------------------------------------------------------

INSERT INTO notifieringar (arende_id, mottagare_id, typ, meddelande, last, last_at, epost_skickas, epost_skickad_at) VALUES
  -- Komplettering AB -> beställare Per (oläst, e-post skickad)
  ('a0000003-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222', 'komplettering_begard',
   'Komplettering begard for ARB-1003. Se kommentar fran driftledare.', false, NULL, true, '2026-02-15T09:31:00+01'),

  -- Komplettering DO -> DL1 Maria (skrev DO:n) (oläst)
  ('a0000006-0000-0000-0000-000000000000', '55555555-5555-5555-5555-555555555555', 'do_komplettering',
   'Komplettering begard for driftorder ARB-1006.', false, NULL, true, '2026-02-16T06:01:00+01'),

  -- AB godkänd -> beställare Anna (läst)
  ('a0000001-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'ab_godkand',
   'Din arbetsbegaran ARB-1001 har godkants.', true, '2026-02-13T12:00:00+01', true, '2026-02-13T10:01:00+01'),

  -- Ny inskickad AB -> driftledare Erik (oläst, e-post i kö)
  ('a0000007-0000-0000-0000-000000000000', '44444444-4444-4444-4444-444444444444', 'ab_inskickad',
   'Ny arbetsbegaran ARB-1007 har skickats in for granskning.', false, NULL, true, NULL),

  -- Tillagd som aktör -> Maria (oläst)
  ('a0000013-0000-0000-0000-000000000000', '55555555-5555-5555-5555-555555555555', 'tillagd_aktor',
   'Du har lagts till som elsakerhetsledare pa ARB-1013.', false, NULL, false, NULL);

COMMIT;
