import React, { useMemo } from 'react'
import { Plus, Check } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { EntityThumb } from '../ui/EntityThumb'
import { Button } from '../ui/Button'

const PAPEL_META = {
  boss: { label: 'Boss', color: '#dc2626' },
  elite: { label: 'Elite', color: '#d97706' },
  capanga: { label: 'Capanga', color: '#6b7280' },
  nenhum: { label: 'NPC', color: '#06b6d4' },
}

function EnemyPickerRow({ enemy, inCombat, onAdd }) {
  const papel = PAPEL_META[enemy.papelCombate] ?? PAPEL_META.nenhum

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.65rem 0.7rem',
      borderRadius: 12,
      border: '1px solid rgba(255,255,255,0.06)',
      background: inCombat ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.03)',
    }}>
      <EntityThumb src={enemy.image} alt={enemy.name} size={44} borderRadius="10px" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '0.85rem',
          fontWeight: 700,
          color: '#f0f0f0',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {enemy.name}
        </div>
        <div style={{
          marginTop: 3,
          fontSize: '0.58rem',
          fontFamily: 'monospace',
          letterSpacing: '0.06em',
          color: papel.color,
        }}>
          {papel.label}
        </div>
      </div>
      {inCombat ? (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          fontSize: '0.62rem',
          fontFamily: 'monospace',
          color: '#6b7280',
          flexShrink: 0,
        }}>
          <Check size={12} />
          No combate
        </span>
      ) : (
        <Button
          size="xs"
          onClick={() => onAdd(enemy.id)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, flexShrink: 0 }}
        >
          <Plus size={12} />
          Adicionar
        </Button>
      )}
    </div>
  )
}

function EnemySection({ title, accent, enemies, activeEnemyIds, onAdd }) {
  if (!enemies.length) return null

  return (
    <section>
      <div style={{
        fontSize: '0.58rem',
        fontFamily: 'monospace',
        letterSpacing: '0.12em',
        color: accent,
        marginBottom: '0.5rem',
        fontWeight: 700,
      }}>
        {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
        {enemies.map(enemy => (
          <EnemyPickerRow
            key={enemy.id}
            enemy={enemy}
            inCombat={activeEnemyIds.includes(enemy.id)}
            onAdd={onAdd}
          />
        ))}
      </div>
    </section>
  )
}

export function CombatEnemyPickerModal({
  open,
  onClose,
  enemies = [],
  activeEnemyIds = [],
  onAdd,
}) {
  const { bosses, npcs } = useMemo(() => {
    const bossList = []
    const npcList = []
    enemies.forEach(enemy => {
      if (enemy.papelCombate === 'boss') bossList.push(enemy)
      else npcList.push(enemy)
    })
    return { bosses: bossList, npcs: npcList }
  }, [enemies])

  const empty = enemies.length === 0

  return (
    <Modal open={open} onClose={onClose} title="Adicionar ao combate" maxWidth="480px">
      {empty ? (
        <p style={{ margin: 0, fontSize: '0.82rem', color: '#888', lineHeight: 1.5 }}>
          Nenhum boss ou NPC disponível nesta campanha.
          Crie em <strong style={{ color: '#ccc' }}>Criação</strong> ou em
          {' '}<strong style={{ color: '#ccc' }}>Gerenciamento</strong>.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <EnemySection
            title="BOSSES"
            accent="#dc2626"
            enemies={bosses}
            activeEnemyIds={activeEnemyIds}
            onAdd={onAdd}
          />
          <EnemySection
            title="NPCS"
            accent="#06b6d4"
            enemies={npcs}
            activeEnemyIds={activeEnemyIds}
            onAdd={onAdd}
          />
        </div>
      )}
    </Modal>
  )
}
