import { createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { flushSync } from 'react-dom'
import { CharacterExportSheet, EXPORT_SHEET_WIDTH } from '../components/character/CharacterExportSheet'
import { characterSheetFilename } from './characterSheetSnapshot'

function waitForImages(root) {
  const images = [...root.querySelectorAll('img')]
  return Promise.all(images.map(img => {
    if (img.complete) return Promise.resolve()
    return new Promise(resolve => {
      img.addEventListener('load', resolve, { once: true })
      img.addEventListener('error', resolve, { once: true })
    })
  }))
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

async function mountSheet(entity) {
  const host = document.createElement('div')
  host.setAttribute('data-character-export-host', 'true')
  host.style.cssText = [
    'position:fixed',
    'left:0',
    'top:0',
    `width:${EXPORT_SHEET_WIDTH}px`,
    'z-index:-1',
    'pointer-events:none',
    'opacity:1',
  ].join(';')
  document.body.appendChild(host)

  const root = createRoot(host)
  flushSync(() => {
    root.render(createElement(CharacterExportSheet, { entity }))
  })

  await document.fonts?.ready
  await waitForImages(host)
  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))

  const node = host.querySelector('[data-character-export-sheet="true"]')
  if (!node) {
    root.unmount()
    host.remove()
    throw new Error('Não foi possível montar a ficha para exportar.')
  }

  return { host, root, node }
}

async function captureSheet(entity) {
  const { toCanvas } = await import('html-to-image')
  const mounted = await mountSheet(entity)
  try {
    const canvas = await toCanvas(mounted.node, {
      pixelRatio: 2,
      backgroundColor: '#0c0c10',
      cacheBust: true,
      width: EXPORT_SHEET_WIDTH,
    })
    return canvas
  } finally {
    mounted.root.unmount()
    mounted.host.remove()
  }
}

export async function downloadCharacterSheetPng(entity) {
  const canvas = await captureSheet(entity)
  await new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (!blob) {
        reject(new Error('Falha ao gerar PNG da ficha.'))
        return
      }
      downloadBlob(blob, characterSheetFilename(entity, 'png'))
      resolve()
    }, 'image/png')
  })
}

export async function downloadCharacterSheetPdf(entity) {
  const canvas = await captureSheet(entity)
  const { jsPDF } = await import('jspdf')
  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
  const pageW = pdf.internal.pageSize.getWidth()
  const pageH = pdf.internal.pageSize.getHeight()
  const imgW = pageW
  const imgH = (canvas.height * pageW) / canvas.width

  let heightLeft = imgH
  let position = 0
  pdf.addImage(imgData, 'PNG', 0, position, imgW, imgH)
  heightLeft -= pageH

  while (heightLeft > 0) {
    position -= pageH
    pdf.addPage()
    pdf.addImage(imgData, 'PNG', 0, position, imgW, imgH)
    heightLeft -= pageH
  }

  pdf.save(characterSheetFilename(entity, 'pdf'))
}
