# AGStudio.tech — Sistema de Leads

Este repositório contém:

- **`agstudio-landing-v2_13.html`** — Landing page com integração Supabase
- **`admin-panel/`** — Painel admin em React + Vite + Tailwind
- **`supabase/schema.sql`** — Schema completo do banco de dados

---

## 1. Configurar o Supabase

### 1.1 Criar o projeto

1. Acesse [supabase.com](https://supabase.com) e crie uma conta
2. Clique em **New project**, escolha nome e senha
3. Aguarde o projeto inicializar (~2 min)

### 1.2 Criar as tabelas

1. No painel do Supabase, vá em **SQL Editor**
2. Cole o conteúdo de `supabase/schema.sql` e clique **Run**

Isso cria:
- Tabela `leads` com todos os campos + índices + trigger de atualização
- Tabela `lead_notas` para histórico de anotações
- Políticas RLS: anônimos podem inserir leads; autenticados têm acesso total

### 1.3 Criar os usuários admin

1. Vá em **Authentication → Users**
2. Clique em **Invite user** (ou **Add user → Create new user**)
3. Adicione os 3 e-mails dos usuários com senhas
4. Os usuários já terão acesso ao painel após login

### 1.4 Pegar as credenciais

Em **Settings → API**:
- `Project URL` → `SUPABASE_URL`
- `anon public` key → `SUPABASE_ANON_KEY`

---

## 2. Configurar a Landing Page

Abra `agstudio-landing-v2_13.html` e substitua as duas linhas no topo do `<script>`:

```js
const SUPABASE_URL      = 'https://xxxx.supabase.co';   // ← sua URL
const SUPABASE_ANON_KEY = 'eyJhbGci...';                // ← sua anon key
```

Pronto. Ao enviar o formulário, os dados são salvos na tabela `leads` antes de abrir o WhatsApp.

---

## 3. Configurar e rodar o Admin Panel

### 3.1 Instalar dependências

```bash
cd admin-panel
npm install
```

### 3.2 Criar arquivo `.env`

```bash
cp .env.example .env
```

Preencha com suas credenciais do Supabase:

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

### 3.3 Rodar em desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:5173](http://localhost:5173)

---

## 4. Deploy no Vercel

### 4.1 Preparar

```bash
cd admin-panel
npm run build   # gera a pasta dist/
```

### 4.2 Deploy via Vercel CLI

```bash
npm i -g vercel
vercel --prod
```

Ou conecte o repositório GitHub no [vercel.com](https://vercel.com):

1. **New Project → Import Git Repository**
2. **Root Directory:** `admin-panel`
3. Em **Environment Variables**, adicione:
   - `VITE_SUPABASE_URL` → sua URL
   - `VITE_SUPABASE_ANON_KEY` → sua anon key
4. Clique em **Deploy**

---

## Estrutura do painel admin

```
admin-panel/src/
├── lib/supabase.js          — cliente Supabase
├── App.jsx                  — roteamento + autenticação
├── components/
│   ├── Layout.jsx           — wrapper com sidebar
│   └── Sidebar.jsx          — navegação lateral
└── pages/
    ├── Login.jsx            — tela de login
    ├── Dashboard.jsx        — cards + gráficos
    ├── Leads.jsx            — tabela com filtros + status inline
    └── LeadDetail.jsx       — dados completos + histórico de notas
```

## Schema da tabela `leads`

| Campo            | Tipo        | Descrição                                          |
|------------------|-------------|----------------------------------------------------|
| `id`             | uuid        | Chave primária (auto)                              |
| `nome`           | text        | Nome do lead                                       |
| `whatsapp`       | text        | Telefone com máscara                               |
| `email`          | text        | E-mail                                             |
| `segmento`       | text        | Nicho / segmento do negócio                        |
| `objetivo`       | text        | O que busca com o site                             |
| `canal`          | text        | Como encontrou a AGStudio                          |
| `plano_interesse`| text        | Plano selecionado (Básico/Intermediário/Super)      |
| `status`         | text        | Etapa do funil (Novo → Fechado)                    |
| `notas`          | text        | Campo de notas rápidas                             |
| `data_criacao`   | timestamptz | Criação (auto)                                     |
| `data_atualizacao`| timestamptz| Última atualização (auto via trigger)              |
