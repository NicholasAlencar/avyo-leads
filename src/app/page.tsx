import { brand } from "@/lib/brand";

export default function HomePage() {
  return (
    <main className="grid min-h-screen place-items-center p-8">
      <section className="max-w-xl rounded-3xl border border-black/10 bg-white p-10 shadow-sm">
        <p className="text-xs font-semibold tracking-[0.24em] text-slate-500">VIO</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">{brand.name}</h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          {brand.description}.
        </p>
      </section>
    </main>
  );
}
