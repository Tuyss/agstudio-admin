-- Adiciona coluna valor_venda na tabela leads
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS valor_venda DECIMAL(10,2);
