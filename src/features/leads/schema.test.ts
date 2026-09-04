import { describe, expect, it } from "vitest";
import { parseLeadInput } from "./schema";

describe("parseLeadInput", () => {
  it("rejects a lead without company name", () => {
    expect(() => parseLeadInput({ companyName: " " })).toThrow();
  });

  it("normalizes public identifiers used for deduplication", () => {
    expect(
      parseLeadInput({
        companyName: "  Clínica São João  ",
        websiteUrl: "HTTPS://WWW.Exemplo.COM.br/servicos/",
        phone: "+55 (11) 98888-7777",
        cnpj: "12.345.678/0001-95",
        stateCode: "sp",
        email: " CONTATO@EXEMPLO.COM.BR ",
      }),
    ).toMatchObject({
      companyName: "Clínica São João",
      normalizedName: "clinica sao joao",
      normalizedDomain: "exemplo.com.br",
      normalizedPhone: "5511988887777",
      normalizedCnpj: "12345678000195",
      stateCode: "SP",
      email: "contato@exemplo.com.br",
    });
  });

  it.each([
    [{ companyName: "Empresa", email: "invalido" }, "email"],
    [{ companyName: "Empresa", websiteUrl: "empresa.com" }, "URL"],
    [{ companyName: "Empresa", stateCode: "SÃO PAULO" }, "UF"],
    [{ companyName: "Empresa", potentialValue: -1 }, "valor"],
  ])("rejects invalid business data: %s", (input, message) => {
    expect(() => parseLeadInput(input)).toThrow(message);
  });

  it("keeps omitted estimates absent instead of fabricating values", () => {
    const lead = parseLeadInput({ companyName: "Empresa Exemplo" });

    expect(lead.segment).toBeUndefined();
    expect(lead.potentialValue).toBeUndefined();
    expect(lead.websiteUrl).toBeUndefined();
  });
});
