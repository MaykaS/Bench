# Prepare Supabase for Bench

Bench currently saves data in each browser. These steps prepare your cloud project; they do not enable sync. Sign-in, private database tables, cloud repositories, and migration still need to be implemented in Bench.

1. Export JSON backups from Applications, Network, Cases, and PEI on every browser that contains records you want to keep. Save these files privately.
2. Open [Supabase Dashboard](https://supabase.com/dashboard), sign in, create an organization if needed, and choose **New project**. Name it **Bench**, select a nearby region, generate a database password, and save that password in your password manager.
3. Wait for provisioning. Open the project's **Connect** panel and locate its **Project URL** and **publishable key**. These are the app configuration values. Do not paste your database password or a secret/service-role key into chat or browser code.
4. In Bench's local `.env.local`, add the two lines below using your project's values. This file is already excluded from Git. Keep any existing variables.

   ```dotenv
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
   ```

5. In Vercel, open the Bench project → **Settings → Environment Variables**. Add the same two values for Production. Add Development if using Vercel's local tooling. Preview environments can be connected later to a separate test project.
6. In Supabase **Authentication**, check that the Email provider is enabled. Under **URL Configuration**, set **Site URL** to your exact live Bench HTTPS address. When Bench's sign-in callback is implemented, add that exact callback URL and its localhost equivalent to Redirect URLs. The callback route does not exist in Bench yet.
7. The next code slice must add authentication, database migrations, per-user row-level security, and cloud repositories through the existing factory. Each user's tables must restrict reads and writes to their authenticated user ID. Network relationship changes must use database transactions. Do not apply a public-read demo policy to personal recruiting data.
8. After that code is deployed, sign in on the laptop, migrate its reviewed JSON backups into your account once, then sign in with the same account on the phone. Verify a new test record and an edit appear on both devices. Keep the backups until all datasets and links are verified.

Adding environment variables or redeploying today's code will not move localStorage data into Supabase. No cloud project, tables, authentication, or data migration are created by this guide.

References: [Supabase Next.js quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs), [redirect URL configuration](https://supabase.com/docs/guides/auth/redirect-urls), [row-level security](https://supabase.com/docs/guides/database/postgres/row-level-security).
