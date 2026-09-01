import { downloadPlayerManualPdf } from './playerManualPdf'
import { downloadMasterManualPdf } from './masterManualPdf'
import { downloadClassesManualPdf } from './classesManualPdf'

export const MANUAL_DOWNLOADS = [
  {
    id: 'player',
    label: 'PDF — manual do jogador',
    hint: 'Como jogar: regras, vida, Eco e rolagens.',
    download: downloadPlayerManualPdf,
  },
  {
    id: 'master',
    label: 'PDF — manual do mestre',
    hint: 'Como usar o sistema e conduzir a mesa.',
    download: downloadMasterManualPdf,
  },
  {
    id: 'classes',
    label: 'PDF — classes',
    hint: 'Classes disponíveis, passivas e skills.',
    download: downloadClassesManualPdf,
  },
  {
    id: 'lore',
    label: 'PDF — história do mundo',
    hint: 'Lore, cronologia e contexto do universo ECOS.',
    available: false,
  },
]

export async function downloadManualById(id) {
  const item = MANUAL_DOWNLOADS.find(m => m.id === id)
  if (!item) throw new Error('Manual não encontrado.')
  if (item.available === false || !item.download) {
    throw new Error('Este manual ainda não está disponível para download.')
  }
  await item.download()
  return item
}
