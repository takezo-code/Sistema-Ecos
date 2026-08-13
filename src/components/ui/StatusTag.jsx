import React from 'react'
import GlowingBadge from './GlowingBadge'

const STATUS_MAP = {
  'ativa': { variant: 'success', label: 'Ativa' },
  'pausada': { variant: 'warning', label: 'Pausada' },
  'concluída': { variant: 'cyan', label: 'Concluída' },
  'vivo': { variant: 'success', label: 'Vivo' },
  'morto': { variant: 'error', label: 'Morto' },
  'desaparecido': { variant: 'warning', label: 'Desaparecido' },
  'não iniciado': { variant: 'gray', label: 'Não Iniciado' },
  'em andamento': { variant: 'cyan', label: 'Em Andamento' },
  'concluído': { variant: 'success', label: 'Concluído' },
}

export function StatusTag({ status }) {
  const cfg = STATUS_MAP[status] || { variant: 'gray', label: status }
  return (
    <GlowingBadge variant={cfg.variant} pulse={cfg.variant !== 'gray'} dot>
      {cfg.label}
    </GlowingBadge>
  )
}
