import type { WizardForm } from '../types'
import { Input } from '../../../components/ui/input'
import { FieldError, FieldWrapper, markTouched } from './shared'

export default function StepDatos({ form }: { form: WizardForm }) {
  return (
    <div className="space-y-6">
      <form.Field name="nombre_apellido">
        {(field) => (
          <FieldWrapper label="Nombre y apellido">
            <Input
              value={field.state.value ?? ''}
              onChange={(event) => {
                markTouched(field)
                field.handleChange(event.target.value)
              }}
            />
            <FieldError touched={field.state.meta.isTouched} error={field.state.meta.errors?.[0] as string} />
          </FieldWrapper>
        )}
      </form.Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <form.Field name="edad">
          {(field) => (
            <FieldWrapper label="Edad">
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
        <form.Field name="pais">
          {(field) => (
            <FieldWrapper label="País">
              <Input
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

      <div className="grid gap-4 sm:grid-cols-2">
        <form.Field name="ciudad">
          {(field) => (
            <FieldWrapper label="Ciudad">
              <Input
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
        <form.Field name="email">
          {(field) => (
            <FieldWrapper label="Email">
              <Input
                type="email"
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

      <form.Field name="whatsapp">
        {(field) => (
          <FieldWrapper label="WhatsApp">
            <Input
              value={field.state.value ?? ''}
              onChange={(event) => {
                markTouched(field)
                field.handleChange(event.target.value)
              }}
            />
            <FieldError touched={field.state.meta.isTouched} error={field.state.meta.errors?.[0] as string} />
          </FieldWrapper>
        )}
      </form.Field>
    </div>
  )
}
