export function getVideoId(href: string) {
  try {
    const url = new URL(href);

    if (url.searchParams.has("v")) {
      return url.searchParams.get("v");
    }

    if (url.hostname === "youtu.be") {
      return url.pathname.slice(1).split("/")[0];
    }
  } catch (err) {}

  return null;
}
