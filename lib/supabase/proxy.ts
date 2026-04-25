import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { Database } from "@/types/database";

/**
 * Refreshes the Supabase auth session on every request and propagates the
 * updated cookies to both the request (for Server Components) and the
 * response (for the browser).
 *
 * Returns the response that the root proxy.ts should return. Do not modify
 * its cookies — return it as-is. Adding logic between createServerClient and
 * supabase.auth.getUser() is unsafe; the docs warn that the session may not
 * have been refreshed yet at that point.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: do not run code between createServerClient() and getUser().
  // A simple mistake here can cause issues where users are randomly logged out.
  await supabase.auth.getUser();

  return response;
}
