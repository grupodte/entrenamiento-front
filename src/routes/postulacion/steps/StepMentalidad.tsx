import type { WizardForm } from '../types'
import { FieldError, FieldWrapper, OptionCard, YesNoButtons, markTouched } from './shared'

export default function StepMentalidad({ form }: { form: WizardForm }) {
  return (
    <div className="space-y-6">
      <form.Field name="preferencia_trabajo">
        {(field) => (
          <FieldWrapper label="Preferencia de trabajo">
            <div className="grid gap-3 sm:grid-cols-2">
              <OptionCard
                label="Crecer dentro de una marca"
                active={field.state.value === 'Crecer dentro de una marca'}
                onClick={() => {
                  markTouched(field)
                  field.handleChange('Crecer dentro de una marca')
                }}
              />
              <OptionCard
                label="Prefiero independiente"
                active={field.state.value === 'Prefiero independiente'}
                onClick={() => {
                  markTouched(field)
                  field.handleChange('Prefiero independiente')
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

      <form.Field name="interes_crecer_con_marca">
        {(field) => (
          <FieldWrapper label="¿Te interesa crecer con la marca en el tiempo?">
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
    </div>
  )
}
