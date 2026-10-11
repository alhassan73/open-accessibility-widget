# Design Principles

> **Load when:** designing a new unit (function, class, component, service) or reshaping one.
> **Rules:** DES-1…5.

1. **Single responsibility.** A unit has one reason to change. If you describe it with "and", split it.
2. **Composition over inheritance.** Build behaviour from small parts; inherit only for true is-a with
   shared invariants.
3. **Explicit over implicit.** Pass dependencies in; avoid hidden globals, singletons, and magic config.
4. **Depend on interfaces at boundaries** (I/O, external services, time, randomness) so they can be
   substituted in tests.
5. **Pure core, effectful shell.** Keep decisions in pure functions; push I/O to the edges.
6. **Make illegal states unrepresentable.** Use types/enums/unions so invalid combinations can't be
   built (`../coding/type-safety.md`).
7. **Parse, don't validate.** Turn untrusted input into a typed value once, at the boundary (DES-3).
8. **Fail fast and loudly** on programmer errors; handle expected failures explicitly (`error-handling.md`).
9. **Least surprise.** Names say what things do; functions do what their names say, nothing more.
10. **YAGNI.** No parameters, options, hooks, or layers for needs that don't exist yet.
11. **Small surfaces.** Export the minimum; every public symbol is a contract.
12. **Idempotency** for anything retried: jobs, webhooks, payment and messaging operations.

## Smells that trigger a redesign question

- A function > ~50 lines or > 4 parameters; a boolean parameter that switches behaviour.
- A module everyone imports ("utils" gravity).
- The same conditional on a type/kind in several places (missing polymorphism or map).
- Tests that need heavy mocking to exercise simple logic (I/O mixed into the core).
