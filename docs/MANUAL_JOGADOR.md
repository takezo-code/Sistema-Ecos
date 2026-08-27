# Manual do Jogador — Sistema Eco

> Guia para **quem joga**. Explica como o sistema funciona na mesa: atributos, vida, Eco, skills, equipamento e rolagens.  
> Não é manual de mestre nem tutorial do aplicativo — é o **livro de regras do jogador**.

---

## Comece aqui — o mínimo para sentar na mesa

1. Você tem um **personagem** com **classe**, **atributos** e **3 skills de classe**.
2. Quando precisar fazer algo difícil, rola **d20 + bônus** contra uma **CD** que o mestre define (padrão **15**).
3. Você não tem HP: acumula **marcas de dano**. Muitas marcas = estado **Ferido**, **Grave** ou **Incapacitado**.
4. Usar poderes de classe (**skills ativas**) gasta **usos de Eco** (sobrecarga). Passar do limite seguro piora sua **mente**.
5. **Descansar** limpa marcas. Só a **Sutura** limpa Eco no Void. **Encerrar sessão** limpa Eco de todos.

Se entendeu isso, já dá para jogar. O resto do manual aprofunda cada parte.

---

# Parte I — O que é o Sistema Eco

## Eco: duas coisas diferentes

No jogo, **Eco** aparece em dois sentidos. Não confunda:

| | **Pontos de Eco** | **Sobrecarga de Eco** |
|---|-------------------|------------------------|
| **O que é** | Moeda de **progressão** | Contador de **poder usado na sessão** |
| **Para quê** | Subir o **nível das skills** (1 Eco = +1 nível) | Medir quanto você forçou o canal nesta sessão |
| **Onde vê** | Ficha → investir em habilidades | Ficha → aba Ecos / Status |
| **Quando reseta** | Nunca “gasta” sozinho — você **investe** em skills | Descanso (Sutura) ou fim de sessão |

## Void

O **Void** é o descanso entre cenas — o “respiro” do grupo.

- **Descansar:** todo mundo perde as **marcas de dano**.
- **Eco:** só a classe **Sutura** zera a sobrecarga no Descansar.
- **Demais classes:** mantêm a sobrecarga até o mestre **encerrar a sessão**.

## Marcas, não pontos de vida

Este sistema **não usa HP tradicional**.

- Você tem **vida máxima** e **marcas de dano** acumuladas.
- **Vida restante = vida máxima − marcas.**
- Golpes aplicam marcas **Leve (1)**, **Médio (2)** ou **Grave (3)** — o mestre escolhe conforme a cena.

---

# Parte II — Seu personagem

## Criação

Para criar um personagem válido, você precisa:

| Passo | O que define |
|-------|----------------|
| 1 | **Nome** (e aparência, se quiser) |
| 2 | **Classe** — uma das cinco abaixo |
| 3 | **10 pontos físicos** — máximo **4** por atributo na criação |
| 4 | **6 pontos de cena** — máximo **4** por atributo na criação |
| 5 | **1 Eco inicial** investido em **pelo menos 1 skill** da classe |
| 6 | **Arma** e **armadura** com **nome** (forjadas na criação) |

Depois de criado, os valores da criação viram **piso** — você não pode baixá-los depois. Só sobe com nível.

**Início padrão:** nível 1, sem marcas, estado **Saudável**, mente **Estável**.

---

## Atributos físicos (máximo 10)

| Atributo | Serve para |
|----------|------------|
| **Força** | Corpo a corpo, impacto, empurrões |
| **Destreza** | Precisão, esquiva, movimento fino |
| **Inteligência** | Magia estruturada, cajado, livro |
| **Vitalidade** | Aguentar dano — define **buffer de marcas** |
| **Ruptura** | Canal de Eco — **+1 uso seguro por ponto** |

**Penalidade de ferimento** afeta Força, Destreza e Vitalidade.  
**Penalidade de sobrecarga** afeta Inteligência, Percepção, Sabedoria e Carisma — **não** afeta Ruptura nem Vontade.

## Atributos de cena (máximo 9)

| Atributo | Serve para |
|----------|------------|
| **Carisma** | Presença, intimidação, liderança |
| **Percepção** | Notar, mirar, detectar mentiras |
| **Vontade** | Resistir pressão mental — **não** sofre penalidade de Eco |
| **Sabedoria** | Leitura de situação, cura, bom senso |

---

## Bônus de classe

Cada classe tem **2 atributos-chave** (1 físico + 1 de cena). Se você investiu pontos **base** neles, ganha bônus extra nas rolagens:

| Pontos base no atributo-chave | Bônus |
|-------------------------------|-------|
| 3 ou mais | **+1** |
| 6 ou mais | **+2** |
| 9 ou mais | **+3** |

Equipamento **não** conta para esse degrau — só o valor base da ficha.  
Ferimento reduz o atributo **efetivo** na rolagem, mas **não** tira o bônus de classe que você já conquistou.

### Tabela por classe

| Classe | Atributos-chave |
|--------|-----------------|
| **Traçado** | Destreza + Carisma |
| **Baluarte** | Vitalidade + Vontade |
| **Fratura** | Força + Vontade |
| **Fenda** | Ruptura + Sabedoria |
| **Sutura** | Inteligência + Sabedoria |

### Como montar uma rolagem

```
Total = d20 + atributo efetivo + bônus de classe + bônus de equipamento + bônus de skill
```

O mestre compara o total com a **CD** da ação.

---

## As cinco classes

### Traçado — precisão e distância

- **Papel:** atirador, batedor de longo alcance.
- **Passiva — Olho do Traçado:** vantagem narrativa de mira e percepção (sem bônus numérico fixo no sistema).
- **Armas sugeridas:** arma à distância.

### Baluarte — linha de frente

- **Papel:** tank, proteção do grupo.
- **Passiva — Muralha Inquebrável:** com **vida restante abaixo de 10**, regenera **1 vida por turno** (até voltar a 10).
- **Armas sugeridas:** escudo, arma pesada, arma de uma mão.

### Fratura — força bruta

- **Papel:** dano corpo a corpo, pressão constante.
- **Passiva — Fúria da Queda:** com **vida restante ≤ 5**, ao usar **Fúria Cega** ganha **+2 Força extra** (além do bônus da skill).
- **Armas sugeridas:** arma pesada, manoplas.

### Fenda — ruptura e ilusão

- **Papel:** magia de distorção, controle mental.
- **Passiva — Canal Amplo:** começa com **8 usos seguros de Eco** (em vez de 5).
- **Armas sugeridas:** orbe, varinha, cajado, livro.

### Sutura — suporte e cura

- **Papel:** curar, purgar Eco, sustentar o grupo.
- **Passiva — Descanso no Void:** **única classe** que zera sobrecarga de Eco no **Descansar**.
- **Armas sugeridas:** orbe, varinha, cajado, livro.

> Você **pode** usar outro tipo de arma que não o sugerido — é orientação de classe, não trava mecânica.

---

# Parte III — Vida, marcas e estados

## Vida máxima

```
Vida máxima = 15 + buffer
```

O **buffer** é quanto você “aguenta” antes de piorar de estado:

```
Buffer = floor(Vitalidade base ÷ 2) + bônus de armadura + bônus de skills + passivas de item
```

**Exemplo:** Vitalidade 6 → buffer +3 → vida máxima **18**.

A Vitalidade **ferida** não reduz o buffer — usa sempre a VIT **base** da ficha.

## Estados físicos

A cada ~4 marcas (ajustado pelo buffer), seu estado piora:

| Marcas (referência base) | Estado | Efeito |
|--------------------------|--------|--------|
| 0–4 | **Saudável** | Sem penalidade |
| 5–9 | **Ferido** | −1 Força, Destreza, Vitalidade |
| 10–14 | **Grave** | −2 Força, Destreza, Vitalidade |
| 15+ | **Incapacitado** | −3 Força, Destreza, Vitalidade |

Com buffer, todos esses limiares **atrasam**. Ex.: buffer 3 → Ferido só a partir de 8 marcas.

## Tipos de marca

| Tipo | Valor | Exemplo narrativo |
|------|-------|-------------------|
| Leve | 1 | Arranhão, contusão |
| Médio | 2 | Corte, fratura menor |
| Grave | 3 | Trauma severo, hemorragia |

## Cura

- Skills e efeitos podem **remover marcas**.
- **Descansar** (Void) zera **todas** as marcas → volta a **Saudável**.

---

# Parte IV — Eco, skills e turnos

## Limite seguro de usos

Antes de forçar demais o canal, você tem um **pool seguro**:

```
Limite seguro = base da classe + Ruptura + usos da arma + usos da armadura
```

| Fonte | Valor |
|-------|-------|
| Base (Traçado, Baluarte, Fratura, Sutura) | **5** |
| Base (**Fenda**) | **8** |
| Cada ponto de **Ruptura** | **+1** |
| Passiva “Usos de Ruptura” (arma ou armadura) | **+1 a +5** cada |

**Exemplo:** Fenda com Ruptura 4, arma +2, armadura +1 → limite **8 + 4 + 2 + 1 = 15**.

Na ficha aparece como `usos/limite` (ex.: `7/15`).

## O que acontece ao usar uma skill ativa

1. Aplica o **efeito** (buff, cura, dano narrativo, etc.).
2. Soma o **custo de sobrecarga** ao contador.
3. Entra em **cooldown** (turnos sem poder reusar).
4. No turno seguinte, pode haver **recuo** — penalidade no atributo indicado.

Skills com **hangover**: o bônus dura o turno, mas no seguinte o atributo **cai na mesma medida** do ganho.

## Dentro do limite

- Estado mental: **Estável**
- Sem penalidade de atributos mentais/sociais por Eco

## Acima do limite

Cada uso além do limite seguro piora a mente (−flat em **INT, PER, SAB, CAR**):

| Usos acima do limite | Estado mental | Penalidade |
|----------------------|---------------|------------|
| 0 (no limite inclusive) | Estável | — |
| 1 | **Abalado** | −1 |
| 2 | **Fragmentado** | −2 |
| 3–4 | **Dissociado** | −3 |
| 5+ | **Perdido no Tempo** | −4 + **Ruptura Total** |

### Ruptura Total

Quando a sobrecarga atinge **limite + 5**, dispara um evento crítico narrativo (sorteado). Exemplos:

- Inconsciência
- Colapso mental
- Eco descontrolado
- Mutação
- Morte (salvo exceção do mestre)

**Planeje seus usos de Eco.** Se não for Sutura, o contador só zera no **fim da sessão**.

---

## Skills de classe — as 15

Cada classe tem **3 skills fixas**. A **4ª skill vem da sua arma** (criada na forja, única sua).

- **Nível da skill:** 1 a 3 (cada **Eco investido** = +1 nível).
- Efeitos escalam com o nível: valores **1 / 2 / 3** (ou **2 / 4 / 6** em curas e vida temporária).
- **CD** = cooldown em turnos.
- **Sobrecarga** = custo ao ativar.

### Traçado

| Skill | CD | Sobrecarga | O que faz |
|-------|-----|------------|-----------|
| **Pulso Certeiro** | 2 | 1 | +1/+2/+3 **Destreza** neste turno; recuo −DES depois |
| **Olhar Longínquo** | 2 | 1 | +1/+2/+3 **Percepção** neste turno; recuo −PER depois |
| **Snipe de Ruptura** | 3 | 2 | Disparo de precisão; com mais nível, perfura e distorce o entorno; recuo −DES |

### Baluarte

| Skill | CD | Sobrecarga | O que faz |
|-------|-----|------------|-----------|
| **Couraça Fechada** | 3 | 2 | +2/+4/+6 **vida temporária** (só você); recuo −DES |
| **Manto Sagrado** | 3 | 3 | +1/+2/+3 **vida temporária** (grupo); recuo −Vontade |
| **Bramido** | 2 | 2 | Grito atordoador; com nível alto, pode derrubar; recuo −Carisma |

### Fratura

| Skill | CD | Sobrecarga | O que faz |
|-------|-----|------------|-----------|
| **Fúria Cega** | 2 | 1 | +1/+2/+3 **Força**; +2 FOR extra se vida ≤ 5; recuo −FOR |
| **Pisada Sísmica** | 3 | 2 | Tremor no chão; com nível alto, quebra piso; recuo −DES |
| **Talho Cego** | 3 | 2 | Corte pesado; com nível alto, abre Ruptura no impacto; recuo −FOR |

### Fenda

| Skill | CD | Sobrecarga | O que faz |
|-------|-----|------------|-----------|
| **Dobra Falsa** | 2 | 2 | Ilusões; com nível alto, copia objetos e formas grandes; recuo −RUP |
| **Cárcere Mental** | 3 | 2 | Prende mente do alvo; com nível alto, controle maior; recuo −SAB |
| **Canal Ampliado** | 2 | 1 | +1/+2/+3 **Ruptura e Inteligência**; recuo em ambos |

### Sutura

| Skill | CD | Sobrecarga | O que faz |
|-------|-----|------------|-----------|
| **Mente Elevada** | 2 | 1 | +1/+2/+3 **Sabedoria e Inteligência** por **2 turnos**; recuo em ambos |
| **Costura Viva** | 3 | 2 | Cura grupo: remove **2 / 4 / 6 marcas**; recuo −SAB |
| **Purga do Eco** | 3 | 2 | Reduz sobrecarga dos aliados em **1 / 2 / 3**; recuo −INT |

### Skill da arma (4ª)

Na criação você define nome, descrição e efeito. Padrão: **CD 2**, **sobrecarga 1**. Evolui com a mesma arma ao longo da campanha.

---

## Turno — o que fazer

1. **Agir na cena** — descreva o que faz; role se o mestre pedir.
2. **Ativar skill** — se estiver disponível (sem cooldown) e fizer sentido narrativo.
3. **Avançar turno** (quando o grupo avança o combate):
   - Cooldowns das skills **−1**
   - Buffs e recuos processam
   - **Baluarte** com vida &lt; 10 pode regenerar +1

---

# Parte V — Equipamento

## Regra geral

- **1 arma + 1 armadura** por personagem.
- Forjadas na **criação** e evoluem na campanha.
- Passivas são **roladas** na forja (você pode rerollar grátis na criação).

## Armaduras

| Tipo | Penalidade de Destreza | +Buffer de marcas |
|------|------------------------|-------------------|
| **Leve** | −1 DES | +1 |
| **Média** | −2 DES | +2 |
| **Pesada** | −3 DES | +3 |

### Raridade (sobe com seu nível)

| Nível | Raridade | +Marcas de vida |
|-------|----------|-----------------|
| 1–5 | Latente | +0 |
| 6–10 | Ressonante | +1 |
| 11–15 | Fendida | +2 |
| 16–20 | Atemporal | +3 |

## Passivas de armadura (4 slots)

| Slot | Tipo possível | Faixa |
|------|---------------|-------|
| 1 | +Atributo | +1 a +5 |
| 2 | +Marcas de vida | +1 a +5 |
| 3 | +Usos de Ruptura (Eco) | +1 a +5 |
| 4 | +Bônus de rolagem | +1 a +3 em um atributo |

## Passivas de arma (3 slots + skill)

| Slot | Tipo possível | Faixa |
|------|---------------|-------|
| 1 | +Atributo | +1 a +5 |
| 2 | +Usos de Ruptura (Eco) | +1 a +5 |
| 3 | +Bônus de rolagem | +1 a +3 |
| 4 | **Skill custom** da arma | única |

---

# Parte VI — Rolagens

## O dado

Quase tudo usa **d20**.

## Dificuldade (CD)

| Nome | CD |
|------|-----|
| Trivial | 5 |
| Fácil | 10 |
| **Médio (padrão)** | **15** |
| Difícil | 20 |
| Muito difícil | 25 |
| Extremo | 30 |

## Resultados

Compare **total = d20 + bônus** com a CD:

| Resultado | Quando acontece |
|-----------|-----------------|
| **Falha crítica** | Natural **1** |
| **Sucesso crítico** | Natural **20** e total ≥ CD |
| **Sucesso** | Total ≥ CD |
| **Sucesso parcial** | Total ≥ CD − **3** (quase passou — consegue com custo) |
| **Falha** | Qualquer outro caso |

---

# Parte VII — Descanso e sessão

| Ação | Marcas | Sobrecarga de Eco |
|------|--------|-------------------|
| **Descansar** (Void) | Zera todas | Zera **só na Sutura** |
| **Encerrar sessão** | Não muda | Zera **todas as classes** |

**Dica de jogador:** se não é Sutura e a sobrecarga está alta, peça **Purga do Eco** a um aliado ou espere o fim da sessão antes de spammar skills.

---

# Parte VIII — Crescer (progressão)

## Nível e XP

- **Nível máximo:** 20
- **XP para subir:** nível atual × **150** (ex.: nível 3 → 4 precisa de 450 XP)
- XP vem do mestre (sessões, destaques em combate, etc.)

## O que ganha ao subir

| Quando | Recompensa |
|--------|------------|
| Níveis **pares** (2, 4, 6…) | **+1 ponto físico** (pendente para gastar) |
| Níveis **2 a 15** | **+1 ponto de cena** (pendente) |
| Níveis **pares** + marco **15** | **+1 Eco** para investir em skills |

### Ecos acumulados por nível

| Nível | Ecos totais |
|-------|-------------|
| 1 | 1 |
| 2, 4, 6, 8, 10, 12, 14 | +1 cada (níveis pares) |
| 15 | +1 marco |
| **Total no 15** | **9** |

Com **9 Ecos** você pode deixar as **3 skills no nível 3** (build completo de skills).

## Orçamento de atributos (referência)

| Tipo | Na criação | Cresce com nível |
|------|------------|------------------|
| Físicos | 10 pontos | +1 a cada nível par |
| Cena | 6 pontos | +1 por nível (até 15) |

---

# Jogando uma sessão — fluxo prático

1. **Abra sua ficha** e confira vida, sobrecarga e cooldowns.
2. **Na cena:** descreva ações; role quando o mestre pedir.
3. **No combate:** use skills com critério; avance turno quando o grupo avançar.
4. **Entre cenas:** grupo **Descansa** se ferido; Sutura limpa Eco se precisar.
5. **Fim da noite:** mestre **encerra sessão** → Eco zera para todos.

### Onde olhar na ficha

| Área | O que ver |
|------|-----------|
| **Status** | Marcas, estados físico e mental |
| **Habilidades** | Skills, cooldowns, investir Eco |
| **Ecos** | Contador `usos/limite`, fase mental |
| **Grupo** | Descansar, Encerrar sessão |

---

# Referência rápida

## Classes em uma linha

| Classe | Uma frase | Passiva |
|--------|-----------|---------|
| Traçado | Atira e lê o campo | Mira narrativa |
| Baluarte | Segura a linha | Regen abaixo de 10 vida |
| Fratura | Bate forte ferido | Fúria Cega +2 FOR se vida ≤ 5 |
| Fenda | Distorce e controla | 8 usos seguros de Eco |
| Sutura | Cura e limpa Eco | Única que descansa Eco no Void |

## Fórmulas essenciais

```
Vida máxima     = 15 + buffer
Buffer           = VIT÷2 (base) + armadura + passivas
Limite Eco       = base classe + Ruptura + gear
Ruptura Total    = limite + 5
Rolagem          = d20 + atributo + classe + gear + skill
```

---

# Glossário

| Termo | Significado |
|-------|-------------|
| **Eco (ponto)** | Moeda para subir nível de skill |
| **Sobrecarga / usos de Eco** | Quanto você forçou o canal nesta sessão |
| **Void** | Descanso entre cenas |
| **Marca** | Unidade de dano (não é HP) |
| **Buffer** | Colchão antes de piorar de estado |
| **Recuo** | Penalidade no turno após usar uma skill |
| **CD** | Cooldown — turnos até reusar a skill |
| **Ruptura Total** | Colapso crítico por excesso de Eco |
| **Hangover** | Bônus some e o atributo cai no turno seguinte |

---

*Manual alinhado às mecânicas do Sistema Eco. Se algo na mesa divergir, o mestre tem a palavra final — avise para atualizarmos o documento.*
