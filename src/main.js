import { Actor, log } from "apify";
import { PlaywrightCrawler, RequestQueue, Dataset } from "crawlee";
import { buildSearchUrl, sleep } from "./utils.js";
import { parseListingCards, parseDetailPage } from "./parsers.js";

await Actor.init();

const input = await Actor.getInput() || {};
const {
  citySlug = "moskva",
  category = "kvartiry",
  minPrice = 0,
  maxPrice = 0,
  rooms = [],
  withImages = true,
  onlyOwner = false,
  pagesLimit = 5,
  maxItems = 0,
  proxy = ["RESIDENTIAL"],
} = input;

const proxyConfiguration = await Actor.createProxyConfiguration({
  groups: proxy,
});

const queue = await RequestQueue.open();

for (let p = 1; p <= pagesLimit; p++) {
  const url = buildSearchUrl({
    citySlug,
    category,
    minPrice,
    maxPrice,
    rooms,
    withImages,
    onlyOwner,
    page: p,
  });
  await queue.addRequest({ url, userData: { label: "LIST" } });
}

let itemCount = 0;

const crawler = new PlaywrightCrawler({
  requestQueue: queue,
  proxyConfiguration,
  launchContext: {
    launchOptions: {
      headless: true,
      args: ["--no-sandbox", "--disable-dev-shm-usage"],
    },
  },
  browserPoolOptions: {
    maxOpenPagesPerBrowser: 3,
  },
  maxRequestsPerCrawl: 10000,
  maxConcurrency: 3,
  requestHandlerTimeoutSecs: 90,
  preNavigationHooks: [
    async ({ page }, go) => {
      await page.addInitScript(() => {
        Object.defineProperty(navigator, "webdriver", { get: () => undefined });
      });
      await go();
    },
  ],
  async requestHandler({ request, page }) {
    if (request.userData.label === "LIST") {
      log.info(`Парсим выдачу: ${request.url}`);
      await page.waitForSelector('[data-marker="item"]', { timeout: 20000 }).catch(() => {});
      const cards = await parseListingCards(page);

      for (const card of cards) {
        if (maxItems && itemCount >= maxItems) break;
        await Dataset.pushData({
          ...card,
          source: request.url,
          collectedAt: new Date().toISOString(),
        });
        itemCount++;
        // При желании — добавить детальный парсинг:
        // await crawler.addRequests([{ url: card.url, userData: { label: 'DETAIL', parentUrl: request.url } }]);
      }
      await sleep(1000 + Math.floor(Math.random() * 1000));
    }

    if (request.userData.label === "DETAIL") {
      log.info(`Детали объявления: ${request.url}`);
      await page.waitForLoadState("domcontentloaded");
      const detail = await parseDetailPage(page);
      await Dataset.pushData({
        ...detail,
        url: request.url,
        parent: request.userData.parentUrl,
        collectedAt: new Date().toISOString(),
      });
      await sleep(500 + Math.floor(Math.random() * 1000));
    }
  },
  failedRequestHandler({ request }) {
    log.error(`Не удалось загрузить: ${request.url}`);
  },
});

await crawler.run();

log.info(`Готово. Собрано: ${itemCount} записей`);
await Actor.exit();
