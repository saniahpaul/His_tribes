# Build his_tribes frontend

## What I’ll build
- A complete responsive demo with login/signup, youth dashboard, Bible reading completion, reading calendar, SOAP journal, prayer requests, scoreboard, and leader dashboard.
- The selected “Readable frost” visual direction: deep navy canvas, frosted panels, soft blue/amber/mint accents, Space Grotesk headings, and mobile bottom navigation.
- Role switching between youth and leader experiences, with 2–3 visible leaders marked by a star.

## Functional demo flows
- Mark today’s reading complete and update streak, monthly progress, community progress, history, and scoreboard.
- Create and save private SOAP entries with Scripture, Observation, Application, and Prayer fields.
- Create named or anonymous prayer requests, increment “I Prayed” counts, and view personal prayer history.
- Let leaders review youth progress and SOAP entries, manage prayer requests, and edit the monthly goal.
- Keep all demo data in shared in-memory React state; refreshing resets the demo.

## Structure and quality
- Use one responsive application shell with reusable navigation, panels, progress indicators, forms, and data rows.
- Keep app data and update actions behind a simple context interface so a later FastAPI + SQLite REST API can replace the mock layer.
- Add accessible labels, keyboard-friendly controls, success feedback, mobile-safe layouts, and reduced-motion behavior.
- Add app-specific page metadata and verify key youth/leader flows at desktop and mobile sizes.

## Scope boundaries
- No backend, database, Bible reader, daily verses, groups, assigned leaders, chat, comments, points, XP, badges, levels, or extra social features.
