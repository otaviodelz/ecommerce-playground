// Old /product?id= links (shared, indexed) move to /product/<id>.
// A route handler, because a next.config redirect would pass the old ?id= query through to the new URL.
export function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("id")
  if (!id || !/^[a-z0-9-]+$/.test(id)) return new Response("Not found", { status: 404 })
  return Response.redirect(new URL(`/product/${id}`, request.url), 308)
}
