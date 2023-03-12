export const fetcher = async (url: string) =>
  fetch(url).then(async (res) => {
    if (res.status != 200) {
      throw new Error("Failed to fetch");
    }
    return await res.json();
  });

export function isRequestingUser(
  requestingUser: string,
  requiredUser: string,
  isAdmin?: boolean
) {
  isAdmin = false;
  if (requestingUser != requiredUser && isAdmin) {
    return false;
  }
  return true;
}
