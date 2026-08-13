import { getFixkosten } from "@/lib/queries/fixkosten";
import { getEinnahmen } from "@/lib/queries/einnahmen";
import { getKonten, getVermoegensVerlauf } from "@/lib/queries/vermoegen";
import { getFinanzfeed } from "@/lib/queries/finanzfeed";
import { getKredite } from "@/lib/queries/kredite";
import { getVersicherungen } from "@/lib/queries/versicherungen";
import { getZiele } from "@/lib/queries/ziele";
import { getEinmaligeAusgabenImMonat } from "@/lib/queries/einmalige-ausgaben";
import { monatswert } from "@/types/finanzcockpit";
import { CashflowChart } from "./CashflowChart";
import { NeueAusgabeDialog } from "./einmalige-ausgaben/NeueAusgabeDialog";
import {
  TrendingUp, PiggyBank, Wallet, Landmark, Bell, ChevronRight,
  CalendarClock, Sparkles, Baby, Target, ReceiptText, AlertTriangle,
} from "lucide-react";

const fmt = (n: number) => n.toLocaleString("de-DE", { maximumFractionDigits: 0 }) + " €";
const fmt2 = (n: number) => n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";

export default async function DashboardSeite() {
  const heute = new Date();
  const jahr = heute.getFullYear();
  const monat = heute.getMonth() + 1;

  const [fixkosten, einnahmen, konten, verlauf, feed, kredite, versicherungen, ziele, einmaligeAusgaben] = await Promise.all([
    getFixkosten(), getEinnahmen(), getKonten(), getVermoegensVerlauf(), getFinanzfeed(), getKredite(), getVersicherungen(), getZiele(), getEinmaligeAusgabenImMonat(jahr, monat),
  ]);

  const monatlicheEinnahmen = einnahmen.filter((e) => e.art === "regelmaessig" && e.betrag != null && !e.notiz?.toUpperCase().startsWith("INTERNE")).reduce((s, e) => s + (e.betrag ?? 0), 0);
  const sparPositionen = fixkosten.filter((f) => f.kategorie.toLowerCase().includes("sparen") || f.name.toLowerCase().includes("rücklage"));
  const normaleFixkosten = fixkosten.filter((f) => !sparPositionen.some((s) => s.id === f.id));
  const monatlichesSparen = sparPositionen.reduce((s, f) => s + monatswert(f.betrag, f.rhythmus), 0);
  const monatlicheFixkosten = normaleFixkosten.reduce((s, f) => s + monatswert(f.betrag, f.rhythmus), 0);
  const monatlicheKreditraten = kredite.filter((k) => k.status === "aktiv" && k.rate != null).reduce((s, k) => s + (k.rate ?? 0), 0);
  const monatlicheVersicherungen = versicherungen.filter((v) => v.status !== "gekuendigt").reduce((s, v) => s + monatswert(v.beitrag, v.rhythmus), 0);
  const laufendeKostenOhneSparen = monatlicheFixkosten + monatlicheKreditraten + monatlicheVersicherungen;
  const einmaligImMonat = einmaligeAusgaben.reduce((s, a) => s + a.betrag, 0);
  const girokontoMinus = konten.filter((k) => k.typ === "girokonto" && !k.ist_kinderkonto && k.aktueller_stand < 0).reduce((s, k) => s + Math.abs(k.aktueller_stand), 0);
  const monatlicheKostenGesamt = laufendeKostenOhneSparen + monatlichesSparen + einmaligImMonat + girokontoMinus;
  const freiVerfuegbar = monatlicheEinnahmen - monatlicheKostenGesamt;
  const nettovermoegen = konten.reduce((s, k) => s + k.aktueller_stand, 0);

  return <div><h1>Dashboard</h1><p>{fmt(freiVerfuegbar)}</p><p>{fmt2(nettovermoegen)}</p></div>;
}
