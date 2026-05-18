import React from 'react'

export function Field({ label, required, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
      <label style={{ fontSize: '0.7rem', color: '#555', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>
        {label}{required && <span style={{ color: '#dc2626', marginLeft: '2px' }}>*</span>}
      </label>
      {children}
    </div>
  )
}

export function Input({ ...props }) {
  return <input className="input-base" {...props} />
}

export function Textarea({ rows = 3, ...props }) {
  return (
    <textarea
      className="input-base"
      rows={rows}
      style={{ resize: 'vertical', lineHeight: 1.5 }}
      {...props}
    />
  )
}

export function Select({ children, ...props }) {
  return (
    <select
      className="input-base"
      style={{ cursor: 'pointer' }}
      {...props}
    >
      {children}
    </select>
  )
}
