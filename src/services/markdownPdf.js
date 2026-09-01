const MARGIN = 18
const PAGE_W = 210
const PAGE_H = 297
const CONTENT_W = PAGE_W - MARGIN * 2

const FONT = {
  title: { size: 16, leading: 7, color: [25, 25, 30] },
  section: { size: 11, leading: 5.5, color: [35, 35, 40] },
  subsection: { size: 9.5, leading: 4.8, color: [50, 50, 55] },
  body: { size: 9, leading: 4.4, color: [60, 60, 65] },
  bullet: { size: 9, leading: 4.4, color: [60, 60, 65] },
  footer: { size: 7.5, leading: 3.5, color: [120, 120, 125] },
}

function cleanText(text) {
  return String(text || '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/`/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}

function classifyLine(raw) {
  const line = raw.trimEnd()
  const text = cleanText(line)
  if (!text) return { type: 'blank' }
  if (/^MANUAL DO/i.test(text) || /^MANUAL DE/i.test(text)) return { type: 'title', text }
  if (/^\d+\.\s/.test(text)) return { type: 'section', text }
  if (/^FÓRMULAS RÁPIDAS$/i.test(text)) return { type: 'section', text }
  if (/^RESUMO EM 30 SEGUNDOS$/i.test(text)) return { type: 'section', text }
  if (/^[A-ZÁÉÍÓÚÂÊÔÃÕÇ0-9][A-ZÁÉÍÓÚÂÊÔÃÕÇ0-9\s—-]+$/u.test(text) && text.length < 48 && !text.startsWith('-')) {
    return { type: 'subsection', text }
  }
  if (text.startsWith('- ')) return { type: 'bullet', text: text.slice(2) }
  if (/^ {2}/.test(line)) return { type: 'indent', text }
  return { type: 'body', text }
}

function buildBlocks(source) {
  return source.replace(/\r\n/g, '\n').split('\n').map(classifyLine)
}

function createWriter(pdf, footerLabel) {
  let y = MARGIN
  let page = 1

  const newPage = () => {
    pdf.addPage()
    page += 1
    y = MARGIN
    drawFooter()
  }

  const drawFooter = () => {
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(FONT.footer.size)
    pdf.setTextColor(...FONT.footer.color)
    pdf.text(`Sistema Eco — ${footerLabel} · ${page}`, MARGIN, PAGE_H - 10)
  }

  const ensure = (height) => {
    if (y + height > PAGE_H - MARGIN - 8) newPage()
  }

  const writeLines = (lines, style, indent = 0, fontStyle = 'normal') => {
    pdf.setFont('helvetica', fontStyle)
    pdf.setFontSize(style.size)
    pdf.setTextColor(...style.color)
    for (const line of lines) {
      ensure(style.leading)
      pdf.text(line, MARGIN + indent, y)
      y += style.leading
    }
  }

  const writeParagraph = (text, style, indent = 0, fontStyle = 'normal') => {
    const content = cleanText(text)
    if (!content) return
    const lines = pdf.splitTextToSize(content, CONTENT_W - indent)
    writeLines(lines, style, indent, fontStyle)
  }

  return {
    render(blocks) {
      drawFooter()
      for (const block of blocks) {
        switch (block.type) {
          case 'blank':
            y += 2.2
            break
          case 'title':
            y += 2
            writeParagraph(block.text, FONT.title, 0, 'bold')
            y += 3
            break
          case 'section':
            y += 5
            writeParagraph(block.text, FONT.section, 0, 'bold')
            y += 1.5
            break
          case 'subsection':
            y += 2.5
            writeParagraph(block.text, FONT.subsection, 0, 'bold')
            y += 0.5
            break
          case 'bullet':
            writeParagraph(`• ${block.text}`, FONT.bullet, 2)
            break
          case 'indent':
            writeParagraph(block.text.trim(), FONT.body, 6)
            break
          case 'body':
          default:
            writeParagraph(block.text, FONT.body)
            break
        }
      }
    },
  }
}

export async function downloadMarkdownPdf({ source, filename, footerLabel }) {
  const { jsPDF } = await import('jspdf')
  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
  createWriter(pdf, footerLabel).render(buildBlocks(source))
  pdf.save(filename)
}
