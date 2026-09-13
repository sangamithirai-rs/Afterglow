import { Navbar } from '../components/layout/Navbar'
import { Hero } from '../components/landing/Hero'
import { HowItWorks } from '../components/landing/HowItWorks'
import { Features } from '../components/landing/Features'
import { ExperiencePreview } from '../components/landing/ExperiencePreview'
import { FinalCTA } from '../components/landing/FinalCTA'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <Hero />
      <HowItWorks />
      <Features />
      <ExperiencePreview />
      <FinalCTA />
    </div>
  )
}