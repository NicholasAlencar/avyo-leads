import type { LucideIcon } from "lucide-react";
import { Building2, CalendarClock, Gauge, LayoutDashboard, Settings2, Target } from "@/components/ui/icons";

export interface NavigationItem {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

export const primaryNavigation: NavigationItem[] = [
  { href: "/dashboard", label: "Visão geral", description: "Painel comercial", icon: LayoutDashboard },
  { href: "/leads", label: "Leads", description: "Empresas e contatos", icon: Building2 },
  { href: "/encontrar", label: "Encontrar empresas", description: "Descoberta de leads", icon: Target },
  { href: "/pipeline", label: "Pipeline", description: "Negócios por etapa", icon: Gauge },
  { href: "/follow-ups", label: "Follow-ups", description: "Próximas ações", icon: CalendarClock },
];

export const systemNavigation: NavigationItem[] = [
  { href: "/configuracoes/integracoes", label: "Integrações", description: "Provedores e APIs", icon: Settings2 },
];
