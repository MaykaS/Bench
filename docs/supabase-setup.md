# Bench cloud setup with device pairing

Bench uses one personal workspace. No email or password is required. Paired browsers receive a private, HttpOnly device cookie; the database stores only its hash. Pairing links expire after 10 minutes and work once. Disconnecting a device revokes its access and unused links. Access expires after a year, or when browser data is cleared.

## Initial setup

1. Keep JSON backups of Cases, PEI, Applications, and Network.
2. Create a Supabase project. Obtain the Project URL and a **secret API key** from its Connect / API Keys panel. Store them privately in the existing gitignored `.env.local` as `SUPABASE_URL` and `SUPABASE_SECRET_KEY`. No publishable key or Email provider configuration is needed for this server-mediated design.
3. Apply `supabase/migrations/202609150001_device_pairing.sql` once, using the Supabase CLI or by executing that migration file in SQL Editor. It creates separate tables for the four datasets, device capabilities, pairing tokens, and a workspace revision. All tables have RLS and deny direct anonymous/authenticated access. Only server-side RPCs can access them.
4. In Vercel → Bench → Settings → Environment Variables, configure **Production**:
   - `NEXT_PUBLIC_BENCH_STORAGE=supabase`
   - `SUPABASE_URL` = your project URL
   - `SUPABASE_SECRET_KEY` = your secret API key (mark Sensitive)
   - `BENCH_ORIGIN` = your exact HTTPS Bench origin, with no trailing slash
5. Redeploy after saving the variables. Leave Preview unconfigured, or use a separate Supabase project for test data. Local development uses `BENCH_ORIGIN=http://localhost:3000`.
6. In the project folder run `node scripts/pair-device.mjs https://YOUR-BENCH-ADDRESS`. It writes a private, gitignored `.bench-pairing-link.txt`. Open the link within 10 minutes, name your browser, and press **Connect this device**. The script can also recover access if every device is lost; it requires your server secret key.
7. Open **Devices** and choose all four JSON backups in the migration panel. Review counts and any contact-link repairs, then press **Import all four backups**. The first migration only fills an empty cloud workspace. Existing cloud data must be updated through each section's import controls.
8. On the paired browser, open **Devices → Create pairing link**. Open it on the phone and press **Connect this device**. Both now read the same records. Do this in the installed home-screen app if that is where you use Bench; some platforms keep its storage separate from the normal browser.

## Everyday behavior

Changes save to Supabase. Lists check for changes every 20 seconds while visible and when the window regains focus. Active forms retain their drafts and show a Load new changes option. Concurrent saves are checked against a revision and rejected if someone saved in between. Cloud failures do not fall back to local storage or claim a save succeeded. A failed request whose response was lost may have reached the server; reload before repeating an import or creating a duplicate.

Browser-local backups remain untouched. Cloud mode does not automatically upload them, and empty cloud PEI stays empty until explicitly imported. Resume version labels already used by applications are preserved; unselected local-only suggestions are not part of the backup format.

The secret key must never use a NEXT_PUBLIC prefix. The pairing link grants access, so send it only to your own device. Unpaired browsers see a connection screen; database access is checked on every request. Database changes and related application/contact updates commit atomically.

References: [Supabase data security](https://supabase.com/docs/guides/database/secure-data), [API keys](https://supabase.com/docs/guides/getting-started/api-keys), [Vercel environment variables](https://vercel.com/docs/environment-variables).
