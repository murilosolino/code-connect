/**
 * Dados de exemplo extraídos dos protótipos (`Feed`, `Post` e `Perfil`).
 * É a única fonte de dados desta etapa: as telas leem pelos hooks de `store/`,
 * nunca daqui diretamente (FR-003).
 */
import type { AppState, Comment, Post, Reply, User } from './types'
import { VIEWER_HANDLE } from './viewer'

const users: User[] = [
  {
    handle: 'julio',
    name: 'Júlio Oliveira',
    initials: 'JO',
    bio: 'Desenvolvedor front-end em São Paulo. Gosto de React, acessibilidade e interfaces rápidas, e publico aqui os projetos que construo nos fins de semana.',
    connections: 25,
  },
  {
    handle: 'ana.souza',
    name: 'Ana Souza',
    initials: 'AS',
    bio: 'Back-end com Node.js e testes automatizados. Gosto de APIs bem documentadas.',
    connections: 48,
  },
  { handle: 'rafa.dev', name: 'Rafael Dias', initials: 'RD', connections: 31 },
  { handle: 'bia', name: 'Beatriz Lima', initials: 'BL', connections: 12 },
  { handle: 'marcos', name: 'Marcos Pereira', initials: 'MP', connections: 19 },
  {
    handle: 'carol',
    name: 'Carolina Mendes',
    initials: 'CM',
    bio: 'Full stack com Next.js. Escrevo sobre bancos de dados e deploy contínuo.',
    connections: 40,
  },
]

const posts: Post[] = [
  {
    id: 'vendas',
    title: 'Dashboard de vendas com React',
    summary:
      'Painel com gráficos interativos e filtros por período, consumindo uma API REST de pedidos.',
    description:
      'Painel com gráficos interativos e filtros por período, consumindo uma API REST de pedidos. Os totais são calculados no cliente com useMemo, para a interface continuar rápida mesmo com milhares de registros, e cada gráfico pode ser exportado como imagem.',
    tags: ['React', 'TypeScript', 'Vite'],
    approvals: 32,
    shares: 6,
    authorHandle: 'julio',
    code: "import { useMemo } from 'react';\nimport { Grafico } from './Grafico';\n\nexport function Vendas({ pedidos, periodo }) {\n  const filtrados = useMemo(\n    () => pedidos.filter((p) => noPeriodo(p, periodo)),\n    [pedidos, periodo]\n  );\n  const total = somar(filtrados);\n  return <Grafico dados={filtrados} total={total} />;\n}",
  },
  {
    id: 'auth',
    title: 'API de autenticação em Node',
    summary: 'Login com JWT e refresh token, rotas protegidas e testes de integração com Jest.',
    description:
      'Login com JWT e refresh token, rotas protegidas e testes de integração com Jest.',
    tags: ['Node.js', 'Express', 'Jest'],
    approvals: 21,
    shares: 4,
    authorHandle: 'ana.souza',
    code: "router.post('/login', async (req, res) => {\n  const user = await autenticar(req.body);\n  const token = assinar(user.id);\n  res.json({ token });\n});",
  },
  {
    id: 'landing',
    title: 'Landing page responsiva sem framework',
    summary: 'Layout mobile first com CSS Grid e Flexbox, testado com leitor de tela.',
    description: 'Layout mobile first com CSS Grid e Flexbox, testado com leitor de tela.',
    tags: ['HTML', 'CSS', 'Acessibilidade'],
    approvals: 18,
    shares: 9,
    authorHandle: 'rafa.dev',
    code: '.grade {\n  display: grid;\n  grid-template-columns:\n    repeat(auto-fit, minmax(16rem, 1fr));\n  gap: 1.5rem;\n}',
  },
  {
    id: 'memoria',
    title: 'Jogo da memória em JavaScript',
    summary: 'Cartas embaralhadas, contador de jogadas e recorde salvo no navegador.',
    description: 'Cartas embaralhadas, contador de jogadas e recorde salvo no navegador.',
    tags: ['JavaScript', 'DOM'],
    approvals: 15,
    shares: 3,
    authorHandle: 'bia',
    code: 'function embaralhar(cartas) {\n  return cartas\n    .map((c) => [Math.random(), c])\n    .sort((a, b) => a[0] - b[0])\n    .map(([, c]) => c);\n}',
  },
  {
    id: 'clima',
    title: 'Previsão do tempo no terminal',
    summary: 'CLI em Python que consulta uma API pública e mostra a semana em uma tabela.',
    description: 'CLI em Python que consulta uma API pública e mostra a semana em uma tabela.',
    tags: ['Python', 'CLI'],
    approvals: 9,
    shares: 1,
    authorHandle: 'marcos',
    code: "def semana(cidade):\n    dados = buscar(cidade)\n    for dia in dados['dias']:\n        print(dia['data'], dia['max'])",
  },
  {
    id: 'tarefas',
    title: 'Lista de tarefas com Next.js e Prisma',
    summary: 'CRUD completo com PostgreSQL, autenticação e deploy contínuo.',
    description: 'CRUD completo com PostgreSQL, autenticação e deploy contínuo.',
    tags: ['Next.js', 'Prisma', 'PostgreSQL'],
    approvals: 27,
    shares: 5,
    authorHandle: 'carol',
    code: 'export async function POST(req) {\n  const { titulo } = await req.json();\n  const tarefa = await prisma.tarefa\n    .create({ data: { titulo } });\n  return Response.json(tarefa);\n}',
  },
  {
    id: 'calendario',
    title: 'Calendário acessível em React',
    summary:
      'Componente de calendário navegável pelo teclado, com rótulos para leitores de tela.',
    description:
      'Componente de calendário navegável pelo teclado, com rótulos para leitores de tela.',
    tags: ['React', 'Acessibilidade'],
    approvals: 14,
    shares: 2,
    authorHandle: 'julio',
    code: 'function Dia({ data, selecionado }) {\n  return (\n    <button\n      aria-pressed={selecionado}\n      aria-label={formatar(data)}\n    >\n      {data.getDate()}\n    </button>\n  );\n}',
  },
  {
    id: 'portfolio',
    title: 'Portfólio estático com Astro',
    summary: 'Site pessoal gerado no build, com posts em Markdown e imagens otimizadas.',
    description: 'Site pessoal gerado no build, com posts em Markdown e imagens otimizadas.',
    tags: ['Astro', 'Markdown'],
    approvals: 11,
    shares: 3,
    authorHandle: 'julio',
    code: "---\nconst posts = await Astro.glob('./posts/*.md');\n---\n<ul>\n  {posts.map((p) => <li>{p.frontmatter.titulo}</li>)}\n</ul>",
  },
]

const initialsOf = (handle: string) => (handle === 'voce' ? 'V' : handle.charAt(0).toUpperCase())

type Entry = { by: string; text: string; replies?: { by: string; text: string }[] }

function buildComments(postId: string, entries: Entry[]): Comment[] {
  return entries.map((entry, index) => {
    const id = `${postId}-c${index + 1}`
    const replies: Reply[] = (entry.replies ?? []).map((reply, replyIndex) => ({
      id: `${id}-r${replyIndex + 1}`,
      authorHandle: reply.by,
      authorInitials: initialsOf(reply.by),
      text: reply.text,
    }))
    return {
      id,
      postId,
      authorHandle: entry.by,
      authorInitials: initialsOf(entry.by),
      text: entry.text,
      replies,
    }
  })
}

const commentsByPost: Record<string, Entry[]> = {
  vendas: [
    {
      by: 'ana.souza',
      text: 'Ficou muito limpo o uso do useMemo nos filtros. Você pensou em paginar os pedidos?',
      replies: [{ by: 'julio', text: 'Pensei sim! Vou testar scroll infinito na próxima versão.' }],
    },
    {
      by: 'rafa.dev',
      text: 'Os gráficos ficaram ótimos no celular. Qual biblioteca você usou?',
      replies: [
        { by: 'julio', text: 'Recharts, com um tema próprio usando as cores do projeto.' },
        { by: 'carol', text: 'Uso Recharts também, dá para customizar bastante.' },
      ],
    },
    { by: 'bia', text: 'Salvei para estudar depois. Parabéns pelo projeto!' },
  ],
  auth: [
    { by: 'julio', text: 'Os testes de integração com Jest estão muito bem organizados.' },
    {
      by: 'carol',
      text: 'Como você guarda o refresh token? Cookie httpOnly ou banco?',
      replies: [{ by: 'ana.souza', text: 'Cookie httpOnly, com rotação a cada uso.' }],
    },
    { by: 'rafa.dev', text: 'Vale mostrar o fluxo de logout também.' },
    { by: 'bia', text: 'Estou aprendendo JWT e este exemplo ajudou bastante.' },
    { by: 'marcos', text: 'Dá para reaproveitar o middleware em outras rotas?' },
    { by: 'julio', text: 'Adorei a separação entre rotas públicas e protegidas.' },
    { by: 'carol', text: 'Salvei nos favoritos. Obrigada por compartilhar!' },
  ],
  landing: [
    { by: 'julio', text: 'Testar com leitor de tela faz toda a diferença. Parabéns!' },
    { by: 'ana.souza', text: 'O grid com auto-fit resolveu bem as quebras de coluna.' },
  ],
  memoria: [
    { by: 'ana.souza', text: 'Bem divertido! O recorde no navegador ficou ótimo.' },
    { by: 'marcos', text: 'Dá para trocar o embaralhamento por Fisher-Yates?' },
    {
      by: 'carol',
      text: 'Já pensou em adicionar níveis de dificuldade?',
      replies: [{ by: 'bia', text: 'Boa ideia, vou incluir cartas extras nos níveis maiores.' }],
    },
    { by: 'rafa.dev', text: 'As cartas têm contraste suficiente? Vale testar com o modo escuro.' },
    { by: 'julio', text: 'Código curto e fácil de ler.' },
  ],
  clima: [
    { by: 'bia', text: 'Que ideia legal para quem vive no terminal.' },
    { by: 'julio', text: 'Dá para escolher a unidade de temperatura?' },
  ],
  tarefas: [
    { by: 'julio', text: 'O deploy contínuo ficou redondinho.' },
    { by: 'ana.souza', text: 'Por que Prisma em vez de uma query direta?' },
    {
      by: 'rafa.dev',
      text: 'As rotas estão protegidas por middleware ou por layout?',
      replies: [{ by: 'carol', text: 'Por middleware, assim vale para todas as rotas da área logada.' }],
    },
    { by: 'bia', text: 'Mostra como ficou o esquema do banco?' },
    { by: 'marcos', text: 'Gostei do CRUD completo, serve de base para estudo.' },
    { by: 'julio', text: 'Aprovado e salvo!' },
  ],
  calendario: [
    { by: 'ana.souza', text: 'Navegar pelo calendário só com o teclado funcionou muito bem.' },
    { by: 'carol', text: 'O aria-label com a data completa foi uma ótima escolha.' },
    { by: 'rafa.dev', text: 'Faltou só o suporte a intervalos de datas.' },
    { by: 'bia', text: 'Vou usar como referência no meu projeto.' },
  ],
  portfolio: [{ by: 'marcos', text: 'Astro é uma ótima escolha para sites estáticos.' }],
}

/** Cria um estado novo a cada chamada: recarregar a página restaura os dados de exemplo (FR-004). */
export function createSeedState(): AppState {
  return {
    users: Object.fromEntries(users.map((user) => [user.handle, { ...user }])),
    posts: posts.map((post) => ({ ...post, tags: [...post.tags] })),
    comments: Object.fromEntries(
      posts.map((post) => [post.id, buildComments(post.id, commentsByPost[post.id] ?? [])]),
    ),
    viewer: {
      handle: VIEWER_HANDLE,
      approvedPostIds: ['auth', 'tarefas'],
      followingHandles: [],
    },
    nextId: 1,
  }
}
