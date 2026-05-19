import React, { useState, useMemo } from 'react'
import { Sparkles, Plus, Search } from 'lucide-react'
import { PageHeader } from '../components/ui/PageHeader'
import { Modal } from '../components/ui/Modal'
import { SkillListRow } from '../components/skills/SkillListRow'
import { SkillDetailPanel } from '../components/skills/SkillDetailPanel'
import { SkillForm } from '../components/skills/SkillForm'
import { useSkillsCatalogStore } from '../store/useSkillsCatalogStore'

export function Skills() {
  const skills = useSkillsCatalogStore(s => s.skills)
  const addSkill = useSkillsCatalogStore(s => s.addSkill)
  const updateSkill = useSkillsCatalogStore(s => s.updateSkill)
  const removeSkill = useSkillsCatalogStore(s => s.removeSkill)

  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return skills
    return skills.filter(s =>
      s.name.toLowerCase().includes(q)
      || s.description?.toLowerCase().includes(q)
      || s.mechanicalEffect?.toLowerCase().includes(q)
    )
  }, [skills, search])

  const handleCreate = draft => {
    const skill = addSkill(draft)
    setFormOpen(false)
    setSelected(skill)
  }

  const handleUpdate = draft => {
    if (!editing) return
    const skill = updateSkill(editing.templateId, draft)
    setEditing(null)
    if (skill) setSelected(skill)
  }

  const handleDelete = skill => {
    if (!window.confirm(`Excluir "${skill.name}"?`)) return
    removeSkill(skill.templateId)
    setSelected(null)
  }

  if (selected && !formOpen && !editing) {
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
      <PageHeader
        icon={Sparkles}
        title="Skills"
        subtitle={`${skills.length} poderes de Eco`}
        action={
          <button
            type="button"
            className="btn-primary"
            onClick={() => setFormOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem' }}
          >
            <Plus size={14} /> Nova skill
          </button>
        }
      />

      <div style={{ padding: '0 1.5rem 0.75rem' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#444' }} />
          <input
            className="input-base"
            placeholder="Buscar skill…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '2rem', fontSize: '0.8rem' }}
          />
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 1.5rem 1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '720px' }}>
          {filtered.map(skill => (
            <SkillListRow key={skill.templateId} skill={skill} onClick={setSelected} />
          ))}
          {filtered.length === 0 && (
            <p style={{ color: '#444', fontSize: '0.85rem', textAlign: 'center', padding: '2rem' }}>
              Nenhuma skill encontrada.
            </p>
          )}
        </div>
      </div>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title="Nova skill" maxWidth="520px">
        <SkillForm
          onSubmit={handleCreate}
          onCancel={() => setFormOpen(false)}
          submitLabel="Criar skill"
        />
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Editar skill" maxWidth="520px">
        {editing && (
          <SkillForm
            initial={editing}
            onSubmit={handleUpdate}
            onCancel={() => setEditing(null)}
            submitLabel="Salvar alterações"
          />
        )}
      </Modal>
    </div>
  )
}
