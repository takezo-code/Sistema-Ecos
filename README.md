# Sistema RPG

Ferramenta web para **mestres e jogadores** gerenciarem campanhas de RPG de mesa — fichas, combate, skills, NPCs e progressão em um só lugar.

Desenvolvido como projeto pessoal / portfólio, com foco em UX de mesa, mecânicas customizadas e interface dark temática.

---

## Sobre o projeto

O **Sistema RPG** concentra o fluxo de uma mesa:

- criação e evolução de personagens
- gestão de NPCs, bosses e organizações
- combate por **marcas de dano** (sem HP tradicional)
- skills de classe com cooldown, sobrecarga de Eco e buffs/recuos
- rolagem de dados e exportação de ficha

Tudo roda no navegador, com persistência local — sem backend obrigatório.

---

## Funcionalidades

### Campanha e mundo
- História / campanha ativa
- Organizações e estrutura da mesa
- Sessões e contexto de jogo

### Personagens e entidades
- Criação guiada de personagens
- Fichas com atributos físicos e de cena
- NPCs, elites e bosses
- Equipamento (arma / armadura) com passivas
- Progressão por XP, pontos de atributo e skills

### Classes e skills
Classes jogáveis com skills ativas e passivas:

| Classe   | Papel        |
|----------|--------------|
| Traçado  | Precisão / distância |
| Baluarte | Tank / linha de frente |
| Fratura  | Dano bruto |
| Fenda    | Magia / ruptura |
| Sutura   | Suporte / cura |

Cada skill segue padrão de descrição, efeito mecânico e consequência (incluindo recuo proporcional de atributos).

### Combate
- Painel de combate por personagem
- Marcas de dano leve / médio / grave
- Skills ativas com cooldown e custo de Eco
- Passivas de classe (ex.: regeneração do Baluarte abaixo de 10 de vida)
- Histórico de rolagens e dificuldade (CD)

### Outros
- Rolagem de dados (d4–d100 e contextual com atributos)
- Exportação de ficha (PNG / PDF)
- Lixeira / arquivamento de entidades
- Tema visual dark com animações (GSAP / OGL)

---

## Stack

| Camada        | Tecnologia                          |
|---------------|-------------------------------------|
| UI            | React 19                            |
| Build         | Vite 8                              |
| Estilo        | Tailwind CSS 4                      |
| Componentes   | Radix UI, Lucide Icons              |
| Estado        | Zustand                             |
| Animação      | GSAP, Motion, OGL                   |
| Exportação    | html-to-image, jsPDF                |
| Persistência  | LocalStorage                        |

---

## Como rodar

### Pré-requisitos
- Node.js 18+ (recomendado LTS)
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

Abra o endereço indicado no terminal (geralmente `http://localhost:5173`).

### Build de produção

```bash
npm run build
npm run preview
```

### Lint

```bash
npm run lint
```

---

## Estrutura (resumo)

```text
src/
├── components/     # UI, combate, skills, equipamento
├── constants/      # classes, atributos, estados
├── data/           # catálogo de skills
├── mechanics/      # motores de combate, eco, buffs, passivas
├── pages/          # telas principais
├── services/       # storage, progressão, exportação
└── store/          # Zustand (personagens, NPCs, combate…)
```

---

## Documentação

- [Manual do Jogador](docs/MANUAL_JOGADOR.md) — criação, classes, vida, Eco, descanso e rolagem

---

## Status

Projeto em evolução (MVP funcional). Novas mecânicas de classe, combate e polish visual continuam sendo iteradas.

---

## Autor

**takezo-code** — [github.com/takezo-code](https://github.com/takezo-code)

---

## Licença

Uso pessoal / portfólio. Consulte o repositório para detalhes de licença, se aplicável.
