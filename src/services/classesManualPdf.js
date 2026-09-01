import { CHARACTER_CLASSES, getClassAttributeLabels } from '../constants/classes'
import { getWeaponType } from '../constants/equipmentTypes'
import { getClassSkills } from '../data/classSkillsCatalog'
import { downloadMarkdownPdf } from './markdownPdf'

const PDF_FILENAME = 'Manual-de-Classes-Sistema-Eco.pdf'

function buildClassesManualText() {
  const lines = [
    'MANUAL DE CLASSES — SISTEMA ECO',
    '',
    'Referência das cinco classes jogáveis: papel, atributos, armas e skills.',
    '',
    'RESUMO',
    '',
    '- Cada classe tem 2 atributos-chave (1 físico + 1 de cena).',
    '- 3 skills ativas fixas + 1 skill da arma forjada.',
    '- 1 Eco investido = +1 nível da skill (máx. nível 3).',
    '- Bônus de classe na rolagem: +1 (3+ base), +2 (6+), +3 (9+) nos atributos-chave.',
    '',
  ]

  CHARACTER_CLASSES.forEach((cls, index) => {
    const attrs = getClassAttributeLabels(cls.id).join(' + ')
    const weapons = (cls.weapons || [])
      .map(id => getWeaponType(id)?.label || id)
      .join(', ')

    lines.push(`${index + 1}. ${cls.label.toUpperCase()}`)
    lines.push('')
    lines.push(cls.description)
    lines.push('')
    lines.push(`Atributos-chave: ${attrs}`)
    lines.push(`Armas sugeridas: ${weapons || '—'}`)
    lines.push('')
    lines.push(`Passiva — ${cls.passive.name}`)
    lines.push(`  ${cls.passive.description}`)
    lines.push('')

    const skills = getClassSkills(cls.id)
    lines.push('Skills de classe')
    skills.forEach((skill, i) => {
      lines.push(`  ${i + 1}. ${skill.name} — CD ${skill.cooldownTurns}, custo Eco ${skill.overloadCost}`)
      lines.push(`     ${skill.mechanicalEffect}`)
      if (skill.narrativeConsequence) {
        lines.push(`     Recuo: ${skill.narrativeConsequence}`)
      }
      lines.push('')
    })

    lines.push('A 4ª skill vem da arma equipada (forjada na criação).')
    lines.push('')
  })

  lines.push('FÓRMULAS RÁPIDAS')
  lines.push('')
  lines.push('- Limite Eco base: 5 (Fenda: 8) + Ruptura + bônus de equipamento')
  lines.push('- Baluarte: abaixo de 10 de vida, regenera 1 por turno até 10')
  lines.push('- Fratura: com ≤ 5 marcas de vida, Fúria Cega ganha +2 Força extra')
  lines.push('- Sutura: única classe que zera Eco no Descansar (Void)')

  return lines.join('\n')
}

export async function downloadClassesManualPdf() {
  await downloadMarkdownPdf({
    source: buildClassesManualText(),
    filename: PDF_FILENAME,
    footerLabel: 'Manual de Classes',
  })
}

export { PDF_FILENAME as CLASSES_MANUAL_PDF_FILENAME }
