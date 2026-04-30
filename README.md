# Drashti Hydration Tracker

## Run locally

```bash
npm install
npm run dev
```

Open the local URL shown by Vite.

## Required `.env`

Create `.env` from `.env.example` and fill your real keys:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_ADMIN_EMAIL=mansi2464@gmail.com
VITE_EMAILJS_SERVICE_ID=your_emailjs_service_id
VITE_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
VITE_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
VITE_REPORT_TO_EMAIL=mansi2464@gmail.com
```

## Database

Run `supabase.sql` once in Supabase SQL Editor. It safely adds missing columns like `updated_at`.

## EmailJS template variables

Use these variables in your EmailJS template:

- `{{to_email}}`
- `{{user_name}}`
- `{{report_date}}`
- `{{tumblers}}`
- `{{liters}}`
- `{{goal_liters}}`
- `{{progress}}`
- `{{streak}}`
- `{{mood}}`
- `{{note}}`
- `{{message}}`

The report will be sent to `mansi2464@gmail.com` unless you change `VITE_REPORT_TO_EMAIL`.

## Fix old Supabase timeout issue

In browser console, run once:

```js
localStorage.clear();
sessionStorage.clear();
```

Then refresh the app.
