function downloadStaticPdf(url, filename) {
  return new Promise((resolve, reject) => {
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.rel = 'noopener'
    document.body.appendChild(link)

    fetch(url, { method: 'HEAD' })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`PDF ainda não está no projeto (${filename}).`)
        }
        link.click()
        resolve()
      })
      .catch((err) => {
        reject(err instanceof Error ? err : new Error('Não foi possível baixar o PDF.'))
      })
      .finally(() => {
        link.remove()
      })
  })
}

function makeStaticDownload(path, filename) {
  return () => downloadStaticPdf(path, filename)
}

/**
 * PDFs finais ficam em public/manuals/.
 * Enquanto o arquivo não existir no disco, deixe available: false.
 */
export const MANUAL_DOWNLOADS = [
  {
    id: 'classes',
    label: 'PDF — classes',
    filename: 'Manual-ECOS-Classes.pdf',
    path: '/manuals/Manual-ECOS-Classes.pdf',
    available: true,
  },
  {
    id: 'sistema',
    label: 'PDF — como funciona',
    filename: 'Manual-ECOS-Como-Funciona.pdf',
    path: '/manuals/Manual-ECOS-Como-Funciona.pdf',
    available: true,
  },
  {
    id: 'uso',
    label: 'PDF — como usar',
    filename: 'Manual-ECOS-Como-Usar.pdf',
    path: '/manuals/Manual-ECOS-Como-Usar.pdf',
    available: true,
  },
  {
    id: 'historia',
    label: 'PDF — história do mundo',
    filename: 'Manual-ECOS-Historia.pdf',
    path: '/manuals/Manual-ECOS-Historia.pdf',
    available: true,
  },
]

MANUAL_DOWNLOADS.forEach((item) => {
  if (item.path && item.filename) {
    item.download = makeStaticDownload(item.path, item.filename)
  }
})

export async function downloadManualById(id) {
  const item = MANUAL_DOWNLOADS.find(m => m.id === id)
  if (!item) throw new Error('Manual não encontrado.')
  if (item.available === false || !item.download) {
    throw new Error('Este manual ainda não está disponível para download.')
  }
  await item.download()
  return item
}
