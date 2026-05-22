/**
 * Gera src/data/characterSkillsCatalog.js — 15 skills por categoria (personagem).
 * Executar: node scripts/generate-character-skills-catalog.mjs
 */
import { writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '../src/data/characterSkillsCatalog.js')

const C = {
  combate: 'SKILL_CATEGORIES.COMBATE',
  percepcao: 'SKILL_CATEGORIES.PERCEPCAO',
  movimentacao: 'SKILL_CATEGORIES.MOVIMENTACAO',
  manipulacao: 'SKILL_CATEGORIES.MANIPULACAO',
  suporte: 'SKILL_CATEGORIES.SUPORTE',
  sobrevivencia: 'SKILL_CATEGORIES.SOBREVIVENCIA',
  emocional: 'SKILL_CATEGORIES.EMOCIONAL',
  leitura: 'SKILL_CATEGORIES.LEITURA',
  ambiente: 'SKILL_CATEGORIES.AMBIENTE',
}

/** [name, type, cd, ov, desc, mech, cons, passiveRisk?] */
const DATA = {
  combate: [
    ['Reflexo Eco', 'ativa', 2, 1, 'Eco residual acelera sinapses; você antecipa golpes por um instante.', 'Vantagem narrativa na próxima defesa ou esquiva; pode reagir a um ataque surpresa.', 'Tremor nas mãos e zumbido nos ouvidos por 1 cena.'],
    ['Impacto Direcionado', 'ativa', 3, 1, 'Concentra densidade de eco num único ponto de contato.', '+1 de eficácia em um golpe corpo a corpo ou empurrão.', 'Dor muscular localizada; punho ou pé adormece brevemente.'],
    ['Barreira Cinética', 'ativa', 4, 1, 'Campo breve desvia projéteis leves e fragmentos.', 'Ignora ou reduz o primeiro dano físico leve recebido neste turno.', 'Nariz sangra; pressão na testa.'],
    ['Pulso Atordoante', 'ativa', 3, 1, 'Onda curta de eco perturba equilíbrio e orientação do alvo.', 'Alvo perde ação menor ou sofre penalidade narrativa de equilíbrio.', 'Você sente vertigem leve após o disparo.'],
    ['Visão de Ameaça', 'passiva', 0, 0, 'Instinto alterado sinaliza perigo antes da consciência processar.', 'Mestre avisa sobre emboscadas óbvias ou armadilhas iminentes.', 'Hipervigilância: difícil relaxar fora de combate.'],
    ['Sangue Acelerado', 'ativa', 4, 1, 'Ritmo cardíaco sustentado por eco permite rajada curta de ações.', 'Uma ação extra narrativa ou movimento adicional neste turno.', 'Fadiga intensa no turno seguinte; pulso visível.'],
    ['Agarrão Amplificado', 'ativa', 2, 1, 'Densidade muscular temporária segura alvo com firmeza anormal.', 'Imobiliza ou dificulta fuga de um alvo adjacente por 1 turno.', 'Tensão nos ombros; risco de lesão se exagerar.'],
    ['Postura de Ferro', 'passiva', 0, 0, 'Centro de gravidade ajustado pelo eco mantém você em pé.', 'Resistência narrativa a quedas e empurrões leves.', 'Movimentos rígidos; penalidade leve em furtividade.'],
    ['Corte Etéreo', 'ativa', 3, 1, 'Lâmina de eco rasga tecido e armadura fraca sem lâmina física.', 'Dano leve ignorando proteção narrativa fraca.', 'Hemorragia nasal; visão embaça por segundos.'],
    ['Escudo de Pulso', 'ativa', 4, 1, 'Absorve o primeiro impacto recebido convertendo em calor e dor difusa.', 'Anula ou reduz um ataque recebido nesta rodada.', 'Marca de queimadura fria na pele do contato.'],
    ['Fúria Contida', 'ativa', 5, 2, 'Explosão violenta de eco contida até o limite; depois, vazio.', 'Bônus alto em um ataque ou sequência; risco narrativo elevado.', 'Irritabilidade e tremores por várias cenas.'],
    ['Rastreador de Impacto', 'passiva', 0, 0, 'Lê trajetória recente de ataques no ar e no ambiente.', 'Antecipa padrões de combate do oponente após 1 rodada observando.', 'Dificuldade em desligar o “modo combate”.'],
    ['Disparo Preciso', 'ativa', 3, 1, 'Projétil ou arremesso guiado por eco corrige curva e vento.', 'Vantagem narrativa em um ataque à distância.', 'Olho dominante arde; lacrimejamento.'],
    ['Resiliência de Combate', 'passiva', 0, 0, 'Dor leve é filtrada; você funciona apesar de ferimentos superficiais.', 'Ignora penalidade narrativa de ferimentos leves por uma cena.', 'Subestima ferimentos reais; risco de agravamento.'],
    ['Onda de Choque', 'ativa', 4, 1, 'Pulso radial empurra tudo em curto alcance.', 'Empurra múltiplos alvos próximos ou derruba objetos leves.', 'Zumbido prolongado; sensibilidade a sons altos.'],
  ],
  percepcao: [
    ['Foco Fragmentado', 'ativa', 2, 1, 'Atenção se divide em camadas; detalhes emergem do ruído.', 'Vantagem em investigar um ponto específico por 1 turno.', 'Dor de cabeça pulsante; dificuldade em visão periférica.'],
    ['Eco Auditivo', 'passiva', 0, 0, 'Ouvido captura frequências além do normal humano.', 'Detecta sussurros, mecanismos ocultos ou respiração próxima.', 'Sobrecarga em ambientes barulhentos; irritação.'],
    ['Rastreio Térmico', 'ativa', 3, 1, 'Calor residual revela passagem recente de corpos vivos.', 'Rastrear alvo ou grupo que passou na área nas últimas horas.', 'Olhos secos; sensação de areia.'],
    ['Memória Sensorial', 'passiva', 0, 0, 'Cenas vistas e ouvidas gravam-se com clareza perturbadora.', 'Recuperar detalhe esquecido de uma cena recente.', 'Flashbacks involuntários em momentos de stress.'],
    ['Amplificação Visual', 'ativa', 3, 1, 'Pupilas e nervos ópticos amplificam contraste e movimento.', 'Vantagem para notar gestos, armas ocultas ou escrita distante.', 'Fotofobia leve após uso.'],
    ['Pulso de Localização', 'ativa', 2, 1, 'Eco reverbera no espaço e devolve “eco” de massas próximas.', 'Sentir presença atrás de parede fina ou sob cobertura leve.', 'Desorientação breve; perda de noção de profundidade.'],
    ['Escuta Profunda', 'ativa', 4, 1, 'Foco total filtra ruído ambiente por alguns segundos.', 'Ouvir conversa através de porta fechada ou tubulação (narrativo).', 'Tontura; necessidade de silêncio após.'],
    ['Predição de Movimento', 'passiva', 0, 0, 'Microexpressões e tensão muscular antecipam intenção.', 'Aviso narrativo antes de ação hostil óbvia do alvo.', 'Paranoia social leve fora de combate.'],
    ['Visão em Camadas', 'ativa', 3, 1, 'Sobreposição de eco revela objetos com assinatura diferente.', 'Encontrar compartimento, fio ou objeto não óbvio à vista comum.', 'Enxaqueca leve; cores “vibram” por minutos.'],
    ['Detector de Mentira Eco', 'ativa', 4, 1, 'Variação de pulso e suor amplificados pela leitura de eco.', 'Vantagem narrativa para notar mentira óbvia em interrogatório.', 'Desconfiança crônica temporária com aliados.'],
    ['Sintonia com Ruído', 'passiva', 0, 0, 'Você lê o “tom” emocional de um ambiente pelo som ambiente.', 'Perceber tensão, medo ou calma coletiva no local.', 'Dificuldade em ambientes silenciosos (sensação de surdez).'],
    ['Amplificação Olfativa', 'ativa', 3, 1, 'Químicos e feromônios ficam nítidos por instantes.', 'Rastrear odor específico ou detectar veneno/gás leve.', 'Náusea com cheiros fortes comuns.'],
    ['Mapeamento Instantâneo', 'ativa', 4, 1, 'Scan rápido grava layout do ambiente na mente.', 'Lembrar planta, saídas e coberturas após passagem breve.', 'Sensação de “déjà vu” constante na área.'],
    ['Sexto Sentido', 'passiva', 0, 0, 'Alerta inexplicável antes de eventos perigosos.', 'Mestre pode sinalizar perigo iminente sem explicação clara.', 'Ansiedade; risco passivo de sobrecarga em cenas longas.', true],
    ['Clarividência Limitada', 'ativa', 5, 2, 'Eco projeta fragmento de cena passada ou provável no local.', 'Uma pista narrativa forte sobre o local (passado recente).', 'Desmaio breve ou perda de memória de minutos recentes.'],
  ],
  movimentacao: [
    ['Passo Fantasma', 'ativa', 2, 1, 'Peso distribuído pelo eco reduz som e pegada.', 'Movimento silencioso por um turno ou atravessar terreno ruidoso sem alerta.', 'Fraqueza nas pernas após.'],
    ['Impulso Vertical', 'ativa', 3, 1, 'Eco impulsiona pernas para salto além do humano comum.', 'Alcançar varanda, telhado baixo ou obstáculo médio.', 'Impacto ao aterrissar: dor nos joelhos.'],
    ['Deslize de Eco', 'ativa', 3, 1, 'Superfície parece reduzir atrito sob seus pés por instantes.', 'Deslocamento extra ou escapar de zona de perigo imediato.', 'Unhas frias; formigamento nos pés.'],
    ['Corrida Sustentada', 'passiva', 0, 0, 'Ritmo cardíaco otimizado prolonga esforço aeróbico.', 'Menos fadiga narrativa em perseguições longas.', 'Dificuldade em parar abruptamente sem tropeço.'],
    ['Escalada Amplificada', 'ativa', 4, 1, 'Dedos e pontas aderem levemente a superfícies por eco.', 'Subir superfície difícil com vantagem narrativa.', 'Lacerações leves nas palmas; medo de altura retorna depois.'],
    ['Fuga Instintiva', 'ativa', 2, 1, 'Modo sobrevivência acelera reação de retirada.', 'Vantagem para sair de combate ou alcance inimigo neste turno.', 'Pânico residual; respiração ofegante.'],
    ['Passo Longo', 'ativa', 3, 1, 'Distância entre passos se estende sem parecer corrida.', 'Cobrir terreno aberto mais rápido que o grupo por uma cena.', 'Cãibra noturna possível.'],
    ['Equilíbrio de Corda', 'passiva', 0, 0, 'Centro de massa ajustado automaticamente em superfícies estreitas.', 'Vantagem em vigas, cordas e beiradas.', 'Tontura se ficar parado muito tempo em solo plano.'],
    ['Mergulho Controlado', 'ativa', 4, 1, 'Eco amortece impacto com água ou queda curta.', 'Reduz dano narrativo de queda média ou mergulho.', 'Ouvidos entupidos; pressão no peito.'],
    ['Rastro Falso', 'ativa', 3, 1, 'Pegadas e calor residual confundem rastreadores.', 'Dificulta ser seguido por criaturas ou perseguidores comuns.', 'Confusão sobre seu próprio caminho de volta.'],
    ['Fase Curta', 'ativa', 5, 2, 'Corpo “desloca” entre dois pontos visíveis muito próximos.', 'Teleporte narrativo de poucos metros (linha de visão).', 'Náusea severa; possível sangramento nasal.'],
    ['Agilidade Reflexa', 'passiva', 0, 0, 'Articulações respondem antes do pensamento em perigo.', 'Evitar armadilhas mecânicas simples ou tropeços.', 'Movimentos bruscos involuntários em calma.'],
    ['Nado de Eco', 'ativa', 4, 1, 'Propulsão aquática breve mesmo sem treino formal.', 'Atravessar trecho aquático curto ou manter-se à tona.', 'Pele repuxada; sede intensa após.'],
    ['Ancoragem Leve', 'ativa', 3, 1, 'Gravidade local parece diminuir ao seu redor por segundos.', 'Levantar objeto pesado leve ou flutuar descida por 1 turno.', 'Vertigem ao voltar ao normal.'],
    ['Marcha Inabalável', 'passiva', 0, 0, 'Terreno difícil não desacelera tanto quanto deveria.', 'Ignorar penalidade leve de lama, entulho ou neve.', 'Pés doloridos ao final do dia.'],
  ],
  manipulacao: [
    ['Toque de Sincronia', 'ativa', 3, 1, 'Eco alinha ritmo neural com outro corpo por instantes.', 'Vantagem para copiar gesto técnico ou sincronizar ação em dupla.', 'Sugestão: alvo sente “invasão” leve.'],
    ['Empatia Forçada', 'ativa', 4, 1, 'Projeção de emoção alterada no alvo por segundos.', 'Inclinar reação emocional (medo, calma, raiva leve) — narrativo.', 'Você absorve resíduo emocional; humor instável.'],
    ['Sussurro de Eco', 'ativa', 2, 1, 'Mensagem vibra direto no ouvido interno de quem você toca.', 'Comunicar frase curta sem outros ouvirem.', 'Zumbido se usado em excesso.'],
    ['Pressão Social', 'passiva', 0, 0, 'Presença amplificada intimida ou acalma sem palavras.', 'Vantagem leve em intimidação ou apaziguamento.', 'Inimizades por mal-entendido de tom.'],
    ['Desarme de Tensão', 'ativa', 3, 1, 'Relaxa músculos do oponente no contato certo.', 'Chance narrativa de soltar arma ou reduzir agressividade.', 'Alvo pode ficar confuso ou agressivo depois.'],
    ['Máscara Emocional', 'passiva', 0, 0, 'Rosto e voz não traem seu estado real por um tempo.', 'Esconder medo, mentira ou dor em interação social.', 'Esgotamento ao “desligar” a máscara.'],
    ['Gancho de Memória', 'ativa', 4, 1, 'Eco puxa lembrança recente à superfície no alvo.', 'Extrair detalhe que alvo viu mas não notou (narrativo).', 'Alvo pode ter dor de cabeça ou lacuna.'],
    ['Charme Instável', 'ativa', 3, 1, 'Carisma amplificado por pulso de eco.', 'Vantagem em uma negociação ou persuasão.', 'Rejeição intensa se falhar (narrativo).'],
    ['Toque Paralisante', 'ativa', 4, 1, 'Nervo motor travado por microsegundos.', 'Alvo perde ação menor ou reação por 1 turno.', 'Culpa moral; alvo pode desconfiar depois.'],
    ['Eco de Autoridade', 'passiva', 0, 0, 'Voz e postura projetam comando natural.', 'Grupo hesita em desobedecer ordem direta óbvia.', 'Responsabilidade narrativa se abusar.'],
    ['Ligação de Dor', 'ativa', 5, 2, 'Compartilha sensação de dor leve com agressor.', 'Desincentiva violência imediata contra você (narrativo).', 'Você sente eco da dor infligida.'],
    ['Sugestão Leve', 'ativa', 3, 1, 'Frase ancorada em eco repete na mente do alvo.', 'Alvo considera uma ação simples sugerida (não controle total).', 'Insônia se usado repetidamente na mesma pessoa.'],
    ['Espelho Gestual', 'passiva', 0, 0, 'Imita postura alheia ganhando rapport inconsciente.', 'Vantagem para ganhar confiança inicial.', 'Perda temporária de preferências gestuais próprias.'],
    ['Ruptura de Vínculo', 'ativa', 4, 1, 'Corta influência mental ou emocional externa leve.', 'Liberar aliado de medo paralisante ou charme fraco.', 'Cansaço mental; irritabilidade.'],
    ['Teia de Influência', 'ativa', 3, 1, 'Percebe quem influencia quem em um grupo pequeno.', 'Mapear hierarquia social oculta na cena.', 'Paralisia decisória ao ver muitas conexões.'],
  ],
  suporte: [
    ['Toque de Estabilização', 'ativa', 3, 1, 'Eco acalma pulso e respiração de aliado tocado.', 'Reduz sobrecarga narrativa leve ou pânico de aliado.', 'Você absorve parte da tensão; fadiga.'],
    ['Barreira de Calma', 'ativa', 4, 1, 'Campo suave reduz hostilidade em área pequena.', 'Grupo aliado ignora penalidade leve de medo por 1 turno.', 'Emoções planas depois; dificuldade de decisão.'],
    ['Eco Compartilhado', 'ativa', 3, 1, 'Divide percepção sensorial com aliado por instantes.', 'Aliado ganha uma pista que você percebeu.', 'Confusão sensorial mútua por segundos.'],
    ['Cura de Ritmo', 'passiva', 0, 0, 'Presença acelera recuperação natural leve de aliados próximos.', 'Descanso curto rende mais em narrativa de ferimentos leves.', 'Você sente dores alheias como fantasma.'],
    ['Âncora de Grupo', 'passiva', 0, 0, 'Aliados mantêm coesão sob pressão.', 'Penalidade reduzida por dispersão ou pânico em grupo.', 'Carga emocional se alguém trair expectativa.'],
    ['Transferência de Fadiga', 'ativa', 4, 1, 'Assume exaustão leve de aliado por alguns minutos.', 'Aliado recupera ação ou clareza; você fica lento depois.', 'Exaustão dobrada ao expirar efeito.'],
    ['Pulso de Moral', 'ativa', 2, 1, 'Onda de determinação percorre aliados próximos.', 'Vantagem narrativa na próxima ação coletiva.', 'Queda de moral após se o grupo falhar.'],
    ['Escudo Mental Aliado', 'ativa', 4, 1, 'Deflete influência psíquica leve de um companheiro.', 'Aliado ignora um efeito de medo ou confusão leve.', 'Dor de cabeça compartilhada.'],
    ['Sintonia de Cura', 'ativa', 3, 1, 'Guia corpo aliado a fechar ferimento superficial mais rápido.', 'Estancar sangramento leve ou reduzir dor aguda.', 'Marca temporária no ponto tocado (ardência).'],
    ['Eco de Instrução', 'passiva', 0, 0, 'Explicações suas “grudam” na memória do ouvinte.', 'Aliado repete tarefa técnica com menos erro.', 'Frustração se aliado não obedecer.'],
    ['Rede de Alerta', 'ativa', 3, 1, 'Liga percepções: um alerta, todos sentem.', 'Grupo reage a perigo que um membro detectou.', 'Falso alarme causa pânico em cadeia.'],
    ['Repouso Amplificado', 'ativa', 5, 1, 'Zona de descanso eco acelera recuperação de sobrecarga.', 'Grupo reduz sobrecarga eco em descanso narrativo.', 'Sonolência profunda; vulnerável durante.'],
    ['Voz de Comando Suave', 'passiva', 0, 0, 'Ordens claras sem gritar mantêm grupo focado.', 'Reorganizar iniciativa narrativa após caos leve.', 'Rouquidão se abusar.'],
    ['Absorção de Choque', 'ativa', 4, 1, 'Campo amortece queda ou impacto de aliado adjacente.', 'Aliado evita dano leve de queda ou empurrão.', 'Você recebe metade do impacto narrativo.'],
    ['Legado de Esperança', 'passiva', 0, 0, 'Presença lembra aliados por que resistem.', 'Um aliado evita quebra mental narrativa por cena (1x).', 'Depressão profunda se aliado morrer na cena.'],
  ],
  sobrevivencia: [
    ['Instinto de Fuga', 'passiva', 0, 0, 'Corpo sabe rotas de escape antes da mente planejar.', 'Vantagem para encontrar saída em estrutura desconhecida.', 'Evita confronto mesmo quando necessário.'],
    ['Rastreador de Água', 'ativa', 3, 1, 'Eco detecta umidade e fluxo subterrâneo leve.', 'Encontrar água potável ou umidade em ambiente seco.', 'Sede psicossomática se falhar.'],
    ['Fogo de Eco', 'ativa', 4, 1, 'Faísca dirigida acende material preparado.', 'Iniciar fogueira sem ferramentas (material seco necessário).', 'Queimadura leve nos dedos; cheiro de ozônio.'],
    ['Abrigo Rápido', 'ativa', 3, 1, 'Identifica melhor ponto de proteção climática imediata.', 'Grupo ganha cobertura narrativa contra intempérie leve.', 'Hipersensibilidade ao vento depois.'],
    ['Conservação de Energia', 'passiva', 0, 0, 'Metabolismo entra em modo economia sob stress.', 'Menos necessidade narrativa de comida/água por um dia.', 'Letargia entre picos de ação.'],
    ['Detecção de Veneno', 'ativa', 3, 1, 'Paladar e olfato amplificados para toxinas comuns.', 'Identificar comida ou ar contaminado leve.', 'Recusa alimentos por paranoia temporária.'],
    ['Camuflagem Urbana', 'ativa', 3, 1, 'Eco “dobra” presença contra fundo urbano.', 'Vantagem para se esconder em multidão ou entulho.', 'Sensação de invisibilidade perigosa (descuido).'],
    ['Nó de Sobrevivência', 'passiva', 0, 0, 'Mãos lembram nós e amarrações sob pressão.', 'Vantagem em armadilhas, cordas e reparos rústicos.', 'Dor nas articulações em frio.'],
    ['Caça de Eco', 'ativa', 4, 1, 'Rastreia fauna por pulso vital residual.', 'Localizar presa ou predador próximo na natureza.', 'Pesadelos com animais mortos.'],
    ['Resistência ao Frio', 'ativa', 3, 1, 'Calor interno redistribuído por eco.', 'Ignorar penalidade leve de frio por uma cena.', 'Febre leve ao desativar.'],
    ['Purificação Leve', 'ativa', 4, 1, 'Eco quebra contaminantes simples em água pequena.', 'Água suspeita torna-se potável em volume limitado.', 'Gosto metálico persistente.'],
    ['Alerta Selvagem', 'passiva', 0, 0, 'Sente mudança no padrão natural ao redor.', 'Aviso de predador, tempestade ou deslizamento iminente.', 'Dificuldade em cidades (ruído confunde).'],
    ['Armadilha Improvisada', 'ativa', 3, 1, 'Monta armadilha com materiais locais guiado por eco.', 'Uma armadilha narrativa contra perseguidor comum.', 'Ferimento se montar às pressas.'],
    ['Memória de Trilha', 'passiva', 0, 0, 'Nunca esquece caminho que já percorreu em sobrevivência.', 'Retornar sem se perder em floresta ou ruínas.', 'Obsessão por marcar caminhos fisicamente.'],
    ['Último Suspiro', 'ativa', 5, 2, 'Explosão de vitalidade quando à beira do colapso.', 'Uma ação crítica com vantagem máxima narrativa (1x por arco).', 'Colapso total após: descanso longo obrigatório.'],
  ],
  emocional: [
    ['Respiração de Eco', 'ativa', 2, 1, 'Ciclo respiratório sincronizado reduz pânico interno.', 'Reduz 1 nível narrativo de ansiedade ou sobrecarga leve.', 'Sonolência imediata se já estiver calmo.'],
    ['Muralha Interna', 'passiva', 0, 0, 'Emoções externas não penetram tão facilmente.', 'Resistência a manipulação emocional leve.', 'Dificuldade em se conectar intimamente.'],
    ['Descarga Controlada', 'ativa', 4, 1, 'Libera pico emocional de forma segura por segundos.', 'Evita ruptura mental narrativa por estresse acumulado.', 'Choro ou raiva involuntária após.'],
    ['Foco Sob Pressão', 'ativa', 3, 1, 'Clareza mental corta ruído emocional.', 'Vantagem em teste mental sob medo ou dor.', 'Insensibilidade temporária aos outros.'],
    ['Âncora de Memória Feliz', 'passiva', 0, 0, 'Lembrança positiva fixa acalma em crises.', 'Ignorar penalidade leve de horror por uma rodada.', 'Melancolia quando memória se desgasta.'],
    ['Absorção de Medo', 'ativa', 4, 1, 'Puxa medo de aliado para si e dissolve parcialmente.', 'Aliado recupera ação; você sofre penalidade leve.', 'Pesadelos na noite seguinte.'],
    ['Ressonância Calma', 'ativa', 3, 1, 'Emite estabilidade emocional em raio curto.', 'Grupo reduz hostilidade interna por 1 cena.', 'Emoção plana; criatividade reduzida.'],
    ['Gatilho Consciente', 'passiva', 0, 0, 'Reconhece gatilhos antes de reagir.', 'Mestre avisa quando cena pode disparar trauma.', 'Evita situações necessárias por cautela.'],
    ['Fúria Canalizada', 'ativa', 3, 1, 'Raiva vira foco único sem perder controle total.', 'Bônus ofensivo leve sem perder disciplina narrativa.', 'Resíduo de irritação por horas.'],
    ['Vazio Protegido', 'ativa', 5, 2, 'Desliga emoções por tempo crítico.', 'Imunidade narrativa a pânico por poucos turnos.', 'Não sente empatia até passar efeito; assusta aliados.'],
    ['Empatia Regulada', 'passiva', 0, 0, 'Sente emoções alheias sem ser arrastado.', 'Vantagem para ajudar aliado em crise emocional.', 'Lentidão para processar a própria dor.'],
    ['Mantra de Eco', 'ativa', 2, 1, 'Repetição vibratória interna reorganiza pensamentos.', 'Remove confusão mental leve em si.', 'Eco na voz por minutos após (distração).'],
    ['Limite Saudável', 'passiva', 0, 0, 'Recusa influência emocional além do suportável.', 'Uma recusa automática a sugestão emocional forte por sessão.', 'Conflito se grupo pressionar.'],
    ['Riso Nervoso', 'ativa', 3, 1, 'Libera tensão com humor forçado amplificado.', 'Grupo evita penalidade de moral por falha leve.', 'Aliados acham você instável temporariamente.'],
    ['Serenidade de Combate', 'passiva', 0, 0, 'Medo em combate vira foco frio.', 'Primeiro turno de combate sem penalidade de medo.', 'Pós-combate: tremores e necessidade de isolamento.'],
  ],
  leitura: [
    ['Leitura de Pulso', 'ativa', 2, 1, 'Ritmo cardíaco revela mentira, medo ou excitação.', 'Uma leitura emocional precisa sobre alvo tocado ou próximo.', 'Desconforto com contato físico depois.'],
    ['Microexpressão Amplificada', 'passiva', 0, 0, 'Rosto humano “grita” emoções microscópicas para você.', 'Vantagem para detectar hesitação ou hostilidade oculta.', 'Dificuldade em confiar em sorrisos.'],
    ['Postura de Mentira', 'ativa', 3, 1, 'Corpo trai inconsistência entre fala e gesto.', 'Saber se declaração é provavelmente falsa (narrativo, não infalível).', 'Paranoia em interrogatórios longos.'],
    ['Eco de Intenção', 'ativa', 3, 1, 'Músculos preparando ação antes do movimento.', 'Antecipar golpe ou gesto hostil por 1 turno.', 'Dor nos olhos por concentrar demais.'],
    ['Mapa de Tensão', 'passiva', 0, 0, 'Onde o corpo acumula stress fica visível para você.', 'Identificar ferimento oculto ou fadiga severa.', 'Impulso de tocar pessoas sem permissão.'],
    ['Olhar de Dominância', 'ativa', 4, 1, 'Projeta autoridade lendo e devolvendo hierarquia corporal.', 'Vantagem em intimidar ou resistir a intimidação.', 'Alvo guarda rancor se humilhado.'],
    ['Sincronia de Ritmo', 'ativa', 3, 1, 'Iguala respiração e postura para abrir alvo.', 'Vantagem em próxima persuasão após 1 turno de rapport.', 'Perde postura natural temporariamente.'],
    ['Detector de Arma', 'passiva', 0, 0, 'Ombro, quadril e peso denunciam objeto oculto.', 'Notar porte de arma ou objeto pesado disfarçado.', 'Hipervigilância em espaços públicos.'],
    ['História no Corpo', 'ativa', 4, 1, 'Cicatrizes e desgaste contam narrativa física recente.', 'Uma verdade sobre passado físico do alvo (treino, violência, doença).', 'Respeito ou medo excessivo do alvo.'],
    ['Espelho Hostil', 'ativa', 3, 1, 'Reflete postura agressiva de volta amplificada.', 'Desestabiliza agressor verbal ou físico leve.', 'Conflito escala se mal calibrado.'],
    ['Vazio Corporal', 'passiva', 0, 0, 'Detecta quando alguém “desliga” emocionalmente.', 'Perceber dissociação, choque ou transe.', 'Gatilho empático pesado.'],
    ['Toque-Interrogatório', 'ativa', 4, 1, 'Contato firme extrai reação involuntária.', 'Uma pergunta com vantagem máxima narrativa se alvo tocou.', 'Acusação de violência se mal interpretado.'],
    ['Leitura em Grupo', 'ativa', 3, 1, 'Dinâmica de poder flutuante entre várias pessoas.', 'Quem lidera, quem é excluído, quem mente no grupo.', 'Sobrecarga social em festas.'],
    ['Predador e Presa', 'passiva', 0, 0, 'Sabe quem caça quem na cena por linguagem corporal.', 'Evitar emboscada social ou traição óbvia.', 'Cynismo crescente.'],
    ['Silêncio Eloquente', 'ativa', 2, 1, 'Interpreta pausas e ausência de gesto.', 'Entender recusa ou consentimento não verbal.', 'Misunderstanding se cultura alheia for muito diferente.'],
  ],
  ambiente: [
    ['Sintonia do Local', 'passiva', 0, 0, 'Eco do ambiente “conversa” com você ao entrar.', 'Impressão geral: local abandonado, hostil, sagrado, etc.', 'Enxaqueca em locais com eco antigo forte.'],
    ['Eco Ativo', 'ativa', 3, 1, 'Emite pulso que revela estrutura oca ou vazios.', 'Detectar sala secreta, parede fina ou subsolo leve.', 'Zumbido por minutos.'],
    ['Leitura Climática', 'passiva', 0, 0, 'Pressão e umidade alteradas antecipam tempo.', 'Aviso narrativo de chuva, tempestade ou queda de temperatura.', 'Dor nas articulações antes de mudança.'],
    ['Raio de Decadência', 'ativa', 4, 1, 'Material degradado brilha fraco para seu eco.', 'Encontrar ponto fraco em estrutura, ponte ou porta.', 'Tosse ao respirar poeira liberada.'],
    ['Campo de Ruído', 'ativa', 3, 1, 'Amplifica sons ambientais para desorientar outros.', 'Penalidade leve a inimigos que dependem de audição na área.', 'Você também sofre ruído aumentado.'],
    ['Afinidade com Natureza', 'passiva', 0, 0, 'Florestas e água respondem com calma ao seu eco.', 'Vantagem em navegação natural e evitar perigos naturais leves.', 'Desconforto extremo em ambiente industrial.'],
    ['Marcação de Território', 'ativa', 3, 1, 'Deixa assinatura de eco que só você lê bem.', 'Não se perder em área já marcada; aviso se intruso passar.', 'Animais evitam você temporariamente.'],
    ['Purga de Contaminação', 'ativa', 4, 1, 'Eco dispersa gás ou poeira leve em raio pequeno.', 'Ar respirável por turnos limitados em nuvem leve.', 'Gosto de sangue; fraqueza.'],
    ['Ressonância Estrutural', 'ativa', 4, 1, 'Vibra edifício na frequência certa.', 'Derrubar suporte fraco ou abrir passagem estreita.', 'Risco de colapso parcial; evacuação narrativa.'],
    ['Veia de Eco', 'passiva', 0, 0, 'Sente “linhas” de poder ou poluição eco no mapa regional.', 'Direção aproximada de zona de ruptura ou fonte eco.', 'Compulsão por seguir linhas perigosas.'],
    ['Silenciar Ambiente', 'ativa', 3, 1, 'Absorve reverberação em sala por instantes.', 'Furtividade de grupo melhorada por 1 turno.', 'Surdez temporária leve.'],
    ['Incendiar Material Seco', 'ativa', 4, 1, 'Calor eco concentrado em ponto específico.', 'Iniciar fogo controlado em área pequena (narrativo).', 'Fumaça irrita olhos; alarme local.'],
    ['Chamar da Tempestade', 'ativa', 5, 2, 'Puxa descarga atmosférica leve para ponto aberto.', 'Dano ou efeito narrativo em área externa — imprevisível.', 'Atração por raios; medo de céu aberto depois.'],
    ['Raiz de Pedra', 'passiva', 0, 0, 'Estabilidade aumenta em solo natural ou rocha.', 'Menos penalidade em terreno irregular natural.', 'Instabilidade em prédios altos (vertigem).'],
    ['Eco Urbano', 'passiva', 0, 0, 'Cidade amplifica seus sentidos de forma caótica.', 'Vantagem para rastrear alguém em distrito denso.', 'Estresse crônico se ficar muitos dias sem natureza.'],
  ],
}

function esc(s) {
  return String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

function emitSkill(catKey, index, row) {
  const [name, type, cd, ov, desc, mech, cons, passiveRisk] = row
  const id = String(index).padStart(2, '0')
  const templateId = `pc_${catKey}_${id}`
  const isP = type === 'passiva'
  const lines = [
    `  {`,
    `    templateId: '${templateId}',`,
    `    name: '${esc(name)}',`,
    `    audience: SKILL_AUDIENCE.CHARACTER,`,
    `    skillType: ECO_SKILL_TYPES.${type.toUpperCase()},`,
    `    category: ${C[catKey]},`,
    `    cooldownTurns: ${isP ? 0 : cd},`,
    `    overloadCost: ${isP ? 0 : ov},`,
  ]
  if (isP && passiveRisk) {
    lines.push(`    passiveOverloadRisk: true,`)
  }
  lines.push(
    `    description: '${esc(desc)}',`,
    `    mechanicalEffect: '${esc(mech)}',`,
    `    narrativeConsequence: '${esc(cons)}',`,
    `  },`,
  )
  return lines.join('\n')
}

const blocks = []
for (const [catKey, rows] of Object.entries(DATA)) {
  blocks.push(`  // —— ${catKey} (${rows.length}) ——`)
  rows.forEach((row, i) => blocks.push(emitSkill(catKey, i + 1, row)))
}

const file = `/**
 * Catálogo embutido de habilidades de personagem (~15 por categoria).
 * Gerado por scripts/generate-character-skills-catalog.mjs — não editar à mão em massa.
 */
import { SKILL_CATEGORIES } from '../constants/skillCategories'
import { ECO_SKILL_TYPES } from '../constants/skillTypes'
import { SKILL_AUDIENCE } from '../constants/skillAudience'

export const CHARACTER_SKILLS_CATALOG = [
${blocks.join('\n')}
]

export function getCharacterCatalogSkillIds() {
  return CHARACTER_SKILLS_CATALOG.map(s => s.templateId)
}
`

writeFileSync(OUT, file, 'utf8')
const total = Object.values(DATA).reduce((n, a) => n + a.length, 0)
console.log(`Wrote ${OUT} (${total} skills)`)
