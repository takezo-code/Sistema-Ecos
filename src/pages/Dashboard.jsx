import React from 'react'
import {
  LayoutDashboard, BookOpen, Skull, GitBranch,
  ScrollText, Plus, ArrowRight, Activity, Sword, Building2, Dices, Users, Save, UserCircle,
} from 'lucide-react'
import { manualSave } from '../services/saveService'
import { useCampaignStore } from '../store/useCampaignStore'
import { useNPCStore } from '../store/useNPCStore'
import { useSessionStore } from '../store/useSessionStore'
import { useNarrativeStore } from '../store/useNarrativeStore'
import { useCharacterStore } from '../store/useCharacterStore'
import { PageHeader } from '../components/ui/PageHeader'
import { StatusTag } from '../components/ui/StatusTag'
import { formatDate } from '../utils/id'

function StatCard({ icon: Icon, label, value, color = '#dc2626' }) {
  return (
    <div
      style={{
        background: '#111',
        border: '1px solid #1a1a1a',
        borderRadius: '4px',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.7rem', color: '#444', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</span>
        <Icon size={14} style={{ color }} />
      </div>
      <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#e5e5e5', lineHeight: 1 }}>{value}</div>
    </div>
  )
}

function QuickCard({ icon: Icon, label, color, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: '#111',
        border: '1px solid #1a1a1a',
        borderRadius: '4px',
        padding: '0.75rem 1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.625rem',
        cursor: 'pointer',
        color: '#555',
        fontSize: '0.8rem',
        transition: 'all 0.15s',
        width: '100%',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#e5e5e5' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#1a1a1a'; e.currentTarget.style.color = '#555' }}
    >
      <Icon size={14} style={{ color }} />
      {label}
      <ArrowRight size={12} style={{ marginLeft: 'auto', opacity: 0.3 }} />
    </button>
  )
}

export function Dashboard({ onNavigate }) {
  const { campaigns, activeCampaignId, activeCampaign } = useCampaignStore()
  const { npcs } = useNPCStore()
  const { sessions } = useSessionStore()
  const { events } = useNarrativeStore()
  const { characters } = useCharacterStore()

  const active = activeCampaign
  const campaignNpcs = active ? npcs.filter(n => n.campaignId === activeCampaignId) : npcs
  const campaignSessions = active
    ? sessions.filter(s => s.campaignId === activeCampaignId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    : [...sessions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  const campaignEvents = active
    ? events.filter(e => e.campaignId === activeCampaignId).sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    : events
  const pendingEvents = campaignEvents.filter(e => e.status === 'não iniciado' || e.status === 'em andamento')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <PageHeader
        icon={LayoutDashboard}
        title="Dashboard"
        subtitle="VISÃO GERAL DO SISTEMA"
        action={
          <button
            type="button"
            className="btn-primary"
            onClick={() => manualSave()}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem' }}
          >
            <Save size={13} /> Salvar Campanha
          </button>
        }
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' }}>

        {/* Campanha ativa */}
        {active ? (
          <div
            style={{
              background: '#111',
              border: '1px solid #1a1a1a',
              borderLeft: '3px solid #dc2626',
              borderRadius: '4px',
              padding: '1rem 1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '0.6rem', color: '#333', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: '4px' }}>
                CAMPANHA ATIVA
              </div>
              <div style={{ fontSize: '1rem', fontWeight: 600, color: '#e5e5e5' }}>{active.name}</div>
              <div style={{ fontSize: '0.75rem', color: '#555', marginTop: '2px' }}>
                {active.description || 'Sem descrição'}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
              <StatusTag status={active.status} />
              <span style={{ fontSize: '0.65rem', color: '#333', fontFamily: 'monospace' }}>
                {formatDate(active.createdAt)}
              </span>
            </div>
          </div>
        ) : (
          <div
            style={{
              background: '#0d0d0d',
              border: '1px dashed #1a1a1a',
              borderRadius: '4px',
              padding: '1rem 1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ fontSize: '0.8rem', color: '#333' }}>
              Nenhuma campanha ativa. Selecione uma em <span style={{ color: '#555' }}>Campanhas</span>.
            </div>
            <button className="btn-primary" style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }} onClick={() => onNavigate('campanha', 'historia')}>
              <Plus size={12} style={{ display: 'inline', marginRight: '4px' }} />
              Criar
            </button>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <StatCard icon={BookOpen} label="Campanhas" value={campaigns.length} color="#dc2626" />
          <StatCard icon={Skull} label="NPCs" value={campaignNpcs.length} color="#06b6d4" />
          <StatCard icon={Sword} label="Personagens" value={active ? characters.filter(c => c.campaignId === activeCampaignId).length : characters.length} color="#9ca3af" />
          <StatCard icon={ScrollText} label="Sessões" value={campaignSessions.length} color="#d97706" />
          <StatCard icon={GitBranch} label="Eventos" value={campaignEvents.length} color="#16a34a" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
          {/* Últimas sessões */}
          <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ScrollText size={13} style={{ color: '#dc2626' }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#999' }}>ÚLTIMAS SESSÕES</span>
              </div>
              <button
                onClick={() => onNavigate('campanha', 'sessoes')}
                style={{ background: 'transparent', border: 'none', color: '#333', cursor: 'pointer', fontSize: '0.65rem', fontFamily: 'monospace' }}
                onMouseEnter={e => e.currentTarget.style.color = '#666'}
                onMouseLeave={e => e.currentTarget.style.color = '#333'}
              >
                ver tudo →
              </button>
            </div>
            {campaignSessions.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: '#333', fontSize: '0.75rem' }}>
                Nenhuma sessão registrada
              </div>
            ) : (
              <div>
                {campaignSessions.slice(0, 4).map(s => (
                  <div
                    key={s.id}
                    style={{ padding: '0.625rem 1rem', borderBottom: '1px solid #0d0d0d' }}
                  >
                    <div style={{ fontSize: '0.8rem', color: '#ccc', fontWeight: 500 }}>{s.title}</div>
                    <div style={{ fontSize: '0.65rem', color: '#333', fontFamily: 'monospace', marginTop: '2px' }}>
                      {formatDate(s.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Próximos eventos */}
          <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <GitBranch size={13} style={{ color: '#06b6d4' }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#999' }}>PRÓXIMOS EVENTOS</span>
              </div>
              <button
                onClick={() => onNavigate('campanha', 'historia')}
                style={{ background: 'transparent', border: 'none', color: '#333', cursor: 'pointer', fontSize: '0.65rem', fontFamily: 'monospace' }}
                onMouseEnter={e => e.currentTarget.style.color = '#666'}
                onMouseLeave={e => e.currentTarget.style.color = '#333'}
              >
                ver tudo →
              </button>
            </div>
            {pendingEvents.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: '#333', fontSize: '0.75rem' }}>
                Nenhum evento pendente
              </div>
            ) : (
              <div>
                {pendingEvents.slice(0, 4).map(e => (
                  <div
                    key={e.id}
                    style={{ padding: '0.625rem 1rem', borderBottom: '1px solid #0d0d0d', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                  >
                    <div style={{ fontSize: '0.8rem', color: '#ccc', fontWeight: 500 }}>{e.title}</div>
                    <StatusTag status={e.status} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* NPCs recentes */}
        <div style={{ background: '#111', border: '1px solid #1a1a1a', borderRadius: '4px', overflow: 'hidden', marginBottom: '1.5rem' }}>
          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Skull size={13} style={{ color: '#06b6d4' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#999' }}>NPCs RECENTES</span>
            </div>
            <button
              onClick={() => onNavigate('management', 'npcs')}
              style={{ background: 'transparent', border: 'none', color: '#333', cursor: 'pointer', fontSize: '0.65rem', fontFamily: 'monospace' }}
              onMouseEnter={e => e.currentTarget.style.color = '#666'}
              onMouseLeave={e => e.currentTarget.style.color = '#333'}
            >
              ver tudo →
            </button>
          </div>
          {campaignNpcs.length === 0 ? (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: '#333', fontSize: '0.75rem' }}>
              Nenhum NPC criado
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
              {campaignNpcs.slice(0, 6).map(n => (
                <div
                  key={n.id}
                  style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #0d0d0d', borderRight: '1px solid #0d0d0d' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '4px' }}>
                    <span className="status-dot" style={{
                      width: '5px', height: '5px', borderRadius: '50', display: 'inline-block',
                      background: n.status === 'vivo' ? '#16a34a' : n.status === 'morto' ? '#dc2626' : '#d97706'
                    }} />
                    <span style={{ fontSize: '0.8rem', color: '#ccc', fontWeight: 500 }}>{n.name}</span>
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#444' }}>{n.organization || 'Sem org.'}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Atalhos */}
        <div>
          <div style={{ fontSize: '0.65rem', color: '#333', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
            ATALHOS RÁPIDOS
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.5rem' }}>
            <QuickCard icon={UserCircle} label="Skills" color="#a855f7" onClick={() => onNavigate('skills')} />
            <QuickCard icon={BookOpen} label="Nova Campanha" color="#dc2626" onClick={() => onNavigate('campanha', 'historia')} />
            <QuickCard icon={Skull} label="Novo NPC" color="#06b6d4" onClick={() => onNavigate('management', 'creation', 'npcs')} />
            <QuickCard icon={Sword} label="Novo Personagem" color="#9ca3af" onClick={() => onNavigate('management', 'creation', 'characters')} />
            <QuickCard icon={Building2} label="Nova Organização" color="#d97706" onClick={() => onNavigate('management', 'creation', 'organizations')} />
            <QuickCard icon={ScrollText} label="Nova Sessão" color="#16a34a" onClick={() => onNavigate('campanha', 'sessoes')} />
            <QuickCard icon={Dices} label="Rolar Dados" color="#a855f7" onClick={() => onNavigate('dice')} />
            <QuickCard icon={Users} label="Gerenciar" color="#e5e5e5" onClick={() => onNavigate('management')} />
          </div>
        </div>
      </div>
    </div>
  )
}
