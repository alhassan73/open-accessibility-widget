# <Feature name> — Dependencies

## Depends on

| Kind | Name | Why | Failure impact |
| --- | --- | --- | --- |
| Module | <module> | <reason> | <what breaks> |
| Feature | <F-###> | <reason> | <what breaks> |
| Integration | <service — 06-project-knowledge/integrations.md> | <reason> | <degraded behaviour> |
| Config / env (names only) | <VAR_NAME> | <reason> | <behaviour if missing> |
| Feature flag | <flag> | <reason> | <off behaviour> |

## Depended on by

| Who | What they use | Notify on change? |
| --- | --- | --- |
| <feature / service / client> | <contract> | <yes/no> |

Changing anything in "Depended on by" → impact analysis (`09-knowledge-maintenance/change-impact-analysis.md`).
