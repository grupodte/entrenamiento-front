import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { useSEO } from '../lib/useSEO'

const email = 'contacto@demicherifitness.com'

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="privacy-section">
    <h2>{title}</h2>
    {children}
  </section>
)

export default function Terms() {
  useSEO({
    title: 'Términos y Condiciones | Demicheri Fitness',
    description: 'Términos y Condiciones de uso de Demicheri Fitness.',
    canonical: 'https://demicherifitness.com/terms',
    ogTitle: 'Términos y Condiciones | Demicheri Fitness',
    ogDescription: 'Condiciones de uso del servicio Demicheri Fitness.',
  })

  return (
    <div className="privacy-page rounded-[10px] sm:rounded-[20px] md:rounded-[28px]" data-allow-copy="true">
      <div className="privacy-shell">
        <header className="privacy-hero">
          <Link to="/" className="privacy-back-link">Demicheri Fitness</Link>
          <p className="privacy-eyebrow">Documento legal</p>
          <h1>Términos y Condiciones de Uso</h1>
          <div className="privacy-meta">
            <span>Aplicación móvil de entrenamiento personal para iOS y Android</span>
            <span>Última actualización: <strong>12 de julio de 2026</strong></span>
          </div>
        </header>

        <article className="privacy-content">
          <Section title="1. Aceptación">
            <p>Al registrarte o utilizar Demicheri Fitness, aceptás estos términos y nuestra <Link to="/privacy">Política de Privacidad</Link>. Si no estás de acuerdo, no utilices la app.</p>
          </Section>
          <Section title="2. Servicio y cuenta">
            <p>La app ofrece herramientas de entrenamiento, seguimiento, contenido y comunicación con fines de bienestar general. Debés proporcionar información verdadera, mantener la confidencialidad de tus credenciales y avisarnos si detectás un acceso no autorizado.</p>
          </Section>
          <Section title="3. Autenticación">
            <p>Podés registrarte con email o mediante Google o Apple. Estos proveedores pueden compartir información básica del perfil conforme a los permisos que autorices. Supabase gestiona la autenticación y la sesión de la cuenta.</p>
          </Section>
          <Section title="4. Uso aceptable">
            <ul>
              <li>Usar la app solo para fines personales y legales.</li>
              <li>No acceder a cuentas, datos o funciones sin autorización.</li>
              <li>No copiar, vender ni redistribuir el contenido.</li>
              <li>No cargar contenido fraudulento, ofensivo, ilegal o que infrinja derechos de terceros.</li>
              <li>No interferir con la seguridad o disponibilidad del servicio.</li>
            </ul>
          </Section>
          <Section title="5. Contenido y propiedad intelectual">
            <p>La app, su diseño, marca, textos, rutinas, videos y demás contenidos pertenecen a Demicheri Fitness o a sus licenciantes. Se concede una licencia personal, limitada, no exclusiva y revocable mientras la cuenta esté habilitada.</p>
          </Section>
          <Section title="6. Planes y pagos">
            <p>Cuando existan planes pagos, sus condiciones, precio, duración y renovación se mostrarán antes de confirmar la contratación. Las compras realizadas mediante Apple se gestionan conforme a las reglas de App Store y las compras realizadas por otros medios conforme a sus condiciones específicas.</p>
          </Section>
          <Section title="7. Salud y responsabilidad">
            <p>El contenido es informativo y de bienestar general; no constituye consejo médico ni garantiza resultados. Consultá con un profesional antes de entrenar si tenés lesiones, enfermedades, embarazo o dudas sobre tu estado físico.</p>
          </Section>
          <Section title="8. Disponibilidad">
            <p>La app requiere conexión y puede actualizarse, suspenderse o modificarse por mantenimiento, seguridad, cambios técnicos o causas fuera de nuestro control. Procuramos mantener el servicio disponible, pero no garantizamos funcionamiento ininterrumpido.</p>
          </Section>
          <Section title="9. Suspensión y eliminación">
            <p>Podemos limitar, suspender o cerrar una cuenta ante incumplimientos, fraude, abuso, riesgos de seguridad o exigencias legales. Podés solicitar la eliminación escribiendo a <a href={`mailto:${email}`}>{email}</a>; la eliminación de datos se regirá por la Política de Privacidad.</p>
          </Section>
          <Section title="10. Limitación de responsabilidad">
            <p>El servicio se ofrece en la medida permitida por la ley aplicable. No respondemos por daños derivados de un uso contrario a estos términos, información incorrecta del usuario, interrupciones ajenas a nuestro control o decisiones de entrenamiento tomadas sin asesoramiento profesional.</p>
          </Section>
          <Section title="11. Cambios">
            <p>Podemos modificar estos términos para reflejar cambios en la app, el servicio o la normativa. Publicaremos la versión actualizada y, cuando corresponda, notificaremos cambios materiales.</p>
          </Section>
          <Section title="12. Contacto y ley aplicable">
            <p>Para consultas, escribí a <a href={`mailto:${email}`}>{email}</a>. Estos términos se interpretan conforme a la legislación aplicable en Uruguay, sin perjuicio de los derechos imperativos que correspondan al consumidor en su jurisdicción.</p>
          </Section>
        </article>

        <footer className="privacy-local-footer">
          <p><strong>Demicheri Fitness</strong></p>
          <p>Responsable: Daniel Demicheri · Uruguay</p>
          <p>Contacto: <a href={`mailto:${email}`}>{email}</a></p>
          <p>Este documento es una plantilla informativa. Consulte con un abogado calificado para obtener asesoramiento legal específico para su situación.</p>
          <p><Link to="/privacy">Política de Privacidad</Link></p>
        </footer>
      </div>
    </div>
  )
}
