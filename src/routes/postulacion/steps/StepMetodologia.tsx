import type { WizardForm } from '../types'
import { Textarea } from '../../../components/ui/textarea'
import { FieldError, FieldWrapper, OptionCard, markTouched } from './shared'

export default function StepMetodologia({ form }: { form: WizardForm }) {
  return (
    <div className="space-y-6">
      <form.Field name="metodologia">
        {(field) => (
          <FieldWrapper label="Metodología de trabajo">
            <div className="grid gap-3 sm:grid-cols-2">
              <OptionCard
                label="Me adapto a una metodología definida"
                active={field.state.value === 'Me adapto a una metodología definida'}
                onClick={() => {
                  markTouched(field)
                  field.handleChange('Me adapto a una metodología definida')
                }}
              />
              <OptionCard
                label="Necesito aplicar la mía"
                active={field.state.value === 'Necesito aplicar la mía'}
                onClick={() => {
                  markTouched(field)
                  field.handleChange('Necesito aplicar la mía')
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

      <form.Field name="sentido_comun">
        {(field) => (
          <FieldWrapper label="¿Qué significa el sentido común aplicado para vos?">
            <Textarea
              value={field.state.value ?? ''}
              onChange={(event) => {
                markTouched(field)
                field.handleChange(event.target.value)
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
