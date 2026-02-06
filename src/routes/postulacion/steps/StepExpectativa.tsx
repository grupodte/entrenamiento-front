import type { WizardForm } from '../types'
import { Input } from '../../../components/ui/input'
import { Textarea } from '../../../components/ui/textarea'
import { FieldError, FieldWrapper, YesNoButtons, markTouched } from './shared'

export default function StepExpectativa({ form }: { form: WizardForm }) {
  return (
    <div className="space-y-6">
      <form.Field name="expectativa_usd_mensual">
        {(field) => (
          <FieldWrapper label="Expectativa económica mensual (USD)">
            <Input
              type="number"
              min={0}
              value={field.state.value ?? ''}
              onChange={(event) => {
                markTouched(field)
                const value = event.target.value
                field.handleChange(value === '' ? undefined : Number(value))
              }}
            />
            <FieldError
              touched={field.state.meta.isTouched}
              error={field.state.meta.errors?.[0] as string}
            />
          </FieldWrapper>
        )}
      </form.Field>

      <form.Field name="flexible_por_volumen">
        {(field) => (
          <FieldWrapper label="¿Sos flexible según volumen de trabajo?">
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

      <form.Field name="estilo_comunicacion">
        {(field) => (
          <FieldWrapper label="¿Cómo te comunicás con tus clientes?">
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
