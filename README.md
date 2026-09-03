<p align="center">
  <img src="docs/screenshots/logo.png" alt="ECOS" width="140" />
</p>

<h1 align="center">ECOS</h1>

<p align="center">
  <strong>Sistema de RPG de mesa no navegador</strong><br />
  Campanha, fichas, combate, Eco e narrativa — tudo em um só lugar.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/status-finalizado-22c55e?style=flat-square" alt="Status: finalizado" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite 8" />
  <img src="https://img.shields.io/badge/Zustand-estado-433e38?style=flat-square" alt="Zustand" />
  <img src="https://img.shields.io/badge/local--first-sem%20backend-0ea5e9?style=flat-square" alt="Local-first" />
</p>

<p align="center">
  <a href="#-sobre">Sobre</a> ·
  <a href="#-capturas-de-tela">Screenshots</a> ·
  <a href="#-o-que-o-sistema-faz">Funcionalidades</a> ·
  <a href="#-stack">Stack</a> ·
  <a href="#-como-rodar">Como rodar</a> ·
  <a href="#-manuais">Manuais</a>
</p>

---

## Sobre

**ECOS** é um aplicativo web completo para conduzir campanhas de RPG de mesa. Foi pensado para a mesa de verdade: o mestre cria o mundo, os jogadores evoluem fichas, o combate roda com marcas e Eco, e a história fica registrada sem planilha solta.

O projeto está **finalizado** como sistema jogável — mecânicas, interface, persistência local, exportações e manuais em PDF prontos para uso.

### Pilares do sistema

| Pilar | Como funciona |
|-------|----------------|
| **Marcas de vida** | Em vez de HP clássico: marcas leves/graves e estados corporais |
| **Eco** | Recurso de skills com limite seguro, sobrecarga e consequências |
| **Cinco classes** | Traçado, Baluarte, Fratura, Fenda e Sutura — cada uma com passiva e skills |
| **Narrativa** | História, escolhas, organizações e linha do tempo da campanha |
| **Local-first** | Tudo no navegador; import/export JSON quando precisar trocar de máquina |

<p align="center">
  <img src="docs/screenshots/11-combate.png" alt="Painel de combate ECOS" width="100%" />
  <br />
  <em>Combate com grupo, inimigos, skills, marcas e histórico de rolagens.</em>
</p>

---

## Capturas de tela

### História e decisões

Fluxo narrativo com cenas, objetivos e escolhas com consequência.

<p align="center">
  <img src="docs/screenshots/02-campanha-historia.png" alt="Fluxo narrativo da campanha" width="100%" />
</p>

### Criação

Personagens, NPCs, bosses e organizações no mesmo fluxo.

<p align="center">
  <img src="docs/screenshots/04-criacao.png" alt="Tela de criação" width="90%" />
</p>

### Gestão e ficha

| Lista de personagens | Ficha do personagem |
|:---:|:---:|
| <img src="docs/screenshots/05-personagens.png" alt="Lista de personagens" width="100%" /> | <img src="docs/screenshots/08-ficha-tracado.png" alt="Ficha do personagem" width="100%" /> |

### Organizações

Facções com ideologia, aliados e inimigos para consulta na mesa.

<p align="center">
  <img src="docs/screenshots/07-organizacao.png" alt="Organização da campanha" width="72%" />
</p>

---

## O que o sistema faz

### Campanha e narrativa
- Campanhas locais com import / export em JSON
- Linha do tempo (passado, presente, futuro)
- Fluxo de história e escolhas com status
- Organizações com lore estruturado

### Personagens e entidades
- Criação guiada de personagens, NPCs, bosses e organizações
- Atributos físicos + atributos de cena
- Equipamento (arma + armadura) com atributos por rolagem e skill da arma
- Progressão por XP, pontos de atributo e investimento de Eco

### Classes jogáveis

| Classe | Papel |
|--------|--------|
| **Traçado** | Precisão / distância |
| **Baluarte** | Linha de frente / tank |
| **Fratura** | DPS corpo a corpo |
| **Fenda** | Controle / canal de Eco |
| **Sutura** | Suporte / cura |

Cada classe traz skills próprias, passiva, cooldown e progressão por Eco.

### Combate
- Mesa com múltiplos personagens e inimigos
- Marcas de dano e estados
- Skills com custo de Eco, cooldown e histórico
- CD configurável e rolagens com bônus de classe / equipamento

### Utilitários
- Dados avulsos e contextualizados
- Exportação de ficha (PNG / PDF)
- Lixeira de entidades
- Manuais oficiais em PDF na tela inicial
- Preferências: efeito de clique e background animado

---

## Stack

Aplicação **SPA** moderna, sem backend obrigatório.

| Camada | Tecnologia |
|--------|------------|
| UI | [React 19](https://react.dev/) |
| Build | [Vite 8](https://vitejs.dev/) |
| Estilo | [Tailwind CSS 4](https://tailwindcss.com/) |
| Estado | [Zustand](https://zustand.docs.pmnd.rs/) |
| Ícones | [Lucide](https://lucide.dev/) |
| Motion | [Motion](https://motion.dev/), [GSAP](https://gsap.com/) |
| WebGL | [OGL](https://github.com/oframe/ogl) (fundo animado) |
| UI auxiliar | [Vaul](https://vaul.emilkowal.ski/), Radix Scroll Area |
| Exportação | html-to-image, jsPDF |
| Persistência | LocalStorage (save completo da campanha) |

---

## Como rodar

### Pré-requisitos

- Node.js 18+ (LTS recomendado)
- npm

### Instalação

```bash
git clone https://github.com/takezo-code/sistema-rpg.git
cd sistema-rpg
npm install
```

### Desenvolvimento

```bash
npm run dev
```

Abra `http://localhost:5173`.

### Produção

```bash
npm run build
npm run preview
```

### Lint

```bash
npm run lint
```

---

## Manuais

Na tela inicial → **Conteúdos**, os PDFs oficiais estão disponíveis para download:

| Manual | Conteúdo |
|--------|----------|
| **Classes** | Classes, passivas, atributos e skills |
| **História** | Lore e organizações do mundo |
| **Manual Mestre** | Como usar o sistema na mesa |
| **Manual Jogadores** | Como o sistema funciona |

Arquivos em `public/manuals/`.

---

## Estrutura

```text
src/
├── components/   # UI, combate, skills, equipamento, welcome
├── constants/    # classes, atributos, estados, tema
├── data/         # catálogo de skills
├── mechanics/    # combate, Eco, equipamento, passivas
├── pages/        # telas principais
├── services/     # storage, save/import, downloads
└── store/        # Zustand

public/manuals/   # PDFs oficiais
docs/screenshots/ # imagens deste README
```

---

## Status

**Finalizado.** O sistema está completo para mesa: criação, gestão, combate, progressão, saves locais, exportações e manuais.

Melhorias pontuais e feedback da comunidade continuam bem-vindos via issues.

---

## Autor

**takezo-code** — [github.com/takezo-code](https://github.com/takezo-code)

Contato: [thales.gcr05@gmail.com](mailto:thales.gcr05@gmail.com)

---

## Licença

Projeto pessoal / portfólio. Uso e distribuição conforme combinado com o autor.
