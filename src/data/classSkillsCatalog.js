import { SKILL_AUDIENCE } from '../constants/skillAudience'
import { ECO_SKILL_TYPES } from '../constants/skillTypes'

/**
 * 3 skills ativas pré-definidas por classe.
 * 1 Eco = +1 nível (máx. nv.3). A 4ª skill vem da arma (custom).
 *
 * Não importar CHARACTER_CLASSES no topo: ciclo attributes ↔ classes ↔ equipment
 * deixa CHARACTER_CLASSES undefined na primeira avaliação.
 */

function skill(classId, slot, partial) {
  return {
    templateId: `${classId}_${slot}`,
    classId,
    audience: SKILL_AUDIENCE.CHARACTER,
    skillType: ECO_SKILL_TYPES.ATIVA,
    cooldownTurns: partial.cooldownTurns ?? 2,
    overloadCost: partial.overloadCost ?? 1,
    basePower: partial.basePower ?? 1,
    slot,
    icon: partial.icon ?? partial.name.slice(0, 2).toUpperCase(),
    iconSrc: partial.iconSrc ?? null,
    name: partial.name,
    description: partial.description,
    mechanicalEffect: partial.mechanicalEffect,
    narrativeConsequence: partial.narrativeConsequence ?? '',
    effect: partial.mechanicalEffect,
    sideEffect: partial.narrativeConsequence ?? '',
    buff: partial.buff ?? null,
    buffs: partial.buffs ?? null,
    aftereffect: partial.aftereffect ?? null,
    heal: partial.heal ?? null,
  }
}

const BY_CLASS = {
  atirador: [
    skill('atirador', 1, {
      icon: 'PC',
      iconSrc: '/skills/atirador/pulso-certeiro.png',
      name: 'Pulso Certeiro',
      description: 'Ancora pulso, ombro e respiração na trajetória. O disparo fica firme e o corpo inteiro acompanha o ponto de impacto.',
      mechanicalEffect: 'Aumenta Destreza neste turno.',
      narrativeConsequence: 'O travamento permanece no corpo. No turno seguinte, a Destreza cai na mesma medida do aumento.',
      cooldownTurns: 2,
      overloadCost: 1,
      buff: {
        kind: 'attr_bonus',
        attrKey: 'destreza',
        values: [1, 2, 3],
        durationTurns: 1,
        target: 'self',
        hangover: true,
      },
    }),
    skill('atirador', 2, {
      icon: 'OL',
      iconSrc: '/skills/atirador/olhar-longinquo.png',
      name: 'Olhar Longínquo',
      description: 'Estende o foco até o ponto certo. Distância, cobertura e movimento deixam de competir com o alvo.',
      mechanicalEffect: 'Aumenta Percepção neste turno.',
      narrativeConsequence: 'A visão fecha depois do esforço. No turno seguinte, a Percepção cai na mesma medida do aumento.',
      cooldownTurns: 2,
      overloadCost: 1,
      buff: {
        kind: 'attr_bonus',
        attrKey: 'percepcao',
        values: [1, 2, 3],
        durationTurns: 1,
        target: 'self',
        hangover: true,
      },
    }),
    skill('atirador', 3, {
      icon: 'SR',
      iconSrc: '/skills/atirador/snipe-de-ruptura.png',
      name: 'Snipe de Ruptura',
      description: 'Um disparo de precisão atravessa o campo. A bala carrega Ruptura: quanto mais Eco na skill, mais ela penetra e puxa o entorno para si.',
      mechanicalEffect: 'Snipe de precisão. Com mais Eco, a bala atravessa blindados e passa a sugar o que está ao redor.',
      narrativeConsequence: 'O recuo atravessa o ombro. No turno seguinte, a Destreza cai na mesma medida do nível da skill.',
      cooldownTurns: 3,
      overloadCost: 2,
      aftereffect: {
        kind: 'attr_bonus',
        attrKey: 'destreza',
        values: [-1, -2, -3],
        durationTurns: 1,
        delayTurns: 1,
        target: 'self',
      },
    }),
  ],
  tank: [
    skill('tank', 1, {
      icon: 'CT',
      name: 'Couraça Temporal',
      description: 'O corpo fecha contra o golpe. Pele e osso passam a aguentar o que antes passaria.',
      mechanicalEffect: 'Aumenta seus pontos de vida em 2 no nível 1, 4 no nível 2 e 6 no nível 3, enquanto o efeito durar.',
      narrativeConsequence: 'O peso permanece no corpo. No turno seguinte, −1 Destreza.',
      cooldownTurns: 3,
      overloadCost: 2,
      buff: { kind: 'mark_bonus', values: [2, 4, 6], durationTurns: 3, target: 'self' },
    }),
    skill('tank', 2, {
      icon: 'PS',
      name: 'Proteção Sagrada',
      description: 'Você estende um manto sobre o grupo. O impacto encontra a proteção antes de encontrar o corpo.',
      mechanicalEffect: 'Aumenta os pontos de vida do grupo em 1 no nível 1, 2 no nível 2 e 3 no nível 3, enquanto o efeito durar.',
      narrativeConsequence: 'O manto drena o foco. No turno seguinte, −1 Vontade.',
      cooldownTurns: 3,
      overloadCost: 3,
      buff: { kind: 'mark_bonus', values: [1, 2, 3], durationTurns: 3, target: 'party' },
    }),
    skill('tank', 3, {
      icon: 'GB',
      name: 'Grito do Baluarte',
      description: 'Um grito alto atravessa o campo. O som pesa no corpo de quem está à frente.',
      mechanicalEffect: 'Nível 1: atordoa de leve. Nível 2: pode desmaiar o alvo. Nível 3: o grito pode empurrar o alvo só com a força do som. O mestre define alcance e quem resiste.',
      narrativeConsequence: 'A garganta fecha. No turno seguinte, −1 Carisma.',
      cooldownTurns: 2,
      overloadCost: 2,
    }),
  ],
  porradeiro: [
    skill('porradeiro', 1, {
      icon: 'FC',
      name: 'Fúria Cega',
      description: 'A raiva sobe sem cálculo. O corpo inteiro entra no golpe e a força pesa no impacto.',
      mechanicalEffect: 'Aumenta Força em 1 no nível 1, 2 no nível 2 e 3 no nível 3, enquanto o efeito durar.',
      narrativeConsequence: 'O pico desaba. No turno seguinte, −1 Força.',
      cooldownTurns: 2,
      overloadCost: 1,
      buff: { kind: 'attr_bonus', attrKey: 'forca', values: [1, 2, 3], durationTurns: 2, target: 'self' },
    }),
    skill('porradeiro', 2, {
      icon: 'PS',
      name: 'Pisada Sísmica',
      description: 'O pé desce no chão. O solo treme, cede e devolve o impacto para quem está perto.',
      mechanicalEffect: 'Nível 1: o tremor derruba quem está no alcance. Nível 2: abre um buraco no ponto da pisada. Nível 3: pedras voam contra o alvo. O mestre define alcance e quem resiste.',
      narrativeConsequence: 'O impacto sobe pelas pernas. No turno seguinte, −1 Destreza.',
      cooldownTurns: 3,
      overloadCost: 2,
    }),
    skill('porradeiro', 3, {
      icon: 'PV',
      name: 'Punhos do Vazio',
      description: 'A Ruptura envolve as mãos. Cada soco abre uma fenda: o que o golpe pega é puxado para o void.',
      mechanicalEffect: 'Os socos passam a sugar o que atingem para o void. O mestre define o que é arrastado, o que resiste e o que some de vez.',
      narrativeConsequence: 'As mãos esvaziam. No turno seguinte, −1 Ruptura.',
      cooldownTurns: 3,
      overloadCost: 2,
    }),
  ],
  magica: [
    skill('magica', 1, {
      icon: 'CR',
      name: 'Canal de Ruptura',
      description: 'Você abre os canais. O Eco sobe e fica à mão para torcer o instante.',
      mechanicalEffect: 'Aumenta Ruptura por 2 turnos.',
      narrativeConsequence: 'Os canais fecham. No turno seguinte, −1 Ruptura.',
      cooldownTurns: 2,
      overloadCost: 1,
      buff: { kind: 'attr_bonus', attrKey: 'ruptura', values: [1, 2, 3], durationTurns: 2, target: 'self' },
    }),
    skill('magica', 2, {
      icon: 'LF',
      name: 'Leitura da Fenda',
      description: 'Você lê a rachadura no tempo antes de atravessá-la. O instante deixa de ser ruído.',
      mechanicalEffect: 'Aumenta Sabedoria por 2 turnos.',
      narrativeConsequence: 'A leitura esvazia. No turno seguinte, −1 Sabedoria.',
      cooldownTurns: 2,
      overloadCost: 1,
      buff: { kind: 'attr_bonus', attrKey: 'sabedoria', values: [1, 2, 3], durationTurns: 2, target: 'self' },
    }),
    skill('magica', 3, {
      icon: 'FI',
      name: 'Fio Interior',
      description: 'Você puxa o fio certo no Eco. A distorção obedece ao cálculo, não ao acaso.',
      mechanicalEffect: 'Aumenta Inteligência por 2 turnos.',
      narrativeConsequence: 'O fio escapa. No turno seguinte, −1 Inteligência.',
      cooldownTurns: 2,
      overloadCost: 1,
      buff: { kind: 'attr_bonus', attrKey: 'inteligencia', values: [1, 2, 3], durationTurns: 2, target: 'self' },
    }),
  ],
  suporte: [
    skill('suporte', 1, {
      icon: 'TS',
      name: 'Trama Serena',
      description: 'Você tece um fio calmo na mente. A ferida se deixa ler antes de fechar errado.',
      mechanicalEffect: 'Aumenta Sabedoria por 2 turnos.',
      narrativeConsequence: 'A trama se desfaz. No turno seguinte, −1 Sabedoria.',
      cooldownTurns: 2,
      overloadCost: 1,
      buff: { kind: 'attr_bonus', attrKey: 'sabedoria', values: [1, 2, 3], durationTurns: 2, target: 'self' },
    }),
    skill('suporte', 2, {
      icon: 'LF',
      name: 'Leitura da Ferida',
      description: 'Você isola o ponto exato do dano. O que precisa ser costurado fica nítido.',
      mechanicalEffect: 'Aumenta Inteligência por 2 turnos.',
      narrativeConsequence: 'O foco se espalha. No turno seguinte, −1 Inteligência.',
      cooldownTurns: 2,
      overloadCost: 1,
      buff: { kind: 'attr_bonus', attrKey: 'inteligencia', values: [1, 2, 3], durationTurns: 2, target: 'self' },
    }),
    skill('suporte', 3, {
      icon: 'OS',
      name: 'Olho da Sutura',
      description: 'Você vê o instante em que o corpo ainda estava inteiro. A costura encontra o lugar certo.',
      mechanicalEffect: 'Aumenta Percepção por 2 turnos.',
      narrativeConsequence: 'O olho fecha. No turno seguinte, −1 Percepção.',
      cooldownTurns: 2,
      overloadCost: 1,
      buff: { kind: 'attr_bonus', attrKey: 'percepcao', values: [1, 2, 3], durationTurns: 2, target: 'self' },
    }),
  ],
}

/** Todas as skills de personagem (flat) — catálogo embutido. */
export const CHARACTER_SKILLS_CATALOG = Object.values(BY_CLASS).flat()

export function getClassSkills(classId) {
  return BY_CLASS[classId] || []
}

export function getClassSkillDef(templateId) {
  return CHARACTER_SKILLS_CATALOG.find(s => s.templateId === templateId) || null
}
