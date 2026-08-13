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
    name: partial.name,
    description: partial.description,
    mechanicalEffect: partial.mechanicalEffect,
    narrativeConsequence: partial.narrativeConsequence ?? '',
    effect: partial.mechanicalEffect,
    sideEffect: partial.narrativeConsequence ?? '',
    buff: partial.buff ?? null,
    buffs: partial.buffs ?? null,
    heal: partial.heal ?? null,
  }
}

const BY_CLASS = {
  atirador: [
    skill('atirador', 1, {
      icon: 'PC',
      name: 'Pulso Certeiro',
      description: 'O Eco afia o corpo — cada movimento fica firme e preciso.',
      mechanicalEffect: '+1 / +2 / +3 em Destreza (nv.1 / 2 / 3) enquanto o efeito durar.',
      narrativeConsequence: 'Músculos travam depois do pico: −1 DES no próximo turno.',
      cooldownTurns: 2,
      overloadCost: 1,
      buff: { kind: 'attr_bonus', attrKey: 'destreza', values: [1, 2, 3], durationTurns: 2, target: 'self' },
    }),
    skill('atirador', 2, {
      icon: 'OL',
      name: 'Olhar Longínquo',
      description: 'O Eco estica a visão — distância e detalhes saltam à frente.',
      mechanicalEffect: '+1 / +2 / +3 em Percepção (nv.1 / 2 / 3) enquanto o efeito durar.',
      narrativeConsequence: 'Olhos ardidos: −1 PER no próximo turno.',
      cooldownTurns: 2,
      overloadCost: 1,
      buff: { kind: 'attr_bonus', attrKey: 'percepcao', values: [1, 2, 3], durationTurns: 2, target: 'self' },
    }),
    skill('atirador', 3, {
      icon: 'BF',
      name: 'Bala Fragmentada',
      description: 'A arma inteira se fragmenta no Eco — o projétil rasga o tempo e perfura o trajeto.',
      mechanicalEffect: 'Disparo que atravessa múltiplos alvos/coberturas no trajeto. Acerto: marca Leve em cada alvo perfurado; crítico no principal: marca Média nele.',
      narrativeConsequence: 'O Eco estilhaça no ombro e no pulso: −1 FOR no próximo turno.',
      cooldownTurns: 3,
      overloadCost: 3,
    }),
  ],
  tank: [
    skill('tank', 1, {
      icon: 'CE',
      name: 'Chamado do Eco',
      description: 'O Eco ecoa alto em você — a atenção do campo vira na sua direção.',
      mechanicalEffect: 'Inimigos em alcance curto/médio priorizam você nos próximos ataques, até o fim do seu próximo turno ou até você cair.',
      narrativeConsequence: 'Você se abre demais: −1 DES no próximo turno.',
      cooldownTurns: 2,
      overloadCost: 2,
    }),
    skill('tank', 2, {
      icon: 'CT',
      name: 'Couraça Temporal',
      description: 'O Eco endurece a pele e os ossos por alguns instantes.',
      mechanicalEffect: '+2 / +4 / +6 no limiar de marcas (nv.1 / 2 / 3) por 3 turnos, só em você.',
      narrativeConsequence: 'Corpo pesado demais: −1 DES no próximo turno.',
      cooldownTurns: 3,
      overloadCost: 2,
      buff: { kind: 'mark_bonus', values: [2, 4, 6], durationTurns: 3, target: 'self' },
    }),
    skill('tank', 3, {
      icon: 'AR',
      name: 'Aura de Amparo',
      description: 'Uma aura de Eco reforça a resistência de todo o grupo.',
      mechanicalEffect: '+1 / +2 / +3 no limiar de marcas do grupo (nv.1 / 2 / 3) por 3 turnos.',
      narrativeConsequence: 'A aura drena o foco: −1 RUP no próximo turno.',
      cooldownTurns: 3,
      overloadCost: 3,
      buff: { kind: 'mark_bonus', values: [1, 2, 3], durationTurns: 3, target: 'party' },
    }),
  ],
  porradeiro: [
    skill('porradeiro', 1, {
      icon: 'FC',
      name: 'Fúria Cega',
      description: 'O Eco explode nos músculos — força sobe, a mente some.',
      mechanicalEffect: '+2 / +4 / +6 em Força (nv.1 / 2 / 3) enquanto o efeito durar. Inteligência cai na mesma medida (−2 / −4 / −6).',
      narrativeConsequence: 'O corpo e o Eco desabam juntos: −1 RUP, −1 FOR e −1 INT no próximo turno.',
      cooldownTurns: 2,
      overloadCost: 2,
      buffs: [
        { kind: 'attr_bonus', attrKey: 'forca', values: [2, 4, 6], durationTurns: 2, target: 'self' },
        { kind: 'attr_bonus', attrKey: 'inteligencia', values: [-2, -4, -6], durationTurns: 2, target: 'self' },
      ],
    }),
    skill('porradeiro', 2, {
      icon: 'LR',
      name: 'Lâmina de Ruptura',
      description: 'Enche a arma de Ruptura — o corte deixa feridas que o tempo não perdoa.',
      mechanicalEffect: 'Ataque corpo a corpo carregado de Ruptura. Acerto: marca Média. Crítico: marca Grave.',
      narrativeConsequence: 'O gume cobra o braço: −1 DES e −1 FOR no próximo turno.',
      cooldownTurns: 2,
      overloadCost: 2,
    }),
    skill('porradeiro', 3, {
      icon: 'VT',
      name: 'Vórtice Temporal',
      description: 'Gira a arma tão rápido que o Eco abre um vórtice no instante.',
      mechanicalEffect: 'Ataque em área ao redor: todos em alcance curto sofrem a rolagem. Acerto: marca Leve; crítico no principal: marca Média nele.',
      narrativeConsequence: 'O giro desarruma o corpo: −1 FOR e −1 DES no próximo turno.',
      cooldownTurns: 3,
      overloadCost: 3,
    }),
  ],
  magica: [
    skill('magica', 1, {
      icon: 'CR',
      name: 'Canal de Ruptura',
      description: 'Abre os canais — o Eco sobe e queima por dentro.',
      mechanicalEffect: '+1 / +2 / +3 em Ruptura (nv.1 / 2 / 3) enquanto o efeito durar.',
      narrativeConsequence: 'Canais formigam: −1 RUP no próximo turno.',
      cooldownTurns: 2,
      overloadCost: 1,
      buff: { kind: 'attr_bonus', attrKey: 'ruptura', values: [1, 2, 3], durationTurns: 2, target: 'self' },
    }),
    skill('magica', 2, {
      icon: 'PD',
      name: 'Passo Distorcido',
      description: 'Torce o instante e atravessa o espaço num piscar.',
      mechanicalEffect: 'Mova-se até alcance médio sem provocação. Até o fim do turno, seu próximo ataque de Eco (RUP): acerto causa marca Leve (nv.1), Média (nv.2) ou Grave (nv.3).',
      narrativeConsequence: 'Náusea temporal: −1 SAB no próximo turno.',
      cooldownTurns: 2,
      overloadCost: 2,
    }),
    skill('magica', 3, {
      icon: 'ET',
      name: 'Estilhaço Temporal',
      description: 'Lança um pedaço do instante — o alvo trava enquanto o mundo segue.',
      mechanicalEffect: 'Ataque de Eco (RUP) à distância. Acerto: marca Média e o alvo age por último no próximo round. Crítico: marca Grave e o alvo perde a próxima ação.',
      narrativeConsequence: 'Sua percepção atrasa junto: −1 PER no próximo turno.',
      cooldownTurns: 3,
      overloadCost: 3,
    }),
  ],
  suporte: [
    skill('suporte', 1, {
      icon: 'TS',
      name: 'Trama Serena',
      description: 'O Eco tece um fio calmo na mente — você lê a ferida antes dela se fechar mal.',
      mechanicalEffect: '+1 / +2 / +3 em Sabedoria (nv.1 / 2 / 3) enquanto o efeito durar.',
      narrativeConsequence: 'A mente esvazia depois da leitura: −1 INT no próximo turno.',
      cooldownTurns: 2,
      overloadCost: 1,
      buff: { kind: 'attr_bonus', attrKey: 'sabedoria', values: [1, 2, 3], durationTurns: 2, target: 'self' },
    }),
    skill('suporte', 2, {
      icon: 'CI',
      name: 'Cicatriz de Eco',
      description: 'Puxa um instante em que o corpo ainda estava inteiro e costura por cima da ferida.',
      mechanicalEffect: 'Remove 1 / 2 / 3 marcas de dano em você (nv.1 / 2 / 3).',
      narrativeConsequence: 'O Eco cobra o pulso: −1 DES no próximo turno.',
      cooldownTurns: 2,
      overloadCost: 2,
      heal: { values: [1, 2, 3], target: 'self' },
    }),
    skill('suporte', 3, {
      icon: 'RF',
      name: 'Refluxo',
      description: 'O Eco volta no grupo inteiro — cada um recupera um pedaço do instante perdido.',
      mechanicalEffect: 'Remove 1 / 2 / 3 marcas de dano em todo o grupo (nv.1 / 2 / 3).',
      narrativeConsequence: 'Você fica oco depois de devolver tanto: −1 SAB no próximo turno.',
      cooldownTurns: 3,
      overloadCost: 3,
      heal: { values: [1, 2, 3], target: 'party' },
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
