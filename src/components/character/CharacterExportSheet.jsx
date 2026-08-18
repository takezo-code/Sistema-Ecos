import { buildCharacterSheetSnapshot } from '../../services/characterSheetSnapshot'

export const EXPORT_SHEET_WIDTH = 794

const SHEET = {
  width: EXPORT_SHEET_WIDTH,
  minHeight: 1123,
  boxSizing: 'border-box',
  padding: '28px 32px 24px',
  background: '#0c0c10',
  color: '#e8e8e8',
  fontFamily: 'Inter, system-ui, sans-serif',
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

function Stat({ label, value, hint, color = '#f0f0f0' }) {
  return (
    <div style={{
      flex: 1,
      minWidth: 0,
      padding: '10px 12px',
      borderRadius: 10,
      border: '1px solid rgba(255,255,255,0.08)',
      background: 'rgba(255,255,255,0.03)',
    }}>
      <div style={{
        fontSize: 9,
        fontFamily: 'ui-monospace, monospace',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: '#6b6b6b',
        marginBottom: 4,
      }}>
        {label}
      </div>
      <div style={{ fontSize: 20, fontWeight: 800, color, letterSpacing: '-0.03em', lineHeight: 1 }}>
        {value}
      </div>
      {hint ? (
        <div style={{ marginTop: 4, fontSize: 10, color: '#666' }}>{hint}</div>
      ) : null}
    </div>
  )
}

function AttrGrid({ items }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
      {items.map(attr => (
        <div
          key={attr.key}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            padding: '7px 10px',
            borderRadius: 8,
            border: `1px solid ${attr.color}33`,
            background: `${attr.color}10`,
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 650, color: '#d8d8d8' }}>{attr.label}</span>
          <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 4 }}>
            <strong style={{ fontSize: 16, color: attr.color, fontWeight: 800 }}>{attr.value}</strong>
            {attr.classBonusLabel ? (
              <span style={{ fontSize: 10, color: '#c4c4c4', fontFamily: 'ui-monospace, monospace' }}>
                {attr.classBonusLabel}
              </span>
            ) : null}
          </span>
        </div>
      ))}
    </div>
  )
}

function GearThumb({ src, fallback }) {
  return (
    <div style={{
      width: 48,
      height: 48,
      flexShrink: 0,
      borderRadius: 8,
      overflow: 'hidden',
      background: '#141418',
      border: '1px solid rgba(255,255,255,0.08)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#444',
      fontSize: 9,
      fontFamily: 'ui-monospace, monospace',
    }}>
      {src ? (
        <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      ) : fallback}
    </div>
  )
}

function GearCard({ title, accent, item, emptyText, extra = null }) {
  return (
    <div style={{
      flex: 1,
      minWidth: 0,
      padding: 12,
      borderRadius: 12,
      border: `1px solid ${accent}33`,
      background: 'rgba(255,255,255,0.025)',
    }}>
      <Label color={accent}>{title}</Label>
      {!item ? (
        <div style={{ fontSize: 12, color: '#555' }}>{emptyText}</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <GearThumb src={item.image} fallback={title.slice(0, 3).toUpperCase()} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 750, color: '#f2f2f2', lineHeight: 1.25 }}>
                {item.name}
              </div>
              {item.kind ? (
                <div style={{ marginTop: 6 }}>
                  <Chip color="#f97316">{item.kind}</Chip>
                </div>
              ) : null}
            </div>
          </div>
          {item.passives?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {item.passives.map(line => (
                <div
                  key={line}
                  style={{
                    fontSize: 11,
                    fontFamily: 'ui-monospace, monospace',
                    color: '#cfcfcf',
                    padding: '5px 8px',
                    borderRadius: 6,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  {line}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 11, color: '#555' }}>Sem atributos de item</div>
          )}
          {extra}
        </div>
      )}
    </div>
  )
}

function SkillBlock({ skill }) {
  return (
    <div style={{
      padding: '10px 12px',
      borderRadius: 10,
      borderLeft: `3px solid ${skill.typeColor}`,
      border: '1px solid rgba(255,255,255,0.07)',
      borderLeftWidth: 3,
      borderLeftColor: skill.typeColor,
      background: 'rgba(255,255,255,0.025)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          {skill.iconSrc ? (
            <img
              src={skill.iconSrc}
              alt=""
              style={{
                width: 28,
                height: 28,
                objectFit: 'cover',
                borderRadius: 6,
                flexShrink: 0,
                background: '#111',
              }}
            />
          ) : null}
          <strong style={{ fontSize: 13, color: '#f3f3f3' }}>{skill.name}</strong>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <Chip color={skill.typeColor}>{skill.typeLabel}</Chip>
          <Chip color="#a855f7">{skill.levelLabel}</Chip>
        </div>
      </div>
      {skill.description ? (
        <p style={{ margin: '0 0 6px', fontSize: 12, lineHeight: 1.5, color: '#bdbdbd' }}>{skill.description}</p>
      ) : null}
      {skill.mechanicalEffect ? (
        <p style={{ margin: 0, fontSize: 11, lineHeight: 1.45, color: '#d4d4d4' }}>
          <span style={{ color: '#888', fontFamily: 'ui-monospace, monospace', letterSpacing: '0.06em' }}>EFEITO · </span>
          {skill.mechanicalEffect}
        </p>
      ) : null}
      {skill.narrativeConsequence ? (
        <p style={{ margin: '4px 0 0', fontSize: 11, lineHeight: 1.45, color: '#9a9a9a' }}>
          <span style={{ color: '#666', fontFamily: 'ui-monospace, monospace', letterSpacing: '0.06em' }}>CONSEQUÊNCIA · </span>
          {skill.narrativeConsequence}
        </p>
      ) : null}
    </div>
  )
}

export function CharacterExportSheet({ entity, kind }) {
  const sheet = buildCharacterSheetSnapshot(entity, kind)
  const accent = sheet.identity?.color || '#a855f7'
  const xpLabel = sheet.xpToNext == null
    ? String(sheet.xp)
    : `${sheet.xp} / ${sheet.xpToNext}`

  return (
    <div data-character-export-sheet="true" style={SHEET}>
      <header style={{
        display: 'flex',
        gap: 16,
        alignItems: 'center',
        paddingBottom: 18,
        marginBottom: 16,
        borderBottom: `1px solid ${accent}44`,
      }}>
        <div style={{
          width: 84,
          height: 84,
          borderRadius: 14,
          overflow: 'hidden',
          background: '#141418',
          border: `1px solid ${accent}55`,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#444',
          fontSize: 11,
          fontFamily: 'ui-monospace, monospace',
        }}>
          {sheet.image ? (
            <img src={sheet.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          ) : 'RETRATO'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', color: '#f7f7f7', lineHeight: 1.1 }}>
            {sheet.name}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6, marginTop: 8 }}>
            <Chip color={accent}>{sheet.identity?.label}</Chip>
            <Chip color="#c084fc">NVL {sheet.level}</Chip>
            {sheet.organization ? <Chip color="#d97706">{sheet.organization}</Chip> : null}
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
        <Stat label="Experiência" value={xpLabel} hint={sheet.xpToNext == null ? 'Nível máximo' : 'atual / próximo'} />
        {sheet.ecoAvailable != null ? (
          <Stat label="Ecos disponíveis" value={sheet.ecoAvailable} color="#c084fc" />
        ) : null}
        <Stat label="Vida máxima" value={sheet.lifeMax} color="#4ade80" hint="Vitalidade + armadura" />
        {sheet.rupturaMax != null ? (
          <Stat label="Limite de Ruptura" value={sheet.rupturaMax} color="#fbbf24" hint={sheet.rupturaSources || undefined} />
        ) : null}
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
        <section style={{ flex: 1, minWidth: 0 }}>
          <Label>Atributos físicos</Label>
          <AttrGrid items={sheet.physical} />
        </section>
        <section style={{ flex: 1, minWidth: 0 }}>
          <Label>Atributos de cena</Label>
          <AttrGrid items={sheet.social} />
        </section>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
        <GearCard
          title="Arma"
          accent="#f97316"
          item={sheet.weapon}
          emptyText="Nenhuma arma forjada"
          extra={sheet.weapon?.skill ? (
            <div style={{
              padding: '8px 10px',
              borderRadius: 8,
              background: 'rgba(249,115,22,0.08)',
              border: '1px solid rgba(249,115,22,0.22)',
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#fdba74', marginBottom: 4 }}>
                {sheet.weapon.skill.name}
              </div>
              {sheet.weapon.skill.mechanicalEffect || sheet.weapon.skill.description ? (
                <p style={{ margin: 0, fontSize: 11, lineHeight: 1.45, color: '#d6d6d6' }}>
                  {sheet.weapon.skill.mechanicalEffect || sheet.weapon.skill.description}
                </p>
              ) : null}
              <div style={{ marginTop: 6, fontSize: 10, fontFamily: 'ui-monospace, monospace', color: '#9a9a9a' }}>
                CD {sheet.weapon.skill.cooldownTurns} turnos · Eco {sheet.weapon.skill.overloadCost}
              </div>
            </div>
          ) : null}
        />
        <GearCard
          title="Armadura"
          accent="#38bdf8"
          item={sheet.armor}
          emptyText="Nenhuma armadura forjada"
        />
      </div>

      {(sheet.hasEco || sheet.skills.length > 0) && (
        <section>
          <Label color="#a855f7">Habilidades</Label>
          {sheet.skills.length === 0 ? (
            <div style={{ fontSize: 12, color: '#555' }}>Nenhuma skill aprendida</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {sheet.skills.map(skill => (
                <SkillBlock key={skill.id} skill={skill} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
