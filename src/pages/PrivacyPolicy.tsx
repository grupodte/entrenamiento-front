import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { useSEO } from '../lib/useSEO'

const lastUpdated = '12 de julio de 2026'
const legalName = 'Daniel Demicheri'
const country = 'Uruguay'
const privacyEmail = 'contacto@demicherifitness.com'
const minimumAge = '18'

const toc = [
  ['responsable', 'Responsable y contacto'],
  ['datos', 'Datos que recopilamos'],
  ['finalidades', 'Finalidades del tratamiento'],
  ['base-legal', 'Base legal y GDPR'],
  ['terceros', 'Terceros y encargados'],
  ['transferencias', 'Transferencias internacionales'],
  ['retencion', 'Retención de datos'],
  ['derechos', 'Derechos del usuario'],
  ['eliminacion', 'Eliminación de cuenta'],
  ['seguridad', 'Seguridad'],
  ['menores', 'Menores de edad'],
  ['salud', 'Aviso de salud'],
  ['cambios', 'Cambios a esta política'],
  ['contacto', 'Contacto'],
] as const

const purposes = [
  {
    category: 'Identidad y cuenta',
    purpose:
      'Crear y autenticar la cuenta, administrar el perfil, prevenir accesos no autorizados, enviar emails transaccionales y brindar soporte.',
  },
  {
    category: 'Datos de salud y fitness',
    purpose:
      'Preparar, adaptar y registrar rutinas; mostrar progreso; permitir seguimiento de peso y medidas corporales; ofrecer una experiencia de entrenamiento personalizada.',
  },
  {
    category: 'Token de dispositivo',
    purpose:
      'Enviar notificaciones push permitidas por el usuario, incluyendo recordatorios, avisos del servicio y mensajes relacionados con su entrenamiento.',
  },
  {
    category: 'Uso y diagnóstico',
    purpose:
      'Detectar errores, mejorar rendimiento, mantener seguridad, analizar estabilidad de la app y priorizar mejoras técnicas.',
  },
  {
    category: 'Reproducción de video',
    purpose:
      'Entregar videos de entrenamiento, optimizar calidad de streaming, solucionar fallos de reproducción y medir disponibilidad del contenido.',
  },
  {
    category: 'Grabaciones de audio',
    purpose:
      'Guardar, reproducir o procesar el audio creado voluntariamente por el usuario, según la función específica de la app.',
  },
]

const providers = [
  {
    name: 'Supabase',
    purpose: 'autenticación, gestión de usuarios, almacenamiento de base de datos y servicios backend asociados.',
  },
  {
    name: 'Google Firebase (Firebase Cloud Messaging)',
    purpose: 'envío y administración de notificaciones push mediante tokens de dispositivo.',
  },
  {
    name: 'Mux',
    purpose: 'streaming, entrega, monitoreo y diagnóstico de reproducción de videos.',
  },
  {
    name: 'Resend',
    purpose: 'envío de emails transaccionales, como confirmaciones, avisos operativos o comunicaciones necesarias del servicio.',
  },
  {
    name: 'Vercel (Speed Insights)',
    purpose: 'medición de rendimiento, tiempos de carga y estabilidad técnica de la experiencia web o componentes relacionados.',
  },
]

const retentionItems = [
  'Cuenta e identidad: mientras la cuenta esté activa y por el plazo adicional necesario para fines legales, contables, antifraude o de soporte.',
  'Salud y fitness: mientras la cuenta esté activa o hasta que el usuario elimine esos datos o solicite la eliminación de su cuenta, salvo conservación limitada exigida por ley.',
  'Tokens push: mientras las notificaciones estén habilitadas, el token siga vigente o la cuenta permanezca activa.',
  'Uso, diagnóstico y rendimiento: durante el tiempo necesario para análisis técnico, seguridad y mejora del servicio. Cuando sea posible, estos datos se agregan o anonimizan.',
  'Video: durante el tiempo necesario para entregar el contenido, analizar rendimiento de reproducción y resolver incidencias.',
  'Audio creado por el usuario: mientras el usuario lo conserve en su cuenta o hasta que lo elimine, solicite su eliminación o borre su cuenta.',
]

const userRights = [
  'Solicitar acceso a sus datos personales.',
  'Rectificar datos inexactos o incompletos.',
  'Solicitar la portabilidad de sus datos en un formato estructurado.',
  'Solicitar la eliminación de sus datos personales.',
  'Retirar el consentimiento cuando el tratamiento se base en este.',
  'Oponerse o solicitar la limitación de ciertos tratamientos.',
  'Presentar una reclamación ante la autoridad de protección de datos competente.',
]

function PolicySection({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children: ReactNode
}) {
  return (
    <section id={id} className="privacy-section scroll-mt-24">
      <h2>{title}</h2>
      {children}
    </section>
  )
}

export default function PrivacyPolicy() {
  useSEO({
    title: 'Política de Privacidad | Demicheri Fitness',
    description:
      'Política de Privacidad de Demicheri Fitness, aplicación móvil de entrenamiento personal para iOS y Android.',
    canonical: 'https://demicherifitness.com/privacy',
    ogTitle: 'Política de Privacidad | Demicheri Fitness',
    ogDescription:
      'Información sobre datos recopilados, finalidades, terceros, derechos del usuario y eliminación de cuenta en Demicheri Fitness.',
  })

  return (
    <div className="privacy-page rounded-[10px] sm:rounded-[20px] md:rounded-[28px]" data-allow-copy="true">
      <div className="privacy-shell">
        <header className="privacy-hero">
          <Link to="/" className="privacy-back-link">
            Demicheri Fitness
          </Link>
          <p className="privacy-eyebrow">Política pública</p>
          <h1>Política de Privacidad</h1>
          <div className="privacy-meta" aria-label="Información de la aplicación">
            <span>Aplicación móvil de entrenamiento personal para iOS y Android</span>
            <span>
              Bundle ID: <strong>com.demicheri.fit</strong>
            </span>
            <span>
              Última actualización: <strong>{lastUpdated}</strong>
            </span>
          </div>
        </header>

        <div className="privacy-note" role="note">
          <p>
            Esta política explica cómo Demicheri Fitness recopila, utiliza,
            comparte y protege los datos personales de sus usuarios.
          </p>
        </div>

        <nav className="privacy-toc" aria-labelledby="privacy-toc-title">
          <h2 id="privacy-toc-title">Índice</h2>
          <ol>
            {toc.map(([id, label]) => (
              <li key={id}>
                <a href={`#${id}`}>{label}</a>
              </li>
            ))}
          </ol>
        </nav>

        <article className="privacy-content">
          <PolicySection id="responsable" title="1. Responsable y datos de contacto">
            <p>
              El responsable del tratamiento de los datos personales recopilados a
              través de la aplicación móvil <strong>Demicheri Fitness</strong> es{' '}
              <strong>{legalName}</strong>, con operación en <strong>{country}</strong>.
            </p>
            <p>
              Para consultas sobre privacidad, protección de datos o ejercicio de
              derechos, puede escribir a:{' '}
              <a href={`mailto:${privacyEmail}`}>{privacyEmail}</a>
              .
            </p>
          </PolicySection>

          <PolicySection id="datos" title="2. Qué datos recopilamos y cómo los obtenemos">
            <p>
              Recopilamos los datos necesarios para crear y mantener la cuenta,
              prestar el servicio de entrenamiento, mejorar la experiencia de uso,
              enviar comunicaciones operativas y mantener la seguridad de la app. Los
              datos pueden ser proporcionados directamente por el usuario, generarse
              por el uso de la aplicación o recibirse desde servicios técnicos
              integrados.
            </p>

            <h3>2.1 Identidad y cuenta</h3>
            <p>
              Recopilamos email, nombre y contraseña. La contraseña se almacena
              mediante mecanismos de hash; no almacenamos contraseñas en texto claro.
              Estos datos se obtienen cuando el usuario registra una cuenta, inicia
              sesión, actualiza su perfil o solicita soporte.
            </p>

            <h3>2.2 Datos de salud y fitness</h3>
            <p>
              Recopilamos rutinas asignadas o realizadas, progreso de entrenamiento,
              peso y medidas corporales. Estos datos pueden constituir una categoría
              sensible de datos personales porque se relacionan con la salud, el
              estado físico o características corporales del usuario.
            </p>
            <p>
              Estos datos se obtienen cuando el usuario los ingresa en la app, cuando
              registra entrenamientos, cuando el responsable o un entrenador
              autorizado carga información vinculada al plan, o cuando la app genera
              métricas derivadas del uso del servicio.
            </p>

            <h3>2.3 Token de dispositivo para notificaciones push</h3>
            <p>
              Si el usuario permite las notificaciones, recopilamos un token de
              dispositivo para enviar notificaciones push relacionadas con la app,
              como recordatorios de entrenamiento, avisos operativos o novedades del
              servicio. El usuario puede desactivar las notificaciones desde los
              ajustes del sistema operativo.
            </p>

            <h3>2.4 Datos de uso y diagnóstico de rendimiento</h3>
            <p>
              Podemos recopilar datos técnicos y de uso, como eventos de navegación
              dentro de la app, tiempos de carga, errores, información de
              rendimiento, versión de la app, sistema operativo, tipo de dispositivo,
              dirección IP aproximada o datos similares necesarios para diagnóstico,
              seguridad y mejora del servicio.
            </p>

            <h3>2.5 Datos de reproducción de video</h3>
            <p>
              Cuando el usuario reproduce videos de entrenamiento, podemos recopilar
              eventos de reproducción, calidad de streaming, duración de
              visualización, errores de reproducción, identificadores técnicos del
              reproductor y datos similares necesarios para entregar y mejorar el
              contenido de video.
            </p>

            <h3>2.6 Grabaciones de audio, si el usuario las crea</h3>
            <p>
              La app puede permitir que el usuario cree o suba grabaciones de audio.
              Solo recopilamos audio si el usuario lo genera explícitamente mediante
              una función visible de la app. No grabamos audio en segundo plano ni
              activamos el micrófono sin una acción del usuario y los permisos
              correspondientes del sistema operativo.
            </p>
          </PolicySection>

          <PolicySection id="finalidades" title="3. Finalidad de cada tratamiento">
            <div className="privacy-table-wrap">
              <table className="privacy-table">
                <thead>
                  <tr>
                    <th scope="col">Categoría de datos</th>
                    <th scope="col">Finalidades</th>
                  </tr>
                </thead>
                <tbody>
                  {purposes.map((item) => (
                    <tr key={item.category}>
                      <td>{item.category}</td>
                      <td>{item.purpose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>
              No vendemos datos personales. Tampoco usamos datos de salud o fitness
              para publicidad comportamental de terceros.
            </p>
          </PolicySection>

          <PolicySection id="base-legal" title="4. Base legal del tratamiento y usuarios de la UE">
            <p>
              Cuando el Reglamento General de Protección de Datos de la Unión Europea
              (GDPR) resulte aplicable, tratamos los datos personales conforme a una
              o más de las siguientes bases legales:
            </p>
            <ul>
              <li>
                <strong>Ejecución de un contrato:</strong> para crear la cuenta,
                autenticar al usuario, prestar el servicio de entrenamiento, mostrar
                rutinas, registrar progreso, reproducir videos y enviar
                comunicaciones transaccionales necesarias.
              </li>
              <li>
                <strong>Consentimiento:</strong> para tratar datos sensibles de salud
                y fitness cuando la ley lo exija, enviar notificaciones push, acceder
                al micrófono si el usuario crea grabaciones de audio, y realizar
                otros tratamientos opcionales que dependan de permisos o aceptación
                expresa.
              </li>
              <li>
                <strong>Interés legítimo, cuando sea permitido:</strong> para
                mantener la seguridad, prevenir abuso, diagnosticar errores y mejorar
                el rendimiento del servicio, siempre ponderando los derechos y
                libertades del usuario.
              </li>
              <li>
                <strong>Obligación legal:</strong> cuando debamos conservar o
                divulgar información para cumplir con una norma, autoridad competente
                o proceso legal aplicable.
              </li>
            </ul>
            <p>
              El usuario puede retirar su consentimiento en cualquier momento desde
              la app, los ajustes del dispositivo o escribiendo al email de contacto.
              La retirada del consentimiento no afecta la licitud del tratamiento
              realizado antes de retirarlo.
            </p>
          </PolicySection>

          <PolicySection id="terceros" title="5. Terceros y encargados de tratamiento">
            <p>
              Compartimos datos personales solo cuando es necesario para operar,
              proteger y mejorar Demicheri Fitness. Estos proveedores actúan como
              encargados de tratamiento o prestadores técnicos, conforme a sus
              propios términos, acuerdos de protección de datos y medidas de
              seguridad.
            </p>
            <ul>
              {providers.map((provider) => (
                <li key={provider.name}>
                  <strong>{provider.name}:</strong> {provider.purpose}
                </li>
              ))}
            </ul>
            <p>
              También podemos compartir información si es necesario para cumplir la
              ley, responder a solicitudes válidas de autoridades, proteger derechos,
              investigar incidentes de seguridad o defender reclamaciones legales.
            </p>
          </PolicySection>

          <PolicySection id="transferencias" title="6. Transferencias internacionales de datos">
            <p>
              La app y sus proveedores pueden procesar o almacenar datos en
              servidores ubicados fuera del país del usuario, incluyendo Estados
              Unidos, la Unión Europea u otras jurisdicciones donde operen nuestros
              proveedores.
            </p>
            <p>
              Cuando la ley aplicable lo requiera, utilizaremos salvaguardas
              razonables para proteger las transferencias internacionales, como
              acuerdos de procesamiento de datos, cláusulas contractuales tipo,
              medidas técnicas de seguridad y evaluación de proveedores.
            </p>
          </PolicySection>

          <PolicySection id="retencion" title="7. Plazos de retención">
            <p>
              Conservamos los datos personales solo durante el tiempo necesario para
              cumplir las finalidades descritas en esta política, prestar el
              servicio, resolver disputas, mantener seguridad, cumplir obligaciones
              legales y atender solicitudes del usuario.
            </p>
            <ul>
              {retentionItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p>
              Las copias de seguridad pueden conservar datos por un periodo limitado
              antes de ser sobrescritas o eliminadas de forma segura, de acuerdo con
              los ciclos técnicos de respaldo.
            </p>
          </PolicySection>

          <PolicySection id="derechos" title="8. Derechos del usuario">
            <p>Según la legislación aplicable, el usuario puede tener derecho a:</p>
            <ul>
              {userRights.map((right) => (
                <li key={right}>{right}</li>
              ))}
            </ul>
            <p>
              Para ejercer estos derechos, escriba a{' '}
              <a href={`mailto:${privacyEmail}`}>{privacyEmail}</a>
              . Podemos solicitar información adicional para verificar la identidad
              del solicitante antes de responder.
            </p>
          </PolicySection>

          <PolicySection id="eliminacion" title="9. Eliminación de cuenta y datos">
            <p>
              El usuario puede borrar su cuenta y todos sus datos personales desde
              dentro de la app, en la sección de configuración o perfil mediante la
              opción <strong>Eliminar cuenta</strong>. Al confirmar la eliminación,
              se eliminarán los datos asociados a la cuenta, incluyendo datos de
              identidad, entrenamiento, progreso, medidas corporales, tokens de
              notificación y contenidos creados por el usuario, salvo información que
              debamos conservar temporalmente por obligación legal, seguridad,
              prevención de fraude o copias de seguridad.
            </p>
            <p>
              Como alternativa, el usuario puede solicitar la eliminación escribiendo
              a{' '}
              <a href={`mailto:${privacyEmail}?subject=Solicitud%20de%20eliminaci%C3%B3n%20de%20cuenta%20Demicheri%20Fitness`}>
                {privacyEmail}
              </a>{' '}
              con el asunto "Solicitud de eliminación de cuenta". Responderemos
              dentro de los plazos exigidos por la ley aplicable.
            </p>
          </PolicySection>

          <PolicySection id="seguridad" title="10. Seguridad">
            <p>
              Aplicamos medidas técnicas y organizativas razonables para proteger los
              datos personales contra acceso no autorizado, pérdida, alteración,
              divulgación o destrucción. Estas medidas incluyen cifrado en tránsito
              mediante HTTPS/TLS, almacenamiento de contraseñas con hash, controles
              de acceso, separación de permisos, prácticas de respaldo y revisión de
              proveedores técnicos.
            </p>
            <p>
              Ningún sistema es completamente seguro. Si detectamos un incidente de
              seguridad que afecte datos personales, tomaremos medidas razonables
              para mitigarlo y notificaremos a los usuarios o autoridades cuando la
              ley lo requiera.
            </p>
          </PolicySection>

          <PolicySection id="menores" title="11. Menores de edad">
            <p>
              Demicheri Fitness está dirigida a personas mayores de{' '}
              <strong>{minimumAge}</strong> años. No recopilamos
              intencionalmente datos personales de menores de esa edad. Si un padre,
              madre, tutor o representante legal considera que un menor nos
              proporcionó datos personales sin autorización, puede contactarnos para
              solicitar su eliminación.
            </p>
          </PolicySection>

          <PolicySection id="salud" title="12. Aviso de salud">
            <p>
              Demicheri Fitness ofrece información, seguimiento y herramientas de
              entrenamiento personal con fines educativos y de bienestar general. La
              app no sustituye el consejo, diagnóstico, tratamiento ni seguimiento de
              un médico, nutricionista, fisioterapeuta u otro profesional de la
              salud.
            </p>
            <p>
              Antes de iniciar o modificar un programa de entrenamiento,
              especialmente si el usuario tiene lesiones, enfermedades, embarazo,
              condiciones preexistentes o dudas sobre su estado físico, debe
              consultar con un profesional de la salud. En caso de emergencia médica,
              debe contactar inmediatamente a los servicios de emergencia locales.
            </p>
          </PolicySection>

          <PolicySection id="cambios" title="13. Cambios a esta política">
            <p>
              Podemos actualizar esta Política de Privacidad para reflejar cambios en
              la app, los proveedores, los tratamientos de datos o la legislación
              aplicable. Cuando realicemos cambios materiales, lo notificaremos por
              medios razonables, como un aviso dentro de la app, email o actualización
              visible de la fecha de "Última actualización" en esta página.
            </p>
            <p>
              El uso continuado de la app después de la entrada en vigor de los
              cambios implica el conocimiento de la versión actualizada, sin perjuicio
              de los consentimientos específicos que puedan requerirse por ley.
            </p>
          </PolicySection>

          <PolicySection id="contacto" title="14. Contacto">
            <p>
              Para preguntas, solicitudes, reclamos o ejercicio de derechos
              vinculados con privacidad y protección de datos, puede contactar a:
            </p>
            <p>
              <strong>Responsable:</strong> {legalName}
              <br />
              <strong>País:</strong> {country}
              <br />
              <strong>Email de privacidad:</strong>{' '}
              <a href={`mailto:${privacyEmail}`}>{privacyEmail}</a>
            </p>
          </PolicySection>
        </article>

        <footer className="privacy-local-footer">
          <p>
            <strong>Demicheri Fitness</strong>
          </p>
          <p>
            Contacto de privacidad:{' '}
            <a href={`mailto:${privacyEmail}`}>{privacyEmail}</a>
          </p>
          <p>
            Este documento es una plantilla informativa. Consulte con un abogado
            calificado para obtener asesoramiento legal específico para su situación.
          </p>
          <p>
            <Link to="/terms">Términos y Condiciones</Link>
          </p>
        </footer>
      </div>
    </div>
  )
}
