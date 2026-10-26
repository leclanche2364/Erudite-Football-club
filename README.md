# Eruditeballersafrica Football Academy

Astro website for Eruditeballersafrica Football Academy, including public academy information, an application enquiry form, and an invite-only staff application review area.

## Local development

1. Install Node.js 22.12 or newer.
2. Run `npm install`.
3. Copy `.env.example` to `.env` and add the Supabase project URL and publishable/anon key.
4. Run `npm run dev`.

`npm run check` runs Astro diagnostics. `npm run build` creates the Vercel deployment output.

## Supabase setup

1. Create a Supabase project and apply `supabase/migrations/202610260001_create_applications.sql` using the SQL editor or Supabase CLI.
2. In Supabase Auth, enable email/password and disable public sign-ups. Create/invite staff accounts from the dashboard; do not share a service-role key with the website.
3. Set `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY` in local `.env` and the Vercel project environment variables.
4. Deploy to Vercel. The public pages are prerendered; the application and admin pages render on demand.

The migration enables RLS. Anonymous visitors can insert new applications only; staff sessions can read applications and update only the status column. Do not enable public sign-ups unless staff access policies are redesigned.

## Before accepting applications

- Publish the current Code of Conduct and medical policy and ensure guardians receive them before completing the acknowledgement fields.
- Approve a privacy notice and application-record retention period.
- Confirm the age eligibility for U10, U12, U14, and U16 groups.
- Confirm photo permissions for every supplied image used publicly.
- Add verified academy contact details and any final program/schedule information.
