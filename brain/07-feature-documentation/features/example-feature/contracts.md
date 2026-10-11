# <Feature name> — Contracts

> The feature's public surface. Changing anything here is an ARCH-4 gate.

## API

| Method | Path | Auth | Request | Response | Errors |
| --- | --- | --- | --- | --- | --- |
| <GET/POST> | <path> | <role> | <schema ref or fields> | <schema ref> | <codes + meaning> |

Schema source of truth: <path to schema/types/OpenAPI>.

## Events / messages

| Name | Direction | Payload | Consumers |
| --- | --- | --- | --- |
| <event> | <emits / consumes> | <schema ref> | <who> |

## Data

| Table / collection | Fields owned by this feature | Migration |
| --- | --- | --- |
| <name> | <fields> | <migration id> |

## UI routes

| Route | Params | Access |
| --- | --- | --- |
| <route> | <params> | <public / role> |

## Compatibility

- Versioning: <how breaking changes are handled>
- Consumers that must not break: <clients, other services>
