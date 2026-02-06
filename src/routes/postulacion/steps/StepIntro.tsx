import type { WizardForm } from '../types'

export default function StepIntro({}: { form: WizardForm }) {
  return (
    <div className="space-y-4 text-[15px] text-black/70 leading-relaxed">
      <p className="m-0">
        Leé esto antes de empezar: trabajamos 100% online con procesos claros, foco en resultados
        y comunicación constante. Buscamos perfiles con criterio, autonomía y ganas de crecer dentro
        de la marca.
      </p>
      <p className="m-0">
        Este formulario dura menos de 7 minutos. Podés guardar tu avance y retomarlo cuando quieras.
      </p>
    </div>
  )
}
