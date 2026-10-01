import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { BarChart3, BookCheck, BookOpen, Flame, HeartHandshake, House, LogOut, NotebookPen, ShieldCheck, Trophy } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { useApp } from "@/lib/app-store";
import { Progress } from "./progress";

const items = [
  { to: "/", label: "Dashboard", short: "Home", icon: House },
  { to: "/reading", label: "Bible reading", short: "Read", icon: BookOpen },
  { to: "/history", label: "Reading history", short: "History", icon: BookCheck },
  { to: "/journal", label: "SOAP journal", short: "SOAP", icon: NotebookPen },
  { to: "/prayers", label: "Prayer requests", short: "Pray", icon: HeartHandshake },
  { to: "/scoreboard", label: "Scoreboard", short: "Board", icon: Trophy },
  { to: "/leader", label: "Leader dashboard", short: "Leader", icon: ShieldCheck },
] as const;

export function AppShell({ children, title, eyebrow }: { children: ReactNode; title: string; eyebrow?: string }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { readings, goal, streak, user, isLeader, signOut } = useApp();
  const navigate = useNavigate();
  useEffect(() => { if (!user) navigate({to:"/login", replace:true}); }, [user, navigate]);
  const nav = items.filter((i) => i.to !== "/leader" || isLeader);
  const mobile = isLeader ? [...items.slice(0, 4), items[5], items[6]] : [...items.slice(0, 4), items[5]];
  return <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
    <div className="ambient" aria-hidden="true" />
    <div className="relative mx-auto flex min-h-screen max-w-[1440px]">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-line/70 bg-panel p-5 backdrop-blur-xl md:flex">
        <Link to="/" className="mb-7 flex items-center gap-3 px-2">
          <span className="grid size-10 place-items-center rounded-xl bg-brand/15 font-display text-lg font-bold text-brand ring-1 ring-brand/30">h</span>
          <span><strong className="block font-display text-base">his_tribes</strong><span className="text-xs text-muted-foreground">youth collective</span></span>
        </Link>
        <nav className="flex flex-col gap-1" aria-label="Main navigation">
          {nav.map(({ to, label, icon: Icon }) => <Link key={to} to={to} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${pathname === to ? "bg-brand/15 text-foreground ring-1 ring-brand/25" : "text-muted-foreground hover:bg-panel-strong hover:text-foreground"}`}><Icon className="size-4" />{label}</Link>)}
        </nav>
        <div className="mt-auto rounded-2xl bg-panel p-4 ring-1 ring-line">
          <div className="flex items-center justify-between text-xs text-muted-foreground"><span>This month</span><span>{readings}/{goal}</span></div>
          <p className="mt-2 font-display text-2xl font-semibold">{Math.round((readings / goal) * 100)}%</p>
          <Progress value={(readings / goal) * 100} label="Monthly reading goal" />
        </div>
        <Link to="/login" onClick={(e)=>{e.preventDefault();signOut();navigate({to:"/login"});}} className="mt-4 flex items-center gap-2 px-3 text-xs text-muted-foreground hover:text-foreground"><LogOut className="size-4" /> Sign out</Link>
      </aside>
      <main className="min-w-0 flex-1 px-4 pb-[calc(8rem+1cm+env(safe-area-inset-bottom,0px))] pt-5 sm:px-8 md:pb-10">
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="min-w-0"><p className="truncate text-[11px] uppercase tracking-[0.15em] text-muted-foreground">{eyebrow ?? `Good morning, ${user?.name ?? "friend"}`}{isLeader && " ⭐"}</p><h1 className="truncate font-display text-xl font-semibold sm:text-2xl">{title}</h1></div>
          <div className="flex shrink-0 items-center gap-2 rounded-full bg-panel px-3 py-2 text-sm ring-1 ring-line"><Flame className="size-4 text-accent" /><span className="font-medium">{streak} days</span></div>
        </header>
        {children}
      </main>
    </div>
    <nav className="fixed inset-x-0 bottom-[calc(1cm+env(safe-area-inset-bottom,0px))] z-20 border-t border-line bg-background/90 backdrop-blur-xl md:hidden" aria-label="Mobile navigation">
      <div className={`mx-auto grid max-w-lg px-2 py-2 ${isLeader ? "grid-cols-6" : "grid-cols-5"}`}>
        {mobile.map(({ to, short, icon: Icon }) => <Link key={to} to={to} className={`flex min-w-0 flex-col items-center gap-1 py-1 text-[10px] ${pathname === to ? "text-brand" : "text-muted-foreground"}`}><Icon className="size-5" /><span className="truncate">{short}</span></Link>)}
      </div>
    </nav>
  </div>;
}

export function LeaderStar() { return <span className="ml-1 text-accent" aria-label="Leader" title="Leader">⭐</span>; }
export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) { return <section className={`rounded-2xl bg-panel p-5 ring-1 ring-line backdrop-blur-xl ${className}`}>{children}</section>; }
export function PageIntro({ title, text }: { title: string; text: string }) { return <div className="mt-7 max-w-2xl"><h2 className="font-display text-3xl font-semibold sm:text-4xl">{title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p></div>; }
export function EmptyIcon({ icon: Icon }: { icon: typeof BarChart3 }) { return <span className="grid size-10 place-items-center rounded-xl bg-brand/10 text-brand"><Icon className="size-5" /></span>; }
