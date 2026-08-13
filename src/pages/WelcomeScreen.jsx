import React, { useMemo, useRef, useState } from 'react'
import {
  BookOpen,
  FileDown,
  FolderGit2,
  Hexagon,
  LayoutGrid,
  Plus,
  Sparkles,
  Swords,
  Upload,
} from 'lucide-react'
import { initializeNewCampaign, importCampaign } from '../services/saveService'
import { useSaveStore } from '../store/useSaveStore'
import { THEME_ACCENT, THEME_ACCENT_SOFT, THEME_ACCENT_BORDER } from '../constants/theme'
import {
  GITHUB_REPO_URL,
  MANUAL_JOGADOR_URL,
  MANUAL_MESTRE_URL,
} from '../constants/welcomeIntro'
import Carousel from '../components/react-bits/Carousel'

function IntroLink({ href, icon: Icon, children, download }) {
  return (
    <a
      href={href}
      {...(download
        ? { download }
        : { target: '_blank', rel: 'noreferrer' })}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.4rem',
        padding: '0.55rem 0.75rem',
        border: '1px solid #2a2a2a',
        borderRadius: '4px',
        color: '#c4b5fd',
        fontSize: '0.68rem',
        fontFamily: 'monospace',
        letterSpacing: '0.08em',
        textDecoration: 'none',
        background: 'rgba(168,85,247,0.08)',
      }}
    >
      <Icon size={13} />
      {children}
    </a>
  )
}

export function WelcomeScreen({ onEnter, canContinue = false }) {
  const fileRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const { showToast } = useSaveStore()

  const introItems = useMemo(() => [
    {
      id: 1,
      title: 'O que é Ecos',
      description: 'RPG temporal. Vocês são marcados pelo Eco — uma força que dobra o tempo, a percepção e o corpo. Não é magia limpa: cada uso deixa resíduo.',
      icon: <Sparkles className="h-3.5 w-3.5 text-[#a855f7]" />,
    },
    {
      id: 2,
      title: 'Combate sem HP',
      description: 'Dano vira marcas (Leve, Média, Grave). Conforme elas sobem, o corpo piora: Saudável → Ferido → Grave → Incapacitado. Vitalidade só atrasa a queda.',
      icon: <Swords className="h-3.5 w-3.5 text-[#a855f7]" />,
    },
    {
      id: 3,
      title: 'Eco e sobrecarga',
      description: 'Skills gastam usos de Ruptura. No limite (ex.: 9/9) ainda é Estável. O próximo uso acima (10/9) vira Abalado — e a mente degrada se continuar.',
      icon: <Hexagon className="h-3.5 w-3.5 text-[#a855f7]" />,
    },
    {
      id: 4,
      title: 'Como usar o app',
      description: 'Campanha, fichas, combate e criação. O app organiza rolagem, atributos e Eco. Marcas e a narrativa final ficam com o mestre.',
      icon: <LayoutGrid className="h-3.5 w-3.5 text-[#a855f7]" />,
    },
    {
      id: 5,
      title: 'Manuais (PDF)',
      description: 'Abra o manual no navegador e use Ctrl+P → Salvar como PDF. Há uma versão para o mestre e outra para os jogadores.',
      icon: <FileDown className="h-3.5 w-3.5 text-[#a855f7]" />,
      footer: (
        <>
          <IntroLink href={MANUAL_MESTRE_URL} icon={BookOpen}>
            Manual do mestre
          </IntroLink>
          <IntroLink href={MANUAL_JOGADOR_URL} icon={BookOpen}>
            Manual do jogador
          </IntroLink>
        </>
      ),
    },
    {
      id: 6,
      title: 'Código no GitHub',
      description: 'O app é aberto. Issues, clones e contribuições ficam no repositório.',
      icon: <FolderGit2 className="h-3.5 w-3.5 text-[#a855f7]" />,
      footer: (
        <IntroLink href={GITHUB_REPO_URL} icon={FolderGit2}>
          takezo-code/sistema-rpg
        </IntroLink>
      ),
    },
  ], [])

  const handleNew = () => {
    setLoading(true)
    try {
      initializeNewCampaign('Nova Campanha')
      showToast('Nova campanha criada.', 'success')
      onEnter?.()
    } catch (e) {
      showToast(e.message || 'Erro ao criar campanha.', 'error')
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
    if (result.ok) onEnter?.()
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'transparent',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'auto',
      zIndex: 100,
    }}>

      <div style={{
        position: 'relative',
        zIndex: 1,
        textAlign: 'center',
        maxWidth: '520px',
        width: '100%',
        padding: '2rem 1.25rem 2.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '48px',
          height: '48px',
          border: `1px solid ${THEME_ACCENT_BORDER}`,
          borderRadius: '4px',
          marginBottom: '1rem',
          background: THEME_ACCENT_SOFT,
        }}>
          <Hexagon size={24} style={{ color: THEME_ACCENT }} strokeWidth={1.5} />
        </div>

        <h1 style={{
          fontSize: 'clamp(1.5rem, 5vw, 2rem)',
          fontWeight: 800,
          letterSpacing: '0.2em',
          color: '#e5e5e5',
          fontFamily: 'monospace',
          marginBottom: '0.4rem',
        }}>
          ECOS
        </h1>

        <p style={{
          fontSize: '0.7rem',
          color: '#555',
          fontFamily: 'monospace',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          marginBottom: '1.5rem',
          lineHeight: 1.6,
        }}>
          Sistema de gerenciamento narrativo temporal
        </p>

        <Carousel
          items={introItems}
          baseWidth={440}
          loop
          pauseOnHover
        />

        <p style={{
          margin: '0.75rem 0 1.25rem',
          fontSize: '0.6rem',
          color: '#333',
          fontFamily: 'monospace',
          letterSpacing: '0.1em',
        }}>
          ARRASTE OS CARDS · INTRODUÇÃO
        </p>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          width: '100%',
          maxWidth: '440px',
        }}>
          <button
            type="button"
            disabled={loading}
            onClick={handleNew}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.625rem',
              padding: '1rem 1.5rem',
              background: `linear-gradient(135deg, ${THEME_ACCENT_BORDER} 0%, ${THEME_ACCENT_SOFT} 100%)`,
              border: `1px solid ${THEME_ACCENT_BORDER}`,
              borderRadius: '4px',
              color: '#e5e5e5',
              fontSize: '0.8rem',
              fontFamily: 'monospace',
              letterSpacing: '0.15em',
              fontWeight: 600,
              cursor: loading ? 'wait' : 'pointer',
              transition: 'border-color 0.2s, background 0.2s',
            }}
            onMouseEnter={e => {
              if (!loading) {
                e.currentTarget.style.borderColor = THEME_ACCENT
                e.currentTarget.style.background = 'rgba(37,99,235,0.2)'
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = THEME_ACCENT_BORDER
              e.currentTarget.style.background = `linear-gradient(135deg, ${THEME_ACCENT_BORDER} 0%, ${THEME_ACCENT_SOFT} 100%)`
            }}
          >
            <Plus size={16} />
            NOVA CAMPANHA
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={handleImportClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.625rem',
              padding: '1rem 1.5rem',
              background: 'transparent',
              border: '1px solid #2a2a2a',
              borderRadius: '4px',
              color: '#888',
              fontSize: '0.8rem',
              fontFamily: 'monospace',
              letterSpacing: '0.15em',
              fontWeight: 600,
              cursor: loading ? 'wait' : 'pointer',
              transition: 'border-color 0.2s, color 0.2s',
            }}
            onMouseEnter={e => {
              if (!loading) {
                e.currentTarget.style.borderColor = '#444'
                e.currentTarget.style.color = '#e5e5e5'
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '#2a2a2a'
              e.currentTarget.style.color = '#888'
            }}
          >
            <Upload size={16} />
            IMPORTAR CAMPANHA
          </button>

          {canContinue && (
            <button
              type="button"
              disabled={loading}
              onClick={() => onEnter?.()}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.625rem',
                padding: '1rem 1.5rem',
                background: 'transparent',
                border: 'none',
                color: '#555',
                fontSize: '0.75rem',
                fontFamily: 'monospace',
                letterSpacing: '0.12em',
                fontWeight: 600,
                cursor: loading ? 'wait' : 'pointer',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#e5e5e5' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#555' }}
            >
              CONTINUAR CAMPANHA
            </button>
          )}
        </div>
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
