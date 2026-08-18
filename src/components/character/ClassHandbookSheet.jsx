import { getClassHandbook } from '../../data/classHandbooks'

export const HANDBOOK_SHEET_WIDTH = 794

const SHEET = {
  width: HANDBOOK_SHEET_WIDTH,
  boxSizing: 'border-box',
  padding: '36px 40px 32px',
  background: '#0c0c10',
  color: '#e8e8e8',
  fontFamily: 'Inter, system-ui, sans-serif',
}

function Label({ children, color = '#7a7a7a' }) {
  return (
    <div style={{
      fontSize: 10,
      fontFamily: 'ui-monospace, monospace',
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      color,
      marginBottom: 8,
    }}>
      {children}
    </div>
  )
}

function Chip({ children, color = '#888' }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      fontSize: 10,
      fontFamily: 'ui-monospace, monospace',
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color,
      background: `${color}18`,
      border: `1px solid ${color}44`,
      borderRadius: 999,
      padding: '3px 8px',
      whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  )
}

function SkillCard({ skill, accent, index }) {
  return (
    <div style={{
      padding: '14px 16px',
      borderRadius: 12,
      border: '1px solid rgba(255,255,255,0.08)',
      borderLeft: `3px solid ${accent}`,
      background: 'rgba(255,255,255,0.03)',
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, marginBottom: 8 }}>
        <div style={{ fontSize: 16, fontWeight: 750, color: '#f4f4f4' }}>
          {index}. {skill.name}
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <Chip color="#22d3ee">Ativa</Chip>
          {skill.cooldownTurns > 0 ? <Chip color="#888">CD {skill.cooldownTurns}</Chip> : null}
          {skill.overloadCost > 0 ? <Chip color="#a855f7">Ruptura +{skill.overloadCost}</Chip> : null}
        </div>
      </div>
      <p style={{ margin: '0 0 8px', fontSize: 13, lineHeight: 1.55, color: '#c8c8c8' }}>
        {skill.description}
      </p>
      {skill.effect ? (
        <p style={{ margin: '0 0 6px', fontSize: 12, lineHeight: 1.5, color: '#d4d4d4' }}>
          <span style={{ color: '#67e8f9', fontFamily: 'ui-monospace, monospace', letterSpacing: '0.06em' }}>EFEITO · </span>
          {skill.effect}
        </p>
      ) : null}
      {skill.consequence ? (
        <p style={{ margin: '0 0 8px', fontSize: 12, lineHeight: 1.5, color: '#c4c4c4' }}>
          <span style={{ color: '#f87171', fontFamily: 'ui-monospace, monospace', letterSpacing: '0.06em' }}>CONSEQUÊNCIA · </span>
          {skill.consequence}
        </p>
      ) : null}
      {skill.levels?.length ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {skill.levels.map(line => (
            <div key={line} style={{ fontSize: 12, lineHeight: 1.45, color: '#a3a3a3' }}>
              {line}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export function ClassHandbookSheet({ classId }) {
  const book = getClassHandbook(classId)
  if (!book) return null
  const accent = book.color || '#06b6d4'

  return (
    <div data-class-handbook-sheet="true" style={SHEET}>
      <header style={{
        paddingBottom: 20,
        marginBottom: 22,
        borderBottom: `1px solid ${accent}44`,
      }}>
        <div style={{
          fontSize: 11,
          fontFamily: 'ui-monospace, monospace',
          letterSpacing: '0.18em',
          color: accent,
          marginBottom: 8,
        }}>
          GUIA DE CLASSE
        </div>
        <h1 style={{ margin: 0, fontSize: 36, fontWeight: 800, letterSpacing: '-0.04em', color: '#f8f8f8' }}>
          {book.label}
        </h1>
        <p style={{ margin: '8px 0 0', fontSize: 15, color: '#a0a0a0', lineHeight: 1.45 }}>
          {book.tagline}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14 }}>
          {book.attributes.map(label => (
            <Chip key={label} color={accent}>{label}</Chip>
          ))}
          <Chip color="#888">{book.weapons}</Chip>
        </div>
      </header>

      <section style={{ marginBottom: 22 }}>
        <Label color={accent}>Como funciona</Label>
        {book.overview.map(p => (
          <p key={p} style={{ margin: '0 0 10px', fontSize: 13.5, lineHeight: 1.6, color: '#d0d0d0' }}>{p}</p>
        ))}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
          {book.howItWorks.map(line => (
            <div key={line} style={{ fontSize: 12.5, lineHeight: 1.5, color: '#b5b5b5', paddingLeft: 12, borderLeft: `2px solid ${accent}55` }}>
              {line}
            </div>
          ))}
        </div>
      </section>

      <section style={{
        marginBottom: 22,
        padding: '14px 16px',
        borderRadius: 12,
        background: `${accent}10`,
        border: `1px solid ${accent}33`,
      }}>
        <Label color={accent}>Passiva · {book.passive.name}</Label>
        <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55, color: '#e2e2e2' }}>
          {book.passive.description}
        </p>
        {book.passive.narrative ? (
          <p style={{ margin: '10px 0 0', fontSize: 12, lineHeight: 1.5, color: '#9ca3af' }}>
            Passiva narrativa. Não altera números na ficha; o mestre interpreta na cena.
          </p>
        ) : null}
      </section>

      <section style={{
        marginBottom: 22,
        padding: '14px 16px',
        borderRadius: 12,
        background: 'rgba(248,113,113,0.06)',
        border: '1px solid rgba(248,113,113,0.18)',
      }}>
        <Label color="#f87171">{book.recoilRule.title}</Label>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: '#d4d4d4' }}>
          {book.recoilRule.text}
        </p>
      </section>

      <section>
        <Label color={accent}>Skills</Label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {book.skills.map((skill, i) => (
            <SkillCard key={skill.name} skill={skill} accent={accent} index={i + 1} />
          ))}
        </div>
      </section>

      <footer style={{
        marginTop: 24,
        paddingTop: 14,
        borderTop: '1px solid rgba(255,255,255,0.08)',
        fontSize: 11,
        color: '#666',
        lineHeight: 1.5,
      }}>
        A quarta skill é da arma equipada. Este guia cobre só a classe Traçado.
      </footer>
    </div>
  )
}
