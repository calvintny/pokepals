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

## Deploying to Netlify

1. Push this repo to GitHub (or GitLab/Bitbucket).
2. In Netlify: **Add new site → Import an existing project**, pick the repo. Build command: none. Publish directory: `.` (already set in `netlify.toml`).
3. Deploy — that's it, the site is static.

## Setting up the CMS (one-time)

The admin panel at `/admin` is already in the repo, but it needs Netlify Identity + Git Gateway turned on
so it can authenticate you and commit your edits back to the repo:

1. In your Netlify site dashboard: **Site configuration → Identity → Enable Identity**.
2. Under Identity **Registration**, set it to **Invite only** (so randoms can't sign up).
3. Under Identity → **Services**, enable **Git Gateway**.
4. Identity tab → **Invite users** → invite yourself by email, then accept the invite from your inbox and set a password.
5. Visit `https://<your-site>.netlify.app/admin/` and log in.

From then on, editing `automations.json` is a form — no JSON, no git, no code. Add/remove/reorder
automations, set the icon, category, badges, rating, etc. Saving commits straight to `main`, and Netlify
redeploys automatically (usually live within a minute).

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
  "rating": 4.8,
  "reviewCount": 120,
  "installs": 900
}
```

- `id` must match the recipe slug at `poke.com/r/[id]` — it drives both the install link and the share link.
- `cat` should be one of the categories already in use (Email, Calendar, Reminders, Web Search, Integrations, Health) so it groups correctly with the filter pills — though any string works, it'll just become its own filter.
- `bg` accepts any CSS `background` value (gradients work well with the design).

**Note on translations:** automation names/descriptions are English-only by design — the CMS form doesn't
ask for 10 translations per entry. The rest of the page chrome (buttons, onboarding, etc., in
`translations.js`) is fully translated and switches automatically based on the visitor's browser language.
