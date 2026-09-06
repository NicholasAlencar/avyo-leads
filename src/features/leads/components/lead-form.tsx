"use client";

import { useActionState } from "react";
import { createLeadAction } from "../actions";

type LeadDefaults = Record<string, string>;

function Field({ label, name, type = "text", placeholder, value }: { label: string; name: string; type?: string; placeholder?: string; value?: string }) {
  return (
    <label>
      <span className="mb-1.5 block text-xs font-semibold text-slate-600">{label}</span>
      <input className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-500" defaultValue={value} name={name} placeholder={placeholder} type={type} />
    </label>
  );
}

export function LeadForm({ defaults = {} }: { defaults?: LeadDefaults }) {
  const [state, action, pending] = useActionState(createLeadAction, null);

  return (
    <form action={action} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6">
      <fieldset className="grid gap-4 md:grid-cols-2">
        <legend className="mb-4 text-sm font-bold text-slate-900">Empresa</legend>
        <Field label="Nome da empresa *" name="companyName" placeholder="Razão comercial conhecida" value={defaults.companyName} />
        <Field label="Segmento" name="segment" placeholder="Ex.: Odontologia" value={defaults.segment} />
        <Field label="CNPJ" name="cnpj" placeholder="Somente se publicamente disponível" />
        <Field label="Site oficial" name="websiteUrl" placeholder="https://" type="url" value={defaults.websiteUrl} />
      </fieldset>

      <fieldset className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <legend className="mb-4 text-sm font-bold text-slate-900">Localização e contato público</legend>
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
        <span className="mb-1.5 block text-xs font-semibold text-slate-600">Descrição pública</span>
        <textarea className="min-h-28 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-500" maxLength={4000} name="description" />
      </label>

      {state && !state.ok ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700" role="alert">{state.message}</p> : null}

      <div className="flex justify-end">
        <button className="rounded-xl bg-[#18250f] px-5 py-3 text-sm font-bold text-white hover:bg-[#263919] disabled:cursor-wait disabled:opacity-60" disabled={pending} type="submit">
          {pending ? "Salvando..." : "Salvar lead"}
        </button>
      </div>
    </form>
  );
}
