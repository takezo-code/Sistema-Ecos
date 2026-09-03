import MagicBento from '../react-bits/MagicBento'

/**
 * Grade de escolha no estilo Magic Bento (criação, classes, etc.).
 */
export function CreationChoiceGrid({ types, disabled, onClick, selectedId, columns = 2, compact = false }) {
  const cards = types.map(type => ({
    id: type.id,
    title: type.label,
    description: type.description,
    icon: type.icon,
    iconSrc: type.iconSrc,
    accent: type.color,
    color: '#120f17',
    disabled: typeof disabled === 'function' ? disabled(type) : Boolean(disabled),
    selected: selectedId === type.id,
  }))

  return (
    <MagicBento
      cards={cards}
      columns={columns}
      compact={compact}
      onCardClick={card => onClick?.(card.id)}
    />
  )
}
