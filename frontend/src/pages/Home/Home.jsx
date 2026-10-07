import { Link } from "react-router-dom";
import { Card } from "../..//components/ui/SharedComponents.jsx";
import { Code2, ShieldCheck, Zap } from "../../components/ui/Icons.jsx";

function Home() {
  return (
    <div className="arena-home-background relative isolate -mx-4 -mt-8 overflow-hidden sm:-mx-6 lg:-mx-8">
      <div aria-hidden="true" className="arena-home-grid pointer-events-none absolute inset-0" />
      <div
        aria-hidden="true"
        className="arena-home-rings pointer-events-none absolute left-1/2 top-[-26rem] h-[70rem] w-[70rem] -translate-x-1/2 opacity-70"
      />
      <section className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-6xl flex-col justify-center px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="relative z-10 max-w-4xl">
          <p className="font-display text-sm uppercase tracking-[0.3em] text-accent-primary">&gt; enter_the_arena()</p>
          <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-text-primary sm:text-6xl">
            Enter the arena.
            <br />
            Solve the challenge.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-text-secondary sm:text-xl">
            Solve real problems, run them in an isolated sandbox, and get judged in milliseconds.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              to="/problems"
              className="inline-flex items-center justify-center rounded-full bg-accent-primary px-6 py-3 font-medium text-white transition hover:bg-accent-primary-hover"
            >
              Start Solving
            </Link>
            <Link
              to="/problems"
              className="inline-flex items-center justify-center rounded-full border border-border-subtle/80 px-6 py-3 font-medium text-text-primary transition hover:border-accent-primary hover:text-accent-primary"
            >
              Explore Problems
            </Link>
          </div>

          <div className="mt-8 inline-flex flex-wrap items-center gap-3 rounded-xl border border-accent-primary/25 bg-[#111820]/90 px-4 py-3 shadow-lg shadow-black/20">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-verdict-accepted/50" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-verdict-accepted" />
            </span>
            <span className="font-display text-xs font-semibold uppercase tracking-[0.16em] text-text-primary sm:text-sm">
              Ready when you are
            </span>
            <span className="hidden h-5 w-px bg-border-subtle sm:block" />
            <span className="rounded-md border border-accent-primary/20 bg-accent-primary/10 px-2 py-1 font-display text-[10px] font-semibold uppercase tracking-[0.16em] text-accent-primary">
              Code Arena
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: ShieldCheck,
              title: "Docker Sandboxed Execution",
              description:
                "Every submission runs in an isolated container for consistent, secure execution.",
              accent: "emerald",
            },
            {
              icon: Code2,
              title: "Multi-Language Support",
              description:
                "Write solutions in C, C++, Java, or Python without changing your workflow.",
              accent: "violet",
            },
            {
              icon: Zap,
              title: "Real-Time Judging",
              description:
                "Get fast verdicts and feedback so you can iterate with less waiting.",
              accent: "amber",
            },
          ].map(({ icon: Icon, title: cardTitle, description, accent }) => (
            <Card
              key={cardTitle}
              className={`group relative overflow-hidden border-white/10 bg-[#111820]/85 p-6 transition duration-200 hover:-translate-y-1 hover:bg-[#111820] ${
                accent === "emerald"
                  ? "hover:border-emerald-400/40"
                  : accent === "violet"
                    ? "hover:border-violet-400/40"
                    : "hover:border-amber-400/40"
              }`}
            >
              <div
                className={`absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent to-transparent opacity-50 transition group-hover:opacity-100 ${
                  accent === "emerald"
                    ? "via-emerald-400/70"
                    : accent === "violet"
                      ? "via-violet-400/70"
                      : "via-amber-400/70"
                }`}
              />
              <div className="flex items-center justify-between">
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-xl transition ${
                    accent === "emerald"
                      ? "border border-emerald-400/25 bg-emerald-400/10 text-emerald-300 group-hover:border-emerald-400/50 group-hover:bg-emerald-400/15"
                      : accent === "violet"
                        ? "border border-violet-400/25 bg-violet-400/10 text-violet-300 group-hover:border-violet-400/50 group-hover:bg-violet-400/15"
                        : "border border-amber-400/25 bg-amber-400/10 text-amber-300 group-hover:border-amber-400/50 group-hover:bg-amber-400/15"
                  }`}
                >
                  <Icon size={20} strokeWidth={1.8} />
                </span>
              </div>
              <h2
                className={`mt-6 font-display text-base font-semibold text-text-primary transition ${
                  accent === "emerald"
                    ? "group-hover:text-emerald-300"
                    : accent === "violet"
                      ? "group-hover:text-violet-300"
                      : "group-hover:text-amber-300"
                }`}
              >
                {cardTitle}
              </h2>
              <p className="mt-3 text-sm leading-6 text-text-secondary">
                {description}
              </p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
