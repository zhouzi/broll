export const dynamic = "force-dynamic";

async function convertImageToBase64(href: string) {
  const response = await fetch(href);
  const buffer = await response.arrayBuffer();

  const base64String = Buffer.from(buffer).toString("base64");
  return `data:image/jpeg;base64,${base64String}`;
}

export async function GET(req: Request) {
  const href = new URL(req.url).searchParams.get("href");

  if (href == null) {
    return new Response("missing href", {
      status: 400,
    });
  }

  const base64 = await convertImageToBase64(href);

  return new Response(base64);
}
