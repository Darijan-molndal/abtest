-- =====================================================================
-- Driftskärm 2 – Arbetsordrar
-- PostgreSQL DDL (ren backend, inga leverantörsspecifika tillägg).
--
-- Kör i ordning. Skriptet är idempotent nog för en ren databas:
--   psql "$DATABASE_URL" -f db/001_schema.sql
--
-- Kärnidé: ett ÄRENDE bär hela livscykeln. Arbetsbegäran (AB) och
-- Driftorder (DO) är 1:1 med ärendet. DO skapas alltid från en
-- godkänd AB inom SAMMA ärende. Anläggning/objekt är fritext.
-- =====================================================================

BEGIN;

-- gen_random_uuid() finns i pgcrypto (standard i moderna Postgres-installationer).
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------

CREATE TYPE user_role AS ENUM (
  'bestallare',
  'driftledare',
  'kontrollrum',
  'admin'
);

CREATE TYPE arende_status AS ENUM (
  'utkast',
  'inskickad',
  'komplettering_ab',
  'godkand_ab',
  'do_skriven',
  'komplettering_do',
  'do_kontrollerad',
  'arbete_utfors',
  'arbete_slutfort',
  'nekad',
  'arkiverad'
);

CREATE TYPE risk_niva AS ENUM (
  'lag',
  'medel',
  'hog',
  'kritisk'
);

CREATE TYPE aktor_roll AS ENUM (
  'kopplingsledare',
  'kopplingsbitrade',
  'elsakerhetsledare',
  'delgiven_utforande',
  'delgiven_kannedom'
);

CREATE TYPE bilaga_agare AS ENUM (
  'arbetsbegaran',
  'driftorder'
);

CREATE TYPE notis_typ AS ENUM (
  'ab_inskickad',
  'ab_godkand',
  'ab_nekad',
  'komplettering_begard',
  'do_skriven',
  'do_godkand',
  'do_komplettering',
  'arbete_utfors',
  'arbete_slutfort',
  'tillagd_aktor'
);

-- ---------------------------------------------------------------------
-- Hjälpfunktion: håll updated_at aktuell
-- ---------------------------------------------------------------------

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------
-- Användare
-- ---------------------------------------------------------------------

CREATE TABLE users (
  id         uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  entra_id   varchar(64)  UNIQUE,
  namn       varchar(120) NOT NULL,
  epost      varchar(255) NOT NULL UNIQUE,
  roll       user_role,                          -- NULL = väntar på behörighet
  mail_only  boolean      NOT NULL DEFAULT false,
  aktiv      boolean      NOT NULL DEFAULT true,
  created_at timestamptz  NOT NULL DEFAULT now(),
  updated_at timestamptz  NOT NULL DEFAULT now()
);

COMMENT ON TABLE  users            IS 'Interna användare + roller. Roll cachas för snabb åtkomst vid varje API-anrop.';
COMMENT ON COLUMN users.entra_id   IS 'Objekt-id från Entra ID (null tills första login mappats).';
COMMENT ON COLUMN users.roll       IS 'NULL = väntar på behörighet (tilldelas av admin).';
COMMENT ON COLUMN users.mail_only  IS 'Får bara e-post, ej appkonto.';

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------
-- Ärende (bär hela livscykeln)
-- ---------------------------------------------------------------------

CREATE TABLE arenden (
  id           uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  arende_nr    varchar(20)   NOT NULL UNIQUE,       -- t.ex. "ARB-2026-001"
  status       arende_status NOT NULL DEFAULT 'utkast',
  created_at   timestamptz   NOT NULL DEFAULT now(),
  updated_at   timestamptz   NOT NULL DEFAULT now(),
  arkiverad_at timestamptz,
  deleted_at   timestamptz
);

COMMENT ON TABLE arenden IS 'Ett ärende = en AB (1:1) + eventuellt en DO (1:1). Status styr flödet.';

CREATE INDEX idx_arenden_status         ON arenden (status);
CREATE INDEX idx_arenden_status_created ON arenden (status, created_at);
-- Filtrera bort mjukt borttagna i vanliga listningar.
CREATE INDEX idx_arenden_live           ON arenden (status) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_arenden_updated_at
  BEFORE UPDATE ON arenden
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------
-- Arbetsbegäran (1:1 med ärende)
-- ---------------------------------------------------------------------

CREATE TABLE arbetsbegaran (
  id                   uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  arende_id            uuid         NOT NULL UNIQUE
                                    REFERENCES arenden (id) ON DELETE CASCADE,
  bestallare_id        uuid         NOT NULL REFERENCES users (id),

  utkast_namn          varchar(200),
  utkast_skapad_at     timestamptz,

  kontakt_namn         varchar(120) NOT NULL,      -- förifylls från session
  kontakt_email        varchar(255) NOT NULL,

  anlaggning           varchar(200) NOT NULL,      -- fritext, obligatorisk
  objekt               varchar(160),               -- fritext, valfri
  beskrivning          text         NOT NULL,
  onskat_startdatum    date         NOT NULL,
  varaktighet_timmar   numeric(6,1),
  risk_niva            risk_niva    NOT NULL,
  risk_beskrivning     text,

  riskanalys_bifogad   boolean      NOT NULL DEFAULT false,
  arbetsschema_godkant boolean      NOT NULL DEFAULT false,

  godkand_av           uuid         REFERENCES users (id),
  godkand_at           timestamptz,
  nekad_av             uuid         REFERENCES users (id),
  nekad_at             timestamptz,
  nekad_kommentar      text,

  created_at           timestamptz  NOT NULL DEFAULT now(),
  updated_at           timestamptz  NOT NULL DEFAULT now(),

  -- Godkänd XOR nekad – aldrig båda samtidigt.
  CONSTRAINT chk_ab_ej_godkand_och_nekad
    CHECK (NOT (godkand_at IS NOT NULL AND nekad_at IS NOT NULL))
);

COMMENT ON TABLE  arbetsbegaran              IS 'Arbetsbegäran-delen av ärendet.';
COMMENT ON COLUMN arbetsbegaran.kontakt_namn IS 'Förifylls från session, skrivskyddad i UI.';
COMMENT ON COLUMN arbetsbegaran.anlaggning   IS 'Fritext (obligatorisk) – ingen registerintegration.';
COMMENT ON COLUMN arbetsbegaran.objekt       IS 'Objekt/MFU-ref, fritext (valfri).';

CREATE INDEX idx_ab_bestallare ON arbetsbegaran (bestallare_id);

CREATE TRIGGER trg_ab_updated_at
  BEFORE UPDATE ON arbetsbegaran
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------
-- Driftorder (1:1 med ärende)
-- ---------------------------------------------------------------------

CREATE TABLE driftorder (
  id                      uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  arende_id               uuid         NOT NULL UNIQUE
                                       REFERENCES arenden (id) ON DELETE CASCADE,

  do_nummer               varchar(40),              -- manuellt, obligatoriskt före kontroll
  sammanfattning          text,
  skapad_av               uuid         NOT NULL REFERENCES users (id),   -- DL1
  planerat_startdatum     date,

  word_sharepoint_url     text,
  word_item_id            varchar(120),

  kontrollerad_av         uuid         REFERENCES users (id),            -- DL2
  kontrollerad_at         timestamptz,
  komplettering_kommentar text,

  utfors_av               uuid         REFERENCES users (id),
  utfors_at               timestamptz,
  slutford_av             uuid         REFERENCES users (id),
  slutford_at             timestamptz,

  ar_utkast               boolean      NOT NULL DEFAULT true,
  created_at              timestamptz  NOT NULL DEFAULT now(),
  updated_at              timestamptz  NOT NULL DEFAULT now(),

  -- Fyra ögon: den som kontrollerar får inte vara den som skrev DO:n.
  CONSTRAINT chk_do_kontroll_annan_person
    CHECK (kontrollerad_av IS NULL OR kontrollerad_av <> skapad_av),
  -- do_nummer måste finnas när DO är kontrollerad.
  CONSTRAINT chk_do_nummer_vid_kontroll
    CHECK (kontrollerad_at IS NULL OR do_nummer IS NOT NULL)
);

COMMENT ON TABLE  driftorder                 IS 'Driftorder-delen av ärendet. Skapas från godkänd AB.';
COMMENT ON COLUMN driftorder.do_nummer       IS 'Anges manuellt av DL1 (obligatoriskt före kontroll).';
COMMENT ON COLUMN driftorder.skapad_av       IS 'DL1 – författare av driftordern.';
COMMENT ON COLUMN driftorder.kontrollerad_av IS 'DL2 – får ej vara samma som skapad_av.';
COMMENT ON COLUMN driftorder.komplettering_kommentar IS 'Obligatorisk vid begäran om komplettering.';

CREATE INDEX idx_do_skapad_av ON driftorder (skapad_av);

CREATE TRIGGER trg_do_updated_at
  BEFORE UPDATE ON driftorder
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------
-- Aktörer på ett ärende
-- ---------------------------------------------------------------------

CREATE TABLE arende_aktorer (
  id         uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  arende_id  uuid         NOT NULL REFERENCES arenden (id) ON DELETE CASCADE,
  roll       aktor_roll   NOT NULL,
  user_id    uuid         REFERENCES users (id),   -- satt när aktören finns i users
  namn       varchar(120) NOT NULL,                -- fritext tills vidare
  epost      varchar(255),
  created_at timestamptz  NOT NULL DEFAULT now()
);

COMMENT ON TABLE arende_aktorer IS 'Kopplingsledare, kopplingsbiträde, elsäkerhetsledare, delgivna.';

CREATE INDEX idx_aktorer_arende_roll ON arende_aktorer (arende_id, roll);

-- ---------------------------------------------------------------------
-- Bilagor (hör till AB eller DO)
-- ---------------------------------------------------------------------

CREATE TABLE bilagor (
  id             uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  arende_id      uuid         NOT NULL REFERENCES arenden (id) ON DELETE CASCADE,
  agare          bilaga_agare NOT NULL,            -- AB eller DO
  namn           varchar(255) NOT NULL,
  fil_typ        varchar(40)  NOT NULL,            -- docx, pdf, ...
  storlek_bytes  bigint,
  sharepoint_url text         NOT NULL,
  version        int          NOT NULL DEFAULT 1,
  uppladdad_av   uuid         NOT NULL REFERENCES users (id),
  uppladdad_at   timestamptz  NOT NULL DEFAULT now()
);

COMMENT ON TABLE bilagor IS 'Bifogade filer. DO:ns Word-dokument lagras i SharePoint.';

CREATE INDEX idx_bilagor_arende_agare ON bilagor (arende_id, agare);

-- ---------------------------------------------------------------------
-- Audit-logg
-- ---------------------------------------------------------------------

CREATE TABLE audit_log (
  id          uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  arende_id   uuid          NOT NULL REFERENCES arenden (id) ON DELETE CASCADE,
  user_id     uuid          REFERENCES users (id),  -- NULL = systemhändelse
  handling    varchar(120)  NOT NULL,
  fran_status arende_status,
  till_status arende_status,
  kommentar   text,
  created_at  timestamptz   NOT NULL DEFAULT now()
);

COMMENT ON TABLE  audit_log         IS 'Fullständig historik. Visas i omvänd kronologisk ordning.';
COMMENT ON COLUMN audit_log.user_id IS 'NULL = systemhändelse.';

CREATE INDEX idx_audit_arende_created ON audit_log (arende_id, created_at DESC);

-- ---------------------------------------------------------------------
-- Notifieringar (en rad per mottagare + händelse)
-- ---------------------------------------------------------------------

CREATE TABLE notifieringar (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  arende_id        uuid        REFERENCES arenden (id) ON DELETE CASCADE,
  mottagare_id     uuid        NOT NULL REFERENCES users (id),
  typ              notis_typ   NOT NULL,
  meddelande       text        NOT NULL,

  last             boolean     NOT NULL DEFAULT false,   -- in-app läststatus
  last_at          timestamptz,

  epost_skickas    boolean     NOT NULL DEFAULT false,
  epost_skickad_at timestamptz,
  epost_fel        text,

  created_at       timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE  notifieringar               IS 'Driver både in-app-notiser (polling) och e-post.';
COMMENT ON COLUMN notifieringar.last          IS 'In-app läststatus.';
COMMENT ON COLUMN notifieringar.epost_skickas IS 'Ska e-post skickas till mottagaren.';
COMMENT ON COLUMN notifieringar.epost_fel     IS 'Felmeddelande vid misslyckad e-post.';

-- Snabb "olästa för mig"-räkning (endast olästa rader i indexet).
CREATE INDEX idx_notis_mottagare_olasta ON notifieringar (mottagare_id) WHERE last = false;
CREATE INDEX idx_notis_arende           ON notifieringar (arende_id);
-- E-postkö: rader som ska skickas men ännu inte är skickade.
CREATE INDEX idx_notis_epost_ko         ON notifieringar (created_at)
  WHERE epost_skickas = true AND epost_skickad_at IS NULL;

COMMIT;
