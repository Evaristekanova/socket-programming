export async function GET() {
  return new Response(JSON.stringify({ message: "API is working!" }), {
    status: 200,
  });
}
