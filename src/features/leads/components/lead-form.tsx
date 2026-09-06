"use client";

import { useActionState } from "react";
import { createLeadAction } from "../actions";
import { Building2, MapPin, Save } from "lucide-react";

type LeadDefaults = Record<string, string>;

function Field({ label, name, type = "text", placeholder, value }: { label: string; name: string; type?: string; placeholder?: string; value?: string }) {
  return (
    <label>
      <span className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)]">{label}</span>
      <input className="h-11 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface-subtle)] px-3 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-[var(--brand-primary)] focus:bg-white focus:ring-4 focus:ring-blue-500/10" defaultValue={value} name={name} placeholder={placeholder} type={type} />
    </label>
  );
}

export function LeadForm({ defaults = {} }: { defaults?: LeadDefaults }) {
  const [state, action, pending] = useActionState(createLeadAction, null);

  return (
    <form action={action} className="space-y-8 rounded-[var(--radius-panel)] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-card)] lg:p-8">
      <fieldset className="grid gap-5 md:grid-cols-2">
        <legend className="mb-5 flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]"><span className="grid size-8 place-items-center rounded-xl bg-blue-50 text-[var(--brand-primary)]"><Building2 className="size-4" /></span>Dados da empresa</legend>
        <Field label="Nome da empresa *" name="companyName" placeholder="Razão comercial conhecida" value={defaults.companyName} />
        <Field label="Segmento" name="segment" placeholder="Ex.: Odontologia" value={defaults.segment} />
        <Field label="CNPJ" name="cnpj" placeholder="Somente se publicamente disponível" />
        <Field label="Site oficial" name="websiteUrl" placeholder="https://" type="url" value={defaults.websiteUrl} />
      </fieldset>

      <fieldset className="grid gap-5 border-t border-[var(--border)] pt-7 md:grid-cols-2 lg:grid-cols-4">
        <legend className="mb-5 flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]"><span className="grid size-8 place-items-center rounded-xl bg-blue-50 text-[var(--brand-primary)]"><MapPin className="size-4" /></span>Localização e contato público</legend>
        <Field label="UF" name="stateCode" placeholder="SP" value={defaults.stateCode} />
        <Field label="Cidade" name="city" value={defaults.city} />
        <Field label="Bairro" name="district" />
        <Field label="Telefone" name="phone" value={defaults.phone} />
        <Field label="E-mail empresarial" name="email" type="email" />
        <Field label="WhatsApp" name="whatsapp" />
        <Field label="Instagram" name="instagramUrl" placeholder="https://" type="url" />
        <Field label="LinkedIn" name="linkedinUrl" placeholder="https://" type="url" />
      </fieldset>

      <input name="googleMapsUrl" type="hidden" value={defaults.googleMapsUrl ?? ""} />
      <input name="googlePlaceId" type="hidden" value={defaults.googlePlaceId ?? ""} />

      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)]">Descrição pública</span>
        <textarea className="min-h-32 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface-subtle)] px-3 py-2.5 text-sm outline-none transition focus:border-[var(--brand-primary)] focus:bg-white focus:ring-4 focus:ring-blue-500/10" maxLength={4000} name="description" />
      </label>

      {state && !state.ok ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">{state.message}</p> : null}

      <div className="flex justify-end">
        <button className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-5 text-sm font-semibold text-white shadow-[0_8px_22px_rgba(24,92,255,.2)] transition hover:bg-[var(--brand-primary-hover)] disabled:cursor-wait disabled:opacity-60" disabled={pending} type="submit">
          <Save className="size-4" />{pending ? "Salvando..." : "Salvar lead"}
        </button>
      </div>
    </form>
  );
}
