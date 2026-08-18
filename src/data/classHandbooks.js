import { getCharacterClass, getAttributeLabel } from '../constants/classes'
import { getClassSkills } from './classSkillsCatalog'

/**
 * Guias de classe para PDF. Por enquanto só Traçado.
 * Números e degraus de nível ficam aqui — a ficha no jogo não lista tabela de atributos.
 */
const FACTORIES = {
  atirador: buildAtiradorHandbook,
}

export function getClassHandbook(classId) {
  return FACTORIES[classId]?.() ?? null
}

export function listClassHandbooks() {
  return Object.keys(FACTORIES).map(id => FACTORIES[id]()).filter(Boolean)
}

function skillFromCatalog(classId, slot, extras = {}) {
  const def = getClassSkills(classId).find(s => s.slot === slot)
  if (!def) return null
  return {
    name: def.name,
    description: def.description,
    effect: def.mechanicalEffect,
    consequence: def.narrativeConsequence,
    cooldownTurns: def.cooldownTurns,
    overloadCost: def.overloadCost,
    ...extras,
  }
}

function buildAtiradorHandbook() {
  const cls = getCharacterClass('atirador')
  return {
    classId: 'atirador',
    label: cls.label,
    color: cls.color,
    tagline: 'Precisão, leitura e disparos que cortam o campo.',
    overview: [
      'O Traçado desenha a trajetória no Eco. Antes do disparo, o corpo já está no ponto certo: pulso, ombro, respiração e olhar alinhados.',
      'Combate de longe. A classe vive de Destreza na mira e de Carisma quando a cena pede presença.',
    ],
    howItWorks: [
      'Atributos-chave: Destreza e Carisma. Cada 3 / 6 / 9 pontos nesses atributos rendem +1 / +2 / +3 nas rolagens daquele atributo.',
      'Três skills ativas da classe. 1 Eco sobe 1 nível (máximo 3). A quarta skill vem da arma.',
      'Ativar uma skill gasta usos de Ruptura e entra em cooldown.',
      'Quanto maior o nível da skill, maior o pico e maior o recuo. Se a skill aumenta um atributo em +2 neste turno, no turno seguinte aquele atributo cai −2.',
    ],
    attributes: cls.attributes.map(getAttributeLabel),
    weapons: 'Armas à distância.',
    passive: {
      name: cls.passive.name,
      description: cls.passive.description,
      narrative: true,
    },
    recoilRule: {
      title: 'Recuo',
      text: 'O corpo devolve o que a skill tomou emprestado. O bônus vale neste turno; no turno seguinte, o mesmo valor vira penalidade no mesmo atributo. Skills sem bônus de atributo ainda deixam recuo proporcional ao nível.',
    },
    skills: [
      skillFromCatalog('atirador', 1, {
        levels: [
          'Nível 1: +1 Destreza neste turno, −1 Destreza no seguinte.',
          'Nível 2: +2 Destreza neste turno, −2 Destreza no seguinte.',
          'Nível 3: +3 Destreza neste turno, −3 Destreza no seguinte.',
        ],
      }),
      skillFromCatalog('atirador', 2, {
        levels: [
          'Nível 1: +1 Percepção neste turno, −1 Percepção no seguinte.',
          'Nível 2: +2 Percepção neste turno, −2 Percepção no seguinte.',
          'Nível 3: +3 Percepção neste turno, −3 Percepção no seguinte.',
        ],
      }),
      skillFromCatalog('atirador', 3, {
        levels: [
          'Nível 1: snipe padrão — disparo de precisão no alvo.',
          'Nível 2: a bala penetra blindados.',
          'Nível 3: a bala suga o entorno para si com Ruptura. O mestre define o que é arrastado, o que resiste e o alcance.',
          'Recuo: −1 / −2 / −3 Destreza no turno seguinte, conforme o nível.',
        ],
      }),
    ].filter(Boolean),
  }
}
