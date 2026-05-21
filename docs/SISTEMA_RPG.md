# Sistema RPG — Documentação do Mestre

**Versão do documento:** maio/2026 · reflete o estado atual do aplicativo `sistema-rpg`

Este manual descreve como o sistema funciona **hoje** no software: atributos, combate sem HP tradicional, cena narrativa, inimigos/bosses, poderes de Eco e progressão. Use-o na mesa ou como referência ao criar fichas.

---

## Sumário

1. [Visão geral](#1-visão-geral)
2. [Estrutura do aplicativo](#2-estrutura-do-aplicativo)
3. [Atributos](#3-atributos)
4. [Estados físicos e marcas de dano](#4-estados-físicos-e-marcas-de-dano)
5. [Estados mentais e Sobrecarga de Eco](#5-estados-mentais-e-sobrecarga-de-eco)
6. [Rolagem e resultados](#6-rolagem-e-resultados)
7. [Aba Cena (narrativa social)](#7-aba-cena-narrativa-social)
8. [Aba Combate](#8-aba-combate)
9. [Inimigos e Bosses](#9-inimigos-e-bosses)
10. [Vitalidade](#10-vitalidade)
11. [Skills e poderes de Eco](#11-skills-e-poderes-de-eco)
12. [Progressão e experiência](#12-progressão-e-experiência)
13. [Campanhas, grupos e sessões](#13-campanhas-grupos-e-sessões)
14. [Referência rápida](#14-referência-rápida)

---

## 1. Visão geral

### Filosofia do sistema

| Princípio | Como funciona no app |
|-----------|----------------------|
| **Sem HP como foco** | Personagens e inimigos usam **marcas de dano** que mudam o **estado físico**, não uma barra de vida única. |
| **Consequências** | Ferimentos penalizam atributos físicos; sobrecarga de Eco afeta poderes temporais e mente. |
| **Duas camadas de atributos** | **Físicos** (combate, ação) e **sociais** (cena, interação). |
| **Mestre no centro** | O app organiza fichas, rolagens e marcas; a narrativa final é do mestre. |

### O que o jogador NÃO vê como “vida”

- Não há campo “HP 45/45”.
- Dano é registrado como **marcas** (Leve +1, Médio +2, Grave +3).
- O estado **Estável → Ferido → Grave → Incapacitado** deriva do total de marcas (com modificador de Vitalidade).

---

## 2. Estrutura do aplicativo

### Menu principal

| Seção | Função |
|-------|--------|
| **Dashboard** | Visão geral da campanha ativa. |
| **Campanha** | História e registro de sessões. |
| **Gerenciamento** | Criar/editar personagens, NPCs, bosses, organizações. |
| **Skills** | Catálogo de habilidades (Personagem / NPC / Boss). |
| **Em jogo → Ficha** | Ficha completa do personagem (modo mestre). |
| **Em jogo → Cena** | Interação narrativa com atributos **sociais**. |
| **Em jogo → Combate** | Confronto com atributos **físicos** e marcas. |
| **Dados** | Rolador genérico de dados. |
| **Lixeira** | Entidades excluídas recuperáveis. |

### Campanha ativa

Quase tudo é filtrado pela **campanha ativa**. Personagens, NPCs, grupos e sessões de cena/combate pertencem a uma campanha.

---

## 3. Atributos

### Atributos físicos (combate e ação)

Usados na aba **Combate**, rolagens de ataque, defesa e habilidades físicas/Eco.

| Sigla | Nome | Máx. típico | Uso principal |
|-------|------|-------------|---------------|
| FOR | Força | 10 | Ataques corpo a corpo, imposição física. |
| DES | Destreza | 10 | Esquiva, precisão, reflexos. |
| INT | Inteligência | 10 | Tática, análise, pressão mental dirigida. |
| VIT | Vitalidade | 10 | Resistência ao trauma; ver [seção 10](#10-vitalidade). |
| RUP | Ruptura | 5 | Potência de habilidades de Eco (só com poderes de Eco). |

**Criação:** 10 pontos para distribuir; máximo **4** por atributo na criação.

**Progressão (nível 2–20):**

- Com **poderes de Eco:** níveis **pares** → +1 ponto de atributo; níveis **ímpares** (3, 5, 7…) → +1 ponto de Eco.
- **Sem** poderes de Eco (NPCs comuns): todo nível par dá atributo; sem Ruptura nem skills de Eco.

### Atributos sociais (cena)

Usados **somente** na aba **Cena** (jogadores e boss/inimigo na cena).

| Sigla | Nome | Máx. típico | Uso principal |
|-------|------|-------------|---------------|
| CAR | Carisma | 8 | Persuasão, presença, liderança. |
| PER | Percepção | 8 | Notar detalhes, mentiras, perigo. |
| VON | Vontade | 8 | Resistir manipulação, manter foco. |
| SAB | Sabedoria | 8 | Intuição, conhecimento aplicado. |

**Criação:** 6 pontos sociais; máximo **4** por atributo na criação.

**Progressão:** +1 ponto social por nível do personagem, do nível **2 ao 15**. Após nível 15, não ganha mais pontos sociais automáticos.

### Valor efetivo na rolagem

Na interface, ao clicar em um atributo no card de combate/cena:

```
Total = d20 + valor efetivo do atributo
```

O **valor efetivo** pode ser menor que o valor na ficha quando há penalidades de estado físico ou sobrecarga de Eco (atributos mentais).

---

## 4. Estados físicos e marcas de dano

### Marcas de dano

| Tipo | Marcas | Exemplos narrativos |
|------|--------|---------------------|
| **Leve** | +1 | Arranhão, contusão. |
| **Médio** | +2 | Corte, fratura menor. |
| **Grave** | +3 | Fratura séria, hemorragia. |

Marcas são **somadas**. O mestre aplica pelo painel no card (botões Leve / Médio / Grave) ou ajusta manualmente.

### Tabela de estados (padrão)

| Total de marcas | Estado no app | Label na mesa | Penalidade em FOR, DES, VIT |
|-----------------|---------------|---------------|-----------------------------|
| 0–2 | `bem` | **Estável** | Nenhuma |
| 3–5 | `ferido` | **Ferido** | −5% |
| 6–8 | `grave` | **Grave** | −10% |
| 9+ | `incapacitado` | **Incapacitado** | −20% |

O estado físico é **recalculado automaticamente** ao aplicar ou curar marcas. O mestre ainda pode alterar o estado manualmente no dropdown do card.

### Cura de marcas

- **−1:** remove uma marca; estado recalcula.
- **Limpar marcas:** zera marcas e volta para Estável (descanso narrativo).

### Boss com limite de marcas

Inimigos podem ter **Marcas Máximas** (ex.: 15). Quando `marcas atuais ≥ marcas máximas`, o card exibe **DERROTADO** (narrativamente: derrotado/capturado/fora de combate — o mestre define).

---

## 5. Estados mentais e Sobrecarga de Eco

### Estados mentais (personagem)

Derivados principalmente da **Sobrecarga de Eco** (uso de habilidades Ativas e Ruptura). Também editáveis manualmente.

| Estado | Label | Efeito resumido |
|--------|-------|-----------------|
| `estavel` | Estável | Sem penalidade mental. |
| `abalado` | Abalado | −5% Eco; lapsos leves (5/5). |
| `fragmentado` | Fragmentado | −10% Eco; −5% INT/RUP (6/5). |
| `dissociado` | Dissociado | −20% Eco; −10% INT/RUP (7/5). |
| `perdido_no_tempo` | Perdido no Tempo | −80% Eco; −40% INT/RUP; instabilidade severa (9/5+). |

Cada estado traz **consequências narrativas** sugeridas na ficha (hesitação, medo, desconexão, etc.).

### Sobrecarga de Eco (`ecoOverload`)

- Contador exibido como **N/5** na barra estável; **6+** entra em fase de ruptura.
- **Passivas** não aumentam sobrecarga.
- **Ativas** e **Ruptura** aumentam +1 por uso.
- Em **5/5:** aplica status *Mentalmente Abalado*.
- Em **10/5:** dispara evento de **Ruptura Total** (desfecho crítico temporal).

**Descanso:** ação “Descansar” / recuperação de grupo zera sobrecarga e pode limpar marcas (conforme botões na aba).

Documentação técnica adicional: `docs/ECO_OVERLOAD.md`, `docs/ECO_SKILLS.md`.

---

## 6. Rolagem e resultados

Ao rolar **d20 + atributo** (clique no atributo no card), o app classifica o resultado:

| Condição | Resultado | Orientação narrativa |
|----------|-----------|----------------------|
| Natural **1** no d20 | **Falha crítica** | Erro grave, vulnerabilidade, consequência forte. |
| Total **≤ 9** | **Falha** | Ação não funciona como esperado. |
| Total **10–17** | **Sucesso parcial** | Funciona com pequena consequência. |
| Total **≥ 18** e d20 ≠ 20 | **Sucesso** | Ação clara e eficaz. |
| Natural **20** no d20 | **Sucesso crítico** | Resultado excepcional; grande vantagem narrativa. |

> **Nota:** Aplicar marcas de dano após a rolagem é **manual** pelo mestre (botões de marcas), salvo ajustes futuros. A rolagem informa o *quão bem* a ação foi; as marcas registram o *dano concretizado*.

---

## 7. Aba Cena (narrativa social)

**Caminho:** Em jogo → Cena

### Propósito

Resolver **interação, investigação, diálogo e tensão social** — não combate armado direto.

### O que aparece nos cards dos jogadores

- Estado **mental** (dropdown).
- **Sem** barra de sobrecarga Eco (oculta neste modo).
- **Sem** estado físico nem painel de marcas de dano.
- **Apenas atributos sociais** (CAR, PER, VON, SAB) — clique para rolar d20.
- Skills, XP de destaque, turno, anotações.

### Painel lateral

| Situação | Painel direito |
|----------|----------------|
| **Sem inimigo** selecionado | **Notas da cena** (texto livre: ambiente, pistas, falas). |
| **Com inimigo/boss** na cena | **Card do inimigo** (atributos sociais, estado mental, sem marcas). |

Seletor de inimigo no topo (ícone caveira): escolha quem o grupo está enfrentando socialmente.

### Sessão da cena

- Grupo presente (filtro de personagens).
- Contador de **turno** (narrativo).
- Botão **Descansar grupo** (zera sobrecarga Eco e marcas dos membros).

---

## 8. Aba Combate

**Caminho:** Em jogo → Combate

### Propósito

Confronto físico: ataques, ferimentos, marcas, estados e uso de Eco em combate.

### Cards dos jogadores

- Barra de **Sobrecarga de Eco**.
- Estados **físico** e **mental**.
- Painel de **marcas de dano** (Leve / Médio / Grave, curar, limpar).
- **Atributos físicos** (FOR, DES, INT, VIT, RUP se aplicável).
- Skills ativáveis, anotações de combate.

### Card do inimigo / boss

- Resistência física, resistência mental, marcas máximas (referência).
- Estados físico e mental.
- Marcas de dano (mesmo painel dos jogadores).
- **Somente atributos físicos** para rolagem — **não** exibe atributos sociais.
- Fraquezas (texto livre, ex.: “fogo”, “luz”).

### Fluxo sugerido na mesa

1. Mestre descreve a situação.
2. Jogador declara ação; mestre pede rolagem (clique no atributo).
3. Mestre interpreta o resultado (tabela da seção 6).
4. Se houver dano, mestre aplica **marcas** no alvo.
5. Inimigo age; repete rolagem e marcas no card do boss.
6. **Avançar turno** quando a rodada narrativa fechar.

Não há sistema automático de “ataque vs defesa” encadeado — **uma rolagem por ação** declarada.

---

## 9. Inimigos e Bosses

### Onde criar

| Tipo | Onde |
|------|------|
| NPC comum | Gerenciamento → NPCs ou Criação |
| Boss / combatente | Gerenciamento → Boss ou NPC com **Pode combater** |
| Ficha de combate | Gerenciamento → Boss (lista inimigos com `podeCombater`) |

### Campos de combate (inimigo)

| Campo | Função |
|-------|--------|
| **Papel** | Capanga / Elite / Boss (etiqueta visual). |
| **Resist. física** | Referência para reduzir dano futuro (campo na ficha; aplicação na mesa). |
| **Resist. mental** | Idem para dano mental. |
| **Marcas máximas** | Limite para derrota automática (0 = sem limite). |
| **Bônus de ataque** | Referência narrativa/mecânica (+X ataques). |
| **Fraquezas** | Texto: vulnerabilidades elementais ou táticas. |
| **XP recompensa** | XP concedida ao grupo ao derrotar. |

### Atributos do inimigo na mesa

- **Combate:** grid físico (FOR, DES, INT, VIT, RUP).
- **Cena:** grid social (CAR, PER, VON, SAB) no card lateral.

NPCs **sem** checkbox “poderes de Eco” não têm Ruptura nem grimório de skills.

---

## 10. Vitalidade

**Vitalidade não é HP.** Representa resistência corporal e tolerância à dor.

### Efeitos implementados no app

| Efeito | Regra |
|--------|-------|
| **Atraso de estado** | A cada **2 pontos de VIT**, os limiares de marcas sobem +1 (ex.: Ferido começa em 3+N em vez de 3). |
| **Resistência ao trauma** | A cada **3 pontos de VIT**, **−1 marca** recebida (mínimo 0). |

**Exemplo:** Personagem com VIT 6 (buffer +3, resistência −2). Receberia 2 marcas → 0 marcas efetivas; com 3 marcas → 1 marca efetiva.

### Na ficha

VIT aparece no grid de atributos físicos e sofre penalidade de estado físico (−5% / −10% / −20%) como FOR e DES.

---

## 11. Skills e poderes de Eco

### Tipos de habilidade

| Tipo | Sobrecarga | Uso |
|------|------------|-----|
| **Passiva** | Não aumenta | Sempre ligada ou gatilho automático. |
| **Ativa** | +1 por uso | Ação consciente de Eco. |
| **Ruptura** | +1 por uso | Manipulação forte do tempo/Eco. |

### Catálogo por audiência

- **Personagem** — skills de PCs.
- **NPC** — skills de NPCs.
- **Boss** — skills de inimigos poderosos.

Criação em **Skills → Criação** ou hub de criação em Gerenciamento.

### Na mesa (aba Combate / Ficha)

- Lista de skills no card; clique abre detalhe.
- Botão **Ativar** consome cooldown e processa sobrecarga (se não for passiva).
- Avisos de bloqueio (cooldown, sobrecarga, estado mental) aparecem como mensagem.

---

## 12. Progressão e experiência

### Níveis

| | Personagem |
|---|------------|
| **Nível máximo** | 20 |
| **XP para próximo nível** | nível atual × 150 |

### Ganho de XP (exemplos no app)

| Fonte | Valor típico |
|-------|----------------|
| Botão **+50 XP** na ficha (mestre) | 50 XP |
| **Destaque na cena/combate** (estrela no card) | 50 XP |
| **Ultra XP de sessão** (fim de sessão, grupo) | 300 / 550 / 850 conforme qualidade |

### Ao subir de nível

- **Com Eco:** alterna ponto de atributo (nível par) e ponto de Eco (nível ímpar ≥ 3).
- **Pontos sociais:** +1 por nível até o 15.
- **Skills:** gastar pontos de Eco para **descobrir** habilidades novas (não há evolução de tier pelo jogador).

---

## 13. Campanhas, grupos e sessões

### Grupos

- Agrupam personagens da campanha (Party Alpha, etc.).
- Em **Cena** e **Combate**, o seletor de grupo filtra quais cards aparecem.
- **Descansar grupo:** zera marcas e sobrecarga Eco de todos os membros.

### Sessões independentes

| Aba | Dados salvos separadamente |
|-----|----------------------------|
| Cena | `scene_session` — turno, grupo, notas, inimigo ativo na cena |
| Combate | `combat_session` — turno, grupo, inimigo ativo no combate |

Trocar de aba não mistura turno nem inimigo selecionado entre cena e combate.

---

## 14. Referência rápida

### Combate em 30 segundos

1. Selecione campanha e grupo.
2. **Combate** → escolha o inimigo ativo.
3. Jogador clica atributo → rola d20 → leia faixa de resultado.
4. Aplique marcas no card do alvo.
5. Role para o inimigo (atributos físicos no card dele).
6. Avance turno; repita.

### Cena em 30 segundos

1. **Cena** → grupo + inimigo opcional.
2. Sem inimigo: use **Notas da cena**.
3. Com inimigo: card lateral com atributos **sociais**.
4. Clique em CAR/PER/VON/SAB para rolar interação.

### Tabela de marcas → estado

```
0–2 marcas   → Estável
3–5 marcas   → Ferido (−5% físico)
6–8 marcas   → Grave (−10% físico)
9+ marcas    → Incapacitado (−20% físico)
```

### Contatos no código (desenvolvedores)

| Tópico | Arquivo principal |
|--------|-------------------|
| Marcas de dano | `src/mechanics/combat/damageMarksEngine.js` |
| Rolagem | `src/mechanics/combat/rollOutcome.js` |
| Estados | `src/constants/states.js` |
| Atributos | `src/constants/attributes.js` |
| Sobrecarga Eco | `src/mechanics/ecoOverload/` |
| UI Combate | `src/pages/ManageCombat.jsx` |
| UI Cena | `src/pages/ManageScene.jsx` |

---

*Documento gerado para o projeto sistema-rpg. Para exportar em PDF: abra este arquivo no VS Code / Cursor, use extensão “Markdown PDF”, ou imprima o HTML em `docs/SISTEMA_RPG.html` pelo navegador (Ctrl+P → Salvar como PDF).*
