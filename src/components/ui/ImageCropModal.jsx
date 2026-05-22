import React, { useCallback, useEffect, useRef, useState } from 'react'
import { RotateCcw, Move } from 'lucide-react'
import { Modal } from './Modal'
import {
  clampCropBox,
  cropToSourceRect,
  getInitialCropLayout,
  loadImageElement,
  renderCroppedDataUrl,
  resizeCropFromHandle,
} from '../../utils/imageCrop'

const WORKSPACE = 300
const CROP_MIN = 56
const HANDLE_VIS = 10
const HANDLE_HIT = 22
const EDGE_HIT = 14

const CORNERS = ['nw', 'ne', 'sw', 'se']
const EDGES = ['n', 's', 'e', 'w']

const CURSOR_BY_HANDLE = {
  nw: 'nwse-resize',
  se: 'nwse-resize',
  ne: 'nesw-resize',
  sw: 'nesw-resize',
  n: 'ns-resize',
  s: 'ns-resize',
  e: 'ew-resize',
  w: 'ew-resize',
}

function CropGrid() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        background: `
          linear-gradient(to right, transparent calc(33.33% - 0.5px), rgba(255,255,255,0.25) calc(33.33% - 0.5px), rgba(255,255,255,0.25) calc(33.33% + 0.5px), transparent calc(33.33% + 0.5px)),
          linear-gradient(to right, transparent calc(66.66% - 0.5px), rgba(255,255,255,0.25) calc(66.66% - 0.5px), rgba(255,255,255,0.25) calc(66.66% + 0.5px), transparent calc(66.66% + 0.5px)),
          linear-gradient(to bottom, transparent calc(33.33% - 0.5px), rgba(255,255,255,0.25) calc(33.33% - 0.5px), rgba(255,255,255,0.25) calc(33.33% + 0.5px), transparent calc(33.33% + 0.5px)),
          linear-gradient(to bottom, transparent calc(66.66% - 0.5px), rgba(255,255,255,0.25) calc(66.66% - 0.5px), rgba(255,255,255,0.25) calc(66.66% + 0.5px), transparent calc(66.66% + 0.5px))
        `,
      }}
    />
  )
}

function CropHandles({ crop }) {
  const { x, y, size } = crop
  const cornerStyle = (left, top) => ({
    position: 'absolute',
    left: left - HANDLE_VIS / 2,
    top: top - HANDLE_VIS / 2,
    width: HANDLE_VIS,
    height: HANDLE_VIS,
    background: '#dc2626',
    border: '2px solid #fff',
    borderRadius: '2px',
    pointerEvents: 'none',
    zIndex: 5,
    boxShadow: '0 1px 3px rgba(0,0,0,0.45)',
  })

  return (
    <>
      <div style={cornerStyle(x, y)} />
      <div style={cornerStyle(x + size, y)} />
      <div style={cornerStyle(x, y + size)} />
      <div style={cornerStyle(x + size, y + size)} />
    </>
  )
}

function CropOverlay({ crop }) {
  const { x, y, size } = crop
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2 }}>
        <div style={{ position: 'absolute', left: 0, top: 0, right: 0, height: y, background: 'rgba(0,0,0,0.6)' }} />
        <div style={{ position: 'absolute', left: 0, top: y + size, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)' }} />
        <div style={{ position: 'absolute', left: 0, top: y, width: x, height: size, background: 'rgba(0,0,0,0.6)' }} />
        <div style={{ position: 'absolute', left: x + size, top: y, right: 0, height: size, background: 'rgba(0,0,0,0.6)' }} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: x,
          top: y,
          width: size,
          height: size,
          boxShadow: 'inset 0 0 0 2px rgba(220,38,38,0.9)',
          pointerEvents: 'none',
          zIndex: 3,
        }}
      >
        <CropGrid />
      </div>
      <CropHandles crop={crop} />
    </>
  )
}

function hitTestCrop(px, py, crop) {
  const { x, y, size } = crop
  const h = HANDLE_HIT / 2

  for (const corner of CORNERS) {
    const cx = corner.includes('e') ? x + size : x
    const cy = corner.includes('s') ? y + size : y
    if (Math.abs(px - cx) <= h && Math.abs(py - cy) <= h) return corner
  }

  const inX = px >= x && px <= x + size
  const inY = py >= y && py <= y + size
  if (inX && py >= y - EDGE_HIT && py <= y + EDGE_HIT) return 'n'
  if (inX && py >= y + size - EDGE_HIT && py <= y + size + EDGE_HIT) return 's'
  if (inY && px >= x - EDGE_HIT && px <= x + EDGE_HIT) return 'w'
  if (inY && px >= x + size - EDGE_HIT && px <= x + size + EDGE_HIT) return 'e'

  if (inX && inY) return 'move'

  return null
}

export function ImageCropModal({
  open,
  source,
  onApply,
  onClose,
  title = 'Enquadrar imagem',
  outputSize = 512,
}) {
  const [img, setImg] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [imgPan, setImgPan] = useState({ x: 0, y: 0 })
  const [crop, setCrop] = useState({ x: 0, y: 0, size: WORKSPACE })
  const [cursor, setCursor] = useState('default')

  const layoutRef = useRef({
    scale: 1,
    imageRect: null,
    maxCropSize: WORKSPACE,
  })
  const imgPanRef = useRef({ x: 0, y: 0 })
  const cropRef = useRef({ x: 0, y: 0, size: WORKSPACE })
  const workspaceRef = useRef(null)
  const dragRef = useRef(null)

  const applyCrop = (next) => {
    cropRef.current = next
    setCrop(next)
  }

  const syncRefs = (layout) => {
    layoutRef.current = {
      scale: layout.scale,
      imageRect: layout.imageRect,
      maxCropSize: layout.maxCropSize,
    }
    imgPanRef.current = layout.imgPan
    cropRef.current = layout.crop
    setImgPan(layout.imgPan)
    setCrop(layout.crop)
  }

  const resetTransform = useCallback((image) => {
    if (!image) return
    syncRefs(getInitialCropLayout(image, WORKSPACE, CROP_MIN))
  }, [])

  useEffect(() => {
    if (!open || !source) {
      setImg(null)
      setError('')
      return
    }
    let cancelled = false
    setLoading(true)
    setError('')
    loadImageElement(source)
      .then((loaded) => {
        if (cancelled) return
        setImg(loaded)
        resetTransform(loaded)
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err.message?.includes('carregar')
              ? 'Não foi possível carregar a imagem. Se for uma URL externa, baixe e envie do computador.'
              : err.message || 'Erro ao carregar imagem.',
          )
          setImg(null)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [open, source, resetTransform])

  const getLocalPoint = (e) => {
    const rect = workspaceRef.current?.getBoundingClientRect()
    if (!rect) return { x: 0, y: 0 }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const onPointerDown = (e) => {
    if (!img || loading) return
    const pt = getLocalPoint(e)
    const mode = hitTestCrop(pt.x, pt.y, cropRef.current)
    if (!mode) return

    e.currentTarget.setPointerCapture(e.pointerId)
    setCursor(mode === 'move' ? 'move' : CURSOR_BY_HANDLE[mode] || 'default')

    dragRef.current = {
      mode,
      startX: e.clientX,
      startY: e.clientY,
      crop: { ...cropRef.current },
    }
  }

  const onPointerMove = (e) => {
    const pt = getLocalPoint(e)
    const { imageRect } = layoutRef.current

    if (!dragRef.current) {
      if (img) {
        const mode = hitTestCrop(pt.x, pt.y, cropRef.current)
        setCursor(mode === 'move' ? 'move' : mode ? CURSOR_BY_HANDLE[mode] : 'default')
      }
      return
    }

    if (!img || !imageRect) return

    const { mode, startX, startY, crop: startCrop } = dragRef.current
    const dx = e.clientX - startX
    const dy = e.clientY - startY

    if (mode === 'move') {
      applyCrop(clampCropBox(
        { x: startCrop.x + dx, y: startCrop.y + dy, size: startCrop.size },
        imageRect,
        WORKSPACE,
        CROP_MIN,
      ))
      return
    }

    applyCrop(resizeCropFromHandle(
      startCrop,
      mode,
      dx,
      dy,
      imageRect,
      WORKSPACE,
      CROP_MIN,
    ))
  }

  const onPointerUp = (e) => {
    dragRef.current = null
    if (img && e) {
      const pt = getLocalPoint(e)
      const mode = hitTestCrop(pt.x, pt.y, cropRef.current)
      setCursor(mode === 'move' ? 'move' : mode ? CURSOR_BY_HANDLE[mode] : 'default')
    } else {
      setCursor('default')
    }
  }

  const handleApply = () => {
    if (!img) return
    const { sourceX, sourceY, sourceSize } = cropToSourceRect(
      cropRef.current,
      imgPanRef.current,
      layoutRef.current.scale,
    )
    onApply(renderCroppedDataUrl(img, { sourceX, sourceY, sourceSize, outputSize }))
    onClose()
  }

  const scale = layoutRef.current.scale

  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="420px">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <p style={{ fontSize: '0.75rem', color: '#666', margin: 0, lineHeight: 1.6 }}>
          <Move size={12} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '4px' }} />
          A foto fica <strong style={{ color: '#888', fontWeight: 600 }}>fixa</strong>. Arraste o quadrado para enquadrar
          ou use os cantos e bordas para mudar o tamanho.
        </p>

        <div
          ref={workspaceRef}
          style={{
            position: 'relative',
            width: WORKSPACE,
            height: WORKSPACE,
            margin: '0 auto',
            background: '#0a0a0a',
            border: '1px solid #2a2a2a',
            borderRadius: '4px',
            overflow: 'hidden',
            cursor: img ? cursor : 'default',
            touchAction: 'none',
            userSelect: 'none',
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {loading && (
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#555',
              fontSize: '0.8rem',
              zIndex: 6,
            }}>
              Carregando...
            </div>
          )}

          {img && !loading && (
            <div
              style={{
                position: 'absolute',
                left: imgPan.x,
                top: imgPan.y,
                width: img.naturalWidth,
                height: img.naturalHeight,
                transform: `scale(${scale})`,
                transformOrigin: '0 0',
                pointerEvents: 'none',
              }}
            >
              <img
                src={source}
                alt=""
                width={img.naturalWidth}
                height={img.naturalHeight}
                draggable={false}
                style={{ display: 'block', maxWidth: 'none', maxHeight: 'none' }}
              />
            </div>
          )}

          {img && !loading && <CropOverlay crop={crop} />}
        </div>

        {error && (
          <p style={{ fontSize: '0.75rem', color: '#dc2626', margin: 0, textAlign: 'center' }}>{error}</p>
        )}

        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn-ghost"
            disabled={!img || loading}
            onClick={() => resetTransform(img)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem' }}
          >
            <RotateCcw size={13} /> Redefinir
          </button>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" className="btn-ghost" onClick={onClose}>Cancelar</button>
            <button
              type="button"
              className="btn-primary"
              disabled={!img || loading || !!error}
              onClick={handleApply}
            >
              Aplicar
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
