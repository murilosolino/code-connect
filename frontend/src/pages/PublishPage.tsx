import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Button, PageTitle, TextField } from '../components/ui'
import { useAppActions } from '../data/store/hooks'
import { ImageUpload } from '../features/publish/ImageUpload'
import { TagInput } from '../features/publish/TagInput'
import { useFormValidation } from '../hooks/useFormValidation'
import { usePageTitle } from '../hooks/usePageTitle'
import { projectSchema } from '../lib/validation'

/** Novo projeto: imagem do código, nome, descrição e tags. Nada é enviado a um servidor. */
export function PublishPage() {
  usePageTitle('Novo projeto')
  const navigate = useNavigate()
  const { publishPost } = useAppActions()
  const form = useFormValidation(projectSchema)
  const [tags, setTags] = useState<string[]>([])
  const [imageUrl, setImageUrl] = useState<string>()

  const handleSubmit = form.handleSubmit(({ title, description }) => {
    const id = publishPost({ title, description, tags, imageUrl })
    navigate(`/projeto/${id}`)
  })

  // A prévia só vive enquanto o rascunho existe; ao publicar, o projeto passa a usá-la.
  const discard = () => {
    if (imageUrl) URL.revokeObjectURL(imageUrl)
  }

  return (
    <div className="flex flex-col gap-8">
      <PageTitle>Novo projeto</PageTitle>
      <div className="flex flex-wrap items-start gap-6">
        <div className="min-w-0 flex-1 basis-100">
          <ImageUpload onChange={setImageUrl} />
        </div>
        <form onSubmit={handleSubmit} noValidate className="flex min-w-0 flex-1 basis-95 flex-col gap-6">
          <TextField
            label="Nome do projeto"
            placeholder="Dashboard de vendas com React"
            {...form.register('title')}
          />
          <TextField
            label="Descrição"
            type="textarea"
            placeholder="Conte o que o projeto faz, como foi construído e o que você aprendeu."
            {...form.register('description')}
          />
          <TagInput tags={tags} onChange={setTags} />
          {/* "Publicar" vem primeiro no HTML (ordem do Tab); no desktop "Descartar" fica à esquerda, como no protótipo. */}
          <div className="flex flex-col gap-4 pt-2 lg:flex-row-reverse lg:flex-wrap lg:pt-4">
            <Button variant="primary" type="submit" icon="arrow_forward" className="lg:flex-1 lg:basis-40">
              Publicar
            </Button>
            <Button
              variant="tertiary"
              to="/"
              icon="delete"
              onClick={discard}
              className="lg:flex-1 lg:basis-40"
            >
              Descartar
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
