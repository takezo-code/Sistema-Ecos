# Manual do Jogador — Sistema Eco

Guia alinhado ao que o app faz hoje. Serve para criar personagem, jogar a ficha e entender vida, Eco e descanso.

---

## 1. O que é o Eco

O **Eco** é o canal de poder das skills de classe. Cada uso **ativo** gasta usos seguros e sobe a **sobrecarga**.

- **Ruptura** (atributo): alarga o canal — **+1 uso seguro por ponto**.
- **Void**: descanso do grupo. Só a **Sutura** limpa usos de Eco no Void. As outras classes só zeram Eco ao **encerrar a sessão**.

---

## 2. Criar personagem

Na tela **Personagens**, o assistente tem 4 passos. Tudo abaixo é obrigatório para salvar.

1. **Nome** (foto opcional)
2. **Classe** (uma das cinco)
3. **Atributos** — gastar **todos** os pontos
4. **Skill inicial** + **nome da arma** e **nome da armadura**

### Pontos iniciais

| Tipo | Pontos | Máximo por atributo (criação) |
|------|--------|-------------------------------|
| Físicos | **10** | 4 |
| De cena | **6** | 4 |

No nível 1 você recebe **1 Eco** e precisa investir em **uma** skill da classe.

Arma e armadura iniciais acompanham a campanha: o sistema exige **nome** em ambas (tipo e passivas são opcionais).

---

## 3. Atributos

### Físicos (máximo 10)

Força · Destreza · Inteligência · Vitalidade · Ruptura

### De cena (máximo 9)

Carisma · Percepção · Vontade · Sabedoria

### Atributos-chave da classe

Cada classe tem **2 atributos-chave** (1 físico + 1 de cena). Nos pontos **base**:

| Pontos no atributo | Bônus na rolagem |
|--------------------|------------------|
| 3 | +1 |
| 6 | +2 |
| 9 | +3 |

Equipamento soma à parte na rolagem e **não** sobe o degrau de classe. Estado ferido reduz valor efetivo, mas **não** remove o bônus de classe já conquistado.

---

## 4. Classes e passivas

| Classe | Atributos-chave | Passiva |
|--------|-----------------|---------|
| **Traçado** | Destreza + Carisma | **Olho do Traçado** — narrativa (mira e percepção) |
| **Baluarte** | Vitalidade + Vontade | **Muralha Inquebrável** — abaixo de **10** de vida, regenera **1** por turno (para no teto 10) |
| **Fratura** | Força + Vontade | **Fúria da Queda** — com vida restante **≤ 5**, **Fúria Cega** ganha **+2 Força** extra (1 turno) |
| **Fenda** | Ruptura + Sabedoria | **Canal Amplo** — base de usos seguros de Eco = **8** (em vez de 5) |
| **Sutura** | Inteligência + Sabedoria | **Descanso no Void** — única que zera Eco no descanso do Void |

### Skills ativas por classe (3 cada)

- **Traçado:** Pulso Certeiro · Olhar Longínquo · Snipe de Ruptura  
- **Baluarte:** Couraça Fechada · Manto Sagrado · Bramido  
- **Fratura:** Fúria Cega · Pisada Sísmica · Talho Cego  
- **Fenda:** Dobra Falsa · Cárcere Mental · Canal Ampliado  
- **Sutura:** Mente Elevada · Costura Viva · Purga do Eco  

---

## 5. Vida e marcas

Não há HP clássico: você acumula **marcas de dano**.

**Vida restante** = máximo − marcas.

| Tipo de marca | Valor |
|---------------|-------|
| Leve | 1 |
| Médio | 2 |
| Grave | 3 |

### Estados físicos (a cada ~4 marcas, sem buffer)

| Marcas (efetivas) | Estado | Penalidade (FOR / DES / VIT) |
|-------------------|--------|------------------------------|
| 0–4 | Saudável | −0 |
| 5–9 | Ferido | −1 |
| 10–14 | Grave | −2 |
| 15+ | Incapacitado | −3 |

**Buffer de limiar:** `floor(Vitalidade base ÷ 2)` + armadura (leve +1 / média +2 / pesada +3) + buffs. Isso atrasa a entrada nos estados.

**Pool máximo** do jogador: 15 + buffer (ex.: VIT 6 → buffer +3 → máximo 18).

---

## 6. Sobrecarga de Eco

**Limite seguro** = base da classe + Ruptura + passivas de equipamento (`ruptura_uses`).

- Base: **5** (maioria) ou **8** (**Fenda**)
- +1 por ponto de Ruptura
- Arma/armadura podem somar usos extras

Usar skill **ativa** adiciona o custo de sobrecarga (em geral 1–2). Passivas **não** sobem o contador.

### Dentro do limite

Estado mental **Estável** — sem penalidade de atributos mentais/sociais.

### Acima do limite

Penalidade flat em **INT, PER, SAB, CAR** (Ruptura **não** é penalizada):

| Excessos | Estado | Penalidade |
|----------|--------|------------|
| 1 | Abalado | −1 |
| 2 | Fragmentado | −2 |
| 3–4 | Dissociado | −3 |
| 5+ | Perdido no Tempo | −4 + **Ruptura Total** (evento narrativo crítico) |

Ruptura Total dispara em `limite + 5` (ex.: limite 5 → em 10 usos).

---

## 7. Skills e progressão

- **3 skills** por classe
- **1 Eco = +1 nível** na skill escolhida
- Teto atual de nível de skill: **3**
- Orçamento total de Eco até o nível 15 do personagem: **9**

### Eco por nível de personagem

- Nível 1: 1 Eco  
- +1 nos níveis pares 2–14  
- +1 no nível 15  
- Congela em **9**

Níveis pares também dão **+1 ponto de atributo físico**. Dos níveis 2–15: **+1 ponto de cena** por nível.

### Usar skill

Ativa sobe sobrecarga, aplica cooldown, buffs/cura/recuos conforme a ficha. Cooldowns típicos: 2–3 turnos. **Avançar turno** reduz cooldowns, processa buffs e a regen do Baluarte.

---

## 8. Descansar e encerrar sessão

No **grupo**:

| Ação | Marcas de dano | Usos de Eco |
|------|----------------|-------------|
| **Descansar** | Limpa de todos | Zera **só na Sutura** (Void) |
| **Encerrar sessão** | Não limpa | Zera Eco de **todas** as classes |

Na ficha, o botão de descanso de Eco no Void só aparece para a **Sutura**.

---

## 9. Rolagens (básico)

Dado padrão: **d20**.

**Total** = dado + atributo efetivo + bônus de classe + equipamento + buffs.

Contra **CD** (padrão 15):

| Resultado | Quando |
|-----------|--------|
| Falha crítica | Natural **1** |
| Sucesso crítico | Natural **20** e total ≥ CD |
| Sucesso | Total ≥ CD |
| Sucesso parcial | Total ≥ CD − 3 |
| Falha | Resto |

---

## 10. Onde encontrar tudo no app

| Área | Uso |
|------|-----|
| **Criação / Personagens** | Wizard e lista de fichas |
| **Ficha (Em jogo)** | Personagem, inventário, status, habilidades, Eco, histórico, configs |
| **Grupos** | Descansar, Encerrar sessão, XP do grupo |
| **Combate** | Marcas, skills, turnos, CD |
| **Config** | Dados (rolagem avulsa), Lixeira, salvar/importar campanha |

---

## Dicas rápidas

1. Na criação, gaste **todos** os pontos e nomeie arma e armadura.  
2. A **Fenda** aguenta mais usos seguros; a **Sutura** é quem limpa Eco entre cenas no Void.  
3. Se a sobrecarga disparar, atrase skills ativas ou espere o **fim da sessão**.  
4. Baluarte abaixo de 10 de vida: avance o turno para regenerar.  
5. Fratura perto da morte (≤ 5 vida): **Fúria Cega** fica mais forte.

---

*Documento vivo — atualize quando as mecânicas do código mudarem.*
