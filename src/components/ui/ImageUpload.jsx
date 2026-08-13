import React, { useRef, useState } from 'react'
import { Upload, X, Link2, User, Crop } from 'lucide-react'
import { Field, Input } from './Field'
import { readImageFileAsDataUrl } from '../../utils/imageCrop'
import { ImageCropModal } from './ImageCropModal'
import { Button } from './Button'

export function ImageUpload({
  value,
  onChange,
  label = 'Foto do personagem',
  outputSize = 512,
}) {
  const inputRef = useRef(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showUrl, setShowUrl] = useState(false)
  const [cropOpen, setCropOpen] = useState(false)
  const [cropSource, setCropSource] = useState('')

  const openCrop = (src) => {
    if (!src?.trim()) return
    setCropSource(src)
    setCropOpen(true)
  }

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setError('')
    setLoading(true)
    try {
      const dataUrl = await readImageFileAsDataUrl(file)
      openCrop(dataUrl)
    } catch (err) {
      setError(err.message || 'Erro ao processar imagem.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Field label={label}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <div style={{
            width: '88px',
            height: '88px',
            flexShrink: 0,
            background: '#0d0d0d',
            border: '1px solid #1a1a1a',
            borderRadius: '4px',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {value ? (
              <img
                src={value}
                alt="Prévia"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={e => { e.target.style.display = 'none' }}
              />
            ) : (
              <User size={28} style={{ color: '#222' }} />
            )}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Button
                type="button"
                variant="secondary"
                size="xs"
                disabled={loading}
                onClick={() => inputRef.current?.click()}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Upload size={13} />
                {loading ? 'Carregando...' : 'Enviar do computador'}
              </Button>
              {value && (
                <>
                  <Button
                    type="button"
                    variant="secondary"
                    size="xs"
                    onClick={() => openCrop(value)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <Crop size={13} /> Ajustar
                  </Button>
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => { onChange(''); setError('') }}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem' }}
                  >
                    <X size={13} /> Remover
                  </button>
                </>
              )}
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setShowUrl(s => !s)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.7rem', color: '#555' }}
              >
                <Link2 size={12} /> {showUrl ? 'Ocultar URL' : 'Usar URL'}
              </button>
            </div>

            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFile}
              style={{ display: 'none' }}
            />

            <p style={{ fontSize: '0.65rem', color: '#444', lineHeight: 1.5, margin: 0 }}>
              JPG, PNG, WebP ou GIF · até 5 MB · ajuste o quadrado de recorte
            </p>

            {error && (
              <p style={{ fontSize: '0.7rem', color: '#dc2626', marginTop: '0.35rem' }}>{error}</p>
            )}

            {showUrl && (
              <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <Input
                  value={value?.startsWith('data:') ? '' : (value || '')}
                  onChange={e => onChange(e.target.value)}
                  placeholder="https://..."
                  style={{ flex: 1, minWidth: '160px' }}
                />
                {value && !value.startsWith('data:') && (value.startsWith('http://') || value.startsWith('https://')) && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="xs"
                    onClick={() => openCrop(value)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}
                  >
                    <Crop size={13} /> Ajustar URL
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </Field>

      <ImageCropModal
        open={cropOpen}
        source={cropSource}
        outputSize={outputSize}
        onClose={() => setCropOpen(false)}
        onApply={dataUrl => {
          onChange(dataUrl)
          setError('')
        }}
      />
    </>
  )
}
