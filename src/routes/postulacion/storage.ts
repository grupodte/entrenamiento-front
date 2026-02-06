import type { ApplicationFormValues } from './schema'

const STORAGE_KEY = 'ddfit_postulacion_v1'
const EXIT_KEY = 'ddfit_postulacion_exit_v1'
const STORAGE_VERSION = 1

export type StoredApplication = {
  version: number
  updatedAt: string
  step: number
  values: ApplicationFormValues
}

const canUseStorage = () => typeof window !== 'undefined'

export const loadApplication = (): StoredApplication | null => {
  if (!canUseStorage()) return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredApplication
    if (!parsed || parsed.version !== STORAGE_VERSION) return null
    return parsed
  } catch {
    return null
  }
}

export const saveApplication = (values: ApplicationFormValues, step: number) => {
  if (!canUseStorage()) return
  const payload: StoredApplication = {
    version: STORAGE_VERSION,
    updatedAt: new Date().toISOString(),
    step,
    values
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

export const clearApplication = () => {
  if (!canUseStorage()) return
  window.localStorage.removeItem(STORAGE_KEY)
}

export const setExitReason = (reason: string) => {
  if (!canUseStorage()) return
  window.localStorage.setItem(EXIT_KEY, reason)
}

export const getExitReason = () => {
  if (!canUseStorage()) return null
  return window.localStorage.getItem(EXIT_KEY)
}

export const clearExitReason = () => {
  if (!canUseStorage()) return
  window.localStorage.removeItem(EXIT_KEY)
}
