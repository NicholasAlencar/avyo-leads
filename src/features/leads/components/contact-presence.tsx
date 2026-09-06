import type { ReactNode } from "react";
import { BriefcaseBusiness, Camera, Globe2, Mail, Phone } from "@/components/ui/icons";

function Presence({ active, label, children }: { active: boolean; label: string; children: ReactNode }) {
  return <span aria-label={`${label} ${active ? "disponível" : "não disponível"}`} className={`grid size-7 place-items-center rounded-lg border ${active ? "border-blue-100 bg-blue-50 text-blue-600" : "border-slate-100 bg-slate-50 text-slate-300"}`}>{children}</span>;
}

export function ContactPresence({ phone, email, website, instagram, linkedin }: { phone: string | null; email: string | null; website: string | null; instagram: string | null; linkedin: string | null }) {
  return <div className="flex items-center gap-1"><Presence active={Boolean(phone)} label="Telefone"><Phone className="size-3.5" /></Presence><Presence active={Boolean(email)} label="E-mail"><Mail className="size-3.5" /></Presence><Presence active={Boolean(website)} label="Site"><Globe2 className="size-3.5" /></Presence><Presence active={Boolean(instagram)} label="Instagram"><Camera className="size-3.5" /></Presence><Presence active={Boolean(linkedin)} label="LinkedIn"><BriefcaseBusiness className="size-3.5" /></Presence></div>;
}
