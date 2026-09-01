import { buildOrganizationSheetSnapshot } from '../../services/characterSheetSnapshot'
import { EXPORT_SHEET_WIDTH } from './CharacterExportSheet'

const ACCENT = '#d97706'

const SHEET_BG = '#0c0c10'

const SHEET = {
  width: EXPORT_SHEET_WIDTH,
  boxSizing: 'border-box',
  padding: '28px 32px 24px',
  background: SHEET_BG,
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

function TextBlock({ title, text, color }) {
  if (!text) return null
  return (
    <section style={{
      padding: 14,
      borderRadius: 12,
      border: `1px solid ${color}33`,
      background: 'rgba(255,255,255,0.025)',
      marginBottom: 12,
    }}>
      <Label color={color}>{title}</Label>
      <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: '#cfcfcf', whiteSpace: 'pre-wrap' }}>
        {text}
      </p>
    </section>
  )
}

export function OrganizationExportSheet({ org }) {
  const sheet = buildOrganizationSheetSnapshot(org)
  const empty = !sheet.description && !sheet.ideology && !sheet.allies && !sheet.enemies

  return (
    <div data-character-export-sheet="true" style={SHEET}>
      <header style={{
        display: 'flex',
        gap: 16,
        alignItems: 'center',
        paddingBottom: 18,
        marginBottom: 18,
        borderBottom: `1px solid ${ACCENT}44`,
      }}>
        <div style={{
          width: 84,
          height: 84,
          borderRadius: 14,
          overflow: 'hidden',
          background: 'rgba(217,119,6,0.12)',
          border: `1px solid ${ACCENT}55`,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: ACCENT,
          fontSize: sheet.symbol ? 32 : 11,
          fontFamily: 'ui-monospace, monospace',
        }}>
          {sheet.image ? (
            <img src={sheet.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          ) : (sheet.symbol || 'ORG')}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', color: '#f7f7f7', lineHeight: 1.1 }}>
            {sheet.name}
          </div>
          <div style={{
            marginTop: 8,
            display: 'inline-flex',
            fontSize: 10,
            fontFamily: 'ui-monospace, monospace',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: ACCENT,
            background: `${ACCENT}18`,
            border: `1px solid ${ACCENT}44`,
            borderRadius: 999,
            padding: '3px 8px',
          }}>
            Organização
          </div>
        </div>
      </header>

      {empty ? (
        <div style={{ fontSize: 13, color: '#666' }}>Sem descrição preenchida.</div>
      ) : (
        <>
          <TextBlock title="Descrição" text={sheet.description} color="#94a3b8" />
          <TextBlock title="Ideologia" text={sheet.ideology} color="#eab308" />
          <div style={{ display: 'flex', gap: 12 }}>
            {sheet.allies ? (
              <div style={{ flex: 1, minWidth: 0 }}>
                <TextBlock title="Aliados" text={sheet.allies} color="#4ade80" />
              </div>
            ) : null}
            {sheet.enemies ? (
              <div style={{ flex: 1, minWidth: 0 }}>
                <TextBlock title="Inimigos" text={sheet.enemies} color="#f87171" />
              </div>
            ) : null}
          </div>
        </>
      )}
    </div>
  )
}
