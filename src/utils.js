export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function buildSearchUrl({
  citySlug,
  category,
  minPrice,
  maxPrice,
  rooms,
  withImages,
  onlyOwner,
  page = 1,
}) {
  const city = citySlug && citySlug.trim() !== "" ? citySlug : "rossiya";
  const base = `https://www.avito.ru/${encodeURIComponent(city)}/${encodeURIComponent(category)}/prodam`;

  const params = new URLSearchParams();
  if (page > 1) params.set("p", String(page));
  if (withImages) params.set("f", "p:1");
  if (minPrice && minPrice > 0) params.set("minprice", String(minPrice));
  if (maxPrice && maxPrice > 0) params.set("maxprice", String(maxPrice));
  if (Array.isArray(rooms) && rooms.length) {
    params.set("rooms", rooms.join(","));
  }
  if (onlyOwner) {
    params.set("s", "1");
  }
  const q = params.toString();
  return q ? `${base}?${q}` : base;
}

export function textOrNull(el) {
  if (!el) return null;
  const t = el.textContent?.trim();
  return t?.length ? t : null;
}

export function toNumberSafe(str) {
  if (!str) return null;
  const n = Number(String(str).replace(/[^\d]/g, ""));
  return Number.isFinite(n) ? n : null;
}
