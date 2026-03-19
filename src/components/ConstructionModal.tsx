import { useState } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'

export default function ConstructionModal() {
  const [open, setOpen] = useState(true)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="z-[210] w-[min(92vw,460px)]">
        <div className="flex flex-col gap-4">
          <DialogTitle>Sitio en construcción</DialogTitle>
          <DialogDescription>Esta página está en construcción. Volvé pronto.</DialogDescription>
          <div className="flex justify-end">
            <DialogPrimitive.Close asChild>
              <Button size="sm">Entendido</Button>
            </DialogPrimitive.Close>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
