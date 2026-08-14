import { useMemo, useState } from 'react'
import { Drawer } from 'vaul'
import * as ScrollArea from '@radix-ui/react-scroll-area'
import {
  Clock3,
  Crown,
  Dice5,
  History,
  Skull,
  Trash2,
  UserRound,
  X,
} from 'lucide-react'
import { getRollOutcome } from '../../mechanics/combat/rollOutcome'

const FILTERS = [
  { id: 'all', label: 'Todos' },
  { id: 'player', label: 'Players' },
  { id: 'enemy', label: 'Inimigos' },
]

function formatRollTime(value) {
  if (!value) return ''
  return new Date(value).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function RollHistoryItem({ roll, onDelete }) {
  const outcome = getRollOutcome(roll.dice, roll.bonus, roll.sides, roll.dc)
  const isEnemy = roll.actorType === 'enemy'
  const ActorIcon = isEnemy ? Skull : UserRound

  return (
    <article style={{
      position: 'relative',
      display: 'grid',
      gridTemplateColumns: '42px minmax(0, 1fr) auto',
      gap: '0.75rem',
      alignItems: 'center',
      padding: '0.8rem',
      borderRadius: 14,
      border: `1px solid ${outcome.color}2f`,
      background: `linear-gradient(135deg, ${outcome.color}12, rgba(255,255,255,0.018) 55%)`,
      boxShadow: `inset 0 1px 0 rgba(255,255,255,0.035), 0 10px 30px rgba(0,0,0,0.18)`,
    }}>
      <div style={{
        width: 42,
        height: 42,
        display: 'grid',
        placeItems: 'center',
        borderRadius: 12,
        color: outcome.color,
        background: `${outcome.color}18`,
        border: `1px solid ${outcome.color}3d`,
        boxShadow: `0 0 18px ${outcome.color}1e`,
      }}>
        <span style={{ fontSize: '1rem', fontWeight: 900 }}>{roll.total}</span>
      </div>

      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <ActorIcon size={11} style={{ color: isEnemy ? '#f87171' : '#a78bfa' }} />
          <strong style={{
            color: '#ededed',
            fontSize: '0.72rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {roll.characterName || 'Sem nome'}
          </strong>
          <span style={{ color: '#555', fontSize: '0.58rem', fontFamily: 'monospace' }}>
            {roll.attrLabel}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 5, flexWrap: 'wrap' }}>
          <span style={{
            color: outcome.color,
            fontSize: '0.62rem',
            fontWeight: 800,
          }}>
            {outcome.icon} {outcome.label}
          </span>
          <span style={{ color: '#616161', fontSize: '0.57rem', fontFamily: 'monospace' }}>
            d{roll.sides}: {roll.dice} {roll.bonus >= 0 ? '+' : '−'} {Math.abs(roll.bonus)} = {roll.total}
          </span>
          <span style={{ color: '#444', fontSize: '0.56rem', fontFamily: 'monospace' }}>
            CD {roll.dc}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 7 }}>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          color: '#555',
          fontSize: '0.53rem',
          fontFamily: 'monospace',
        }}>
          <Clock3 size={9} />
          {formatRollTime(roll.createdAt)}
        </span>
        <button
          type="button"
          onClick={() => onDelete(roll.id)}
          title="Remover esta rolagem"
          style={{
            display: 'grid',
            placeItems: 'center',
            width: 24,
            height: 24,
            padding: 0,
            borderRadius: 7,
            border: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(255,255,255,0.025)',
            color: '#555',
            cursor: 'pointer',
          }}
        >
          <Trash2 size={10} />
        </button>
      </div>
    </article>
  )
}

export function RollHistoryDrawer({
  rolls,
  onDelete,
  onClear,
}) {
  const [filter, setFilter] = useState('all')
  const filtered = useMemo(
    () => filter === 'all' ? rolls : rolls.filter(roll => roll.actorType === filter),
    [filter, rolls],
  )

  return (
    <Drawer.Root direction="right">
      <Drawer.Trigger asChild>
        <button
          type="button"
          title="Abrir histórico de rolagens"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            padding: '0.34rem 0.72rem',
            borderRadius: 999,
            border: '1px solid rgba(139,92,246,0.32)',
            background: 'rgba(139,92,246,0.09)',
            color: '#c4b5fd',
            cursor: 'pointer',
            fontSize: '0.62rem',
            fontFamily: 'monospace',
            fontWeight: 800,
            boxShadow: rolls.length ? '0 0 16px rgba(139,92,246,0.12)' : 'none',
          }}
        >
          <History size={12} />
          Histórico
          <span style={{
            minWidth: 18,
            height: 18,
            display: 'grid',
            placeItems: 'center',
            borderRadius: 999,
            background: rolls.length ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.05)',
            color: rolls.length ? '#ddd6fe' : '#666',
            fontSize: '0.55rem',
          }}>
            {rolls.length}
          </span>
        </button>
      </Drawer.Trigger>

      <Drawer.Portal>
        <Drawer.Overlay style={{
          position: 'fixed',
          inset: 0,
          zIndex: 90,
          background: 'rgba(0,0,0,0.58)',
          backdropFilter: 'blur(5px)',
        }} />
        <Drawer.Content
          aria-describedby={undefined}
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            zIndex: 91,
            width: 'min(430px, 94vw)',
            display: 'flex',
            flexDirection: 'column',
            outline: 'none',
            borderLeft: '1px solid rgba(167,139,250,0.2)',
            background: 'linear-gradient(180deg, rgba(14,12,20,0.985), rgba(8,8,12,0.99))',
            boxShadow: '-24px 0 70px rgba(0,0,0,0.55), -1px 0 28px rgba(139,92,246,0.08)',
          }}
        >
          <header style={{
            padding: '1rem 1rem 0.85rem',
            borderBottom: '1px solid rgba(255,255,255,0.065)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
              <div style={{
                width: 36,
                height: 36,
                display: 'grid',
                placeItems: 'center',
                borderRadius: 11,
                color: '#c4b5fd',
                background: 'rgba(139,92,246,0.14)',
                border: '1px solid rgba(139,92,246,0.3)',
                boxShadow: '0 0 20px rgba(139,92,246,0.14)',
              }}>
                <Dice5 size={17} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Drawer.Title style={{ margin: 0, color: '#f5f5f5', fontSize: '0.9rem', fontWeight: 800 }}>
                  Histórico de rolagens
                </Drawer.Title>
                <div style={{ color: '#666', fontSize: '0.58rem', fontFamily: 'monospace', marginTop: 3 }}>
                  {rolls.length} resultado{rolls.length === 1 ? '' : 's'} nesta campanha
                </div>
              </div>
              <Drawer.Close asChild>
                <button
                  type="button"
                  title="Fechar histórico"
                  style={{
                    width: 30,
                    height: 30,
                    display: 'grid',
                    placeItems: 'center',
                    padding: 0,
                    borderRadius: 9,
                    border: '1px solid rgba(255,255,255,0.07)',
                    background: 'rgba(255,255,255,0.025)',
                    color: '#777',
                    cursor: 'pointer',
                  }}
                >
                  <X size={13} />
                </button>
              </Drawer.Close>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: '0.85rem' }}>
              {FILTERS.map(option => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setFilter(option.id)}
                  style={{
                    padding: '0.28rem 0.65rem',
                    borderRadius: 999,
                    border: filter === option.id
                      ? '1px solid rgba(139,92,246,0.42)'
                      : '1px solid transparent',
                    background: filter === option.id ? 'rgba(139,92,246,0.13)' : 'transparent',
                    color: filter === option.id ? '#c4b5fd' : '#666',
                    fontSize: '0.58rem',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {option.label}
                </button>
              ))}
              {rolls.length > 0 && (
                <button
                  type="button"
                  onClick={onClear}
                  style={{
                    marginLeft: 'auto',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: '0.28rem 0.45rem',
                    border: 'none',
                    background: 'transparent',
                    color: '#7f4b4b',
                    fontSize: '0.56rem',
                    fontFamily: 'monospace',
                    cursor: 'pointer',
                  }}
                >
                  <Trash2 size={10} />
                  Limpar
                </button>
              )}
            </div>
          </header>

          <ScrollArea.Root style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
            <ScrollArea.Viewport style={{ width: '100%', height: '100%' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', padding: '0.8rem 1rem 1.5rem' }}>
                {filtered.length > 0 ? filtered.map(roll => (
                  <RollHistoryItem key={roll.id} roll={roll} onDelete={onDelete} />
                )) : (
                  <div style={{
                    minHeight: 260,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    color: '#555',
                  }}>
                    <Crown size={25} style={{ color: '#4c3c69', marginBottom: 10 }} />
                    <strong style={{ color: '#777', fontSize: '0.72rem' }}>Nenhuma rolagem ainda</strong>
                    <span style={{ fontSize: '0.6rem', marginTop: 5, maxWidth: 220, lineHeight: 1.5 }}>
                      As rolagens de players e inimigos aparecerão aqui automaticamente.
                    </span>
                  </div>
                )}
              </div>
            </ScrollArea.Viewport>
          </ScrollArea.Root>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
