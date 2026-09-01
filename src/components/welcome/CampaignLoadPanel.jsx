import React, { useMemo, useRef, useState } from 'react'
import { Download, Play, Plus, Upload, Users, Skull, BookOpen } from 'lucide-react'
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
} from '../../services/saveService'
import { useSaveStore } from '../../store/useSaveStore'
import { formatDate } from '../../utils/id'
import { Button } from '../ui/Button'
import SpotlightCard from '../react-bits/SpotlightCard'

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
      {value} {label}
    </span>
  )
}

export function CampaignLoadPanel({ onPlay }) {
  const fileRef = useRef(null)
  const campaigns = useCampaignStore(s => s.campaigns)
  const activeCampaignId = useCampaignStore(s => s.activeCampaignId)
  const characters = useCharacterStore(s => s.characters)
  const npcs = useNPCStore(s => s.npcs)
  const groups = useGroupStore(s => s.groups)
  const { showToast } = useSaveStore()
  const [loading, setLoading] = useState(false)
  const [selectedId, setSelectedId] = useState(activeCampaignId || campaigns[0]?.id || null)

  const slots = useMemo(
    () => campaigns.map(campaign => ({
      campaign,
      summary: getCampaignSlotSummary(campaign.id, { characters, npcs, groups }),
    })),
    [campaigns, characters, npcs, groups],
  )

  const handleNew = () => {
    setLoading(true)
    try {
      const campaign = addCampaign('Nova Campanha')
      setSelectedId(campaign.id)
      showToast(`Campanha "${campaign.name}" criada.`, 'success')
    } catch (e) {
      showToast(e.message || 'Erro ao criar campanha.', 'error')
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
    if (result.ok && result.campaignId) {
      setSelectedId(result.campaignId)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      <div>
        <div style={{
          fontSize: '0.58rem',
          fontFamily: 'monospace',
          letterSpacing: '0.12em',
          color: '#a855f7',
          marginBottom: '0.35rem',
          fontWeight: 700,
        }}>
          ÁREA DE SAVE
        </div>
        <h2 style={{
          fontSize: '1.1rem',
          fontWeight: 700,
          color: '#f0f0f0',
          marginBottom: '0.35rem',
          letterSpacing: '-0.02em',
        }}>
          Carregar campanhas
        </h2>
        <p style={{ margin: 0, fontSize: '0.78rem', color: '#888', lineHeight: 1.5 }}>
          Escolha um save neste computador, importe outro arquivo ou exporte para levar a campanha completa.
        </p>
      </div>

      {slots.length === 0 ? (
        <div style={{
          padding: '1.5rem 1rem',
          borderRadius: 12,
          border: '1px dashed rgba(255,255,255,0.1)',
          textAlign: 'center',
          color: '#666',
          fontSize: '0.8rem',
        }}>
          Nenhuma campanha salva neste computador.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: 280, overflowY: 'auto' }}>
          {slots.map(({ campaign, summary }) => {
            const selected = selectedId === campaign.id
            const isActive = activeCampaignId === campaign.id
            return (
              <SpotlightCard
                key={campaign.id}
                onClick={() => setSelectedId(campaign.id)}
                spotlightColor={selected ? 'rgba(168, 85, 247, 0.22)' : 'rgba(255,255,255,0.06)'}
                style={{
                  padding: '0.85rem 0.95rem',
                  cursor: 'pointer',
                  border: selected ? '1px solid rgba(168,85,247,0.45)' : '1px solid rgba(255,255,255,0.08)',
                  background: selected ? 'rgba(168,85,247,0.08)' : 'rgba(255,255,255,0.02)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#f2f2f2' }}>
                        {campaign.name}
                      </span>
                      {isActive && (
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
                      )}
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
                      Criada {formatDate(campaign.createdAt)}
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
            )
          })}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
        <Button type="button" size="md" block disabled={loading} onClick={handleNew}>
          <Plus size={15} />
          Nova campanha
        </Button>
        <Button type="button" variant="secondary" size="md" block disabled={loading} onClick={handleImportClick}>
          <Upload size={15} />
          Importar campanha
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="md"
          block
          disabled={loading || !selectedId}
          onClick={handleExport}
        >
          <Download size={15} />
          Exportar campanha selecionada
        </Button>
      </div>

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
