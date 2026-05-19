# Sistema de Sobrecarga de Eco

## Visão geral

O poder temporal tem custo existencial. Cada uso de habilidade **Ativa** ou **Ruptura** aumenta a **Sobrecarga de Eco** (`ecoOverload`). Passivas não incrementam.

## Estrutura do personagem

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `ecoOverload` | number | Contador atual (0+, exibido como N/5) |
| `activeMentalStatuses` | array | Efeitos mentais empilháveis |
| `skills[].skillType` | `ativa` \| `passiva` \| `ruptura` | Tipo da habilidade |
| `lastRuptureTotalEvent` | object | Último evento crítico em 10/5 |

## Camadas do código

```
constants/
  ecoOverload.js      — limites, fases, tabela de ruptura
  skillTypes.js       — enum de tipos de habilidade
  mentalStatusEffects.js — catálogo de efeitos (ex.: Mentalmente Abalado)

mechanics/ecoOverload/
  overloadPenalties.js — % Eco e % atributos globais
  overloadEngine.js    — incremento, reset, status em 5/5
  ruptureEvents.js     — desfechos de Ruptura Total (extensível)

services/
  ecoOverloadService.js  — API: useEcoSkill, rest, snapshot
  mentalStatusService.js   — aplicar/listar/remover status

models/
  gameEntity.js — migração e defaults
```

## Fluxo de uso de habilidade

1. UI chama `useEcoSkill(entity, skillId)` (`ecoOverloadService`)
2. Se `passiva` → sem incremento (aviso narrativo)
3. `overloadEngine.processEcoSkillUse` → `ecoOverload + 1`
4. Em **5/5** → aplica `mentalmente_abalado` em `activeMentalStatuses`
5. Em **6+** → fase `rupture` (penalidades globais)
6. Em **10/5** → `buildRuptureTotalEvent` (desfecho aleatório ou escolhido)
7. Store persiste patch + `lastOverloadEvents` para UI

## Penalidades

| Sobrecarga | Poder Eco | Todos atributos |
|------------|-----------|-----------------|
| 1–5 | −1% a −5% | — |
| 6/5 | −10% | −10% |
| 7/5 | −20% | −20% |
| 8/5 | −40% | −40% |
| 9/5 | −80% | −80% |
| 10/5 | Ruptura Total | Ruptura Total |

Ordem de cálculo de atributo efetivo: **base → estado físico (Força/Destreza/Vitalidade) → sobrecarga global (6+)**.

Poder de habilidade: base × tier × ruptura × mental × **sobrecarga Eco**.

## Expandir o sistema

### Novo tipo de Eco

1. Adicionar valor em `ECO_SKILL_TYPES` e `ECO_SKILL_TYPE_META`
2. Definir `incrementsOverload` no meta
3. Marcar templates em `skillPool.js`

### Novo efeito mental

1. Registrar em `MENTAL_STATUS_EFFECTS`
2. Aplicar via `mentalStatusService.applyMentalStatus`
3. UI lista automaticamente em `EcoOverloadSection` / `StatesSection`

### Novo desfecho de Ruptura Total

Adicionar objeto em `RUPTURE_TOTAL_OUTCOMES` em `ruptureEvents.js`.

## Descanso

`restEcoOverload` zera sobrecarga e remove `mentalmente_abalado` vinculado à sobrecarga.
