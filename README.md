# Cupion

Telegram Mini App: лента анкет, оценки и мэтчи. Интерфейс на русском, данные пока живут в mock-слое (`js/mock.js`).

Живой адрес: **https://res661.github.io/cupion/**

Основной бот: [@cupion_app](https://t.me/cupion_app). [@cupion_bot](https://t.me/cupion_bot) тоже открывает это приложение.

Ссылка на анкету: `https://t.me/cupion_app?startapp=u_username`

## Подключить Mini App в BotFather

1. Открой [@BotFather](https://t.me/BotFather).
2. Отправь `/mybots`.
3. Выбери **@cupion_app** (это основной бот; @cupion_bot указывает на него же).
4. **Bot Settings**.
5. **Menu Button** или **Configure Mini App**.
6. Укажи URL: `https://res661.github.io/cupion/`

## GitHub Pages

Источник публикации должен быть **GitHub Actions**, не ветка «Deploy from a branch».

В репозитории это делает [`.github/workflows/pages.yml`](.github/workflows/pages.yml): при пуше в `main` он включает Pages (`actions/configure-pages` с `enablement: true`) и выкладывает статику. В корне есть `.nojekyll`, сборки нет: это обычные HTML, CSS и JS.

## Как устроен код

| Файл | Роль |
| --- | --- |
| `index.html` | Оболочка Mini App, `telegram-web-app.js`, meta no-cache |
| `js/telegram.js` | `expand()`, fullscreen на iOS/Android 8.0+, safe area, хаптика |
| `js/mock.js` | Память + `localStorage` |
| `js/api.js` | Адаптер. Реальный бэкенд подставляется через `CupionAPI.use(backend)` с теми же методами |
| `js/app.js` | Экраны |
| `css/app.css` | Светлая и тёмная темы |

Кэш статики сбрасывается параметром `?v=` у CSS и JS.
