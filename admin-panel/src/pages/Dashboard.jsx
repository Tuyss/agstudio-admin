import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { supabase } from '../lib/supabase'

const STATUS_COLORS = {
  Novo:              '#4d9fff',
  Contatado:         '#7ec8ff',
  'Proposta Enviada':'#a8d4ff',
  Fechado:           '#4ade80',
  Perdido:           '#f87171',
}

const PIE_COLORS = ['#4d9fff','#1a6fd4','#7ec8ff','#a8d4ff','#2563eb']

function StatCard({ label, value, sub, icon, accent }) {
  return (
    <div className="card p-6 flex items-start gap-4">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}
      >
        <span style={{ color: accent }}>{icon}</span>
      </div>
      <div>
        <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-1">{label}</p>
        <p className="text-3xl font-extrabold text-agtext tracking-tight">{value}</p>
        {sub && <p className="text-xs text-muted mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface2 border border-white/10 rounded-xl px-4 py-3 text-sm shadow-xl">
      <p className="text-muted text-xs mb-1">{label}</p>
      <p className="font-bold text-agtext">{payload[0].value} lead{payload[0].value !== 1 ? 's' : ''}</p>
    </div>
  )
}

const CustomPieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface2 border border-white/10 rounded-xl px-4 py-3 text-sm shadow-xl">
      <p className="text-muted text-xs mb-1">{payload[0].name}</p>
      <p className="font-bold text-agtext">{payload[0].value} lead{payload[0].value !== 1 ? 's' : ''}</p>
    </div>
  )
}

function startOfDay(d) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

export default function Dashboard() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLeads() {
      const { data, error } = await supabase
        .from('leads')
        .select('id,nome,whatsapp,plano_interesse,canal,status,data_criacao')
        .order('data_criacao', { ascending: false })

      if (!error) setLeads(data ?? [])
      setLoading(false)
    }
    fetchLeads()
  }, [])

  const now = new Date()
  const todayStart = startOfDay(now)
  const weekStart = new Date(now)
  weekStart.setDate(weekStart.getDate() - 7)

  const total         = leads.length
  const hoje          = leads.filter(l => new Date(l.data_criacao) >= todayStart).length
  const semana        = leads.filter(l => new Date(l.data_criacao) >= weekStart).length
  const fechados      = leads.filter(l => l.status === 'Fechado').length
  const taxaFechamento = total > 0 ? ((fechados / total) * 100).toFixed(0) : 0

  // Group by plano
  const planoMap = {}
  leads.forEach(l => {
    const key = l.plano_interesse || 'Não informado'
    planoMap[key] = (planoMap[key] || 0) + 1
  })
  const planoData = Object.entries(planoMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  // Group by canal
  const canalMap = {}
  leads.forEach(l => {
    const key = l.canal || 'Não informado'
    canalMap[key] = (canalMap[key] || 0) + 1
  })
  const canalData = Object.entries(canalMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  // Group by status
  const statusMap = {}
  leads.forEach(l => {
    statusMap[l.status] = (statusMap[l.status] || 0) + 1
  })

  const recentLeads = leads.slice(0, 8)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-agtext tracking-tight">Dashboard</h1>
        <p className="text-muted text-sm mt-1">Visão geral dos seus leads</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total de leads"
          value={total}
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
          accent="#4d9fff"
        />
        <StatCard
          label="Hoje"
          value={hoje}
          sub="leads nas últimas 24h"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
          accent="#7ec8ff"
        />
        <StatCard
          label="Essa semana"
          value={semana}
          sub="últimos 7 dias"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
          accent="#1a6fd4"
        />
        <StatCard
          label="Fechados"
          value={`${taxaFechamento}%`}
          sub={`${fechados} de ${total} leads`}
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>}
          accent="#4ade80"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Plano bar chart */}
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-agtext mb-1">Leads por Plano</h2>
          <p className="text-xs text-muted mb-5">Distribuição por plano de interesse</p>
          {planoData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={planoData} barSize={36}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#7a9ac0', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#7a9ac0', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(77,159,255,0.05)' }} />
                <Bar dataKey="value" fill="#4d9fff" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-muted text-sm">
              Nenhum dado ainda
            </div>
          )}
        </div>

        {/* Canal pie chart */}
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-agtext mb-1">Leads por Canal</h2>
          <p className="text-xs text-muted mb-5">De onde vieram seus leads</p>
          {canalData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={canalData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {canalData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '12px', color: '#7a9ac0' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-muted text-sm">
              Nenhum dado ainda
            </div>
          )}
        </div>
      </div>

      {/* Status summary + Recent leads */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status */}
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-agtext mb-4">Status do Funil</h2>
          <div className="space-y-3">
            {['Novo','Contatado','Proposta Enviada','Fechado','Perdido'].map(s => {
              const count = statusMap[s] || 0
              const pct = total > 0 ? (count / total) * 100 : 0
              return (
                <div key={s}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-muted">{s}</span>
                    <span className="text-xs font-semibold text-agtext">{count}</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, background: STATUS_COLORS[s] }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent leads */}
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-agtext">Leads Recentes</h2>
            <Link to="/leads" className="text-xs text-accent hover:underline">Ver todos →</Link>
          </div>
          <div className="space-y-2">
            {recentLeads.length === 0 && (
              <p className="text-muted text-sm text-center py-6">Nenhum lead ainda.</p>
            )}
            {recentLeads.map(l => (
              <Link
                key={l.id}
                to={`/leads/${l.id}`}
                className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-white/5 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent text-xs font-bold flex-shrink-0">
                    {l.nome.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-agtext group-hover:text-accent transition-colors">{l.nome}</p>
                    <p className="text-xs text-muted">{l.plano_interesse || 'Plano não informado'}</p>
                  </div>
                </div>
                <span
                  className="badge text-xs"
                  style={{
                    background: `${STATUS_COLORS[l.status]}18`,
                    color: STATUS_COLORS[l.status],
                    border: `1px solid ${STATUS_COLORS[l.status]}30`,
                  }}
                >
                  {l.status}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
