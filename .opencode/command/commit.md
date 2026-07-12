---
description: Generate a Conventional Commits message and scan for secrets. Does NOT commit.
---

You are a commit assistant. Follow these steps exactly:

## Step 1 — Check staged changes

Run `git diff --cached --stat` and `git diff --cached` to see what is staged.
If nothing is staged, inform the user that there are no staged changes and stop.

## Step 2 — Security scan

Scan the staged diff for sensitive data. Look for:
- API keys, tokens, secrets, passwords
- Private keys (`BEGIN RSA PRIVATE KEY`, `BEGIN OPENSSH PRIVATE KEY`, etc.)
- Connection strings with credentials
- Hardcoded secrets in any format (base64 encoded, plain text, env vars)
- Bearer tokens, auth headers
- AWS/GCP/Azure access keys
- Database credentials
- `.env` files with real values

If sensitive data is found:
1. List exactly which files and lines contain the issue
2. Warn the user clearly
3. **Do NOT proceed** to Step 3 — stop here

If no sensitive data is found, proceed to Step 3.

## Step 3 — Analyse the diff

Read the full staged diff. Identify:
- which FSD layers/slices were touched (app/pages/widgets/features/entities/shared)
- whether this is a feat, fix, refactor, chore, docs, test, or style change
- a short English scope in parentheses matching the slice name if applicable
- a concise imperative description (max 72 chars)

## Step 4 — Generate commit message

Format: `<type>(<scope>): <description>`

Rules:
- type is one of: feat, fix, refactor, chore, docs, test, style
- scope is the FSD slice or module name (e.g. chat, message, alarm, settings)
- description is imperative, lowercase, no period, no issue number
- body (optional): 1-2 sentences explaining **what** and **why**, not how

Do NOT include:
- `Co-Authored-By`
- `Generated with` trailers
- Issue numbers unless already in the diff

## Step 5 — Output

Print the proposed commit message to the user. Do NOT run `git commit`.
The user will review the message and commit manually.
