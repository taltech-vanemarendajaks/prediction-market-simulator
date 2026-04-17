# Team Process

## Workflow

issue --> branch --> PR --> review --> merge

---

## Branching

- main = stable
- feature/* = development

---

## Pull Requests

- 1 PR = 1 task
- max ~300–400 LOC
- must link issue
- no direct commits to main
- CI must pass (FE + BE)

---

## Review

- review within 24h
- changes --> re-request review
- PR can be merged only if:
  - approved
  - CI green (FE + BE)

---

## Commits

format:
type(scope): message

types:
- feat
- fix
- refactor
- chore

examples:
feat(api): add POST /position
fix(service): resolve null pointer in resolver

---

## Goal

- small steps
- working system at all times
- clear ownership