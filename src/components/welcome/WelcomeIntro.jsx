import React from 'react'
import { FolderGit2, Heart, Mail, Sparkles } from 'lucide-react'
import Stepper, { Step } from '../react-bits/Stepper'
import { THEME_ACCENT } from '../../constants/theme'
import { CONTACT_MAILTO, GITHUB_REPO_URL } from '../../constants/welcomeIntro'
import { WelcomeResourceLink } from './WelcomeResourceLink'
import { WelcomeManualList } from './WelcomeManualList'

function StepCopy({ eyebrow, title, children }) {
  return (
    <div style={{ padding: '0.35rem 0 0.75rem', textAlign: 'left' }}>
      <div style={{
        fontSize: '0.58rem',
        fontFamily: 'monospace',
        letterSpacing: '0.12em',
        color: THEME_ACCENT,
        marginBottom: '0.45rem',
        fontWeight: 700,
      }}>
        {eyebrow}
      </div>
      <h2 style={{
        fontSize: '1.15rem',
        fontWeight: 700,
        color: '#f0f0f0',
        marginBottom: '0.55rem',
        letterSpacing: '-0.02em',
        lineHeight: 1.25,
      }}>
        {title}
      </h2>
      <div style={{
        fontSize: '0.82rem',
        color: '#9a9a9a',
        lineHeight: 1.55,
      }}>
        {children}
      </div>
    </div>
  )
}

export function WelcomeIntro({ onComplete, pdfLoadingId = null, onDownloadPdf }) {
  const [step, setStep] = React.useState(1)

  return (
    <div>
      <Stepper
        step={step}
        onStepChange={setStep}
        onFinalStepCompleted={onComplete}
        hideDefaultNav={false}
        nextButtonText="Continuar"
        backButtonText="Voltar"
        stepCircleContainerClassName="welcome-stepper-flat"
        style={{ width: '100%' }}
      >
        <Step>
          <StepCopy eyebrow="01 · BOAS-VINDAS" title="Bem-vindo ao ECOS">
            <p style={{ margin: '0 0 0.65rem' }}>
              Este é o sistema de mesa do RPG ECOS — feito para organizar tudo o que
              acontece na campanha sem perder o ritmo da narrativa.
            </p>
            <p style={{ margin: '0 0 0.65rem' }}>
              Aqui você gerencia fichas de personagens e NPCs, bosses, grupos e
              organizações; roda combate com marcas de dano e estados do corpo;
              acompanha Eco, sobrecarga mental e Ruptura; mantém catálogo de skills;
              e salva ou transporta campanhas inteiras entre computadores.
            </p>
            <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem' }}>
              <Sparkles size={14} style={{ color: '#a855f7', flexShrink: 0 }} />
              A mesa decide o drama — o app cuida dos números.
            </p>
          </StepCopy>
        </Step>

        <Step>
          <StepCopy eyebrow="02 · ORIGEM" title="Feito para amigos, aberto a ideias">
            <p style={{ margin: '0 0 0.65rem' }}>
              O ECOS nasceu para um grupo de amigos jogar junto. O sistema evolui na
              mesa real — e continua evoluindo com quem quiser participar.
            </p>
            <p style={{ margin: '0 0 0.85rem' }}>
              Encontrou um bug, tem sugestão de regra ou quer contribuir com código?
              Fale com a gente por e-mail ou abra uma issue no repositório.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
              <WelcomeResourceLink href={CONTACT_MAILTO} icon={Mail}>
                Enviar e-mail
              </WelcomeResourceLink>
              <WelcomeResourceLink href={GITHUB_REPO_URL} icon={FolderGit2}>
                Repositório no GitHub
              </WelcomeResourceLink>
            </div>
            <p style={{
              margin: '0.75rem 0 0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.72rem',
              color: '#6b6b6b',
            }}>
              <Heart size={13} style={{ color: '#f472b6', flexShrink: 0 }} />
              Toda contribuição ajuda a mesa a ficar mais redonda.
            </p>
          </StepCopy>
        </Step>

        <Step>
          <StepCopy eyebrow="03 · MANUAIS" title="Baixe os PDFs">
            <p style={{ margin: '0 0 0.85rem' }}>
              Manuais para a mesa. Eles também ficam disponíveis em Conteúdos
              na tela inicial.
            </p>
            <WelcomeManualList
              loadingId={pdfLoadingId}
              onDownload={onDownloadPdf}
            />
          </StepCopy>
        </Step>
      </Stepper>
    </div>
  )
}
