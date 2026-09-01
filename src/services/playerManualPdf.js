import manualText from '../../docs/MANUAL_JOGADOR_PDF.md?raw'
import { downloadMarkdownPdf } from './markdownPdf'

const PDF_FILENAME = 'Manual-do-Jogador-Sistema-Eco.pdf'

export async function downloadPlayerManualPdf() {
  await downloadMarkdownPdf({
    source: manualText,
    filename: PDF_FILENAME,
    footerLabel: 'Manual do Jogador',
  })
}

export { PDF_FILENAME as PLAYER_MANUAL_PDF_FILENAME }
