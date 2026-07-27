import React, { useRef, useState } from 'react'
import { ImagePlus, Trash2, Link2, X } from 'lucide-react'
import { Field, Input } from './Field'
import { Modal } from './Modal'
import { compressImageToDataUrl } from '../../utils/imageFile'
import { genId } from '../../utils/id'

export const MAX_SCENE_IMAGES = 8

export function normalizeSceneImages(images) {
  if (!Array.isArray(images)) return []
  return images
    .filter(img => img && typeof img.src === 'string' && img.src.trim())
    .map(img => ({
      id: img.id || genId(),
      src: img.src.trim(),
      caption: typeof img.caption === 'string' ? img.caption : '',
    }))
}

/** Editor de galeria (ambiente / referência visual) — paisagem, sem crop quadrado. */
export function SceneImageGalleryEditor({
  images = [],
  onChange,
  label = 'Imagens de ambiente',
  max = MAX_SCENE_IMAGES,
}) {
  const inputRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showUrl, setShowUrl] = useState(false)
  const [urlDraft, setUrlDraft] = useState('')

  const list = normalizeSceneImages(images)
  const atMax = list.length >= max

  const commit = next => onChange?.(normalizeSceneImages(next))

  const addSrc = (src, caption = '') => {
    if (!src?.trim() || atMax) return
    commit([...list, { id: genId(), src: src.trim(), caption }])
  }

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || atMax) return
    setError('')
    setLoading(true)
    try {
      const dataUrl = await compressImageToDataUrl(file, 1280, 0.82)
      addSrc(dataUrl)
    } catch (err) {
      setError(err.message || 'Erro ao processar imagem.')
    } finally {
      setLoading(false)
    }
  }

  const addUrl = () => {
    const url = urlDraft.trim()
    if (!url) return
    if (!/^https?:\/\//i.test(url) && !url.startsWith('data:')) {
      setError('Use uma URL http(s) válida.')
      return
    }
    setError('')
    addSrc(url)
    setUrlDraft('')
  }

  const updateCaption = (id, caption) => {
    commit(list.map(img => img.id === id ? { ...img, caption } : img))
  }

  const remove = (id) => {
    commit(list.filter(img => img.id !== id))
  }

  return (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        marginBottom: '0.5rem',
        flexWrap: 'wrap',
      }}>
        <div style={{ fontSize: '0.65rem', color: '#444', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
          {label.toUpperCase()} · {list.length}/{max}
        </div>
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn-secondary"
            disabled={loading || atMax}
            onClick={() => inputRef.current?.click()}
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.7rem', opacity: atMax ? 0.45 : 1 }}
          >
            <ImagePlus size={13} />
            {loading ? 'Carregando…' : 'Adicionar imagem'}
          </button>
          <button
            type="button"
            className="btn-ghost"
            disabled={atMax}
            onClick={() => setShowUrl(s => !s)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.7rem', color: '#555' }}
          >
            <Link2 size={12} /> URL
          </button>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFile}
        style={{ display: 'none' }}
      />

      <p style={{ fontSize: '0.65rem', color: '#444', lineHeight: 1.45, margin: '0 0 0.65rem' }}>
        Mapas, locais, clima, referências de atmosfera · JPG/PNG/WebP/GIF · até 5 MB · comprimido automaticamente
      </p>

      {showUrl && (
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.65rem', flexWrap: 'wrap' }}>
          <Input
            value={urlDraft}
            onChange={e => setUrlDraft(e.target.value)}
            placeholder="https://…"
            style={{ flex: 1, minWidth: '160px' }}
          />
          <button type="button" className="btn-secondary" onClick={addUrl} style={{ fontSize: '0.7rem' }}>
            Incluir URL
          </button>
        </div>
      )}

      {error && (
        <p style={{ fontSize: '0.7rem', color: '#dc2626', margin: '0 0 0.5rem' }}>{error}</p>
      )}

      {list.length === 0 ? (
        <div style={{
          padding: '1rem',
          background: '#0d0d0d',
          border: '1px dashed #1a1a1a',
          borderRadius: '4px',
          fontSize: '0.75rem',
          color: '#444',
          textAlign: 'center',
        }}>
          Nenhuma imagem ainda — adicione referências do ambiente desta cena.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {list.map((img, idx) => (
            <div
              key={img.id}
              style={{
                display: 'flex',
                gap: '0.75rem',
                background: '#0d0d0d',
                border: '1px solid #1a1a1a',
                borderRadius: '4px',
                padding: '0.5rem',
                alignItems: 'stretch',
              }}
            >
              <div style={{
                width: '120px',
                height: '80px',
                flexShrink: 0,
                borderRadius: '3px',
                overflow: 'hidden',
                background: '#111',
                border: '1px solid #1a1a1a',
              }}>
                <img
                  src={img.src}
                  alt={img.caption || `Ambiente ${idx + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <Field label={`Legenda ${idx + 1}`}>
                  <Input
                    value={img.caption}
                    onChange={e => updateCaption(img.id, e.target.value)}
                    placeholder="Ex.: Entrada do mercado à noite…"
                  />
                </Field>
              </div>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => remove(img.id)}
                title="Remover"
                style={{ alignSelf: 'flex-start', color: '#555', padding: '4px' }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/** Grade de visualização + lightbox */
export function SceneImageGalleryView({ images = [], title = 'Ambiente' }) {
  const list = normalizeSceneImages(images)
  const [openId, setOpenId] = useState(null)
  const current = list.find(i => i.id === openId) || null

  if (list.length === 0) return null

  return (
    <>
      <div style={{ marginTop: '0.65rem', marginBottom: '0.35rem' }}>
        <div style={{ fontSize: '0.6rem', color: '#444', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>
          {title.toUpperCase()} · {list.length}
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
          gap: '0.4rem',
        }}>
          {list.map(img => (
            <button
              key={img.id}
              type="button"
              onClick={() => setOpenId(img.id)}
              title={img.caption || 'Ampliar'}
              style={{
                padding: 0,
                border: '1px solid #1a1a1a',
                borderRadius: '3px',
                overflow: 'hidden',
                background: '#0d0d0d',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ height: '72px', overflow: 'hidden' }}>
                <img
                  src={img.src}
                  alt={img.caption || ''}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
              {img.caption && (
                <div style={{
                  padding: '4px 6px',
                  fontSize: '0.6rem',
                  color: '#666',
                  lineHeight: 1.35,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {img.caption}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <Modal
        open={!!current}
        onClose={() => setOpenId(null)}
        title={current?.caption || title}
        maxWidth="860px"
      >
        {current && (
          <div>
            <div style={{
              background: '#0a0a0a',
              border: '1px solid #1a1a1a',
              borderRadius: '4px',
              overflow: 'hidden',
              marginBottom: current.caption ? '0.75rem' : 0,
            }}>
              <img
                src={current.src}
                alt={current.caption || title}
                style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain', display: 'block' }}
              />
            </div>
            {current.caption && (
              <p style={{ fontSize: '0.85rem', color: '#999', margin: 0, lineHeight: 1.5 }}>{current.caption}</p>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button type="button" className="btn-ghost" onClick={() => setOpenId(null)} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <X size={14} /> Fechar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
