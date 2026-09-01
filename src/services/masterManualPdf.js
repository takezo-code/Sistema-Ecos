import manualText from '../../docs/MANUAL_MESTRE_PDF.md?raw'
import { downloadMarkdownPdf } from './markdownPdf'

const PDF_FILENAME = 'Manual-do-Mestre-Sistema-Eco.pdf'

export async function downloadMasterManualPdf() {
  await downloadMarkdownPdf({
    source: manualText,
    filename: PDF_FILENAME,
    footerLabel: 'Manual do Mestre',
  })
}

export { PDF_FILENAME as MASTER_MANUAL_PDF_FILENAME }
