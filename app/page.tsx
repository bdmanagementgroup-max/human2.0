import { Nav } from "./components/Nav";
import { Marquee } from "./components/Marquee";
import { Hero } from "./components/Hero";
import { Benefits } from "./components/Benefits";
import { Topics } from "./components/Topics";
import { Manifesto } from "./components/Manifesto";
import { Stats } from "./components/Stats";
import { FAQ } from "./components/FAQ";
import { FinalCTA } from "./components/FinalCTA";
import { Footer } from "./components/Footer";
import { ScrollReveal } from "./components/ScrollReveal";
import { EmailCapture } from "./components/EmailCapture";

export default function Page() {
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <Nav />

      <div className="pt-24">
        <Marquee />
      </div>

      <ScrollReveal direction="up" duration={700}>
        <Hero />
      </ScrollReveal>

      <ScrollReveal direction="up" duration={600} delay={100}>
        <Benefits />
      </ScrollReveal>

      <ScrollReveal direction="up" duration={600} delay={100}>
        <Topics />
      </ScrollReveal>

      <ScrollReveal direction="up" duration={700}>
        <Manifesto />
      </ScrollReveal>

      <ScrollReveal direction="up" duration={600}>
        <Stats />
      </ScrollReveal>

      <ScrollReveal direction="up" duration={600} delay={100}>
        <FAQ />
      </ScrollReveal>

      <ScrollReveal direction="up" duration={700}>
        <FinalCTA />
      </ScrollReveal>

      <ScrollReveal direction="up" duration={700}>
        <EmailCapture />
      </ScrollReveal>

      <Footer />
    </main>
  );
}