# VIO LEADS

Aplicação interna da VIO. Repositório oficial: https://github.com/NicholasAlencar/avyo-leads

## Executar

Requer Node.js 24+, npm e um projeto Supabase dedicado. Instale com `npm ci`, copie `.env.example` para `.env.local` e execute `npm run dev`. Sem credenciais o login mostra **INTEGRAÇÃO NÃO CONFIGURADA**.

Configure `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Nunca use a secret key como chave pública. Nenhuma credencial deve ser versionada.

## Banco e equipe

As migrations em `supabase/migrations` estão em ordem cronológica. Para desenvolvimento com Docker, use `npx supabase start`, `npx supabase db reset` e `npx supabase test db`. O reset é exclusivo de banco local descartável.

Para um projeto hospedado, escolha explicitamente um projeto dedicado, faça backup se houver dados, revise as migrations e aplique pelo fluxo de migrations do CLI. Não aponte para outro aplicativo existente. Descubra os comandos da versão instalada com `npx supabase --help`.

Convide os três usuários no painel Supabase Auth e crie os perfis correspondentes em `public.profiles`. Crie uma organização em `public.organizations` e um vínculo por usuário em `public.organization_members`, com `status='active'`, `joined_at=now()` e a função adequada. Use os UUIDs reais de Auth; não há usuários ou senhas padrão. Desative cadastro público e configure a URL de redirecionamento do ambiente. Um usuário autenticado sem vínculo ativo não acessa o CRM.

## Implementado neste corte

- Login Supabase e autorização por organização.
- Cadastro, tabela paginada, filtros, ficha e pipeline com movimentação persistida.
- Notas, tags, listas, responsável, histórico e bloqueio de contato.
- Follow-ups: agendar, concluir, cancelar e atualizar próximo prazo.
- Dashboard por coorte de descoberta, performance por segmento e priorização a partir de scores já persistidos.
- Migrations com RLS, auditoria e funções transacionais.
- Limite de 60 chamadas de gravação por usuário/organização/minuto nas server actions do CRM.

## Validação

`npm run test:run`, `npm run lint`, `npm run typecheck`, `npm run build`.

Instale o navegador de testes com `npx playwright install chromium`. `npm run test:e2e` sobe um servidor isolado na porta 3100 e testa login sem credenciais e proteção de rotas. O teste não usa o banco hospedado.

Os testes `src/test/database.test.ts` executam todas as migrations em PostgreSQL via PGlite **somente no runner de testes**, com um schema Auth mínimo. Testam RLS, funções, auditoria, conflitos e métricas. PGlite não é um backend alternativo do aplicativo e não valida GoTrue, JWT, PostgREST, conexões concorrentes ou infraestrutura Supabase. pgTAP e o fluxo autenticado completo no Supabase real continuam obrigatórios antes de produção.

## Definições das métricas

O período seleciona leads por `created_at`; os resultados consideram o histórico acumulado até hoje. Respostas, reuniões e propostas contam empresas distintas por marco. `RESPONDED` com `metadata.positive=true` alimenta respostas positivas. Cliente é o estágio atual `CLIENT`. Receita fechada utiliza valores registrados em `leads.closed_revenue`; valor potencial soma `potential_value` de oportunidades abertas. Não se estima faturamento.

Taxas: respostas/abordados, reuniões/abordados, clientes/reuniões, clientes/encontrados. Denominador vazio resulta em zero. “Abordar agora” exige score persistido, contato disponível, etapa inicial, ausência de bloqueio e nenhum contato registrado nos últimos três dias.

## Pendências antes de produção

Esta entrega não conclui a especificação completa. Google Places, enriquecimento de sites/redes, cálculo do VIO Score, análise IA, geração de mensagens e envio OAuth ainda não estão implementados. Os cartões de integração verificam presença de configuração; não comprovam conectividade ou implementação do adaptador.

Faltam validação autenticada no Supabase real, tipos de banco gerados pelo CLI, teste de concorrência, revisão final das permissões de escrita direta via Data API e endurecimento do rate limit nesse caminho. Os limites atuais das server actions não substituem proteção no gateway. Também faltam telas para editar valores comerciais, registrar resposta positiva, gestão da equipe e remoção/retensão de dados. Follow-ups armazenam cadências, mas não enviam mensagens ou criam tarefas futuras automaticamente.

Os commits são locais: publicação no GitHub e implantação não foram realizadas nesta etapa.

Plano e arquitetura: `docs/superpowers/plans/2026-09-03-vio-leads-release-1.md` e `docs/superpowers/specs/2026-09-03-vio-leads-foundation-design.md`.
