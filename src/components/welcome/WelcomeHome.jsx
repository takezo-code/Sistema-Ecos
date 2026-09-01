import React, { useState } from 'react'
import { FolderOpen, Library, Plus, Users } from 'lucide-react'
import { addCampaign, suggestCampaignName } from '../../services/saveService'
import { useSaveStore } from '../../store/useSaveStore'
import { THEME_ACCENT } from '../../constants/theme'
import SpotlightCard from '../react-bits/SpotlightCard'
import { CampaignNameModal } from './CampaignNameModal'

function HomeOption({ icon: Icon, title, description, onClick, accent = THEME_ACCENT }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        all: 'unset',
        cursor: 'pointer',
        display: 'block',
        width: '100%',
      }}
    >
      <SpotlightCard
        spotlightColor={`${accent}22`}
        style={{
          padding: '0.95rem 1rem',
          border: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(255,255,255,0.02)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
          <div style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `${accent}18`,
            border: `1px solid ${accent}33`,
          }}>
            <Icon size={18} style={{ color: accent }} strokeWidth={2} />
          </div>
          <div style={{ minWidth: 0, textAlign: 'left' }}>
            <div style={{
              fontSize: '0.92rem',
              fontWeight: 700,
              color: '#f0f0f0',
              marginBottom: '0.25rem',
            }}>
              {title}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#888', lineHeight: 1.45 }}>
              {description}
            </div>
          </div>
        </div>
      </SpotlightCard>
    </button>
  )
}

export function WelcomeHome({ onNewCampaign, onOpenLoad, onOpenContents, onOpenCommunity }) {
  const { showToast } = useSaveStore()
  const [createOpen, setCreateOpen] = useState(false)
  const [suggestedName, setSuggestedName] = useState('')

  const openCreateModal = () => {
    setSuggestedName(suggestCampaignName())
    setCreateOpen(true)
  }

  const handleCreate = (name) => {
    try {
      const campaign = addCampaign(name)
      setCreateOpen(false)
      showToast(`Campanha "${campaign.name}" criada.`, 'success')
      onNewCampaign?.()
    } catch (e) {
      showToast(e.message || 'Erro ao criar campanha.', 'error')
    }
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '0.35rem' }}>
          <div style={{
            fontSize: '0.58rem',
            fontFamily: 'monospace',
            letterSpacing: '0.14em',
            color: THEME_ACCENT,
            marginBottom: '0.35rem',
            fontWeight: 700,
          }}>
            INÍCIO
          </div>
          <h2 style={{
            margin: 0,
            fontSize: '1.1rem',
            fontWeight: 700,
            color: '#f2f2f2',
          }}>
            O que deseja fazer?
          </h2>
        </div>

        <HomeOption
          icon={Plus}
          title="Nova campanha"
          description="Escolha um nome e comece do zero."
          onClick={openCreateModal}
        />
        <HomeOption
          icon={FolderOpen}
          title="Carregar campanha"
          description="Escolha um save local, importe ou exporte arquivos."
          onClick={onOpenLoad}
          accent="#38bdf8"
        />
        <HomeOption
          icon={Library}
          title="Conteúdos"
          description="Manuais em PDF para consultar na mesa."
          onClick={onOpenContents}
          accent="#c4b5fd"
        />
        <HomeOption
          icon={Users}
          title="Comunidade"
          description="GitHub, e-mail, sugestões e contato com o projeto."
          onClick={onOpenCommunity}
          accent="#34d399"
        />
      </div>

      <CampaignNameModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Nova campanha"
        defaultName={suggestedName}
        confirmLabel="Criar e jogar"
        onSubmit={handleCreate}
      />
    </>
  )
}
