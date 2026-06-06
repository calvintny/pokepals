# Pokepals

A one-page marketplace listing automations for [Poke](https://poke.com), the AI assistant that lives in
Apple Messages, WhatsApp, and Telegram. Visitors can search/filter automations and install them via
`poke.com/r/[id]` recipe links.

It's a static site — plain HTML/CSS/JS, no build step, no framework. Fast to load, easy to host.

## Files

- `index.html` — the page itself (markup, styles, and rendering logic)
- `translations.js` — UI copy in 10 languages (auto-detected from the browser, with a manual switcher)
- `automations.json` — the catalog of automations shown on the page (**this is what the CMS edits**)
- `admin/` — [Decap CMS](https://decapcms.org) admin panel for editing `automations.json` without touching code
- `netlify/functions/install-counts.js` — a small serverless function that tracks **real** install-button
  clicks (see "Live install counts" below)
- `package.json` — only exists so that function can use `@netlify/blobs`; the site itself has zero
  build step and zero frontend dependencies

## Deploying to Netlify

1. Push this repo to GitHub (or GitLab/Bitbucket).
2. In Netlify: **Add new site → Import an existing project**, pick the repo. Build command: none (or
   leave the default — there's nothing to build). Publish directory: `.` (already set in `netlify.toml`).
   Netlify will automatically detect and deploy the function in `netlify/functions/`.
3. Deploy — the page itself is static and instant; the function spins up on its own.

## Live install counts

The "Automations" and "Total installs" numbers in the hero, and the install count shown on every card,
are **real** — not made-up marketing numbers:

- **Automations count** is simply the live length of `automations.json` — add or remove an entry via the
  CMS and the number updates on the next page load.
- **Install counts** are tracked server-side: every time someone clicks **Install**, the page fires a
  request to `netlify/functions/install-counts.js`, which increments a counter in
  [Netlify Blobs](https://docs.netlify.com/blobs/overview/) (a free key-value store built into every
  Netlify site — nothing to sign up for or configure). The number shown for each automation is that
  live tracked count *added on top of* the "Starting install count" you set in the CMS, so a
  brand-new automation doesn't look empty on day one but the number still grows for real as people
  install it.

This needs no setup beyond deploying the function (which Netlify does automatically). One caveat: the
counter does a read-then-write rather than an atomic increment, so under heavy simultaneous traffic it
could occasionally undercount by one or two — a fine trade-off for a "this is popular" indicator, and it
avoids needing a real database.

## Setting up the CMS (one-time)

The admin panel at `/admin` is already in the repo, but it needs Netlify Identity + Git Gateway turned on
so it can authenticate you and commit your edits back to the repo:

1. In your Netlify site dashboard: **Site configuration → Identity → Enable Identity**.
2. Under Identity **Registration**, set it to **Invite only** (so randoms can't sign up).
3. Under Identity → **Services**, enable **Git Gateway**.
4. Identity tab → **Invite users** → invite yourself by email.
5. Open the invite email and click the link.

   **Two gotchas baked into Netlify Identity that this repo already works around — but only once the fixes
   below are deployed:**

   - Netlify always sends invite/recovery links to your site's **root** with a token in the URL hash
     (e.g. `https://yoursite.netlify.app/#invite_token=...`), never to `/admin`. `index.html` includes a
     redirect script that catches this and forwards you to `/admin/`.
   - The Identity widget has to be the *first* thing to read that token — otherwise Decap CMS's own
     router rewrites the hash to `#/invite_token=...` (note the extra `/`) before the widget sees it,
     and you land on a plain **login** screen instead of a **"Complete your signup"** dialog.
     `admin/index.html` now loads the Identity widget as its own script, ahead of the CMS bundle, to
     avoid that race.

   **Important:** an invite/recovery token is single-use and expires once the page loads — if you already
   clicked a link and saw the login screen (instead of a password prompt), that token is now spent. After
   redeploying with these fixes, go back to the Identity tab and click **"Invite users"** again (or, for
   an existing user, the **⋯ menu → Send recovery email**) to issue a fresh token, then click the new link.
6. You should now see a **"Complete your signup"** modal — set your password there.
7. From then on, just go to `https://<your-site>.netlify.app/admin/` and log in normally.

From then on, editing `automations.json` is a form — no JSON, no git, no code. Add/remove/reorder
automations, set the icon, category, badges, starting install count, etc. Saving commits straight to
`main`, and Netlify redeploys automatically (usually live within a minute).

## Adding/editing automations manually

If you'd rather skip the CMS, `automations.json` is a plain JSON file:

```json
{
  "id": "my-automation-slug",
  "name": "My Automation",
  "description": "One or two sentences describing what it does.",
  "icon": "✨",
  "bg": "linear-gradient(140deg, #667eea 0%, #764ba2 100%)",
  "cat": "Email",
  "isNew": true,
  "isPopular": false,
  "installs": 0
}
```

- `id` must match the recipe slug at `poke.com/r/[id]` — it drives both the install link and the share link.
- `installs` is just a *starting* number (so a brand new entry doesn't show "0 installs"). The page adds
  the real, live tracked count on top automatically — see "Live install counts" above. You never need to
  edit this again after creating the entry.
- `cat` should be one of the categories already in use (Email, Calendar, Reminders, Web Search, Integrations, Health) so it groups correctly with the filter pills — though any string works, it'll just become its own filter.
- `bg` accepts any CSS `background` value (gradients work well with the design).

**Note on translations:** automation names/descriptions are English-only by design — the CMS form doesn't
ask for 10 translations per entry. The rest of the page chrome (buttons, onboarding, etc., in
`translations.js`) is fully translated and switches automatically based on the visitor's browser language.
