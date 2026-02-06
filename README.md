# Auto Display Web App

## Описание проекта
Веб-интерфейс автомобильного мультимедийного экрана под Android WebView. Экран делится на 40/60: слева — Яндекс Карты, справа — YouTube плеер с поиском. Интерфейс работает в темной теме, оптимизирован под 15.4" дисплей, поддерживает touch и горячие клавиши.

## Архитектура проекта
- **App**: каркас, управление онлайн-статусом, хоткеи, fullscreen.
- **VideoPanel**: YouTube IFrame Player API, поиск через YouTube Data API, управление воспроизведением/громкостью.
- **MapPanel**: Yandex Maps JS API, геолокация, маршруты, сохранение центра/масштаба.
- **OfflineOverlay**: экран оффлайн режима.
- **Hooks**: `useLocalStorage`, `useOnlineStatus`.
- **Utils**: `loadScript`, `logger`.

## Структура
```
src/
  components/
    FullscreenToggle.tsx
    MapPanel.tsx
    OfflineOverlay.tsx
    VideoPanel.tsx
  hooks/
    useLocalStorage.ts
    useOnlineStatus.ts
  styles/
    index.css
  utils/
    loadScript.ts
    logger.ts
  App.tsx
  main.tsx
```

## Установка
```bash
npm install
```

## Настройка API ключей
Создайте `.env` на основе `.env.example`:
```bash
cp .env.example .env
```
Заполните:
- `VITE_YOUTUBE_API_KEY` — YouTube Data API v3.
- `VITE_YANDEX_MAPS_API_KEY` — Yandex Maps JS API.

## Запуск dev режима
```bash
npm run dev
```

## Сборка production
```bash
npm run build
```

## Тестирование
```bash
npm run test
npm run test:e2e
```

## Деплой
### Docker
```bash
docker build -t auto-display .
docker run -p 8080:80 auto-display
```

### Nginx
Скопируйте содержимое `dist/` в `/var/www/auto-display` и используйте конфиг из `nginx.conf`:
```bash
sudo cp -r dist/* /var/www/auto-display
sudo cp nginx.conf /etc/nginx/sites-available/auto-display
sudo ln -s /etc/nginx/sites-available/auto-display /etc/nginx/sites-enabled/auto-display
sudo nginx -t && sudo systemctl reload nginx
```

### Static hosting
Любой статический хостинг (S3, Cloudflare Pages, GitHub Pages). Достаточно загрузить содержимое `dist/`.

## Производственные рекомендации
- В Android WebView включите `setMediaPlaybackRequiresUserGesture(false)` для автозапуска.
- Включите `setDomStorageEnabled(true)` для сохранения состояния.
- Для стабильной геолокации убедитесь, что разрешения доступны на уровне системы.
