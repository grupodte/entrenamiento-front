import type { ApplicationValues } from './schema'

export const submitApplication = async (payload: ApplicationValues) => {
  return Promise.resolve({ ok: true, payload })
}
