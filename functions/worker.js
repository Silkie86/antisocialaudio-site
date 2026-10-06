/**
 * The site's Cloudflare Worker (see wrangler.jsonc).
 *
 * Cloudflare serves the built site (dist/) as static assets for free; this script only runs for /api/*,
 * which is where the DJ booking enquiry form posts. Anything else that reaches it is handed back to the
 * static assets, so normal pages and the 404 page behave as usual.
 */
import { handleEnquiry } from './api/enquiry.js';

export default {
  /**
   * @param {Request} request
   * @param {Record<string, any>} env
   */
  async fetch(request, env) {
    const { pathname } = new URL(request.url);

    if (pathname === '/api/enquiry' || pathname === '/api/enquiry/') return handleEnquiry(request, env);

    if (pathname.startsWith('/api/')) {
      return new Response(JSON.stringify({ ok: false, error: 'Not found.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
      });
    }

    return env.ASSETS.fetch(request);
  },
};
