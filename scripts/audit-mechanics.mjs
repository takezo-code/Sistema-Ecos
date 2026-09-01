/**
 * Smoke tests for core game mechanics (run: npx vite-node scripts/audit-mechanics.mjs)
 */
import { normalizeGameEntity } from '../src/constants/attributes.js'
import { entityHasEcoPowers } from '../src/constants/entityProgression.js'
import { buildNpcPayloadForSave } from '../src/pages/NPCs.jsx'
import {
  buildInlineSkillInstance,
  listCombatSkillsRuntime,
  activateCharacterSkill,
  advanceCharacterTurn,
} from '../src/services/ecoSkillRuntimeService.js'
import { getCooldownRemaining } from '../src/mechanics/skills/cooldownEngine.js'
import { buildCharacterSheetSnapshot } from '../src/services/characterSheetSnapshot.js'
import { getRemainingLife, applyDamageMarks, getMarkPoolMax } from '../src/mechanics/combat/damageMarksEngine.js'
import { enforceProgressionCaps } from '../src/services/progressionBudget.js'

let passed = 0
let failed = 0

function assert(cond, msg) {
  if (cond) {
    passed++
    console.log(`  ✓ ${msg}`)
  } else {
    failed++
    console.error(`  ✗ ${msg}`)
  }
}

function makeBoss(skills = []) {
  return normalizeGameEntity({
    name: 'Boss Test',
    status: 'vivo',
    papelCombate: 'boss',
    podeCombater: true,
    hasEcoPowers: true,
    level: 1,
    skills,
    attributes: { forca: 2, destreza: 2, constituicao: 2, inteligencia: 2, percepcao: 2, ruptura: 2, vitalidade: 4 },
    socialAttributes: { carisma: 1, percepcao: 1, vontade: 1, sabedoria: 1 },
  })
}

function makePlayer() {
  return normalizeGameEntity({
    name: 'Player Test',
    classId: 'sutura',
    level: 1,
    skills: [],
    attributes: { forca: 2, destreza: 2, constituicao: 2, inteligencia: 2, percepcao: 2, ruptura: 2, vitalidade: 4 },
    socialAttributes: { carisma: 1, percepcao: 1, vontade: 1, sabedoria: 1 },
  })
}

console.log('\n=== Boss / NPC skills ===')
const skill = buildInlineSkillInstance({ name: 'Raio', mechanicalEffect: 'dano', cooldownTurns: 3 })
const boss = makeBoss([skill])
assert(entityHasEcoPowers(boss), 'boss has eco powers')
assert(boss.skills.length === 1, 'boss keeps skills after normalize')
assert(listCombatSkillsRuntime(boss).length === 1, 'boss skill visible in combat runtime')

console.log('\n=== Boss creation payload ===')
const payload = buildNpcPayloadForSave({
  name: 'Novo Boss',
  papelCombate: 'boss',
  status: 'vivo',
  skills: [skill],
  attributes: boss.attributes,
  socialAttributes: boss.socialAttributes,
}, true)
assert(payload.skills.length === 1, 'buildNpcPayloadForSave keeps boss skills on create')

console.log('\n=== Skill cooldown ===')
let entity = makeBoss([skill])
const act = activateCharacterSkill(entity, skill.id)
assert(act.ok, 'skill activation succeeds')
entity = { ...entity, ...act.patch }
assert(getCooldownRemaining(entity.skillCooldowns, skill.templateId) === 3, 'cooldown set to 3 after activate')
const advanced = advanceCharacterTurn(entity)
entity = { ...entity, ...advanced.patch }
assert(getCooldownRemaining(entity.skillCooldowns, skill.templateId) === 2, 'cooldown ticks to 2 after advanceTurn')

console.log('\n=== NPC without eco strips skills ===')
const npc = normalizeGameEntity({
  name: 'NPC narrativo',
  status: 'vivo',
  papelCombate: 'nenhum',
  hasEcoPowers: false,
  skills: [skill],
  attributes: boss.attributes,
})
assert(npc.skills.length === 0, 'npc without eco has skills stripped')

console.log('\n=== Life / damage marks ===')
const player = makePlayer()
const life = getRemainingLife(player)
assert(life.max > 0, `player max life > 0 (${life.max})`)
const poolMax = getMarkPoolMax(player)
let wounded = { ...player, damageMarks: poolMax }
const atZero = getRemainingLife(wounded)
assert(atZero.current === 0, 'life clamps at 0')
const extraHit = applyDamageMarks(wounded, 'grave')
wounded = { ...wounded, ...extraHit.patch }
assert(wounded.damageMarks === poolMax, 'marks do not exceed life pool at 0 HP')
const healed = getRemainingLife({ ...wounded, damageMarks: poolMax - 1 })
assert(healed.current === 1, 'one heal from 0 returns to 1 life')

console.log('\n=== Progression caps ===')
const capped = enforceProgressionCaps(player)
assert(capped.patch != null || capped.error == null, 'progression caps runs without error')

console.log('\n=== Export snapshot ===')
const snap = buildCharacterSheetSnapshot(boss, 'boss')
assert(snap.name === 'Boss Test', 'export snapshot has name')
assert(Array.isArray(snap.skills), 'export snapshot has skills array')

console.log(`\n=== RESULT: ${passed} passed, ${failed} failed ===\n`)
process.exit(failed > 0 ? 1 : 0)
