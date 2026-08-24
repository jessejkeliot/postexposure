import PocketBase from 'pocketbase';
import { env } from '$env/dynamic/private';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  // 1. Create a fresh PocketBase instance per request
  event.locals.pb = new PocketBase(env.POCKETBASE_URL || 'http://127.0.0.1:8090');

  // 2. Load auth state from incoming request cookies
  event.locals.pb.authStore.loadFromCookie(event.request.headers.get('cookie') || '');

  try {
    // 3. Refresh valid auth token & populate current user
    if (event.locals.pb.authStore.isValid) {
      await event.locals.pb.collection('users').authRefresh();
      event.locals.user = event.locals.pb.authStore.record;
    } else {
      event.locals.user = null;
    }
  } catch {
    // Clear invalid/expired session
    event.locals.pb.authStore.clear();
    event.locals.user = null;
  }

  // 4. Process the route request
  const response = await resolve(event);

  // 5. Export updated auth state back to HTTP-only cookie
  response.headers.append(
    'set-cookie',
    event.locals.pb.authStore.exportToCookie({
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    })
  );

  return response;
};