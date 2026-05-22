import { validateImageFile } from './imageFile'

export function computeFitScale(imgW, imgH, workspace) {
  return Math.min(workspace / imgW, workspace / imgH)
}

export function getImageDisplayRect(imgPanX, imgPanY, imgW, imgH, scale) {
  const dw = imgW * scale
  const dh = imgH * scale
  return {
    x: imgPanX,
    y: imgPanY,
    width: dw,
    height: dh,
    right: imgPanX + dw,
    bottom: imgPanY + dh,
  }
}

export function getMaxCropSize(imageRect) {
  return Math.min(imageRect.width, imageRect.height)
}

export function getInitialCropLayout(image, workspace, cropMin = 72) {
  const scale = computeFitScale(image.naturalWidth, image.naturalHeight, workspace)
  const dw = image.naturalWidth * scale
  const dh = image.naturalHeight * scale
  const imgPanX = (workspace - dw) / 2
  const imgPanY = (workspace - dh) / 2
  const imageRect = getImageDisplayRect(imgPanX, imgPanY, image.naturalWidth, image.naturalHeight, scale)
  const maxSize = getMaxCropSize(imageRect)
  const size = Math.max(cropMin, maxSize)
  return {
    scale,
    imgPan: { x: imgPanX, y: imgPanY },
    imageRect,
    maxCropSize: maxSize,
    crop: {
      x: imageRect.x + (imageRect.width - size) / 2,
      y: imageRect.y + (imageRect.height - size) / 2,
      size,
    },
  }
}

export function clampCropBox(crop, imageRect, workspace, cropMin) {
  const maxSize = Math.min(getMaxCropSize(imageRect), workspace)
  const size = Math.min(maxSize, Math.max(cropMin, crop.size))

  const minX = Math.max(0, imageRect.x)
  const minY = Math.max(0, imageRect.y)
  const maxX = Math.min(workspace - size, imageRect.right - size)
  const maxY = Math.min(workspace - size, imageRect.bottom - size)

  return {
    x: Math.min(maxX, Math.max(minX, crop.x)),
    y: Math.min(maxY, Math.max(minY, crop.y)),
    size,
  }
}

/** Redimensiona a partir de canto ou borda (quadrado sempre). */
export function resizeCropFromHandle(startCrop, handle, dx, dy, imageRect, workspace, cropMin) {
  let { x, y, size } = startCrop
  const right = startCrop.x + startCrop.size
  const bottom = startCrop.y + startCrop.size

  switch (handle) {
    case 'se':
      size = startCrop.size + (dx + dy) / 2
      break
    case 'sw':
      size = startCrop.size + (-dx + dy) / 2
      x = right - size
      break
    case 'ne':
      size = startCrop.size + (dx - dy) / 2
      y = bottom - size
      break
    case 'nw':
      size = startCrop.size + (-dx - dy) / 2
      x = right - size
      y = bottom - size
      break
    case 'n':
      size = startCrop.size - dy
      y = bottom - size
      break
    case 's':
      size = startCrop.size + dy
      break
    case 'e':
      size = startCrop.size + dx
      break
    case 'w':
      size = startCrop.size - dx
      x = right - size
      break
    default:
      break
  }

  return clampCropBox({ x, y, size }, imageRect, workspace, cropMin)
}

export function loadImageElement(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Não foi possível carregar a imagem.'))
    if (src.startsWith('http://') || src.startsWith('https://')) {
      img.crossOrigin = 'anonymous'
    }
    img.src = src
  })
}

export function readImageFileAsDataUrl(file) {
  const error = validateImageFile(file)
  if (error) return Promise.reject(new Error(error))
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Falha ao carregar o arquivo.'))
    reader.readAsDataURL(file)
  })
}

export function renderCroppedDataUrl(img, {
  sourceX,
  sourceY,
  sourceSize,
  outputSize = 512,
  quality = 0.88,
  fillColor = '#0d0d0d',
}) {
  const canvas = document.createElement('canvas')
  canvas.width = outputSize
  canvas.height = outputSize
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = fillColor
  ctx.fillRect(0, 0, outputSize, outputSize)

  ctx.drawImage(
    img,
    sourceX,
    sourceY,
    sourceSize,
    sourceSize,
    0,
    0,
    outputSize,
    outputSize,
  )

  return canvas.toDataURL('image/jpeg', quality)
}

export function cropToSourceRect(crop, imgPan, scale) {
  return {
    sourceX: (crop.x - imgPan.x) / scale,
    sourceY: (crop.y - imgPan.y) / scale,
    sourceSize: crop.size / scale,
  }
}
