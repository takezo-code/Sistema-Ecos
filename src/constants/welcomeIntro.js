export const CONTACT_EMAIL = 'thales.gcr05@gmail.com'

export const GITHUB_REPO_URL = 'https://github.com/takezo-code/sistema-rpg'

export const GITHUB_ISSUES_URL = `${GITHUB_REPO_URL}/issues`

export const AUTHOR_GITHUB_URL = 'https://github.com/takezo-code'

export const CONTACT_MAILTO = `mailto:${CONTACT_EMAIL}?subject=Sugestão%20—%20Sistema%20ECOS`

export const COMMUNITY_LINKS = [
  {
    id: 'repo',
    title: 'Repositório no GitHub',
    description: 'Código-fonte, histórico de versões e documentação do projeto.',
    href: GITHUB_REPO_URL,
  },
  {
    id: 'issues',
    title: 'Sugestões e bugs',
    description: 'Abra uma issue para reportar problemas ou propor melhorias.',
    href: GITHUB_ISSUES_URL,
  },
  {
    id: 'author',
    title: 'Perfil do autor',
    description: 'Outros projetos e contato pelo GitHub.',
    href: AUTHOR_GITHUB_URL,
  },
  {
    id: 'email',
    title: 'E-mail de contato',
    description: CONTACT_EMAIL,
    href: CONTACT_MAILTO,
  },
]
