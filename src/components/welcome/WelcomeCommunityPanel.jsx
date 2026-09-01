import React from 'react'
import {
  ArrowLeft,
  ExternalLink,
  FolderGit2,
  Mail,
  MessageCircle,
  User,
} from 'lucide-react'
import { COMMUNITY_LINKS } from '../../constants/welcomeIntro'
import { THEME_ACCENT } from '../../constants/theme'
import SpotlightCard from '../react-bits/SpotlightCard'

const LINK_ICONS = {
  repo: FolderGit2,
  issues: MessageCircle,
  author: User,
  email: Mail,
}

const LINK_ACCENTS = {
  repo: '#a78bfa',
  issues: '#38bdf8',
  author: '#94a3b8',
  email: '#f472b6',
}

function CommunityLinkCard({ item }) {
  const Icon = LINK_ICONS[item.id] || FolderGit2
  const accent = LINK_ACCENTS[item.id] || THEME_ACCENT

  return (
    <a
      href={item.href}
      target="_blank"
      rel="noreferrer"
      style={{ textDecoration: 'none', display: 'block' }}
    >
      <SpotlightCard
        spotlightColor={`${accent}22`}
        style={{
          padding: '0.85rem 0.95rem',
          border: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(255,255,255,0.02)',
          cursor: 'pointer',
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
            <Icon size={17} style={{ color: accent }} strokeWidth={2} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.5rem',
              marginBottom: '0.2rem',
            }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f0f0f0' }}>
                {item.title}
              </span>
              <ExternalLink size={13} style={{ color: '#555', flexShrink: 0 }} />
            </div>
            <p style={{
              margin: 0,
              fontSize: '0.72rem',
              color: '#888',
              lineHeight: 1.45,
              wordBreak: 'break-word',
            }}>
              {item.description}
            </p>
          </div>
        </div>
      </SpotlightCard>
    </a>
  )
}

export function WelcomeCommunityPanel({ onBack }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem' }}>
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
            COMUNIDADE
          </div>
          <h2 style={{
            fontSize: '1.1rem',
            fontWeight: 700,
            color: '#f0f0f0',
            marginBottom: 0,
          }}>
            Projeto e contato
          </h2>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
        {COMMUNITY_LINKS.map(item => (
          <CommunityLinkCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  )
}
