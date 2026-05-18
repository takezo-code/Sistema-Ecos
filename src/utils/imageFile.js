const MAX_FILE_BYTES = 5 * 1024 * 1024
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export function validateImageFile(file) {
  if (!file) return 'Nenhum arquivo selecionado.'
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return 'Use JPG, PNG, WebP ou GIF.'
  }
  if (file.size > MAX_FILE_BYTES) {
    return 'Imagem muito grande. Máximo 5 MB.'
  }
  return null
}

/** Redimensiona e converte para data URL (ideal para LocalStorage) */
export function compressImageToDataUrl(file, maxDimension = 512, quality = 0.85) {
  const error = validateImageFile(file)
  if (error) return Promise.reject(new Error(error))

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        let { width, height } = img
        if (width > maxDimension || height > maxDimension) {
          if (width >= height) {
            height = Math.round((height / width) * maxDimension)
            width = maxDimension
          } else {
            width = Math.round((width / height) * maxDimension)
            height = maxDimension
          }
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        const usePng = file.type === 'image/png' || file.type === 'image/gif'
        const mime = usePng ? 'image/png' : 'image/jpeg'
        const q = usePng ? undefined : quality
        resolve(canvas.toDataURL(mime, q))
      }
      img.onerror = () => reject(new Error('Não foi possível ler a imagem.'))
      img.src = reader.result
    }
    reader.onerror = () => reject(new Error('Falha ao carregar o arquivo.'))
    reader.readAsDataURL(file)
  })
}
