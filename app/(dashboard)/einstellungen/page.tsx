import { User, Bell, Palette, ChevronRight, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getOffeneEinladungen } from "@/lib/queries/einladungen";
import { signOut } from "./actions";
import { FamilieBereich } from "./FamilieBereich";

export default async function EinstellungenSeite() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const einladungen = await getOffeneEinladungen();

  const sektionen = [
    {
      titel: "Konto",
      items: [{ icon: User, label: "Profil", sub: user?.email ?? "Nicht eingeloggt" }],
    },
    {
      titel: "App",
      items: [
        { icon: Bell, label: "Benachrichtigungen", sub: "Finanzfeed, Fälligkeiten" },
        { icon: Palette, label: "Darstellung", sub: "Hell (Standard)" },
      ],
    },
  ];

  return (
    <div className="max-w-[720px]">
      <div className="mb-7">
        <p className="text-[13px] text-muted mb-1">Einstellungen</p>
        <h1 className="text-[26px] tracking-tight font-display">Alles, wie ihr es wollt</h1>
      </div>

      {sektionen.map((s, i) => (
        <div key={s.titel}>
          <div className="mb-6">
            <p className="text-[12px] uppercase tracking-wide text-faint mb-2 px-1">{s.titel}</p>
            <div className="rounded-card bg-card border border-border overflow-hidden">
              {s.items.map((item) => (
                <button key={item.label} className="w-full flex items-center justify-between px-6 py-4 border-b border-[#F1EEE5] last:border-0 hover:bg-bg transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#F3F1EA] text-muted flex items-center justify-center">
                      <item.icon size={15} />
                    </div>
                    <div className="text-left">
                      <p className="text-[13.5px]">{item.label}</p>
                      <p className="text-[12px] text-faint">{item.sub}</p>
                    </div>
                  </div>
                  <ChevronRight size={15} className="text-[#D6D2C4]" />
                </button>
              ))}
            </div>
          </div>
          {i === 0 && <FamilieBereich einladungen={einladungen} />}
        </div>
      ))}

      <form action={signOut}>
        <button type="submit" className="flex items-center gap-2 text-[13px] text-warn font-medium px-1">
          <LogOut size={14} />
          Abmelden
        </button>
      </form>
    </div>
  );
}
