import { SKILL_AUDIENCE } from '../constants/skillAudience'
import { ECO_SKILL_TYPES } from '../constants/skillTypes'
import { CHARACTER_CLASSES } from '../constants/classes'

/**
 * 5 skills ativas pré-definidas por classe.
 * Jogadores investem pontos de Eco para desbloquear (nível 1) e evoluir.
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
      icon: 'MI',
      name: 'Mira Fria',
      description: 'Concentra o Eco no olhar — o próximo disparo encontra o ponto fraco.',
      mechanicalEffect: 'Próximo ataque à distância: +1 eficácia. Acerto: 1 marca Leve extra.',
      narrativeConsequence: 'Visão estreita por 1 turno — piora testes de percepção periférica.',
      cooldownTurns: 2,
    }),
    skill('atirador', 2, {
      icon: 'RA',
      name: 'Rajada Eco',
      description: 'Dois disparos ligados pelo mesmo pulso de Eco.',
      mechanicalEffect: 'Ataque à distância. Sucesso: 1 marca Leve no alvo. Crítico: também marca um alvo adjacente.',
      narrativeConsequence: 'Ombro lateja; −1 FOR no próximo teste físico.',
      cooldownTurns: 3,
    }),
    skill('atirador', 3, {
      icon: 'MA',
      name: 'Marca do Caçador',
      description: 'Marca o alvo com resíduo de Eco — o grupo sente onde ele está.',
      mechanicalEffect: 'Escolha 1 alvo em visão: aliados têm vantagem narrativa contra ele até seu próximo turno.',
      narrativeConsequence: 'Você fica Exposto até o início do próximo turno.',
      cooldownTurns: 3,
    }),
    skill('atirador', 4, {
      icon: 'RE',
      name: 'Recuo Controlado',
      description: 'Dispara e recua no mesmo fôlego.',
      mechanicalEffect: 'Ataque à distância. Depois, move-se para cobertura curta sem provocação narrativa.',
      narrativeConsequence: 'Joelho treme: teste DES fácil ou fica Caído.',
      cooldownTurns: 2,
    }),
    skill('atirador', 5, {
      icon: 'TI',
      name: 'Tiro de Ruptura',
      description: 'Canaliza Eco demais no projétil — risco e recompensa.',
      mechanicalEffect: 'Ataque à distância com +2 eficácia. Acerto: 1 marca Média (ou Grave se já Ferido).',
      narrativeConsequence: '+1 sobrecarga extra neste uso. Zumbido forte até descansar Eco.',
      cooldownTurns: 4,
      overloadCost: 2,
    }),
  ],
  tank: [
    skill('tank', 1, {
      icon: 'BA',
      name: 'Barreira Viva',
      description: 'Endurece o corpo com Eco — amortece o próximo golpe.',
      mechanicalEffect: 'Até o próximo turno: a próxima marca que receberia cai 1 nível (Grave→Média, etc.).',
      narrativeConsequence: 'Movimento lento: −1 DES neste turno.',
      cooldownTurns: 2,
    }),
    skill('tank', 2, {
      icon: 'PR',
      name: 'Provocar',
      description: 'Puxa a atenção do inimigo com presença e Eco.',
      mechanicalEffect: 'Escolha 1 inimigo em alcance curto: ele deve mirar você no próximo ataque (se fizer sentido narrativo).',
      narrativeConsequence: 'Você fica Exposto até o fim do próximo turno.',
      cooldownTurns: 2,
    }),
    skill('tank', 3, {
      icon: 'IM',
      name: 'Impacto de Escudo',
      description: 'Bate com o escudo carregado de Eco.',
      mechanicalEffect: 'Ataque corpo a corpo. Sucesso: 1 marca Leve + alvo fica Deslocado neste turno.',
      narrativeConsequence: 'Braço lateja; −1 FOR no próximo ataque.',
      cooldownTurns: 2,
    }),
    skill('tank', 4, {
      icon: 'LI',
      name: 'Linha Inquebrável',
      description: 'Segura a linha — aliados atrás de você sofrem menos.',
      mechanicalEffect: 'Até seu próximo turno: 1 aliado adjacente ignora a primeira marca Leve que receberia.',
      narrativeConsequence: 'Você absorve o estresse: +1 sobrecarga se bloquear algo assim.',
      cooldownTurns: 3,
    }),
    skill('tank', 5, {
      icon: 'MU',
      name: 'Muralha de Eco',
      description: 'Campo denso que segura a frente por um instante.',
      mechanicalEffect: 'Você e 1 aliado adjacente: próxima marca Média vira Leve (1× cada).',
      narrativeConsequence: 'Visão embaca; −1 PER até o fim da cena ou descanso.',
      cooldownTurns: 4,
      overloadCost: 2,
    }),
  ],
  porradeiro: [
    skill('porradeiro', 1, {
      icon: 'GO',
      name: 'Golpe Brusco',
      description: 'Força bruta canalizada — sem elegância.',
      mechanicalEffect: 'Ataque corpo a corpo com +1 eficácia. Acerto: 1 marca Leve.',
      narrativeConsequence: 'Formigamento no braço por 1 turno.',
      cooldownTurns: 1,
    }),
    skill('porradeiro', 2, {
      icon: 'AR',
      name: 'Arrancada',
      description: 'Investe no alvo com Eco nos músculos.',
      mechanicalEffect: 'Move-se até alcance curto e ataca. Sucesso: 1 marca Leve. Crítico: também Deslocado.',
      narrativeConsequence: 'Fica Exposto até seu próximo turno.',
      cooldownTurns: 2,
    }),
    skill('porradeiro', 3, {
      icon: 'ES',
      name: 'Estilhaço Ósseo',
      description: 'O impacto espalha Eco como estilhaços.',
      mechanicalEffect: 'Ataque. Acerto: marca Leve no alvo; 1 inimigo adjacente sofre marca Leve (sem rolagem).',
      narrativeConsequence: 'Zumbido; fala mais alto neste turno.',
      cooldownTurns: 3,
    }),
    skill('porradeiro', 4, {
      icon: 'IG',
      name: 'Ignorar a Dor',
      description: 'Empurra o corpo além do razoável por um golpe.',
      mechanicalEffect: 'Ignore 1 nível de penalidade de estado físico neste ataque (Ferido conta como saudável para o teste).',
      narrativeConsequence: 'Após o golpe: +1 marca Leve em si mesmo (o corpo cobra).',
      cooldownTurns: 3,
    }),
    skill('porradeiro', 5, {
      icon: 'RU',
      name: 'Ruptura Brutal',
      description: 'Tudo no impacto — Eco e força no limite.',
      mechanicalEffect: 'Ataque com +2 eficácia. Acerto: 1 marca Média (Grave se já Ferido).',
      narrativeConsequence: '+1 sobrecarga extra. −1 VIT efetiva até descansar Eco.',
      cooldownTurns: 4,
      overloadCost: 2,
    }),
  ],
  magica: [
    skill('magica', 1, {
      icon: 'PU',
      name: 'Pulso de Eco',
      description: 'Rajada curta de Eco puro.',
      mechanicalEffect: 'Ataque de Eco (RUP). Acerto: 1 marca Leve.',
      narrativeConsequence: 'Formigamento nas mãos por 1 turno.',
      cooldownTurns: 1,
    }),
    skill('magica', 2, {
      icon: 'DO',
      name: 'Dobra Curta',
      description: 'Torce o instante — reposiciona a si ou um objeto leve.',
      mechanicalEffect: 'Mova-se (ou um objeto pequeno) para alcance curto sem provocação. Em combate: pode sair de zona.',
      narrativeConsequence: 'Náusea leve; −1 INT no próximo teste mental.',
      cooldownTurns: 2,
    }),
    skill('magica', 3, {
      icon: 'FR',
      name: 'Fragmento Temporal',
      description: 'Atrasa a ação do alvo por um suspiro.',
      mechanicalEffect: 'Alvo em visão: age por último neste round (ou perde a próxima ação menor, a critério do mestre).',
      narrativeConsequence: 'Sua própria percepção atrasa: −1 PER neste turno.',
      cooldownTurns: 3,
    }),
    skill('magica', 4, {
      icon: 'VE',
      name: 'Véu de Eco',
      description: 'Camada fina que desvia atenção e projéteis leves.',
      mechanicalEffect: 'Até o próximo turno: ignore a primeira marca Leve à distância que receberia.',
      narrativeConsequence: 'Voz ecoa estranha; −1 CAR em diálogo imediato.',
      cooldownTurns: 3,
    }),
    skill('magica', 5, {
      icon: 'RT',
      name: 'Ruptura Aberta',
      description: 'Abre demais o canal — poder alto, custo alto.',
      mechanicalEffect: 'Ataque de Eco com +2 eficácia. Acerto: 1 marca Média + alvo fica Deslocado.',
      narrativeConsequence: '+1 sobrecarga extra. Tremor nas mãos até descanso de Eco.',
      cooldownTurns: 4,
      overloadCost: 2,
    }),
  ],
  suporte: [
    skill('suporte', 1, {
      icon: 'LE',
      name: 'Leitura de Campo',
      description: 'Sente intenções e resíduos de Eco no ambiente.',
      mechanicalEffect: 'Vantagem no próximo teste de percepção/investigação. Em combate: o mestre revela 1 intenção óbvia de um inimigo.',
      narrativeConsequence: 'Dor de cabeça leve por 1 cena.',
      cooldownTurns: 1,
    }),
    skill('suporte', 2, {
      icon: 'CO',
      name: 'Cobertura Tática',
      description: 'Puxa um aliado para fora da linha com um fio de Eco.',
      mechanicalEffect: '1 aliado em alcance curto evita o próximo ataque direcionado a ele neste turno (1×).',
      narrativeConsequence: 'Você fica Exposto até seu próximo turno.',
      cooldownTurns: 2,
    }),
    skill('suporte', 3, {
      icon: 'SI',
      name: 'Sinal Clareza',
      description: 'Manda um pulso claro — o grupo entende o plano.',
      mechanicalEffect: 'Até 2 aliados: vantagem narrativa na próxima ação coordenada neste turno.',
      narrativeConsequence: 'Sua voz some por um instante (roleplay).',
      cooldownTurns: 2,
    }),
    skill('suporte', 4, {
      icon: 'ES',
      name: 'Estabilizar',
      description: 'Atenua o Eco no aliado — alívio curto.',
      mechanicalEffect: '1 aliado: remove 1 marca Leve ou reduz Média→Leve (não Grave/Incapacitado).',
      narrativeConsequence: 'Você absorve residual: +1 sobrecarga.',
      cooldownTurns: 3,
    }),
    skill('suporte', 5, {
      icon: 'RE',
      name: 'Rede de Eco',
      description: 'Liga o grupo por um momento — informação e proteção leve.',
      mechanicalEffect: 'Você + até 2 aliados: cada um ignora a primeira marca Leve neste round (1×).',
      narrativeConsequence: '+1 sobrecarga extra. Fadiga mental até descansar Eco.',
      cooldownTurns: 4,
      overloadCost: 2,
    }),
  ],
}

/** Todas as skills de personagem (flat) — catálogo embutido. */
export const CHARACTER_SKILLS_CATALOG = CHARACTER_CLASSES.flatMap(
  cls => BY_CLASS[cls.id] || [],
)

export function getClassSkills(classId) {
  return BY_CLASS[classId] || []
}

export function getClassSkillDef(templateId) {
  return CHARACTER_SKILLS_CATALOG.find(s => s.templateId === templateId) || null
}
