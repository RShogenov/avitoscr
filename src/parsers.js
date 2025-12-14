import { textOrNull, toNumberSafe } from "./utils.js";

export async function parseListingCards(page) {
  return await page.$$eval('[data-marker="item"]', (cards) => {
    const pick = (el, sel) => el.querySelector(sel);
    return cards.map((card) => {
      const a = pick(card, 'a[data-marker="item-title"]');
      const title = a?.textContent?.trim() || null;
      const url = a?.href || null;

      const priceNode = pick(card, 'span[data-marker="item-price"]');
      const priceText = priceNode?.textContent?.trim() || null;

      const metaPrice = pick(card, 'meta[itemprop="price"]')?.getAttribute("content") || null;
      const currency = pick(card, 'meta[itemprop="priceCurrency"]')?.getAttribute("content") || "RUB";

      const address = pick(card, 'div[data-marker="item-address"]')?.textContent?.trim() || null;
      const dateLabel = pick(card, 'div[data-marker="item-date"]')?.textContent?.trim() || null;

      const idAttr = card.getAttribute("data-item-id") || null;
      const subtitle = pick(card, '[data-marker="item-line"]')?.textContent?.trim() || null;

      return {
        id: idAttr,
        title,
        url,
        priceText,
        price: metaPrice ? Number(metaPrice) : null,
        currency,
        address,
        dateLabel,
        subtitle
      };
    });
  });
}

export async function parseDetailPage(page) {
  const data = {};
  try { data.title = await page.$eval('h1[data-marker="item-title"]', el => el.textContent.trim()); } catch {}
  try { data.priceText = await page.$eval('span[itemprop="price"]', el => el.textContent.trim()); } catch {}
  try { data.price = Number(await page.$eval('meta[itemprop="price"]', el => el.getAttribute("content"))); } catch {}
  try { data.currency = await page.$eval('meta[itemprop="priceCurrency"]', el => el.getAttribute("content")); } catch {}
  try { data.address = await page.$eval('[data-marker="delivery/location"]', el => el.textContent.trim()); } catch {}
  try {
    data.attributes = await page.$$eval('[data-marker="item-params"] li', lis => lis.map(li => li.textContent.trim()));
  } catch {}
  try { data.seller = await page.$eval('[data-marker="seller-info/name"]', el => el.textContent.trim()); } catch {}
  try { data.isOwner = !!(await page.$('[data-marker="author-info/private-seller"]')); } catch {}
  return data;
}
