# Frequently Asked Questions

## Q: Why does the dashboard redirect me to /auth?
A: You are not logged in or your session expired. Log in with Google at `/auth`.

## Q: Why is the Google login not working?
A: Verify that `OAUTH_BACKEND_URL` is set correctly on Render and that `NEXTAUTH_URL` matches the live URL.

## Q: I see no alerts on the dashboard. Is it working?
A: The dashboard requires data in the `sentinel_x` MongoDB collection. Seed data or trigger events to populate it.

## Q: The app is slow on first load. Why?
A: Render free-tier spins down after inactivity. First request wakes the server and takes 30-60 seconds.

## Q: Can I run this locally?
A: Yes. Clone the repo, copy `.env.example` to `.env.local`, fill in your credentials, and run `yarn dev`.
