-- =============================================================
-- AGStudio.tech — Schema Supabase
-- Execute no SQL Editor do Supabase Dashboard
-- =============================================================

-- ---------------------------------------------------------------
-- Tabela principal de leads
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS leads (
  id              UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome            TEXT        NOT NULL,
  whatsapp        TEXT        NOT NULL,
  email           TEXT        NOT NULL,
  segmento        TEXT,
  objetivo        TEXT,
  canal           TEXT,
  plano_interesse TEXT,
  status          TEXT        NOT NULL DEFAULT 'Novo'
                  CHECK (status IN ('Novo','Contatado','Proposta Enviada','Fechado','Perdido')),
  notas           TEXT,
  data_criacao    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  data_atualizacao TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS leads_data_criacao_idx  ON leads (data_criacao DESC);
CREATE INDEX IF NOT EXISTS leads_status_idx        ON leads (status);
CREATE INDEX IF NOT EXISTS leads_plano_idx         ON leads (plano_interesse);
CREATE INDEX IF NOT EXISTS leads_canal_idx         ON leads (canal);

-- ---------------------------------------------------------------
-- Histórico de anotações por lead
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS lead_notas (
  id          UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id     UUID        NOT NULL REFERENCES leads (id) ON DELETE CASCADE,
  conteudo    TEXT        NOT NULL,
  criado_em   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  criado_por  TEXT
);

CREATE INDEX IF NOT EXISTS lead_notas_lead_id_idx ON lead_notas (lead_id);

-- ---------------------------------------------------------------
-- Trigger: atualiza data_atualizacao automaticamente
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_data_atualizacao()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.data_atualizacao = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS leads_set_updated ON leads;
CREATE TRIGGER leads_set_updated
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_data_atualizacao();

-- ---------------------------------------------------------------
-- Row Level Security (RLS)
-- ---------------------------------------------------------------
ALTER TABLE leads      ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_notas ENABLE ROW LEVEL SECURITY;

-- Anônimos podem INSERIR leads (formulário da landing page)
DROP POLICY IF EXISTS "anon_insert_leads" ON leads;
CREATE POLICY "anon_insert_leads" ON leads
  FOR INSERT TO anon WITH CHECK (true);

-- Usuários autenticados têm acesso total (painel admin)
DROP POLICY IF EXISTS "auth_all_leads" ON leads;
CREATE POLICY "auth_all_leads" ON leads
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_all_notas" ON lead_notas;
CREATE POLICY "auth_all_notas" ON lead_notas
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
