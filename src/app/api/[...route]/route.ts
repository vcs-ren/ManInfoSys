// src/app/api/[...route]/route.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * CATCH-ALL API ROUTE HANDLER FOR NEXT.JS
 *
 * This handler catches all requests made to /api/* within the Next.js application.
 * It is **intended solely to inform the developer** that the actual API logic
 * resides in the separate PHP backend (expected to be running, e.g., at `/php-api/`).
 *
 * It does **NOT** proxy requests or handle any actual API logic.
 * Frontend components should make requests directly to the PHP backend URL.
 *
 * In a production environment, you might remove this catch-all or configure
 * Next.js rewrites/proxies if needed, but for this setup, direct frontend-to-backend
 * calls are assumed.
 */

// --- Main Route Handlers ---

async function handler(req: NextRequest, { params }: { params: { route: string[] } }) {
    const path = params.route?.join('/') || '';
    const method = req.method;

    console.warn(`API Request (${method}) received at Next.js route: /api/${path}. ` +
                 `This route is a placeholder. Ensure frontend requests target the PHP backend directly.`);

    // Return a clear message indicating this is not the functional API endpoint
    return NextResponse.json(
        {
            message: `This Next.js API route (/api/${path}) is a placeholder. API requests should be directed to the PHP backend.`,
            requestedMethod: method,
            requestedPath: `/api/${path}`
        },
        { status: 404 } // Use 404 Not Found, as this route doesn't handle the request
    );
}

export { handler as GET, handler as POST, handler as PUT, handler as DELETE, handler as PATCH, handler as OPTIONS };
