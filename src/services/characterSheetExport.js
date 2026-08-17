import { createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { flushSync } from 'react-dom'
import { CharacterExportSheet, EXPORT_SHEET_WIDTH } from '../components/character/CharacterExportSheet'
import { OrganizationExportSheet } from '../components/character/OrganizationExportSheet'
import { sheetFilename, resolveSheetKind } from './characterSheetSnapshot'

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

function sheetElement(entity, kind) {
  if (kind === 'organization') {
    return createElement(OrganizationExportSheet, { org: entity })
  }
  return createElement(CharacterExportSheet, { entity, kind })
}

async function mountSheet(entity, kind) {
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
    root.render(sheetElement(entity, kind))
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

async function captureSheet(entity, kind) {
  const { toCanvas } = await import('html-to-image')
  const mounted = await mountSheet(entity, kind)
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

async function canvasToPng(canvas, filename) {
  await new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (!blob) {
        reject(new Error('Falha ao gerar PNG da ficha.'))
        return
      }
      downloadBlob(blob, filename)
      resolve()
    }, 'image/png')
  })
}

async function canvasToPdf(canvas, filename) {
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

  pdf.save(filename)
}

export async function downloadEntitySheet(entity, format, kind) {
  const resolvedKind = resolveSheetKind(entity, kind)
  const canvas = await captureSheet(entity, resolvedKind)
  const filename = sheetFilename(entity, format, resolvedKind)
  if (format === 'pdf') await canvasToPdf(canvas, filename)
  else await canvasToPng(canvas, filename)
}

export async function downloadCharacterSheetPng(entity, kind) {
  return downloadEntitySheet(entity, 'png', kind)
}

export async function downloadCharacterSheetPdf(entity, kind) {
  return downloadEntitySheet(entity, 'pdf', kind)
}
