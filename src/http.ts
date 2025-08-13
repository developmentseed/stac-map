export async function fetchStac(
  href: string,
  method: "GET" | "POST" = "GET",
  body?: string,
) {
  return await fetch(href, {
    method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body,
  }).then((response) => {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error(`${method} ${href}: ${response.statusText}`);
    }
  });
}
