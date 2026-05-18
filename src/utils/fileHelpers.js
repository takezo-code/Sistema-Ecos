export const SAVE_VERSION = '1.0.0'

export function convertToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Falha ao converter imagem para Base64.'))
    reader.readAsDataURL(file)
  })
}

export function downloadJson(data, filename) {
  const json = typeof data === 'string' ? data : JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function readJsonFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('Nenhum arquivo selecionado.'))
      return
    }
    if (!file.name.endsWith('.json') && file.type !== 'application/json') {
      reject(new Error('Selecione um arquivo .json válido.'))
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result)
        resolve(data)
      } catch {
        reject(new Error('O arquivo não contém JSON válido.'))
      }
    }
    reader.onerror = () => reject(new Error('Não foi possível ler o arquivo.'))
    reader.readAsText(file, 'utf-8')
  })
}

export function generateSaveName(prefix = 'campaign-save') {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${prefix}-${y}-${m}-${day}.json`
}

export function isBase64Image(value) {
  return typeof value === 'string' && (
    value.startsWith('data:image/') || value.startsWith('data:application/octet-stream')
  )
}

/** Validação básica de estrutura — lógica completa em saveService */
export function validateSaveFile(data) {
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Save inválido.'] }
  }
  if (!data.version) {
    return { valid: false, errors: ['Versão ausente no save.'] }
  }
  return { valid: true, errors: [] }
}
