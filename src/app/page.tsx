import Link from "next/link";
import {
  Target,
  Trophy,
  Lightbulb,
  CalendarCheck,
  BookOpen,
  NotebookPen,
  ArrowRight,
  Sparkles,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Trophy,
    title: "Accomplishments Vault",
    description: "Build belief by logging past wins before setting new goals.",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/40",
  },
  {
    icon: Lightbulb,
    title: "Goal Brain Dump",
    description: "Capture every aspiration, then narrow to what matters most.",
    color: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-50 dark:bg-sky-950/40",
  },
  {
    icon: Target,
    title: "4 Priority Goals",
    description: "Focus your energy with WHY, identity, and action plans.",
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-50 dark:bg-rose-950/40",
  },
  {
    icon: CalendarCheck,
    title: "Weekly Review",
    description: "Reflect, adjust, and grow through disciplined check-ins.",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
  },
];

const modules = [
  {
    icon: NotebookPen,
    title: "Growth Journal",
    description: "Log insights, breakthroughs, and lessons learned.",
  },
  {
    icon: BookOpen,
    title: "Reading Tracker",
    description: "Connect books to goals and track reading progress.",
  },
  {
    icon: Zap,
    title: "Daily Quotes",
    description: "Start each day with wisdom from Jim Rohn's philosophy.",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-dvh">
      {/* Header */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 animate-fade-in">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <p className="text-base font-bold tracking-tight">The Architect</p>
        </div>
        <Link href="/login">
          <Button variant="ghost" size="sm">Sign in</Button>
        </Link>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Decorative gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-gradient-to-b from-amber-200/40 via-amber-100/20 to-transparent blur-3xl dark:from-amber-900/20 dark:via-amber-800/10" />
        </div>

        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:py-32">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-sm font-medium text-amber-800 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
              <Sparkles className="h-3.5 w-3.5" />
              Jim Rohn Goal System
            </div>
          </div>

          <h1 className="mt-6 max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl animate-fade-in-up delay-75">
            Attract success by the{" "}
            <span className="bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent dark:from-amber-400 dark:to-amber-300">
              person you become
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-muted leading-relaxed animate-fade-in-up delay-150">
            Build belief from your accomplishments, capture your vision, choose four priority goals,
            and grow through daily discipline and weekly reflection.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row animate-fade-in-up delay-200">
            <Link href="/register" className="w-full sm:w-auto">
              <Button size="lg" className="w-full group">
                Get Started — It&apos;s Free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="w-full">Sign In</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              A proven framework for transformation
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted">
              Follow the four-step onboarding system, then manage your growth daily.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, description, color, bg }, index) => (
              <div
                key={title}
                className="group rounded-xl border border-border bg-background p-6 transition-all duration-300 hover:shadow-[var(--shadow-md)] hover:border-primary/20"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${bg} ${color} transition-transform duration-300 group-hover:scale-110`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold text-foreground">{title}</h3>
                <p className="mt-2 text-sm text-muted leading-relaxed">{description}</p>
                <div className="mt-3 text-xs font-medium text-muted">
                  Step {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote Banner */}
      <section className="relative overflow-hidden border-t border-border bg-gradient-to-r from-amber-50 via-amber-25 to-orange-50 dark:from-amber-950/30 dark:via-background dark:to-orange-950/30">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-20">
          <div className="text-4xl text-amber-500 dark:text-amber-400">&ldquo;</div>
          <blockquote className="mt-2 text-xl font-medium text-foreground sm:text-2xl leading-relaxed">
            The major reason for setting a goal is for what it makes of you to accomplish it.
          </blockquote>
          <p className="mt-4 text-sm font-medium text-muted">— Jim Rohn</p>
        </div>
      </section>

      {/* Extra Modules */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Beyond the basics
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted">
              Additional tools to deepen your growth journey.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {modules.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="flex items-start gap-4 rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:shadow-[var(--shadow-md)]"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-surface text-accent-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{title}</h3>
                  <p className="mt-1 text-sm text-muted">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-20">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Ready to architect your future?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-muted">
            Join and start building the foundation for who you want to become.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/register">
              <Button size="lg" className="group">
                Start Free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Sparkles className="h-3 w-3" />
              </div>
              <span className="text-sm font-semibold">The Architect</span>
            </div>
            <p className="text-center text-xs text-muted">
              Inspired by Jim Rohn&apos;s philosophy of personal development.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
