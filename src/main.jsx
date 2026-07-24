import './index.css'
import './services/skillsMigration'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { registerAutoSaveOnStorage, isAppBootstrapped, autoSave } from './services/saveService'
import { storage, KEYS } from './services/storage'

registerAutoSaveOnStorage()

if (isAppBootstrapped() && !storage.get(KEYS.appBootstrapped)) {
  storage.set(KEYS.appBootstrapped, true)
}
if (isAppBootstrapped()) {
  autoSave()
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
