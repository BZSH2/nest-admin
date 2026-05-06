# AGENTS.md - nest-admin

This backend is coupled to the generated frontend API client in `../vue-admin`.

## Rule: API surface changes must sync OpenAPI output

When you add or change exposed HTTP API behavior, treat frontend OpenAPI sync as part of the same task.

### API surface changes include

- controller routes
- path/query/body params
- request/response DTO fields
- Swagger/OpenAPI decorators or schema names
- module/controller naming that affects generated files

### Expected flow

1. Finish backend change
2. Validate backend in this repo:
   - `pnpm build`
3. Sync frontend in `../vue-admin`:
   - `pnpm openApi`
   - `pnpm build`

### If regeneration breaks frontend build

Prefer fixing the generator/template in `../vue-admin/openApi/**` or shared generated compatibility types.
Do not leave one-off edits that will be overwritten by the next `pnpm openApi`.

### When sync is not required

Skip OpenAPI sync for internal refactors that do not change the exposed HTTP contract.

### Skill

Use the workspace skill `nest-admin-openapi-sync` when this rule applies.
