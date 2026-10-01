import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, clearAuth, getToken, type Prayer, type Role, type ScoreRow, type SoapEntry, type User } from "./api";

export { type Role, type User, type Prayer, type SoapEntry } from "./api";
export const LEADER_NAMES = ["Jordan Lee", "Naomi Patel", "Micah Brooks"];

const AppContext = createContext<ReturnType<typeof useAppState> | null>(null);

function useAppState() {
  const [user, setUser] = useState<User | null>(() => { try { const raw=localStorage.getItem("his_tribes_user"); return raw ? JSON.parse(raw) : null; } catch { return null; } });
  const [completed, setCompleted] = useState(false);
  const [goal, setGoal] = useState(21);
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [soapEntries, setSoapEntries] = useState<SoapEntry[]>([]);
  const [rows, setRows] = useState<ScoreRow[]>([]);
  const [leaderSoapEntries, setLeaderSoapEntries] = useState<SoapEntry[]>([]);
  const [readings, setReadings] = useState(0);
  const [readingDates, setReadingDates] = useState<string[]>([]);
  const [streak, setStreak] = useState(0);
  const [community, setCommunity] = useState(0);

  const refresh = async (nextUser?: User | null) => {
    const active = nextUser ?? user;
    if (!active || !getToken()) return;
    const [stats, prayerData, soapData, board, history] = await Promise.all([api.readingStats(), api.prayers(), api.soap(), api.scoreboard(), api.readingHistory()]);
    setCompleted(stats.completed); setReadings(stats.readings); setStreak(stats.streak); setGoal(stats.goal); setReadingDates(history.dates); setPrayers(prayerData); setSoapEntries(soapData); setRows(board);
    if (active.role === "leader") { try { setLeaderSoapEntries(await api.leaderSoap()); } catch { setLeaderSoapEntries([]); } }
    const activeMembers = board.filter(r => r.days > 0).length;
    setCommunity(board.length ? Math.round((activeMembers / board.length) * 100) : 0);
  };

  useEffect(() => { if (user && getToken()) refresh().catch(() => { clearAuth(); setUser(null); }); }, []);

  const signIn = async (email:string, password:string) => {
    const result = await api.login({email,password});
    localStorage.setItem("his_tribes_token", result.token); localStorage.setItem("his_tribes_user", JSON.stringify(result.user)); setUser(result.user); await refresh(result.user);
    return result.user;
  };
  const signUp = async (name:string,email:string,password:string) => {
    const result = await api.signup({name,email,password});
    localStorage.setItem("his_tribes_token", result.token); localStorage.setItem("his_tribes_user", JSON.stringify(result.user)); setUser(result.user); await refresh(result.user);
    return result.user;
  };
  const signOut = () => { clearAuth(); setUser(null); setRows([]); setPrayers([]); setSoapEntries([]); };
  const markComplete = async () => { const s=await api.completeReading(); setCompleted(s.completed); setReadings(s.readings); setStreak(s.streak); setGoal(s.goal); const [board,history]=await Promise.all([api.scoreboard(),api.readingHistory()]); setRows(board); setReadingDates(history.dates); };
  const addPrayer = async (text:string, anonymous:boolean) => { const p=await api.addPrayer({text,anonymous}); setPrayers(items=>[p,...items]); };
  const pray = async (id:number) => { const r=await api.pray(id); setPrayers(items=>items.map(p=>p.id===id?{...p,count:r.count}:p)); };
  const togglePrayerStatus = async (id:number) => { const r=await api.togglePrayerStatus(id); setPrayers(items=>items.map(p=>p.id===id?{...p,status:r.status as Prayer["status"]}:p)); };
  const addSoap = async (entry: Omit<SoapEntry,"id"|"date"|"author"|"leader">) => { const saved=await api.addSoap(entry); setSoapEntries(items=>[saved,...items]); };
  const saveGoal = async (title:string,target:number,deadline:string) => { await api.updateGoal({title,target_days:target,deadline}); setGoal(target); };

  return { user, isLeader:user?.role === "leader", signIn, signUp, signOut, completed, goal, setGoal, saveGoal, prayers, soapEntries, leaderSoapEntries, rows, readings, readingDates, streak, community, markComplete, addPrayer, pray, togglePrayerStatus, addSoap, refresh };
}

export function AppProvider({ children }: { children: ReactNode }) { const state=useAppState(); const value=useMemo(()=>state,[state.user,state.completed,state.goal,state.prayers,state.soapEntries,state.leaderSoapEntries,state.rows,state.readings,state.readingDates,state.streak,state.community]); return <AppContext.Provider value={value}>{children}</AppContext.Provider>; }
export function useApp() { const context=useContext(AppContext); if(!context) throw new Error("useApp must be used inside AppProvider"); return context; }
