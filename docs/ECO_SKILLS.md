# Habilidades de Eco — Aba e Catálogo

## Navegação

- Sidebar principal: **Ficha**
- Sub-sidebar da ficha:
  - Personagem · Inventário · Status · **Habilidades** · Ecos · Histórico · Configurações

## Catálogo

20 habilidades em `src/data/ecoSkillsCatalog.js` — tom humano alterado, sem magia exagerada.

## Cooldown e turnos

- `skillCooldowns`: `{ templateId: turnosRestantes }`
- **Avançar turno** reduz todos os cooldowns em 1
- Passivas com `passiveOverloadRisk` podem adicionar +1 sobrecarga por turno (máx. 1/turno no total)

## Ativação

`ecoSkillRuntimeService.activateCharacterSkill` integra:

1. Validação (cooldown, ruptura total)
2. Sobrecarga (`overloadEngine`)
3. Cooldown da habilidade
4. Entrada em `ecoSkillHistory`

## Estados visuais do card

| Estado | Condição |
|--------|----------|
| Disponível | Ativa, CD 0, sobrecarga &lt; 5 |
| Em cooldown | CD &gt; 0 |
| Instável | Sobrecarga ≥ 4 ou mente fragmentada+ |
| Sobrecarga alta | ≥ 5/5 |
| Bloqueada | Ruptura total (10/5) |

## Expandir

1. Adicionar entrada em `ecoSkillsCatalog.js`
2. Personagem aprende via **Aprender do catálogo** na aba Habilidades
3. Opcional: registrar `modifiers` em `mentalStatusEffects` para consequências mecânicas futuras
