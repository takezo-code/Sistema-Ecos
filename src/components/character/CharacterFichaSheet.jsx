import React, { useState } from 'react'
import { EntityManagePanel } from '../management/EntityManagePanel'
import { Modal } from '../ui/Modal'
import { CharacterForm } from '../../pages/Characters'
import { useCharacterManagementPanel } from '../../hooks/useCharacterManagementPanel'
import { useCharacterStore } from '../../store/useCharacterStore'

/**
 * Ficha de personagem ligada ao store global.
 * Alterações em Gerenciamento → Personagens refletem aqui automaticamente.
 */
export function CharacterFichaSheet({ characterId, adminMode = false, onEditProfile }) {
  const { entity, panelProps } = useCharacterManagementPanel(characterId, { adminMode })
  const updateCharacter = useCharacterStore(s => s.updateCharacter)
  const [editingProfile, setEditingProfile] = useState(null)

  if (!entity || !panelProps) return null

  const handleEditProfile = onEditProfile ?? (() => setEditingProfile(entity))

  return (
    <>
      <EntityManagePanel
        entity={entity}
        {...panelProps}
        onEditProfile={handleEditProfile}
      />

      <Modal
        open={!!editingProfile}
        onClose={() => setEditingProfile(null)}
        title={`Editar ficha — ${entity.name}`}
        maxWidth="640px"
      >
        {editingProfile && (
          <CharacterForm
            key={entity.updatedAt ?? entity.id}
            initial={entity}
            profileOnly
            onSave={data => {
              updateCharacter(characterId, data)
              setEditingProfile(null)
            }}
            onCancel={() => setEditingProfile(null)}
          />
        )}
      </Modal>
    </>
  )
}
