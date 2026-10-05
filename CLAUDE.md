# Claude instructions for the ScamPrep website

Read and follow `AGENTS.md` in this folder before planning or editing. It is the
shared website instruction file for Claude and Codex, including design, build,
preview, and publishing rules. Keep those rules there so the assistants do not drift.

Read the original business files at the start of work:

- `~/ScamPrep/00_CONTEXT.md` for current business facts and decisions.
- `~/ScamPrep/voice.md` for all copy guidance.
- `~/ScamPrep/PROJECT-INSTRUCTIONS.md` for working preferences.

Leave these originals in `~/ScamPrep`; do not copy or move them into the website
repo. They take precedence over old business guidance in website documentation.
If they are unavailable, report that rather than relying on a stale snapshot.

Read `brand/TOKENS.md` for design work and `SITE-OPS.md` for verified repository
details and the edit workflow. Show Bryce a preview and run a clean build before
publishing website changes. A push or merge to `main` makes the site live.
For documentation-only work, review the diff. Stage only the requested files and
commit with a plain-English message when asked. Give exact commands for the current
branch; do not push or publish unless requested.
