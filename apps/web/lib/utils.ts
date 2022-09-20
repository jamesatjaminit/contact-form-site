export const fetcher = async (url: string) =>
  fetch(url).then(async (res) => {
    if (res.status != 200) {
      throw new Error("Failed to fetch");
    }
    return await res.json();
  });
