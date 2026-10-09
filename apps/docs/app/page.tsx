import { localeCodes } from '@kvirn-ui/i18n'
import { Contact } from '../components/home/contact.tsx'
import { Evidence } from '../components/home/evidence.tsx'
import { Hero } from '../components/home/hero.tsx'
import { Moments } from '../components/home/moments.tsx'
import { Start } from '../components/home/start.tsx'
import { Edges, Why } from '../components/home/statements.tsx'
import { componentGroups } from '../components/site-sections.ts'
import { countCoreDependencies } from '../lib/home-facts.ts'
import './home.css'

export default function HomePage() {
  const componentCount = componentGroups.reduce((total, group) => total + group.pages.length, 0)

  return (
    <>
      <Hero />
      <Moments />
      <Edges />
      <Why />
      <Evidence
        componentCount={componentCount}
        localeCount={localeCodes.length}
        dependencyCount={countCoreDependencies()}
      />
      <Start />
      <Contact />
    </>
  )
}
