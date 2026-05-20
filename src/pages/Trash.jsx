import React, { useEffect, useMemo, useState } from 'react'
import {
  Trash2, RotateCcw, Sword, Skull, Building2, X, BookOpen, ScrollText,
  UsersRound, Sparkles, GitBranch,
} from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { Modal } from '../components/ui/Modal'
import { EmptyState } from '../components/ui/EmptyState'
import { useTrashStore } from '../store/useTrashStore'
import { useCampaignStore } from '../store/useCampaignStore'
import { TRASH_TYPE_LABELS } from '../services/trashService'
import { formatDate } from '../utils/id'

const TYPE_ICONS = {
  character: Sword,
  npc: Skull,
  organization: Building2,
  campaign: BookOpen,
  session: ScrollText,
  group: UsersRound,
  skill: Sparkles,
  flow: GitBranch,
}

const TYPE_COLORS = {
  character: '#9ca3af',
  npc: '#06b6d4',
  organization: '#d97706',
  campaign: '#dc2626',
  session: '#16a34a',
  group: '#a855f7',
  skill: '#eab308',
  flow: '#6366f1',
}

const FILTER_OPTIONS = [
  { id: 'all', label: 'Todos' },
  { id: 'character', label: 'Personagens' },
  { id: 'npc', label: 'NPCs' },
  { id: 'organization', label: 'Organizações' },
  { id: 'campaign', label: 'Campanhas' },
  { id: 'session', label: 'Sessões' },
  { id: 'group', label: 'Grupos' },
  { id: 'skill', label: 'Skills' },
  { id: 'flow', label: 'Fluxo' },
]

export function Trash() {
  const { activeCampaignId } = useCampaignStore()
  const items = useTrashStore(s => s.items)
  const restore = useTrashStore(s => s.restore)
  const permanentDelete = useTrashStore(s => s.permanentDelete)
  const refresh = useTrashStore(s => s.refresh)

  useEffect(() => {
    refresh()
  }, [refresh])

  const [filter, setFilter] = useState('all')
  const [restoreError, setRestoreError] = useState(null)
  const [permanentConfirm, setPermanentConfirm] = useState(null)

  const filtered = useMemo(() => {
    let list = items
    if (activeCampaignId) {
      list = list.filter(i => i.campaignId === activeCampaignId || i.campaignId == null)
    }
    if (filter !== 'all') list = list.filter(i => i.entityType === filter)
    return list
  }, [items, activeCampaignId, filter])

  const handleRestore = (entry) => {
    const result = restore(entry.id)
    if (!result.ok) {
      setRestoreError(result.message)
      return
    }
    setRestoreError(null)
  }

  const handlePermanentDelete = (entry) => {
    permanentDelete(entry.id)
    setPermanentConfirm(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <PageHeader
        icon={Trash2}
        title="Lixeira"
        subtitle={`${filtered.length} item(ns) · restaurar ou excluir permanentemente`}
      />

      <div style={{ padding: '0 1.5rem 0.75rem', display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
        {FILTER_OPTIONS.map(f => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            style={{
              padding: '0.35rem 0.65rem',
              fontSize: '0.7rem',
              borderRadius: '3px',
              border: filter === f.id ? '1px solid rgba(220,38,38,0.35)' : '1px solid #1a1a1a',
              background: filter === f.id ? 'rgba(220,38,38,0.1)' : '#0d0d0d',
              color: filter === f.id ? '#e5e5e5' : '#555',
              cursor: 'pointer',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {restoreError && (
        <div style={{
          margin: '0 1.5rem 0.75rem',
          padding: '0.6rem 0.75rem',
          fontSize: '0.75rem',
          color: '#dc2626',
          background: 'rgba(220,38,38,0.08)',
          border: '1px solid rgba(220,38,38,0.2)',
          borderRadius: '4px',
        }}>
          {restoreError}
          <button type="button" className="btn-ghost" style={{ marginLeft: '0.5rem', fontSize: '0.65rem' }} onClick={() => setRestoreError(null)}>Fechar</button>
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 1.5rem 1.5rem' }}>
        {filtered.length === 0 ? (
          <EmptyState
            icon={Trash2}
            title="Lixeira vazia"
            description="Itens excluídos no sistema aparecem aqui para restauração ou exclusão definitiva."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '720px' }}>
            {filtered.map(entry => {
              const Icon = TYPE_ICONS[entry.entityType] || Trash2
              const color = TYPE_COLORS[entry.entityType] || '#666'
              return (
                <div
                  key={entry.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.875rem 1rem',
                    background: '#111',
                    border: '1px solid #1a1a1a',
                    borderRadius: '4px',
                  }}
                >
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '4px',
                    background: 'rgba(255,255,255,0.03)',
                    border: `1px solid ${color}33`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Icon size={16} style={{ color }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e5e5e5' }}>{entry.name}</div>
                    <div style={{ fontSize: '0.65rem', color: '#444', fontFamily: 'monospace', marginTop: '2px' }}>
                      {TRASH_TYPE_LABELS[entry.entityType] || entry.entityType}
                      {' · '}
                      {formatDate(entry.deletedAt)}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0 }}>
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => handleRestore(entry)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.7rem' }}
                    >
                      <RotateCcw size={12} /> Restaurar
                    </button>
                    <button
                      type="button"
                      className="btn-ghost"
                      onClick={() => setPermanentConfirm(entry)}
                      title="Excluir permanentemente"
                      style={{ display: 'flex', alignItems: 'center', padding: '0.4rem 0.5rem', color: '#555' }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Modal open={!!permanentConfirm} onClose={() => setPermanentConfirm(null)} title="Excluir permanentemente" maxWidth="400px">
        <p style={{ fontSize: '0.85rem', color: '#999', marginBottom: '1.25rem' }}>
          Remover <strong style={{ color: '#e5e5e5' }}>{permanentConfirm?.name}</strong> da lixeira?
          Esta ação não pode ser desfeita.
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button type="button" className="btn-ghost" onClick={() => setPermanentConfirm(null)}>Cancelar</button>
          <button type="button" className="btn-primary" onClick={() => handlePermanentDelete(permanentConfirm)}>Excluir para sempre</button>
        </div>
      </Modal>
    </div>
  )
}
