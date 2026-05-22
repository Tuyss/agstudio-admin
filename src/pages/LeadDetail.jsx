import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const STATUSES = ['Novo', 'Contatado', 'Proposta Enviada', 'Fechado', 'Perdido']

const SELLER_NAMES = {
  'arthurcolinas19@gmail.com': 'Arthur',
  'gregory.bsns@gmail.com':    'Gregory',
  'gustavopp2906@gmail.com':   'Gustavo',
}

const STATUS_STYLE = {
  Novo:              { bg: 'rgba(77,159,255,0.12)',  color: '#4d9fff', border: 'rgba(77,159,255,0.3)' },
  Contatado:         { bg: 'rgba(126,200,255,0.12)', color: '#7ec8ff', border: 'rgba(126,200,255,0.3)' },
  'Proposta Enviada':{ bg: 'rgba(168,212,255,0.12)', color: '#a8d4ff', border: 'rgba(168,212,255,0.3)' },
  Fechado:           { bg: 'rgba(74,222,128,0.12)',  color: '#4ade80', border: 'rgba(74,222,128,0.3)' },
  Perdido:           { bg: 'rgba(248,113,113,0.12)', color: '#f87171', border: 'rgba(248,113,113,0.3)' },
}

function fmtBRL(v) {
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold text-muted uppercase tracking-widest">{label}</span>
      <span className="text-sm text-agtext">{value || '—'}</span>
    </div>
  )
}

function fmtDateTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function LeadDetail() {
  const { id }       = useParams()
  const navigate     = useNavigate()

  const [lead, setLead]         = useState(null)
  const [notas, setNotas]       = useState([])
  const [sellerName, setSeller] = useState('')
  const [loadingLead, setLL]    = useState(true)
  const [savingStatus, setSS]   = useState(false)
  const [newNota, setNewNota]   = useState('')
  const [savingNota, setSN]     = useState(false)
  const [valor, setValor]       = useState('')
  const [savingValor, setSV]    = useState(false)
  const [deleting, setDel]      = useState(false)

  useEffect(() => {
    async function load() {
      const [{ data: l }, { data: n }, { data: sessionData }] = await Promise.all([
        supabase.from('leads').select('*').eq('id', id).single(),
        supabase.from('lead_notas').select('*').eq('lead_id', id).order('criado_em', { ascending: false }),
        supabase.auth.getSession(),
      ])
      setLead(l)
      setNotas(n ?? [])
      if (l?.valor_venda != null) setValor(String(l.valor_venda))
      const email = sessionData?.session?.user?.email ?? ''
      setSeller(SELLER_NAMES[email] ?? 'AGStudio')
      setLL(false)
    }
    load()
  }, [id])

  async function handleStatusChange(e) {
    const next = e.target.value
    setSS(true)
    const { error } = await supabase.from('leads').update({ status: next }).eq('id', id)
    if (!error) setLead(prev => ({ ...prev, status: next }))
    setSS(false)
  }

  async function handleSaveValor() {
    setSV(true)
    const raw = valor.replace(',', '.').replace(/[^0-9.]/g, '')
    const v   = parseFloat(raw)
    const { error } = await supabase
      .from('leads')
      .update({ valor_venda: isNaN(v) ? null : v })
      .eq('id', id)
    if (!error) setLead(prev => ({ ...prev, valor_venda: isNaN(v) ? null : v }))
    setSV(false)
  }

  async function handleDelete() {
    if (!window.confirm(`Excluir o lead "${lead?.nome}" permanentemente? Esta ação não pode ser desfeita.`)) return
    setDel(true)
    await supabase.from('lead_notas').delete().eq('lead_id', id)
    await supabase.from('leads').delete().eq('id', id)
    navigate('/leads')
  }

  async function handleAddNota(e) {
    e.preventDefault()
    if (!newNota.trim()) return
    setSN(true)
    const { data, error } = await supabase
      .from('lead_notas')
      .insert({ lead_id: id, conteudo: newNota.trim() })
      .select()
      .single()
    if (!error && data) {
      setNotas(prev => [data, ...prev])
      setNewNota('')
    }
    setSN(false)
  }

  async function handleDeleteNota(notaId) {
    await supabase.from('lead_notas').delete().eq('id', notaId)
    setNotas(prev => prev.filter(n => n.id !== notaId))
  }

  if (loadingLead) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-muted">Lead não encontrado.</p>
        <Link to="/leads" className="text-accent hover:underline text-sm">← Voltar para leads</Link>
      </div>
    )
  }

  const s = STATUS_STYLE[lead.status] ?? STATUS_STYLE.Novo

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted mb-6">
        <Link to="/leads" className="hover:text-accent transition-colors">Leads</Link>
        <span>/</span>
        <span className="text-agtext">{lead.nome}</span>
      </div>

      {/* Header */}
      <div className="flex flex-wrap items-start gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent text-2xl font-bold flex-shrink-0">
          {lead.nome.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-agtext tracking-tight">{lead.nome}</h1>
          <p className="text-muted text-sm mt-0.5">Cadastrado em {fmtDateTime(lead.data_criacao)}</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs text-muted hidden sm:block">Status:</span>
          <div className="relative">
            <select
              value={lead.status}
              onChange={handleStatusChange}
              disabled={savingStatus}
              className="appearance-none pr-8 pl-3 py-2 text-sm font-semibold rounded-xl border cursor-pointer outline-none transition-all disabled:opacity-60"
              style={{ background: s.bg, color: s.color, borderColor: s.border }}
            >
              {STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
            </select>
            <svg className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: s.color }}>
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </div>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-red-400 hover:bg-red-400/10 border border-red-400/20 transition-all disabled:opacity-60"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/>
            </svg>
            {deleting ? 'Excluindo...' : 'Excluir'}
          </button>
        </div>
      </div>

      {/* Info grid */}
      <div className="card p-6 mb-6">
        <h2 className="text-sm font-semibold text-agtext mb-5 flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4d9fff" strokeWidth="2">
            <circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/>
          </svg>
          Informações do Lead
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <InfoRow label="Nome"       value={lead.nome} />
          <InfoRow label="WhatsApp"   value={lead.whatsapp} />
          <InfoRow label="E-mail"     value={lead.email} />
          <InfoRow label="Segmento"   value={lead.segmento} />
          <InfoRow label="Objetivo"   value={lead.objetivo} />
          <InfoRow label="Canal"      value={lead.canal} />
          <InfoRow label="Plano"      value={lead.plano_interesse} />
          <InfoRow label="Automação"  value={lead.automacao_interesse || 'Não informado'} />
          {lead.valor_venda != null && (
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-muted uppercase tracking-widest">Valor vendido</span>
              <span className="text-sm font-semibold text-emerald-400">{fmtBRL(lead.valor_venda)}</span>
            </div>
          )}
          <InfoRow label="Criado em"     value={fmtDateTime(lead.data_criacao)} />
          <InfoRow label="Atualizado em" value={fmtDateTime(lead.data_atualizacao)} />
        </div>

        {/* Observações do formulário */}
        {lead.notas && (
          <div className="mt-6 pt-6 border-t border-white/10">
            <span className="block text-xs font-semibold text-muted uppercase tracking-widest mb-2">
              Observações do cliente
            </span>
            <p className="text-sm text-agtext whitespace-pre-wrap bg-surface2/60 border border-white/[0.07] rounded-xl px-4 py-3">
              {lead.notas}
            </p>
          </div>
        )}

        {/* Venda fechada — registrar valor */}
        {lead.status === 'Fechado' && (
          <div className="mt-6 pt-6 border-t border-emerald-500/20">
            <div className="flex items-center gap-2 mb-4">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
              <span className="text-sm font-semibold text-emerald-400">Venda Fechada — Registrar Valor</span>
            </div>
            <div className="flex gap-3 items-center">
              <div className="relative max-w-[200px]">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm font-medium">R$</span>
                <input
                  type="text"
                  value={valor}
                  onChange={e => setValor(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSaveValor()}
                  placeholder="0,00"
                  className="input pl-9"
                />
              </div>
              <button
                onClick={handleSaveValor}
                disabled={savingValor}
                className="btn-primary"
              >
                {savingValor ? 'Salvando...' : 'Salvar valor'}
              </button>
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-white/10">
          <button
            onClick={() => {
              const numero = lead.whatsapp.replace(/\D/g, '')
              const auto   = lead.automacao_interesse
              const plano  = lead.plano_interesse || 'nosso plano'

              let msg
              if (!auto) {
                msg = `Olá ${lead.nome}! Aqui é o ${sellerName} da AGStudio.tech 👋 Recebemos seu formulário e vi que você quer ${lead.objetivo || 'melhorar sua presença digital'} para ${lead.segmento || 'seu negócio'}. Já analisei seu caso e o ${plano} seria o caminho certo pra você. Quando tiver um tempinho me fala que te mostro exatamente o que a gente vai fazer pelo seu negócio 🚀`
              } else if (auto === 'Chatbot Padrão') {
                msg = `Olá ${lead.nome}, tudo bem? Aqui é da AGStudio, meu nome é ${sellerName}. Recebemos seu formulário e vi que você tem interesse no ${plano} e também no ${auto}. Adoraria conversar sobre como podemos automatizar o atendimento do seu negócio com um chatbot inteligente. Quando seria um bom momento para conversarmos?`
              } else if (auto === 'Combo CRM + Chatbot') {
                msg = `Olá ${lead.nome}, tudo bem? Aqui é da AGStudio, meu nome é ${sellerName}. Recebemos seu formulário e vi que você tem interesse no ${plano} e também no ${auto}. Adoraria conversar sobre como podemos automatizar tanto o atendimento quanto a gestão de clientes do seu negócio. Quando seria um bom momento para conversarmos?`
              } else {
                msg = `Olá ${lead.nome}, tudo bem? Aqui é da AGStudio, meu nome é ${sellerName}. Recebemos seu formulário e vi que você tem interesse no ${plano} e também no ${auto}. Adoraria conversar sobre como podemos automatizar a gestão de clientes do seu negócio. Quando seria um bom momento para conversarmos?`
              }

              window.open('https://wa.me/55' + numero + '?text=' + encodeURIComponent(msg), '_blank')
            }}
            className="btn-primary flex items-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
            </svg>
            Abrir WhatsApp
          </button>
          <a
            href={`mailto:${lead.email}`}
            className="btn-ghost border border-white/10"
          >
            Enviar e-mail
          </a>
        </div>
      </div>

      {/* Notes */}
      <div className="card p-6">
        <h2 className="text-sm font-semibold text-agtext mb-5 flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4d9fff" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
          Histórico de Anotações
        </h2>

        <form onSubmit={handleAddNota} className="mb-6">
          <textarea
            value={newNota}
            onChange={e => setNewNota(e.target.value)}
            placeholder="Adicionar uma anotação..."
            rows={3}
            className="input resize-none mb-3"
          />
          <button
            type="submit"
            disabled={savingNota || !newNota.trim()}
            className="btn-primary flex items-center gap-2"
          >
            {savingNota ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Adicionar nota
              </>
            )}
          </button>
        </form>

        {notas.length === 0 && (
          <p className="text-muted text-sm text-center py-8 border border-dashed border-white/10 rounded-xl">
            Nenhuma anotação ainda. Adicione a primeira acima.
          </p>
        )}
        <div className="space-y-3">
          {notas.map(n => (
            <div
              key={n.id}
              className="flex gap-4 p-4 rounded-xl bg-surface2/60 border border-white/[0.07] group"
            >
              <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4d9fff" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted mb-1.5">{fmtDateTime(n.criado_em)}</p>
                <p className="text-sm text-agtext whitespace-pre-wrap">{n.conteudo}</p>
              </div>
              <button
                onClick={() => handleDeleteNota(n.id)}
                className="opacity-0 group-hover:opacity-100 text-muted hover:text-red-400 transition-all flex-shrink-0"
                title="Excluir nota"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  <path d="M10 11v6M14 11v6"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
