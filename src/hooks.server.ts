import { SUPABASE_URL, SUPABASE_ANON_KEY } from '$env/static/private'
import { createServerClient } from '@supabase/ssr'
import { redirect, type Handle } from '@sveltejs/kit'

export const handle: Handle = async ({ event, resolve }) => {
  console.debug("Creating supabase client...");

  // create supabase server client
  event.locals.supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
          return event.cookies.getAll()
      },
      setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => 
            event.cookies.set(name, value, { ...options, path: '/' })
          )
      },
    },
    cookieEncoding: 'base64url'
  })

  // check for user object
  console.debug("Checking for active user...");
  const { data: { user }, error, } = await event.locals.supabase.auth.getUser()
  if (error || !user) {
    // JWT validation has failed
    console.error("Error occured while getting user identity...")
    // return redirect(303, "/");
  }

  return resolve(event, {
    filterSerializedResponseHeaders(name) {
      return name === 'content-range' || name === 'x-supabase-api-version'
    },
  })
}