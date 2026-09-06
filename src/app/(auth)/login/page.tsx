import { LoginForm } from "./login-form";
import { loginAction } from "@/features/auth/actions";
import { brand } from "@/lib/brand";
import { getPublicEnv } from "@/lib/env/public";
import { AvyoLogo } from "@/components/ui/avyo-logo";
import Image from "next/image";

function hasValidSupabaseConfiguration(): boolean {
  try {
    const env = getPublicEnv();
    return Boolean(env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
  } catch {
    return false;
  }
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ reason?: string }> }) {
  const { reason } = await searchParams;
  return (
    <main className="grid min-h-screen bg-[#f5f7fb] lg:grid-cols-[1.08fr_0.92fr]">
      <section className="avyo-grid relative hidden overflow-hidden bg-[var(--avyo-midnight)] p-14 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -left-32 -top-32 size-[500px] rounded-full bg-blue-600/25 blur-[100px]" /><div className="absolute -bottom-48 right-0 size-[520px] rounded-full bg-cyan-400/15 blur-[120px]" />
        <AvyoLogo className="relative z-10" variant="light" />
        <div className="max-w-xl">
          <p className="text-xs font-bold uppercase tracking-[0.26em] text-cyan-300">
            Sales intelligence platform
          </p>
          <h1 className="mt-6 text-6xl font-semibold tracking-[-0.055em]">Encontre sinais.<br/><span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">Converta melhor.</span></h1>
          <p className="mt-7 max-w-lg text-lg leading-8 text-slate-300">
            Encontre contexto, sinais de oportunidade e o próximo passo comercial em uma única central.
          </p>
        </div>
        <div className="relative z-10 h-36 overflow-hidden rounded-3xl border border-white/10 bg-white/5"><Image alt="Identidade visual AVYO" className="object-cover opacity-55 mix-blend-screen" fill priority sizes="55vw" src="/brand/avyo-brand-board.png" /></div>
      </section>

      <section className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md rounded-[28px] border border-white bg-white p-8 shadow-[var(--avyo-shadow)] sm:p-10">
          <div className="lg:hidden"><AvyoLogo variant="dark" /></div><p className="mt-6 text-xs font-bold tracking-[0.24em] text-blue-600 lg:mt-0">{brand.name}</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-.035em] text-slate-950">Bem-vindo de volta</h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">{brand.description}.</p>
          {reason === "membership" ? <p role="alert" className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">Esta conta não possui um vínculo ativo com a equipe. Solicite acesso ao administrador ou entre com outra conta.</p> : null}
          <LoginForm action={loginAction} configured={hasValidSupabaseConfiguration()} />
        </div>
      </section>
    </main>
  );
}
