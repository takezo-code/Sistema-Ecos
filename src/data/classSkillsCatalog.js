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
  }
}

const BY_CLASS = {
  atirador: [
    skill('atirador', 1, {
      icon: 'PA',
      name: 'Precisão Aumentada',
      description: 'O Eco afia o corpo — a mira fica mais firme.',
      mechanicalEffect: 'Aumenta Destreza: +1 (nv.1), +2 (nv.2) ou +3 (nv.3) enquanto o efeito durar (até o fim da cena ou conforme o mestre).',
      narrativeConsequence: 'Músculos travam depois do pico: −1 DES no próximo turno.',
      cooldownTurns: 2,
    }),
    skill('atirador', 2, {
      icon: 'OA',
      name: 'Olhos de Águia',
      description: 'Enxerga melhor a longa distância ou percebe algo com mais clareza.',
      mechanicalEffect: 'Na próxima rolagem de Percepção: +1 (nv.1), +2 (nv.2) ou +3 (nv.3).',
      narrativeConsequence: 'Olhos ardidos: −1 PER no próximo turno.',
      cooldownTurns: 2,
    }),
    skill('atirador', 3, {
      icon: 'SE',
      name: 'Sniper de Eco',
      description: 'Cria um sniper de Eco — tiro certeiro, balas em curva, sem interferências.',
      mechanicalEffect: 'Disparo à distância extremo (inimigos ou alvo longe). Tiro certeiro: ignora coberturas leves e trajetórias tortas; o mestre define alcance e dificuldade.',
      narrativeConsequence: 'Recuo do Eco no ombro: −1 FOR no próximo turno.',
      cooldownTurns: 3,
    }),
  ],
  tank: [
    skill('tank', 1, {
      icon: 'PV',
      name: 'Provocação',
      description: 'Puxa a atenção — os monstros miram em você em vez dos aliados.',
      mechanicalEffect: 'Inimigos em alcance curto/médio devem priorizar você nos próximos ataques (enquanto fizer sentido narrativo), até o fim do seu próximo turno ou até você cair.',
      narrativeConsequence: 'Você se abre demais: −1 DES no próximo turno.',
      cooldownTurns: 2,
    }),
    skill('tank', 2, {
      icon: 'AD',
      name: 'Aumento de Defesa',
      description: 'O Eco endurece o corpo por alguns instantes.',
      mechanicalEffect: 'Por 3 turnos: +2 limiar de marcas (nv.1), +4 (nv.2) ou +6 (nv.3) só em você.',
      narrativeConsequence: 'Corpo pesado demais: −1 DES no próximo turno.',
      cooldownTurns: 3,
    }),
    skill('tank', 3, {
      icon: 'AR',
      name: 'Aura de Ruptura',
      description: 'Uma aura de Eco reforça a defesa de todo o grupo.',
      mechanicalEffect: 'Por 3 turnos: todo o grupo ganha +1 limiar de marcas (nv.1), +2 (nv.2) ou +3 (nv.3).',
      narrativeConsequence: 'A aura drena o foco: −1 RUP no próximo turno.',
      cooldownTurns: 3,
    }),
  ],
  porradeiro: [
    skill('porradeiro', 1, {
      icon: 'GO',
      name: 'Golpe Brusco',
      description: 'Força bruta canalizada — sem elegância.',
      mechanicalEffect: 'Ataque corpo a corpo com +1 eficácia. Acerto: 1 marca Leve.',
      narrativeConsequence: 'Braço lateja: −1 FOR no próximo turno.',
      cooldownTurns: 1,
    }),
    skill('porradeiro', 2, {
      icon: 'AR',
      name: 'Arrancada',
      description: 'Investe no alvo com Eco nos músculos.',
      mechanicalEffect: 'Move-se até alcance curto e ataca. Sucesso: 1 marca Leve. Crítico: também Deslocado.',
      narrativeConsequence: 'Passos desajeitados depois da investida: −1 DES no próximo turno.',
      cooldownTurns: 2,
    }),
    skill('porradeiro', 3, {
      icon: 'ES',
      name: 'Estilhaço Ósseo',
      description: 'O impacto espalha Eco como estilhaços.',
      mechanicalEffect: 'Ataque. Acerto: marca Leve no alvo; 1 inimigo adjacente sofre marca Leve (sem rolagem).',
      narrativeConsequence: 'Zumbido na cabeça: −1 INT no próximo turno.',
      cooldownTurns: 3,
    }),
  ],
  magica: [
    skill('magica', 1, {
      icon: 'PU',
      name: 'Pulso de Eco',
      description: 'Rajada curta de Eco puro.',
      mechanicalEffect: 'Ataque de Eco (RUP). Acerto: 1 marca Leve.',
      narrativeConsequence: 'Canais formigam: −1 RUP no próximo turno.',
      cooldownTurns: 1,
    }),
    skill('magica', 2, {
      icon: 'DO',
      name: 'Dobra Curta',
      description: 'Torce o instante — reposiciona a si ou um objeto leve.',
      mechanicalEffect: 'Mova-se (ou um objeto pequeno) para alcance curto sem provocação. Em combate: pode sair de zona.',
      narrativeConsequence: 'Náusea temporal: −1 INT no próximo turno.',
      cooldownTurns: 2,
    }),
    skill('magica', 3, {
      icon: 'FR',
      name: 'Fragmento Temporal',
      description: 'Atrasa a ação do alvo por um suspiro.',
      mechanicalEffect: 'Alvo em visão: age por último neste round (ou perde a próxima ação menor, a critério do mestre).',
      narrativeConsequence: 'Sua percepção atrasa junto: −1 PER no próximo turno.',
      cooldownTurns: 3,
    }),
  ],
  suporte: [
    skill('suporte', 1, {
      icon: 'MC',
      name: 'Mente Calma',
      description: 'Acalma o Eco no corpo — em si ou em um aliado.',
      mechanicalEffect: 'Alvo (você ou aliado): reduz 1 nível de marcas no corpo e reduz 1 uso/nível de sobrecarga de Eco (a critério do mestre na mesa).',
      narrativeConsequence: 'Mente vazia depois do esforço: −1 INT no próximo turno.',
      cooldownTurns: 2,
    }),
    skill('suporte', 2, {
      icon: 'FO',
      name: 'Fortificação',
      description: 'Reforça o limiar de marcas do alvo com Eco.',
      mechanicalEffect: 'Alvo (você ou aliado): +1 limiar de marcas (nv.1), +2 (nv.2) ou +3 (nv.3) até o fim da cena ou conforme o mestre.',
      narrativeConsequence: 'O Eco endurece demais em você: −1 DES no próximo turno.',
      cooldownTurns: 2,
    }),
    skill('suporte', 3, {
      icon: 'AB',
      name: 'Abençoando',
      description: 'Canaliza Eco para abençoar uma rolagem específica.',
      mechanicalEffect: 'Bônus na rolagem: +1 (nv.1), +2 (nv.2) ou +3 (nv.3). Custo de usos de Eco: 1 se o atributo for aleatório; 2 se escolher só o grupo (físico ou cena); 3 se escolher o atributo exato (ex.: FOR, VIT, SAB).',
      narrativeConsequence: 'Voz e presença falham: −1 CAR no próximo turno.',
      cooldownTurns: 2,
      overloadCost: 1,
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
