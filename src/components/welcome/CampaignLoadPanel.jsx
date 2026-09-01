import React, { useMemo, useRef, useState } from 'react'
import { ArrowLeft, Download, Pencil, Play, Plus, Trash2, Upload, Users, Skull, BookOpen } from 'lucide-react'
import { useCampaignStore } from '../../store/useCampaignStore'
import { useCharacterStore } from '../../store/useCharacterStore'
import { useNPCStore } from '../../store/useNPCStore'
import { useGroupStore } from '../../store/useGroupStore'
import {
  addCampaign,
  activateCampaign,
  exportCampaignById,
  importCampaign,
  getCampaignSlotSummary,
  suggestCampaignName,
  renameCampaign,
  removeCampaign,
} from '../../services/saveService'
import { useSaveStore } from '../../store/useSaveStore'
import { formatDate } from '../../utils/id'
import { Button } from '../ui/Button'
import SpotlightCard from '../react-bits/SpotlightCard'
import { THEME_ACCENT } from '../../constants/theme'
import { CampaignNameModal } from './CampaignNameModal'

function SlotStat({ icon: Icon, label, value, color }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      fontSize: '0.62rem',
      fontFamily: 'ui-monospace, monospace',
      color: '#777',
    }}>
      <Icon size={11} style={{ color }} />
      {value}
      {' '}
      {label}
    </span>
  )
}

function isEmptySlot(summary) {
  return summary.characters === 0 && summary.npcs === 0 && summary.groups === 0
}

const ACTION_BTN = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.55rem',
}

export function CampaignLoadPanel({ onPlay, onBack }) {
  const fileRef = useRef(null)
  const campaigns = useCampaignStore(s => s.campaigns)
  const activeCampaignId = useCampaignStore(s => s.activeCampaignId)
  const characters = useCharacterStore(s => s.characters)
  const npcs = useNPCStore(s => s.npcs)
  const groups = useGroupStore(s => s.groups)
  const { showToast } = useSaveStore()
  const [loading, setLoading] = useState(false)
  const [selectedId, setSelectedId] = useState(activeCampaignId || campaigns[0]?.id || null)
  const [createOpen, setCreateOpen] = useState(false)
  const [renameOpen, setRenameOpen] = useState(false)
  const [suggestedName, setSuggestedName] = useState('')

  const slots = useMemo(
    () => campaigns.map(campaign => ({
      campaign,
      summary: getCampaignSlotSummary(campaign.id, { characters, npcs, groups }),
    })),
    [campaigns, characters, npcs, groups],
  )

  const selectedCampaign = campaigns.find(c => c.id === selectedId) || null

  const openCreateModal = () => {
    setSuggestedName(suggestCampaignName())
    setCreateOpen(true)
  }

  const handleCreate = (name) => {
    setLoading(true)
    try {
      const campaign = addCampaign(name)
      setSelectedId(campaign.id)
      setCreateOpen(false)
      showToast(`Campanha "${campaign.name}" criada.`, 'success')
    } catch (e) {
      showToast(e.message || 'Erro ao criar campanha.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleRename = (name) => {
    if (!selectedId) return
    setLoading(true)
    try {
      renameCampaign(selectedId, name)
      setRenameOpen(false)
      showToast('Nome atualizado.', 'success')
    } catch (e) {
      showToast(e.message || 'Erro ao renomear.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = () => {
    if (!selectedId || !selectedCampaign) return
    const empty = isEmptySlot(getCampaignSlotSummary(selectedId, { characters, npcs, groups }))
    const message = empty
      ? `Excluir "${selectedCampaign.name}"?`
      : `Excluir "${selectedCampaign.name}" e todo o conteúdo dela?\n\nPersonagens, NPCs e dados vão para a lixeira.`
    if (!window.confirm(message)) return

    setLoading(true)
    try {
      removeCampaign(selectedId)
      const remaining = useCampaignStore.getState().campaigns
      setSelectedId(remaining[remaining.length - 1]?.id || null)
      showToast('Campanha removida.', 'success')
    } catch (e) {
      showToast(e.message || 'Erro ao excluir.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handlePlay = (campaignId) => {
    const id = campaignId || selectedId
    if (!id) return
    activateCampaign(id)
    onPlay?.(id)
  }

  const handleExport = () => {
    if (!selectedId) {
      showToast('Selecione uma campanha para exportar.', 'error')
      return
    }
    setLoading(true)
    try {
      exportCampaignById(selectedId)
    } catch (e) {
      showToast(e.message || 'Erro ao exportar.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleImportClick = () => fileRef.current?.click()

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setLoading(true)
    const result = await importCampaign(file)
    setLoading(false)
    if (result?.ok && result.campaignId) {
      setSelectedId(result.campaignId)
    }
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.85rem',
      flex: 1,
      minHeight: 0,
      overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', flexShrink: 0 }}>
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            style={{
              marginTop: 2,
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: 8,
              padding: '0.4rem',
              color: '#aaa',
              cursor: 'pointer',
              display: 'flex',
              flexShrink: 0,
            }}
            title="Voltar"
          >
            <ArrowLeft size={14} />
          </button>
        ) : null}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: '0.58rem',
            fontFamily: 'monospace',
            letterSpacing: '0.12em',
            color: THEME_ACCENT,
            marginBottom: '0.35rem',
            fontWeight: 700,
          }}>
            CAMPANHAS
          </div>
          <h2 style={{
            fontSize: '1.1rem',
            fontWeight: 700,
            color: '#f0f0f0',
            marginBottom: '0.35rem',
          }}>
            Carregar campanha
          </h2>
          <p style={{ margin: 0, fontSize: '0.78rem', color: '#888', lineHeight: 1.5 }}>
            Escolha um save, crie com um nome ou importe um arquivo .json.
          </p>
        </div>
      </div>

      {slots.length === 0 ? (
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem 1rem',
          borderRadius: 12,
          border: '1px dashed rgba(255,255,255,0.1)',
          textAlign: 'center',
          color: '#666',
          fontSize: '0.8rem',
          lineHeight: 1.5,
          minHeight: 120,
        }}>
          Nenhuma campanha neste computador.
          <br />
          Crie uma nova ou importe um arquivo .json.
        </div>
      ) : (
        <div
          className="welcome-campaign-scroll"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            flex: '1 1 auto',
            minHeight: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
            paddingRight: '0.15rem',
            overscrollBehavior: 'contain',
          }}
        >
          {slots.map(({ campaign, summary }) => {
            const selected = selectedId === campaign.id
            const isActive = activeCampaignId === campaign.id
            const empty = isEmptySlot(summary)
            return (
              <div key={campaign.id} style={{ flexShrink: 0 }}>
              <SpotlightCard
                onClick={() => setSelectedId(campaign.id)}
                spotlightColor={selected ? 'rgba(37, 99, 235, 0.2)' : 'rgba(255,255,255,0.06)'}
                style={{
                  padding: '0.85rem 0.95rem',
                  cursor: 'pointer',
                  border: selected ? '1px solid rgba(37,99,235,0.45)' : '1px solid rgba(255,255,255,0.08)',
                  background: selected ? 'rgba(37,99,235,0.08)' : 'rgba(255,255,255,0.02)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#f2f2f2' }}>
                        {campaign.name}
                      </span>
                      {isActive ? (
                        <span style={{
                          fontSize: '0.5rem',
                          fontFamily: 'monospace',
                          letterSpacing: '0.08em',
                          color: '#4ade80',
                          border: '1px solid rgba(74,222,128,0.35)',
                          borderRadius: 999,
                          padding: '2px 6px',
                        }}>
                          ÚLTIMA
                        </span>
                      ) : null}
                      {empty ? (
                        <span style={{
                          fontSize: '0.5rem',
                          fontFamily: 'monospace',
                          letterSpacing: '0.08em',
                          color: '#9ca3af',
                          border: '1px solid rgba(255,255,255,0.12)',
                          borderRadius: 999,
                          padding: '2px 6px',
                        }}>
                          VAZIA
                        </span>
                      ) : null}
                    </div>
                    {campaign.description ? (
                      <p style={{ margin: '0.35rem 0 0', fontSize: '0.72rem', color: '#777', lineHeight: 1.45 }}>
                        {campaign.description.length > 100
                          ? `${campaign.description.slice(0, 100)}…`
                          : campaign.description}
                      </p>
                    ) : null}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.55rem', marginTop: '0.55rem' }}>
                      <SlotStat icon={Users} label="PCs" value={summary.characters} color="#9ca3af" />
                      <SlotStat icon={Skull} label="NPCs" value={summary.npcs} color="#06b6d4" />
                      <SlotStat icon={BookOpen} label="grupos" value={summary.groups} color="#d97706" />
                    </div>
                    <div style={{
                      marginTop: '0.45rem',
                      fontSize: '0.58rem',
                      color: '#555',
                      fontFamily: 'monospace',
                    }}>
                      Criada
                      {' '}
                      {formatDate(campaign.createdAt)}
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="xs"
                    disabled={loading}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedId(campaign.id)
                      handlePlay(campaign.id)
                    }}
                    style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <Play size={12} fill="currentColor" />
                    Jogar
                  </Button>
                </div>
              </SpotlightCard>
              </div>
            )
          })}
        </div>
      )}

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.65rem',
        flexShrink: 0,
        marginTop: '0.35rem',
        paddingTop: '0.85rem',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}>
        <Button
          type="button"
          size="md"
          block
          disabled={loading}
          onClick={openCreateModal}
          style={ACTION_BTN}
        >
          <Plus size={15} />
          Nova campanha
        </Button>
        {selectedCampaign ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
            <Button
              type="button"
              variant="secondary"
              size="md"
              disabled={loading}
              onClick={() => setRenameOpen(true)}
              style={ACTION_BTN}
            >
              <Pencil size={14} />
              Renomear
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="md"
              disabled={loading}
              onClick={handleDelete}
              style={ACTION_BTN}
            >
              <Trash2 size={14} />
              Excluir
            </Button>
          </div>
        ) : null}
        <Button
          type="button"
          variant="secondary"
          size="md"
          block
          disabled={loading}
          onClick={handleImportClick}
          style={ACTION_BTN}
        >
          <Upload size={15} />
          Importar arquivo
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="md"
          block
          disabled={loading || !selectedId}
          onClick={handleExport}
          style={ACTION_BTN}
        >
          <Download size={15} />
          Exportar selecionada
        </Button>
      </div>

      <CampaignNameModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Nova campanha"
        defaultName={suggestedName}
        confirmLabel="Criar"
        onSubmit={handleCreate}
      />

      <CampaignNameModal
        open={renameOpen}
        onClose={() => setRenameOpen(false)}
        title="Renomear campanha"
        defaultName={selectedCampaign?.name || ''}
        confirmLabel="Salvar"
        onSubmit={handleRename}
      />

      <input
        ref={fileRef}
        type="file"
        accept=".json,application/json"
        style={{ display: 'none' }}
        onChange={handleFile}
      />
    </div>
  )
}
