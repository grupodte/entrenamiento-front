import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../../components/ui/dialog'
import { setExitReason } from './storage'

const EXIT_DELAY_MS = 1400

export default function ExitRedirect({
  open,
  reason,
  onComplete
}: {
  open: boolean
  reason: string | null
  onComplete?: () => void
}) {
  const navigate = useNavigate()

  useEffect(() => {
    if (!open || !reason) return
    setExitReason(reason)
    const timer = setTimeout(() => {
      navigate({ to: '/postulacion/no-seleccionado', search: { reason } })
      onComplete?.()
    }, EXIT_DELAY_MS)

    return () => clearTimeout(timer)
  }, [open, reason, navigate, onComplete])

  return (
    <Dialog open={open}>
      <DialogContent>
        <DialogTitle>No podemos continuar</DialogTitle>
        <DialogDescription className="mt-2">
          {reason}
        </DialogDescription>
        <p className="mt-4 text-[12px] text-black/50">
          Te vamos a redirigir en unos segundos.
        </p>
      </DialogContent>
    </Dialog>
  )
}
