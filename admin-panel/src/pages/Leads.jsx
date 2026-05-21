import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const STATUSES = ['Novo', 'Contatado', 'Proposta Enviada', 'Fechado', 'Perdido']
const PLANOS   = ['Básico', 'Intermediário', 'Super']

const STATUS_STYLE = {
  Novo:              { bg: 'rgba(77,159,255,0.12)',  color: '#4d9fff', border: 'rgba(77,159,255,0.3)' },
  Contatado:         { bg: 'rgba(126,200,255,0.12)', color: '#7ec8ff', border: 'rgba(126,200,255,0.3)' },
  'Proposta Enviada':{ bg: 'rgba(168,212,255,0.12)', color: '#a8d4ff', border: 'rgba(168,212,255,0.3)' },
  Fechado:           { bg: 'rgba(74,222,128,0.12)',  color: '#4ade80', border: 'rgba(74,222,128,0.3)' },
  Perdido:           { bg: 'rgba(248,113,113,0.12)', color: '#f87171', border: 'rgba(248,113,113,0.3)' },
}

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] ?? STATUS_STYLE.Novo
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
    >
      {status}
    </span>
  )
}

function InlineStatusSelect({ leadId, current, onUpdated }) {
  const [editing, setEditing]   = useState(false)
  const [saving, setSaving]     = useState(false)
  const [value, setValue]       = useState(current)

  async function handleChange(e) {
    const next = e.target.value
    setValue(next)
    setSaving(true)
    await supabase.from('leads').update({ status: next }).eq('id', leadId)
    setSaving(false)
    setEditing(false)
    onUpdated(leadId, next)
  }

  if (editing) {
    return (
      <select
        autoFocus
        value={value}
        onChange={handleChange}
        onBlur={() => setEditing(false)}
        disabled={saving}
        className="bg-surface2 border border-accent/40 text-agtext text-xs rounded-lg px-2 py-1 outline-none cursor-pointer"
      >
        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
    )
  }

  return (
    <button
      onClick={() => setEditing(true)}
      title="Clique para editar"
      className="group flex items-center gap-1"
    >
      <StatusBadge status={value} />
      <svg className="text-muted opacity-0 group-hover:opacity-100 transition-opacity" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
    </button>
  )
}

function fmtDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric' })
}

export default function Leads() {
  const [leads, setLeads]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [filterStatus, setFS]   = useState('')
  const [filterPlano, setFP]    = useState('')
  const [filterFrom, setFrom]   = useState('')
  const [filterTo, setTo]       = useState('')

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    let q = supabase.from('leads').select('*').order('data_criacao', { ascending: false })
    if (filterStatus) q = q.eq('status', filterStatus)
    if (filterPlano)  q = q.eq('plano_interesse', filterPlano)
    if (filterFrom)   q = q.gte('data_criacao', filterFrom)
    if (filterTo)     q = q.lte('data_criacao', filterTo + 'T23:59:59')
    const { data, error } = await q
    if (!error) setLeads(data ?? [])
    setLoading(false)
  }, [filterStatus, filterPlano, filterFrom, filterTo])

  useEffect(() => { fetchLeads() }, [fetchLeads])

  function handleStatusUpdated(id, next) {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status: next } : l))
  }

  const filtered = search.trim()
    ? leads.filter(l =>
        l.nome.toLowerCase().includes(search.toLowerCase()) ||
        l.email.toLowerCase().includes(search.toLowerCase()) ||
        l.whatsapp.includes(search) ||
        (l.segmento || '').toLowerCase().includes(search.toLowerCase())
      )
    : leads

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-agtext tracking-tight">Leads</h1>
          <p className="text-muted text-sm mt-1">{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Buscar nome, e-mail, telefone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input flex-1 min-w-[200px]"
        />
        <select value={filterStatus} onChange={e => setFS(e.target.value)} className="select w-44">
          <option value="">Todos os status</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterPlano} onChange={e => setFP(e.target.value)} className="select w-40">
          <option value="">Todos os planos</option>
          {PLANOS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <input
          type="date"
          value={filterFrom}
          onChange={e => setFrom(e.target.value)}
          className="input w-40"
          title="De"
        />
        <input
          type="date"
          value={filterTo}
          onChange={e => setTo(e.target.value)}
          className="input w-40"
          title="Até"
        />
        {(filterStatus || filterPlano || filterFrom || filterTo) && (
          <button
            onClick={() => { setFS(''); setFP(''); setFrom(''); setTo('') }}
            className="btn-ghost"
          >
            Limpar filtros
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-surface2/50">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted uppercase tracking-widest">Nome</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-muted uppercase tracking-widest">WhatsApp</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-muted uppercase tracking-widest hidden md:table-cell">E-mail</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-muted uppercase tracking-widest hidden md:table-cell">Plano</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-muted uppercase tracking-widest hidden lg:table-cell">Segmento</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-muted uppercase tracking-widest hidden xl:table-cell">Canal</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-muted uppercase tracking-widest">Status</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-muted uppercase tracking-widest hidden md:table-cell">Data</th>
                <th className="px-4 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading && (
                <tr>
                  <td colSpan={9} className="py-16 text-center">
                    <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-muted text-sm">
                    Nenhum lead encontrado.
                  </td>
                </tr>
              )}
              {!loading && filtered.map(l => (
                <tr key={l.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent text-xs font-bold flex-shrink-0">
                        {l.nome.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-agtext">{l.nome}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-muted">{l.whatsapp}</td>
                  <td className="px-4 py-4 text-muted hidden md:table-cell max-w-[180px] truncate">{l.email}</td>
                  <td className="px-4 py-4 hidden md:table-cell">
                    {l.plano_interesse ? (
                      <span className="text-xs font-semibold text-accent bg-accent/10 border border-accent/20 px-2.5 py-0.5 rounded-full">
                        {l.plano_interesse}
                      </span>
                    ) : <span className="text-muted">—</span>}
                  </td>
                  <td className="px-4 py-4 text-muted hidden lg:table-cell max-w-[140px] truncate">{l.segmento || '—'}</td>
                  <td className="px-4 py-4 text-muted hidden xl:table-cell">{l.canal || '—'}</td>
                  <td className="px-4 py-4">
                    <InlineStatusSelect
                      leadId={l.id}
                      current={l.status}
                      onUpdated={handleStatusUpdated}
                    />
                  </td>
                  <td className="px-4 py-4 text-muted hidden md:table-cell whitespace-nowrap">{fmtDate(l.data_criacao)}</td>
                  <td className="px-4 py-4">
                    <Link
                      to={`/leads/${l.id}`}
                      className="text-xs text-accent hover:underline whitespace-nowrap"
                    >
                      Ver →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
