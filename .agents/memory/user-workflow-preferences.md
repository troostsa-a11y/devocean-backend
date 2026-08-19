---
name: User workflow preferences
description: How the user wants the agent to work — no auto subagent reviews, no unsolicited follow-up tasks
---
The rule: do not run automatic code-review (architect) subagent rounds after changes, and do not propose follow-up tasks unsolicited. Only run a review if the user explicitly asks.
**Why:** User stated (2026-08-19) they dislike subagents; task-agent merges also twice reintroduced regressions (e.g. restored a removed link), so background agents have caused rework.
**How to apply:** After completing a request, verify with tests/build yourself and summarize. Skip the architect pass and proposeFollowUpTasks. After any task-agent merge, diff-check recently changed files for reintroduced regressions.
