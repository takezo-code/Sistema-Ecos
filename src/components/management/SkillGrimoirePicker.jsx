import React, { useMemo, useState } from 'react'
import { Search, Sparkles, X, Plus, ChevronUp } from 'lucide-react'
import { getMergedCatalog } from '../../services/skillsCatalogService'
import { SKILL_AUDIENCE, SKILL_AUDIENCE_META } from '../../constants/skillAudience'
import { buildSkillInstanceFromCatalog } from '../../services/ecoSkillRuntimeService'
import { Button } from '../ui/Button'

/**
 * Escolha manual de habilidades do grimório (catálogo builtin + custom).
 * @param {object[]} selectedSkills - instâncias já na ficha
 * @param {(instance: object) => void} onAdd
 * @param {(skillId: string) => void} onRemove
 * @param {boolean} freePick - mestre: não exige Eco
 */
export function SkillGrimoirePicker({
  selectedSkills = [],
  onAdd,
  onRemove,
  freePick = true,
  compact = false,
  audience = SKILL_AUDIENCE.CHARACTER,
}) {
  const [search, setSearch] = useState('')
  const [listOpen, setListOpen] = useState(false)
  const catalog = useMemo(() => getMergedCatalog(audience), [audience])
  const ownedIds = new Set((selectedSkills || []).map(s => s.templateId))

  const available = useMemo(() => {
    const q = search.trim().toLowerCase()
    return catalog.filter(s => {
      if (ownedIds.has(s.templateId)) return false
      if (!q) return true
      return (
        s.name?.toLowerCase().includes(q)
        || s.description?.toLowerCase().includes(q)
        || s.mechanicalEffect?.toLowerCase().includes(q)
      )
    })
  }, [catalog, ownedIds, search])

  const canAddMore = catalog.some(s => !ownedIds.has(s.templateId))

  const closeList = () => {
    setListOpen(false)
    setSearch('')
  }

  const openList = () => {
    setSearch('')
    setListOpen(true)
  }

  const handleAdd = (templateId) => {
    const instance = buildSkillInstanceFromCatalog(templateId)
    if (!instance) return
    onAdd?.(instance)
    closeList()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Sparkles size={14} style={{ color: '#a855f7' }} />
        <span style={{ fontSize: '0.65rem', color: '#444', fontFamily: 'monospace', letterSpacing: '0.08em' }}>
          GRIMÓRIO · {SKILL_AUDIENCE_META[audience]?.label?.toUpperCase() || 'SKILLS'}
        </span>
        {freePick && (
          <span style={{ fontSize: '0.6rem', color: '#333', marginLeft: 'auto' }}>Seleção manual (mestre)</span>
        )}
      </div>

      {(selectedSkills || []).length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <div style={{ fontSize: '0.6rem', color: '#555', fontFamily: 'monospace' }}>
            {selectedSkills.length} HABILIDADE(S) ESCOLHIDA(S)
          </div>
          {selectedSkills.map(skill => (
            <div
              key={skill.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.5rem',
                padding: '0.5rem 0.65rem',
                background: '#111',
                border: '1px solid rgba(168,85,247,0.2)',
                borderRadius: '3px',
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e5e5e5' }}>{skill.name}</div>
                <div style={{ fontSize: '0.6rem', color: '#555', fontFamily: 'monospace' }}>
                  {skill.skillType?.toUpperCase?.() || 'ATIVA'} · Tier {skill.tier ?? 1}
                </div>
              </div>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => onRemove?.(skill.id)}
                title="Remover"
                style={{ padding: '4px', color: '#555' }}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ fontSize: '0.75rem', color: '#444', margin: 0 }}>
          Nenhuma habilidade escolhida ainda.
        </p>
      )}

      {!listOpen ? (
        <Button
          type="button"
          variant="secondary"
          disabled={!canAddMore}
          onClick={openList}
          block
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontSize: '0.8rem',
            opacity: canAddMore ? 1 : 0.5,
          }}
        >
          <Plus size={14} style={{ color: '#a855f7' }} />
          Adicionar skill
        </Button>
      ) : (
        <div style={{
          padding: '0.75rem',
          background: '#0d0d0d',
          border: '1px solid rgba(168,85,247,0.25)',
          borderRadius: '4px',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.65rem', color: '#888', fontFamily: 'monospace' }}>
              ESCOLHER DO GRIMÓRIO
            </span>
            <button
              type="button"
              className="btn-ghost"
              onClick={closeList}
              style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.65rem', padding: '2px 4px' }}
            >
              <ChevronUp size={12} />
              Fechar
            </button>
          </div>

          <div style={{ position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#333' }} />
            <input
              className="input-base"
              style={{ paddingLeft: '2rem', fontSize: '0.8rem', width: '100%' }}
              placeholder="Buscar no grimório..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem',
            maxHeight: compact ? '200px' : '280px',
            overflowY: 'auto',
          }}>
            {available.length === 0 ? (
              <p style={{ fontSize: '0.75rem', color: '#444', textAlign: 'center', padding: '1rem', margin: 0 }}>
                {search ? 'Nenhuma habilidade encontrada.' : 'Todas as habilidades do grimório já foram adicionadas.'}
              </p>
            ) : (
              available.map(skill => (
                <button
                  key={skill.templateId}
                  type="button"
                  onClick={() => handleAdd(skill.templateId)}
                  style={{
                    textAlign: 'left',
                    background: '#111',
                    border: '1px solid #1a1a1a',
                    borderRadius: '3px',
                    padding: '0.625rem 0.75rem',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(168,85,247,0.35)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#1a1a1a' }}
                >
                  <div style={{ fontWeight: 600, color: '#e5e5e5', fontSize: '0.8rem', marginBottom: '2px' }}>{skill.name}</div>
                  <div style={{ fontSize: '0.6rem', color: '#555', fontFamily: 'monospace' }}>
                    {(skill.skillType || 'ativa').toUpperCase()}
                    {skill.isBuiltin === false && ' · custom'}
                  </div>
                  {skill.description && (
                    <div style={{
                      fontSize: '0.65rem', color: '#444', marginTop: '4px', lineHeight: 1.4,
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                      {skill.description}
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {!listOpen && !canAddMore && (selectedSkills || []).length > 0 && (
        <p style={{ fontSize: '0.65rem', color: '#333', margin: 0, textAlign: 'center' }}>
          Todas as habilidades do grimório já foram adicionadas.
        </p>
      )}
    </div>
  )
}
