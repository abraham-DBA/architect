import Link from "next/link";
import { Target, Trophy, Lightbulb, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Trophy,
    title: "Accomplishments Vault",
    description: "Build belief by logging past wins before setting new goals.",
  },
  {
    icon: Lightbulb,
    title: "Goal Brain Dump",
    description: "Capture every aspiration, then narrow to what matters most.",
  },
  {
    icon: Target,
    title: "4 Priority Goals",
    description: "Focus your energy with WHY, identity, and action plans.",
  },
  {
    icon: CalendarCheck,
    title: "Weekly Review",
    description: "Reflect, adjust, and grow through disciplined check-ins.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-dvh">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <p className="text-base font-semibold">The Architect</p>
        <Link href="/login">
          <Button variant="ghost" size="sm">Sign in</Button>
        </Link>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-20">
        <p className="text-sm font-medium uppercase tracking-wider text-accent-foreground">
          Jim Rohn Goal System
        </p>
        <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight sm:text-5xl">
          Attract success by the person you become
        </h1>
        <p className="mt-4 max-w-2xl text-base text-muted sm:text-lg">
          Build belief, capture your vision, choose four priority goals, and grow
          through daily discipline and weekly reflection.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/register" className="w-full sm:w-auto">
            <Button size="lg" className="w-full">Get Started — It&apos;s Free</Button>
          </Link>
          <Link href="/login" className="w-full sm:w-auto">
            <Button variant="secondary" size="lg" className="w-full">Sign In</Button>
          </Link>
        </div>
      </section>

      <section className="border-t border-border bg-card">
        <div className="mx-auto grid max-w-5xl gap-6 px-4 py-12 sm:grid-cols-2 sm:px-6 sm:py-16 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, description }) => (
            <div key={title} className="rounded-xl border border-border p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-surface text-accent-foreground">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-4 font-semibold">{title}</h2>
              <p className="mt-1 text-sm text-muted">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="mx-auto max-w-5xl px-4 py-8 text-center text-sm text-muted sm:px-6">
        The major reason for setting a goal is for what it makes of you to accomplish it.
      </footer>
    </main>
  );
}
