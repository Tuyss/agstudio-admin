-- Adiciona coluna automacao_interesse na tabela leads
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS automacao_interesse TEXT;
