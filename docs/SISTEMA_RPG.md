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
7. [Aba Combate](#7-aba-combate)
8. [Inimigos e Bosses](#8-inimigos-e-bosses)
9. [Vitalidade](#9-vitalidade)
10. [Skills e poderes de Eco](#10-skills-e-poderes-de-eco)
11. [Progressão e experiência](#11-progressão-e-experiência)
12. [Campanhas, grupos e sessões](#12-campanhas-grupos-e-sessões)
13. [Referência rápida](#13-referência-rápida)

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
- O estado **Saudável → Ferido → Grave → Incapacitado** deriva do total de marcas (com modificador de Vitalidade).

---

## 2. Estrutura do aplicativo

### Menu principal

| Seção | Função |
|-------|--------|
| **Campanha** | História e registro de sessões. |
| **Gerenciamento** | Personagens, NPCs, bosses, organizações e skills (NPC/Boss). |
| **Em jogo → Ficha** | Ficha completa do personagem (modo mestre). |
| **Em jogo → Combate** | Confronto e interação: atributos físicos + de cena, marcas, boss. |
| **Criação** | Fluxo para criar artefatos e skills. |
| **Lixeira** | Entidades excluídas recuperáveis. |

### Campanha ativa

Quase tudo é filtrado pela **campanha ativa**. Personagens, NPCs, grupos e sessões de combate pertencem a uma campanha.

---

## 3. Atributos

### Atributos físicos (combate e ação)

Usados na aba **Combate**, rolagens de ataque, defesa e habilidades físicas/Eco.

| Sigla | Nome | Máx. típico | Uso principal |
|-------|------|-------------|---------------|
| FOR | Força | 10 | Ataques corpo a corpo, imposição física. |
| DES | Destreza | 10 | Esquiva, precisão, reflexos. |
| INT | Inteligência | 10 | Tática, análise, pressão mental dirigida. |
| VIT | Vitalidade | 10 | Resistência ao trauma; ver [seção 9](#9-vitalidade). |
| RUP | Ruptura | 10 | Potência de habilidades de Eco (só com poderes de Eco). |

**Criação:** 10 pontos para distribuir; máximo **4** por atributo na criação. Também é obrigatório **gastar o 1 Eco inicial** desbloqueando **uma skill** da classe — só então a criação é liberada.

**Progressão (nível 2–20):**

- Com **poderes de Eco:** Ecos até o orçamento de **9** (completo no **nível 15**): 1 na criação, +1 nos níveis **pares 2–14**, +1 marco no **15**. Níveis **pares** também dão +1 ponto de atributo.
- **Sem** poderes de Eco (NPCs comuns): todo nível par dá atributo; sem Ruptura nem skills de Eco.

### Atributos sociais (cena)

Usados na aba **Combate** junto com os atributos físicos (CAR, PER, VON, SAB).

| Sigla | Nome | Máx. típico | Uso principal |
|-------|------|-------------|---------------|
| CAR | Carisma | 8 | Persuasão, presença, liderança. |
| PER | Percepção | 8 | Notar detalhes, mentiras, perigo. |
| VON | Vontade | 8 | Resistir manipulação, manter foco. |
| SAB | Sabedoria | 8 | Intuição, conhecimento aplicado. |

**Criação:** 6 pontos sociais; máximo **4** por atributo na criação.

**Progressão:** +1 ponto social por nível do personagem, do nível **2 ao 15**. Após nível 15, não ganha mais pontos sociais automáticos.

### Valor efetivo na rolagem

Na interface, ao clicar em um atributo no card de combate:

```
Total = d20 + valor efetivo do atributo + bônus de classe + perícia de arma
```

O **valor efetivo** pode ser menor que o valor na ficha quando há penalidades de estado físico ou sobrecarga de Eco (atributos mentais). O **bônus de classe** e a **perícia de arma** são descritos abaixo.

### Classes

Cada personagem escolhe uma classe na criação (ou depois, ao editar a ficha). A classe define **2 atributos-chave** — um físico e um de cena — e os **tipos de arma** com perícia.

| Classe | Atributos-chave | Armas com perícia |
|--------|-----------------|-------------------|
| **Atirador** | Destreza · Carisma | Arma à Distância |
| **Tank** | Vitalidade · Vontade | Escudo Médio · Escudo Grande · Arma de Duas Mãos · Arma de Uma Mão |
| **Porradeiro** | Força · Vontade | Arma de Duas Mãos · Manoplas |
| **Mágica** | Ruptura · Sabedoria | Orbe · Varinha · Cajado · Livro |
| **Suporte** | Inteligência · Percepção | Orbe · Varinha · Cajado · Livro (iguais à Mágica) |

Classe é **opcional**: sem classe, o personagem simplesmente não recebe bônus de atributo nem exige perícia de arma.

### Perícia de arma (−3)

Usar uma arma **fora** da perícia da classe aplica **−3** nas rolagens de combate. A arma precisa estar equipada com o tipo definido na ficha.

### Armas (equipamento pessoal)

Não existe catálogo global nem arma de loot. Cada personagem **forja** a sua arma e a sua armadura na criação e usa as mesmas peças pela campanha inteira — o loot das missões é sucata, material e dinheiro.

A arma **não tem raridade**. Tem **3 passivas Metin** (rolar → ver → manter ou rerolar, sem custo) e **1 skill custom** no 4º slot (definida pelo player + mestre):

| Slot | Efeito | Roll |
|------|--------|------|
| 1 | Bônus em **um** atributo (físico ou cena) | 1–5 + qual atributo |
| 2 | **+usos de poder de Ruptura** | 1–5 |
| 3 | Bônus em **uma rolagem específica** | 1–3 + qual atributo |
| 4 | **Skill da arma** | texto/efeito custom (não rola) |

**Tipos de arma:** Arma à Distância (2 mãos) · Orbe (1) · Varinha (1) · Cajado (2) · Livro (1) · Escudo Médio (1) · Escudo Grande (2) · Arma de Duas Mãos (2) · Arma de Uma Mão (1) · Manoplas (1). Na forja, a lista fica restrita aos tipos com perícia da classe.

**Onde gerenciar:** Em jogo → Ficha → botão **Equipamento** (paper-doll com arma e armadura; passivas Metin e skill da arma).

### Armaduras

| Tipo | Penalidade | Limiar de marcas |
|------|------------|------------------|
| **Leve** | −1 Destreza | +1 |
| **Média** | −2 Destreza | +2 |
| **Pesada** | −3 Destreza | +3 |

A armadura tem **4 passivas Metin** (todas liberadas desde a forja):

| Slot | Efeito | Roll |
|------|--------|------|
| 1 | Bônus em **um** atributo (físico ou cena) | 1–5 + qual atributo |
| 2 | **+marcas de vida** (limiar / pool) | 1–5 |
| 3 | **+usos de poder de Ruptura** | 1–5 |
| 4 | Bônus em **uma rolagem específica** | 1–3 + qual atributo |

**Raridade** da armadura acompanha o nível do personagem. Cada degrau acima de comum concede **+1 marca de vida** permanente (cumulativo), somado ao bônus do tipo e à passiva 2:

| Nível | Raridade | Marcas (raridade) |
|-------|----------|-------------------|
| 1–5 | Comum | +0 |
| 6–10 | Incomum | +1 |
| 11–15 | Raro | +2 |
| 16–20 | Lendário | +3 |

O limiar total de marcas = tipo + raridade + passiva Metin de marcas. A −DES vale só no valor efetivo das rolagens. A armadura forjada na criação já entra ativa; dá para reforjá-la e rerolar passivas no botão Equipamento da ficha.

**Usos de Ruptura (gear):** soma das passivas da arma (slot 2) e da armadura (slot 3). Ao ativar uma skill de Eco, um uso bônus é consumido antes da sobrecarga normal. Descansar zera os usos gastos.

### Bônus de classe na rolagem

Os atributos-chave da classe rendem pontos **extras** na rolagem conforme o quanto foi investido neles:

| Pontos no atributo | Bônus na rolagem |
|--------------------|------------------|
| 0–4 | — |
| 5–9 | **+1** |
| 10+ | **+2** |

**Exemplo:** Porradeiro com Força 5 rola d20 e tira 12 → `12 (dado) + 5 (Força) + 1 (classe) = 18`. Ao chegar em Força 10, o bônus vira +2.

O bônus só vale para os 2 atributos da classe — os demais rolam normalmente.

**Importante:** o degrau usa os pontos **base** do atributo. Ficar Ferido reduz o valor efetivo nas rolagens, mas não derruba o bônus de classe já conquistado. No exemplo acima, um Porradeiro Ferido rola `12 + 4 (Força efetiva) + 1 (classe) = 17`.

**Tetos por atributo:** os físicos (incluindo Ruptura) vão até 10 e alcançam **+2**. Os atributos de cena vão até 8, então chegam no máximo a **+1**.

---

## 4. Estados físicos e marcas de dano

### Marcas de dano

| Tipo | Marcas | Exemplos narrativos |
|------|--------|---------------------|
| **Leve** | +1 | Arranhão, contusão. |
| **Grave** | +3 | Fratura séria, hemorragia. |

No card do player: botões **Leve** e **Grave**. (Médio +2 permanece disponível em bosses/inimigos se necessário.)

### Tabela de estados (padrão)

| Total de marcas | Estado no app | Label na mesa | Penalidade em FOR, DES, VIT |
|-----------------|---------------|---------------|-----------------------------|
| 0–4 | `bem` | **Saudável** | Nenhuma |
| 5–9 | `ferido` | **Ferido** | −1 |
| 10–14 | `grave` | **Grave** | −2 |
| 15+ | `incapacitado` | **Incapacitado** | −3 |

O estado físico é **recalculado automaticamente** ao aplicar ou curar marcas. O mestre ainda pode alterar o estado manualmente no dropdown do card.

### Cura de marcas

- **−1:** remove uma marca; estado recalcula.
- **Limpar marcas:** zera marcas e volta para Saudável (descanso narrativo).

### Boss com limite de marcas

Inimigos podem ter **Marcas Máximas** (ex.: 15). Quando `marcas atuais ≥ marcas máximas`, o card exibe **DERROTADO** (narrativamente: derrotado/capturado/fora de combate — o mestre define).

---

## 5. Estados mentais e Sobrecarga de Eco

### Estados mentais (personagem)

Derivados principalmente da **Sobrecarga de Eco** (uso de habilidades Ativas). Também editáveis manualmente.

| Estado | Label | Efeito resumido |
|--------|-------|-----------------|
| `estavel` | Estável | Sem penalidade mental. |
| `abalado` | Abalado | −1 INT/PER/SAB/CAR (no limite seguro). |
| `fragmentado` | Fragmentado | −2 INT/PER/SAB/CAR (1 acima). |
| `dissociado` | Dissociado | −3 INT/PER/SAB/CAR (2–3 acima). |
| `perdido_no_tempo` | Perdido no Tempo | −4 INT/PER/SAB/CAR (4+ acima). |

Cada estado traz **consequências narrativas** sugeridas na ficha (hesitação, medo, desconexão, etc.).

### Sobrecarga de Eco (`ecoOverload`)

- **Limite seguro = 5 + Ruptura** (RUP 0 → 5 usos limpos; RUP 10 → 15).
- Contador exibido como **N / limite**.
- **Dentro do limite:** sem redução de atributos.
- **No limite / acima:** −flat em **INT · PER · SAB · CAR**:
  - Abalado → **−1**
  - Fragmentado → **−2**
  - Dissociado → **−3**
  - Perdido no Tempo → **−4**
- **Ruptura não é penalizada** (só define o limite de usos).
- **Passivas** não aumentam sobrecarga; **Ativas** aumentam +1 (ou o custo da skill) por uso.
- No **limite:** aplica status *Mentalmente Abalado*.
- Em **limite + 5:** dispara evento de **Ruptura Total**.

**Descanso:** ação “Descansar” / recuperação de grupo zera sobrecarga e pode limpar marcas (conforme botões na aba).

Documentação técnica adicional: `docs/ECO_OVERLOAD.md`, `docs/ECO_SKILLS.md`.

---

## 6. Rolagem e resultados

Ao rolar **d20 + atributo + bônus de classe** (clique no atributo no card), o app classifica o resultado:

| Condição | Resultado | Orientação narrativa |
|----------|-----------|----------------------|
| Natural **1** no d20 | **Falha crítica** | Erro grave, vulnerabilidade, consequência forte. |
| Total **≤ 9** | **Falha** | Ação não funciona como esperado. |
| Total **10–17** | **Sucesso parcial** | Funciona com pequena consequência. |
| Total **≥ 18** e d20 ≠ 20 | **Sucesso** | Ação clara e eficaz. |
| Natural **20** no d20 | **Sucesso crítico** | Resultado excepcional; grande vantagem narrativa. |

> **Nota:** Aplicar marcas de dano após a rolagem é **manual** pelo mestre (botões de marcas), salvo ajustes futuros. A rolagem informa o *quão bem* a ação foi; as marcas registram o *dano concretizado*.

---

## 7. Aba Combate

**Caminho:** Em jogo → Combate

### Propósito

Confronto físico e interação na mesa: ataques, ferimentos, marcas, estados, atributos de cena e uso de Eco.

### Cards dos jogadores

- Barra de **Sobrecarga de Eco**.
- Estado **mental** (dropdown).
- Painel de **marcas de dano** (Leve / Médio / Grave, curar, limpar).
- **Atributos físicos** (FOR, DES, INT, VIT, RUP) e **de cena** (CAR, PER, VON, SAB) — clique para rolar.
- Skills ativáveis, anotações de combate.

### Card do inimigo / boss

- Resistência física, resistência mental, marcas máximas (referência).
- Estado mental; marcas de dano.
- **Atributos físicos e de cena** para rolagem.
- Fraquezas (texto livre, ex.: “fogo”, “luz”).

### Fluxo sugerido na mesa

1. Mestre descreve a situação.
2. Jogador declara ação; mestre pede rolagem (clique no atributo).
3. Mestre interpreta o resultado (tabela da seção 6).
4. Se houver dano, mestre aplica **marcas** no alvo.
5. Inimigo age; repete rolagem e marcas no card do boss.

Não há sistema automático de “ataque vs defesa” encadeado — **uma rolagem por ação** declarada. Cada rolagem também avança o turno do personagem (cooldowns).

---

## 8. Inimigos e Bosses

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

- Grid **físico** (FOR, DES, INT, VIT, RUP) e **de cena** (CAR, PER, VON, SAB) no card.

NPCs **sem** checkbox “poderes de Eco” não têm Ruptura nem grimório de skills.

---

## 9. Vitalidade

**Vitalidade não é HP.** Representa resistência corporal e tolerância à dor.

### Efeitos implementados no app

| Efeito | Regra |
|--------|-------|
| **Atraso de estado** | A cada **2 pontos de VIT base**, +1 limiar de marcas. Ex.: Ferido passa de 5 para 5+N — o personagem aguenta mais dano antes de sair de Saudável. |

**Importante:** o atraso usa sempre a VIT **de base** da ficha. Ficar Ferido/Grave/Incapacitado reduz a VIT **efetiva** (para rolagens), mas **não** reduz o colchão de marcas.

**Exemplo:** Base = Ferido em 5+. Com VIT 6 → +3 limiar → Saudável até 7, Ferido a partir de 8. Ao ficar Ferido (−1 VIT efetiva nas rolagens), o limiar continua +3.

### Na ficha

VIT aparece no grid de atributos físicos e sofre penalidade flat de estado físico (−1 / −2 / −3) como FOR e DES — só no valor efetivo das rolagens.

---

## 10. Skills e poderes de Eco

### Tipos de habilidade

Skills de **personagem** são sempre **ativas**. Cada classe tem **3 skills** fixas; a **4ª** vem da **arma** (custom, player + mestre). Jogadores não criam skills de classe — só a skill da arma.

| Tipo | Sobrecarga | Uso |
|------|------------|-----|
| **Ativa** | +1 por uso (ou mais); usos de Ruptura do gear podem cobrir o custo | Ação consciente de Eco. |
| **Passiva** (legado/NPC) | Não aumenta | Sempre ligada ou gatilho automático. |

### Livro de skills (personagem)

- Cada classe tem **3 skills ativas** fixas.
- A **skill da arma** aparece junto na mesa (total **3 + 1 = 4**).
- **1 Eco** = desbloqueia (nível 1) ou sobe **+1 nível**, até o **nível 3**.
- **3 Ecos** maxam uma skill; **9 Ecos** maxam as três — orçamento completo no **nível 15**.
- Ícones cinza = bloqueadas; com nível = disponíveis para ativar.
- Criação manual de skills existe só para **NPC**, **Boss** e a **skill da arma** (no Equipamento).

### Catálogo por audiência

- **Personagem** — 3 skills pré-definidas por classe + 1 da arma (sem aba de catálogo no Gerenciamento).
- **NPC** — skills de NPCs (criação liberada no Gerenciamento).
- **Boss** — skills de inimigos poderosos (criação liberada no Gerenciamento).

### Na mesa (aba Combate / Ficha)

- Lista de skills no card (classe + arma); clique abre detalhe.
- Botão **Ativar** consome cooldown e processa sobrecarga (ou um uso de Ruptura do gear, se houver).
- Avisos de bloqueio (cooldown, sobrecarga, estado mental) aparecem como mensagem.

---

## 11. Progressão e experiência

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

- **Com Eco:** +1 Eco nos níveis **pares (2–14)** e +1 marco no **nível 15** (total 9 com o Eco inicial). Nos níveis **pares**, também +1 ponto de atributo.
- **Pontos sociais:** +1 por nível até o 15.
- **Skills:** Eco sobe skills até o nível 3; no nível 15 dá para maxar as três.

---

## 12. Campanhas, grupos e sessões

### Grupos

- Agrupam personagens da campanha (Party Alpha, etc.).
- Em **Combate**, o seletor de grupo filtra quais cards aparecem.

### Sessão de combate

Dados salvos em `combat_session` — grupo, notas, inimigo ativo no combate.

---

## 13. Referência rápida

### Combate em 30 segundos

1. Selecione campanha e grupo.
2. **Combate** → escolha o inimigo ativo.
3. Jogador clica atributo (físico ou de cena) → rola → leia faixa de resultado.
4. Aplique marcas no card do alvo.
5. Role para o inimigo (atributos físicos e de cena no card dele).

### Tabela de marcas → estado

```
0–4 marcas   → Saudável
5–9 marcas   → Ferido (−1 FOR/DES/VIT)
10–14 marcas → Grave (−2 FOR/DES/VIT)
15+ marcas   → Incapacitado (−3 FOR/DES/VIT)
(+ Vitalidade: a cada 2 VIT, +1 limiar em todos os degraus)
```

### Classes e bônus

```
Atirador    → Destreza · Carisma          · arma à distância
Tank        → Vitalidade · Vontade        · escudo médio/grande / duas mãos / uma mão
Porradeiro  → Força · Vontade             · duas mãos / manoplas
Mágica      → Ruptura · Sabedoria         · orbe / varinha / cajado / livro
Suporte     → Inteligência · Percepção    · iguais à Mágica

5 pontos no atributo da classe  → +1 na rolagem
10 pontos no atributo da classe → +2 na rolagem
Arma fora da perícia            → −3 na rolagem (combate)
```

### Contatos no código (desenvolvedores)

| Tópico | Arquivo principal |
|--------|-------------------|
| Marcas de dano | `src/mechanics/combat/damageMarksEngine.js` |
| Rolagem | `src/mechanics/combat/rollOutcome.js` |
| Classes | `src/constants/classes.js` |
| Bônus de classe | `src/mechanics/classes/classBonusEngine.js` |
| Tipos de arma | `src/constants/equipmentTypes.js` |
| Perícia de arma | `src/mechanics/equipment/weaponProficiencyEngine.js` |
| Equipamento pessoal | `src/mechanics/equipment/characterGear.js` |
| Passivas Metin | `src/mechanics/equipment/gearPassiveEngine.js` |
| Raridade da armadura | `src/mechanics/equipment/armorProgressionEngine.js` |
| Skill da arma | `src/mechanics/equipment/weaponProgressionEngine.js` · `src/services/ecoSkillRuntimeService.js` |
| Skills de classe (3) | `src/data/classSkillsCatalog.js` |
| Estados | `src/constants/states.js` |
| Atributos | `src/constants/attributes.js` |
| Sobrecarga Eco | `src/mechanics/ecoOverload/` |
| UI Combate | `src/pages/ManageCombat.jsx` |

---

*Documento gerado para o projeto sistema-rpg. Para exportar em PDF: abra este arquivo no VS Code / Cursor, use extensão “Markdown PDF”, ou imprima o HTML em `docs/SISTEMA_RPG.html` pelo navegador (Ctrl+P → Salvar como PDF).*
