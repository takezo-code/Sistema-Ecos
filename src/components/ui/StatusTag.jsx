import React from 'react'

const STATUS_MAP = {
  // Campanha
  'ativa': { cls: 'tag-green', label: 'Ativa' },
  'pausada': { cls: 'tag-yellow', label: 'Pausada' },
  'concluída': { cls: 'tag-cyan', label: 'Concluída' },
  // NPC
  'vivo': { cls: 'tag-green', label: 'Vivo' },
  'morto': { cls: 'tag-red', label: 'Morto' },
  'desaparecido': { cls: 'tag-yellow', label: 'Desaparecido' },
  // Evento narrativo
  'não iniciado': { cls: 'tag-gray', label: 'Não Iniciado' },
  'em andamento': { cls: 'tag-cyan', label: 'Em Andamento' },
  'ignorado': { cls: 'tag-yellow', label: 'Ignorado' },
}

export function StatusTag({ status }) {
  const cfg = STATUS_MAP[status] || { cls: 'tag-gray', label: status }
  return <span className={`tag ${cfg.cls}`}>{cfg.label}</span>
}
