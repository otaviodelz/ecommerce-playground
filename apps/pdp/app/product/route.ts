// Old /product?id= links (shared, indexed) move to /product/<id>.
// Relative location preserves the public origin behind the Multi-Zone proxy.
export function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("id")
  if (!id || !/^[a-z0-9-]+$/.test(id)) return new Response("Not found", { status: 404 })
  return new Response(null, { status: 308, headers: { location: `/product/${id}` } })
}
