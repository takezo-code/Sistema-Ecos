import React, { useState, useMemo } from 'react'
import { Plus, Search } from 'lucide-react'
import { Modal } from '../components/ui/Modal'
import { SkillListRow } from '../components/skills/SkillListRow'
import { SkillDetailPanel } from '../components/skills/SkillDetailPanel'
import { SkillForm } from '../components/skills/SkillForm'
import { useSkillsCatalogStore } from '../store/useSkillsCatalogStore'
import { createEmptySkillDraft } from '../services/skillsCatalogService'
import { SKILL_AUDIENCE_META, skillMatchesAudience } from '../constants/skillAudience'

export function SkillsCatalogView({ audience }) {
  const skills = useSkillsCatalogStore(s => s.skills)
  const addSkill = useSkillsCatalogStore(s => s.addSkill)
  const updateSkill = useSkillsCatalogStore(s => s.updateSkill)
  const removeSkill = useSkillsCatalogStore(s => s.removeSkill)

  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState(null)

  const audienceSkills = useMemo(
    () => skills.filter(s => skillMatchesAudience(s, audience)),
    [skills, audience],
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return audienceSkills
    return audienceSkills.filter(s =>
      s.name.toLowerCase().includes(q)
      || s.description?.toLowerCase().includes(q)
      || s.mechanicalEffect?.toLowerCase().includes(q)
    )
  }, [audienceSkills, search])

  const audienceMeta = SKILL_AUDIENCE_META[audience]

  const handleCreate = draft => {
    const skill = addSkill({ ...draft, audience })
    setCreating(false)
    if (skill) setSelected(skill)
  }

  const handleUpdate = draft => {
    if (!editing) return
    const skill = updateSkill(editing.templateId, draft)
    setEditing(null)
    if (skill) setSelected(skill)
  }

  const handleDelete = skill => {
    if (!window.confirm(`Enviar "${skill.name}" para a lixeira?`)) return
    removeSkill(skill.templateId)
    setSelected(null)
  }

  if (selected && !editing && !creating) {
    return (
      <SkillDetailPanel
        skill={selected}
        onBack={() => setSelected(null)}
        onEdit={s => setEditing(s)}
        onDelete={handleDelete}
      />
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{
        padding: '0.75rem 1.5rem',
        borderBottom: '1px solid #1a1a1a',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1rem',
        flexWrap: 'wrap',
      }}>
        <p style={{ fontSize: '0.72rem', color: '#555', lineHeight: 1.5, margin: 0, maxWidth: '520px', flex: 1 }}>
          {audienceMeta.description}
        </p>
        <button
          type="button"
          className="btn-primary"
          onClick={() => setCreating(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', flexShrink: 0 }}
        >
          <Plus size={14} /> Nova skill
        </button>
      </div>

      <div style={{ padding: '0.75rem 1.5rem 0' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#444' }} />
          <input
            className="input-base"
            placeholder={`Buscar skill de ${audienceMeta.label.toLowerCase()}…`}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '2rem', fontSize: '0.8rem' }}
          />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem 1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '720px' }}>
          {filtered.map(skill => (
            <SkillListRow key={skill.templateId} skill={skill} onClick={setSelected} />
          ))}
          {filtered.length === 0 && (
            <p style={{ color: '#444', fontSize: '0.85rem', textAlign: 'center', padding: '2rem' }}>
              {search.trim()
                ? `Nenhuma skill encontrada para “${search.trim()}”.`
                : `Nenhuma skill de ${audienceMeta.label.toLowerCase()} ainda. Clique em Nova skill para criar.`}
            </p>
          )}
        </div>
      </div>

      <Modal open={creating} onClose={() => setCreating(false)} title="Nova skill" maxWidth="520px">
        {creating && (
          <SkillForm
            initial={createEmptySkillDraft(audience)}
            defaultAudience={audience}
            onSubmit={handleCreate}
            onCancel={() => setCreating(false)}
            submitLabel="Criar skill"
            lockAudience
          />
        )}
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Editar skill" maxWidth="520px">
        {editing && (
          <SkillForm
            initial={editing}
            onSubmit={handleUpdate}
            onCancel={() => setEditing(null)}
            submitLabel="Salvar alterações"
            lockAudience
          />
        )}
      </Modal>
    </div>
  )
}
