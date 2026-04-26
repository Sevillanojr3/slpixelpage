import { verifySession, SESSION_COOKIE } from '$lib/server/admin-auth.js';

export async function handle({ event, resolve }) {
  const token = event.cookies.get(SESSION_COOKIE);
  const session = verifySession(token);
  event.locals.admin = session ? { email: session.email } : null;
  return resolve(event);
}
