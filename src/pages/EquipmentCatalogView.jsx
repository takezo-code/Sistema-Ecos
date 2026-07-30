import React, { useState, useMemo } from 'react'
import { Search, Trash2, ChevronLeft, Edit2 } from 'lucide-react'
import { Modal } from '../components/ui/Modal'
import { EquipmentForm } from '../components/equipment/EquipmentForm'
import { useEquipmentStore } from '../store/useEquipmentStore'
import { getPassiveSlotsForRarity, getRarityMeta } from '../constants/equipmentTypes'

function ItemCard({ item, typesMeta, onClick }) {
  const typeMeta = typesMeta[item.type]
  const rarity = getRarityMeta(item.rarity)
  const slots = item.category === 'arma'
    ? (item.passiveSlots ?? getPassiveSlotsForRarity(item.rarity))
    : 0
  const passivesCount = item.passives?.length ?? 0

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.4rem',
        padding: '0.75rem',
        background: '#0d0d0d',
        border: `1px solid ${typeMeta?.color ? `${typeMeta.color}33` : '#1a1a1a'}`,
        borderRadius: '6px',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'border-color 0.12s, background 0.12s',
        width: '100%',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = typeMeta?.color ? `${typeMeta.color}66` : '#2a2a2a'; e.currentTarget.style.background = '#111' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = typeMeta?.color ? `${typeMeta.color}33` : '#1a1a1a'; e.currentTarget.style.background = '#0d0d0d' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {item.image ? (
          <img
            src={item.image}
            alt=""
            style={{
              width: '36px', height: '36px', borderRadius: '4px', objectFit: 'cover',
              border: '1px solid #1a1a1a', flexShrink: 0,
            }}
          />
        ) : (
          <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>{typeMeta?.icon ?? '?'}</span>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#e5e5e5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.name}
          </div>
          <div style={{ fontSize: '0.55rem', color: typeMeta?.color ?? '#555', fontFamily: 'monospace' }}>
            {typeMeta?.label ?? item.type}
            {typeMeta?.handsLabel ? ` · ${typeMeta.handsLabel}` : ''}
          </div>
        </div>
        <span style={{ fontSize: '0.5rem', color: rarity.color, fontFamily: 'monospace', flexShrink: 0, border: `1px solid ${rarity.color}44`, borderRadius: '2px', padding: '1px 4px' }}>
          {rarity.label.toUpperCase()}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {item.category === 'arma' && (
          <span style={{ fontSize: '0.5rem', fontFamily: 'monospace', color: '#a855f7', background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: '2px', padding: '1px 5px' }}>
            PASSIVAS {passivesCount}/{slots}
          </span>
        )}
        {item.penaltyDestreza > 0 && (
          <span style={{ fontSize: '0.5rem', fontFamily: 'monospace', color: '#f97316', background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: '2px', padding: '1px 5px' }}>
            DES −{item.penaltyDestreza}
          </span>
        )}
        {item.markBonus > 0 && (
          <span style={{ fontSize: '0.5rem', fontFamily: 'monospace', color: '#16a34a', background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: '2px', padding: '1px 5px' }}>
            MARCAS +{item.markBonus}
          </span>
        )}
      </div>
    </button>
  )
}

function ItemDetail({ item, typeMeta, onEdit, onDelete, onBack }) {
  const rarity = getRarityMeta(item.rarity)
  const slots = item.category === 'arma'
    ? (item.passiveSlots ?? getPassiveSlotsForRarity(item.rarity))
    : 0
  const passives = item.passives || []

  return (
    <div style={{ flex: 1, padding: '1.25rem', overflowY: 'auto' }}>
      <button type="button" className="btn-ghost" onClick={onBack}
        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', marginBottom: '1.25rem' }}>
        <ChevronLeft size={14} /> Voltar
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            style={{
              width: '72px', height: '72px', borderRadius: '6px', objectFit: 'cover',
              border: '1px solid #1a1a1a', flexShrink: 0,
            }}
          />
        ) : (
          <span style={{ fontSize: '2.5rem', lineHeight: 1 }}>{typeMeta?.icon ?? '?'}</span>
        )}
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f5f5f5', margin: 0 }}>{item.name}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.6rem', color: typeMeta?.color ?? '#555', fontFamily: 'monospace' }}>{typeMeta?.label ?? item.type}</span>
            {typeMeta?.handsLabel && (
              <span style={{ fontSize: '0.55rem', color: '#555', fontFamily: 'monospace' }}>{typeMeta.handsLabel}</span>
            )}
            <span style={{ fontSize: '0.6rem', color: rarity.color, fontFamily: 'monospace', border: `1px solid ${rarity.color}44`, borderRadius: '2px', padding: '1px 5px' }}>{rarity.label}</span>
          </div>
        </div>
      </div>

      {typeMeta?.mechDesc && (
        <div style={{ marginBottom: '1rem', padding: '0.625rem 0.75rem', background: '#0d0d0d', border: '1px solid #1a1a1a', borderRadius: '4px', fontSize: '0.7rem', color: '#888', lineHeight: 1.6 }}>
          <span style={{ fontSize: '0.5rem', color: '#333', fontFamily: 'monospace', display: 'block', marginBottom: '0.25rem' }}>MECÂNICA DO TIPO</span>
          {typeMeta.mechDesc}
        </div>
      )}

      {item.category === 'arma' && (
        <div style={{ marginBottom: '1rem', padding: '0.625rem 0.75rem', background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: '4px' }}>
          <div style={{ fontSize: '0.5rem', color: '#a855f7', fontFamily: 'monospace', marginBottom: '0.35rem' }}>
            PASSIVAS · {passives.length}/{slots}
          </div>
          {passives.length === 0 ? (
            <div style={{ fontSize: '0.7rem', color: '#555' }}>
              Slots reservados pela raridade. Passivas serão geradas depois.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              {passives.map((p, i) => (
                <div key={p.id || i} style={{ fontSize: '0.75rem', color: '#ccc' }}>{p.name || p.id || `Passiva ${i + 1}`}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {item.category === 'armadura' && (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {item.penaltyDestreza > 0 && (
            <div style={{ padding: '0.5rem 0.75rem', background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: '4px' }}>
              <div style={{ fontSize: '0.4rem', color: '#f97316', fontFamily: 'monospace', marginBottom: '2px' }}>PENALIDADE DES</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f97316' }}>−{item.penaltyDestreza}</div>
            </div>
          )}
          {item.markBonus > 0 && (
            <div style={{ padding: '0.5rem 0.75rem', background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: '4px' }}>
              <div style={{ fontSize: '0.4rem', color: '#16a34a', fontFamily: 'monospace', marginBottom: '2px' }}>LIMIAR MARCAS</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#16a34a' }}>+{item.markBonus}</div>
            </div>
          )}
        </div>
      )}

      {item.description && (
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.5rem', color: '#333', fontFamily: 'monospace', marginBottom: '0.35rem' }}>DESCRIÇÃO</div>
          <p style={{ fontSize: '0.8rem', color: '#888', lineHeight: 1.7, margin: 0 }}>{item.description}</p>
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
        <button type="button" className="btn-secondary" onClick={() => onEdit(item)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem' }}>
          <Edit2 size={12} /> Editar
        </button>
        <button type="button" className="btn-ghost" onClick={() => onDelete(item)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#dc2626' }}>
          <Trash2 size={12} /> Excluir
        </button>
      </div>
    </div>
  )
}

const CATALOG_META = {
  arma: {
    label: 'Arma',
    description: 'Catálogo de armas — perícia por classe, passivas pela raridade (sem skills nem bônus de ataque).',
    emptyHint: 'Nenhuma arma encontrada. Crie em Criação → Arma.',
  },
  armadura: {
    label: 'Armadura',
    description: 'Catálogo de armaduras — leve, média ou pesada (−DES / +limiar de marcas).',
    emptyHint: 'Nenhuma armadura encontrada. Crie em Criação → Armadura.',
  },
}

export function EquipmentCatalogView({ category, items, typesMeta }) {
  const { updateItem, removeItem } = useEquipmentStore()
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [editing, setEditing] = useState(null)

  const meta = CATALOG_META[category] ?? CATALOG_META.arma
  const typeLabel = meta.label
  const typeOptions = Object.values(typesMeta)

  const filtered = useMemo(() => {
    let list = items
    if (typeFilter) {
      list = list.filter(i => i.type === typeFilter)
    }
    const q = search.trim().toLowerCase()
    if (!q) return list
    return list.filter(i =>
      i.name.toLowerCase().includes(q) ||
      (typesMeta[i.type]?.label ?? '').toLowerCase().includes(q)
    )
  }, [items, search, typeFilter, typesMeta])

  const handleUpdate = (formData) => {
    if (!editing) return
    updateItem(editing.id, formData)
    setEditing(null)
    if (selected?.id === editing.id) {
      setSelected({ ...selected, ...formData })
    }
  }

  const handleDelete = (item) => {
    if (!window.confirm(`Excluir "${item.name}"?`)) return
    removeItem(item.id)
    setSelected(null)
  }

  if (selected && !editing) {
    const typeMeta = typesMeta[selected.type]
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <ItemDetail
          item={selected}
          typeMeta={typeMeta}
          onEdit={setEditing}
          onDelete={handleDelete}
          onBack={() => setSelected(null)}
        />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid #1a1a1a' }}>
        <p style={{ fontSize: '0.72rem', color: '#555', lineHeight: 1.5, margin: 0, maxWidth: '520px' }}>
          {meta.description}
        </p>
      </div>

      <div style={{ padding: '0.75rem 1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 200px', minWidth: '160px', maxWidth: '320px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#444' }} />
          <input
            className="input-base"
            placeholder={`Buscar ${typeLabel.toLowerCase()}…`}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '2rem', fontSize: '0.8rem', width: '100%' }}
          />
        </div>
        <div style={{ flex: '0 1 220px', minWidth: '180px' }}>
          <div style={{ fontSize: '0.45rem', color: '#333', fontFamily: 'monospace', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>
            {category === 'arma' ? 'FILTRAR POR TIPO DE ARMA' : 'FILTRAR POR TIPO DE ARMADURA'}
          </div>
          <select
            className="input-base"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            style={{ fontSize: '0.75rem', width: '100%', padding: '0.4rem 0.5rem' }}
          >
            <option value="">Todos os tipos</option>
            {typeOptions.map(t => (
              <option key={t.id} value={t.id}>
                {t.icon ? `${t.icon} ` : ''}{t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem 1.5rem' }}>
        {filtered.length === 0 ? (
          <p style={{ color: '#444', fontSize: '0.85rem', textAlign: 'center', padding: '2rem' }}>
            {search || typeFilter ? 'Nenhum resultado para os filtros atuais.' : meta.emptyHint}
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.5rem', maxWidth: '900px' }}>
            {filtered.map(item => (
              <ItemCard
                key={item.id}
                item={item}
                typesMeta={typesMeta}
                onClick={() => setSelected(item)}
              />
            ))}
          </div>
        )}
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={`Editar ${typeLabel.toLowerCase()}`} maxWidth="560px">
        {editing && (
          <EquipmentForm
            initial={editing}
            category={category}
            onSave={handleUpdate}
            onCancel={() => setEditing(null)}
            submitLabel="Salvar alterações"
          />
        )}
      </Modal>
    </div>
  )
}
