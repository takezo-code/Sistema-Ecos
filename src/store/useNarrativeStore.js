import { create } from 'zustand'
import { storage, KEYS } from '../services/storage'
import { genId } from '../utils/id'
import { archiveEntity, TRASH_TYPES } from '../services/trashService'

const normalizeEvent = (e) => ({
  ...e,
  type: e.type || 'historia',
  choices: Array.isArray(e.choices) ? e.choices : [],
  selectedChoiceId: e.selectedChoiceId ?? null,
})

const load = () => (storage.get(KEYS.narrative) || []).map(normalizeEvent)

export const useNarrativeStore = create((set, get) => ({
  events: load(),

  getEventsByCampaign(campaignId) {
    return get().events
      .filter(e => e.campaignId === campaignId)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  },

  addEvent(data) {
    const existing = get().events.filter(e => e.campaignId === data.campaignId)
    const isChoice = data.type === 'escolha'
    const event = normalizeEvent({
      id: genId(),
      campaignId: data.campaignId || null,
      type: data.type || 'historia',
      title: data.title || (isChoice ? 'Nova Escolha' : 'Nova Cena'),
      description: data.description || '',
      objective: data.objective || '',
      consequence: data.consequence || '',
      prompt: data.prompt || '',
      choices: isChoice
        ? (data.choices?.length ? data.choices : [
            { id: genId(), label: 'Opção A', outcome: '' },
            { id: genId(), label: 'Opção B', outcome: '' },
          ])
        : [],
      selectedChoiceId: null,
      status: data.status || 'não iniciado',
      order: existing.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    const events = [...get().events, event]
    storage.set(KEYS.narrative, events)
    set({ events })
    return event
  },

  updateEvent(id, data) {
    const events = get().events.map(e =>
      e.id === id ? normalizeEvent({ ...e, ...data, updatedAt: new Date().toISOString() }) : e
    )
    storage.set(KEYS.narrative, events)
    set({ events })
  },

  deleteEvent(id) {
    const event = get().events.find(e => e.id === id)
    if (!event) return
    archiveEntity(TRASH_TYPES.flow, event)
  },

  reorderEvents(campaignId, orderedIds) {
    const events = get().events.map(e => {
      if (e.campaignId !== campaignId) return e
      const idx = orderedIds.indexOf(e.id)
      return { ...e, order: idx >= 0 ? idx : e.order }
    })
    storage.set(KEYS.narrative, events)
    set({ events })
  },

  selectChoice(eventId, choiceId) {
    const events = get().events.map(e =>
      e.id === eventId
        ? normalizeEvent({
            ...e,
            selectedChoiceId: choiceId,
            status: 'concluído',
            updatedAt: new Date().toISOString(),
          })
        : e
    )
    storage.set(KEYS.narrative, events)
    set({ events })
  },

  clearChoice(eventId) {
    const events = get().events.map(e =>
      e.id === eventId
        ? normalizeEvent({
            ...e,
            selectedChoiceId: null,
            status: 'não iniciado',
            updatedAt: new Date().toISOString(),
          })
        : e
    )
    storage.set(KEYS.narrative, events)
    set({ events })
  },
}))
