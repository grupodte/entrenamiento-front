import { supabase } from '../../lib/supabaseClient'
import type { ApplicationValues } from './schema'

export const submitApplication = async (payload: ApplicationValues) => {
  const { error } = await supabase.from('postulaciones').insert({
    email: payload.email ?? null,
    rol: payload.rol ?? null,
    source: 'web',
    payload
  })

  if (error) {
    if (error.code === '23505') {
      console.warn('Duplicate postulacion ignored', error)
      return { ok: true, duplicate: true }
    }
    console.error('Error saving postulacion', error)
    return { ok: false, error }
  }

  return { ok: true }
}
