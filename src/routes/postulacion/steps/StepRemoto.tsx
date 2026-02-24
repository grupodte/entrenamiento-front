import type { WizardForm } from '../types'
import { FieldError, FieldWrapper, OptionCard, YesNoButtons, markTouched } from './shared'

export default function StepRemoto({ form }: { form: WizardForm }) {
  return (
    <div className="space-y-6">
      <form.Field name="remoto_100">
        {(field) => (
          <FieldWrapper
            label="¿Podés trabajar 100% remoto?"
            hint="Excluyente: si respondés que no, la postulación finaliza."
          >
            <YesNoButtons
              value={field.state.value}
              onChange={(value) => {
                markTouched(field)
                field.handleChange(value)
              }}
            />
            <FieldError
              touched={field.state.meta.isTouched}
              error={field.state.meta.errors?.[0] as string}
            />
          </FieldWrapper>
        )}
      </form.Field>

      <form.Field name="disponibilidad">
        {(field) => (
          <FieldWrapper
            label="Disponibilidad semanal"
            hint="Excluyente: se requiere un mínimo de 6 horas por día."
          >
            <div className="grid gap-3 sm:grid-cols-3">
              <OptionCard
                label="4-5 hs"
                description="Por día"
                active={field.state.value === '4-5'}
                onClick={() => {
                  markTouched(field)
                  field.handleChange('4-5')
                }}
              />
              <OptionCard
                label="6 hs"
                description="Por día"
                active={field.state.value === '6'}
                onClick={() => {
                  markTouched(field)
                  field.handleChange('6')
                }}
              />
              <OptionCard
                label="6+ hs"
                description="Por día"
                active={field.state.value === '6+'}
                onClick={() => {
                  markTouched(field)
                  field.handleChange('6+')
                }}
              />
            </div>
            <FieldError
              touched={field.state.meta.isTouched}
              error={field.state.meta.errors?.[0] as string}
            />
          </FieldWrapper>
        )}
      </form.Field>
    </div>
  )
}
