// Stripe checkout removed — payments handled via PayPal client-side SDK.
// This endpoint is no longer used.
export const prerender = false;

export const POST = () =>
  new Response(JSON.stringify({ error: 'Not implemented.' }), { status: 410 });
