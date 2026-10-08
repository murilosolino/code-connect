import { Button, CodeEditor, Icon, MediaPanel, Surface, type IconName } from '../components/ui'
import { usePageTitle } from '../hooks/usePageTitle'

const BANNER_CODE = 'const comunidade = devs\n  .map(compartilhar)\n  .map(comentar)\n  .filter(aprender);'

const STEPS: { icon: IconName; text: string }[] = [
  {
    icon: 'upload',
    text: 'Publique um projeto com a imagem do código, uma descrição e as tags das tecnologias usadas.',
  },
  { icon: 'code', text: 'Aprove e compartilhe os projetos que te ensinarem algo.' },
  { icon: 'chat', text: 'Comente, responda e siga os perfis que você quer acompanhar.' },
]

const H2 = 'text-paragraph-large font-normal text-text-primary lg:text-subtitle'
const COPY = 'max-w-copy text-paragraph text-text-primary'

/** Sobre nós: conteúdo estático com o propósito, a missão, como funciona e para quem é. */
export function AboutPage() {
  usePageTitle('Sobre nós')

  return (
    <div className="flex flex-col gap-6">
      <MediaPanel
        padding="none"
        className="flex flex-col gap-6 px-4 py-6 lg:flex-row lg:flex-wrap lg:items-center lg:gap-10 lg:p-10"
      >
        <div className="flex flex-col gap-4 text-cinza-escuro lg:flex-1 lg:basis-80">
          <p className="text-subtitle-large font-medium lg:text-heading">Código em primeiro plano</p>
          <p className="text-paragraph-small lg:text-paragraph-large">
            Uma rede para compartilhar projetos e conversar sobre código.
          </p>
        </div>
        <div className="lg:flex-1 lg:basis-90">
          <CodeEditor size="banner" decorative code={BANNER_CODE} highlight={['const']} />
        </div>
      </MediaPanel>

      <Surface as="article" padding="page" className="flex flex-col gap-8 lg:gap-10">
        <section className="flex flex-col gap-6">
          <h1 className="text-subtitle-large font-medium text-text-primary lg:text-heading-small">
            Sobre nós
          </h1>
          <p className={COPY}>
            O CodeConnect é uma rede social para quem programa. Aqui você publica seus projetos,
            mostra o código por trás deles e recebe comentários de outras pessoas desenvolvedoras.
          </p>
        </section>

        <section aria-labelledby="sobre-missao" className="flex flex-col gap-4">
          <h2 id="sobre-missao" className={H2}>
            Nossa missão
          </h2>
          <p className={COPY}>
            Tornar o aprendizado em programação mais colaborativo. Ler o código de outras pessoas, e
            ter o seu lido, é uma das formas mais rápidas de evoluir.
          </p>
        </section>

        <section aria-labelledby="sobre-como-funciona" className="flex flex-col gap-4">
          <h2 id="sobre-como-funciona" className={H2}>
            Como funciona
          </h2>
          <ul className="flex flex-col gap-4 text-paragraph text-text-primary">
            {STEPS.map(({ icon, text }) => (
              <li key={icon} className="flex items-start gap-3 lg:gap-4">
                <span className="pt-0.5 text-text-secondary">
                  <Icon name={icon} />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="sobre-para-quem" className="flex flex-col gap-4">
          <h2 id="sobre-para-quem" className={H2}>
            Para quem é
          </h2>
          <p className={COPY}>
            Para quem está começando e quer feedback, e para quem já tem experiência e quer
            compartilhar o que aprendeu.
          </p>
        </section>

        <Button variant="primary" to="/publicar" icon="arrow_forward" className="self-start">
          Publicar um projeto
        </Button>
      </Surface>
    </div>
  )
}
