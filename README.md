# Avito Realty Scraper (Apify actor)

Собирает объявления «продажа недвижимости» с Avito.

## Быстрый старт локально
1) `npm i`
2) Создайте `input.json` или используйте UI Apify:
```json
{
  "citySlug": "moskva",
  "category": "kvartiry",
  "minPrice": 6000000,
  "maxPrice": 15000000,
  "rooms": [1,2,3],
  "withImages": true,
  "onlyOwner": false,
  "pagesLimit": 3,
  "maxItems": 0,
  "proxy": ["RESIDENTIAL"]
}
```
3) `npm run local`

Результат: `./storage/datasets/default`

## Деплой в Apify
- Импортируйте как новый Actor
- Укажите Proxy groups (лучше `RESIDENTIAL`)
- Запускайте, результаты — в Dataset актора

## Примечания
- Селекторы Avito могут меняться; при 0 результатов проверьте `data-marker` в DevTools.
- Для точных фильтров снимайте сетевой лог и добавляйте параметры в `buildSearchUrl`.
- Соблюдайте правила сайта и закон.
