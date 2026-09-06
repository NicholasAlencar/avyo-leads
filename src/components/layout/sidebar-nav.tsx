import Link from "next/link";
import type { NavigationItem } from "./navigation";
import { primaryNavigation, systemNavigation } from "./navigation";

function isActivePath(currentPath: string, href: string) {
  return currentPath === href || (href !== "/dashboard" && currentPath.startsWith(`${href}/`));
}

function NavigationGroup({ currentPath, items, label }: { currentPath: string; items: NavigationItem[]; label: string }) {
  return (
    <div>
      <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[.18em] text-slate-600">{label}</p>
      <div className="space-y-1">
        {items.map((item) => {
          const active = isActivePath(currentPath, item.href);
          const Icon = item.icon;
          return (
            <Link
              aria-current={active ? "page" : undefined}
              className={`group relative flex min-h-11 items-center gap-3 rounded-xl px-3 text-[13px] font-medium transition ${active ? "bg-blue-500/13 text-white shadow-[inset_0_0_0_1px_rgba(71,125,255,.16)]" : "text-slate-400 hover:bg-white/[.055] hover:text-slate-100"}`}
              href={item.href}
              key={item.href}
              title={item.description}
            >
              {active ? <span className="absolute -left-2 h-5 w-0.5 rounded-full bg-blue-400" /> : null}
              <Icon aria-hidden="true" className={`size-[18px] ${active ? "text-blue-400" : "text-slate-500 transition group-hover:text-slate-300"}`} strokeWidth={1.8} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function SidebarNav({ currentPath }: { currentPath: string }) {
  return (
    <nav aria-label="Navegação principal" className="space-y-7">
      <NavigationGroup currentPath={currentPath} items={primaryNavigation} label="Workspace" />
      <NavigationGroup currentPath={currentPath} items={systemNavigation} label="Sistema" />
    </nav>
  );
}
