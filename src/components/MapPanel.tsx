import { useEffect, useRef, useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { loadScript } from "../utils/loadScript";
import { logger } from "../utils/logger";

const DEFAULT_CENTER: number[] = [55.751244, 37.618423];
const DEFAULT_ZOOM = 10;

type MapPanelProps = {
  online: boolean;
};

export default function MapPanel({ online }: MapPanelProps) {
  const [mapCenter, setMapCenter] = useLocalStorage("mapCenter", DEFAULT_CENTER);
  const [mapZoom, setMapZoom] = useLocalStorage("mapZoom", DEFAULT_ZOOM);
  const [routeFrom, setRouteFrom] = useLocalStorage("routeFrom", "");
  const [routeTo, setRouteTo] = useLocalStorage("routeTo", "");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<ymaps.Map | null>(null);
  const routeRef = useRef<ymaps.MultiRoute | null>(null);

  const apiKey = import.meta.env.VITE_YANDEX_MAPS_API_KEY;

  useEffect(() => {
    if (!online) {
      return;
    }

    let mounted = true;

    const initMap = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!apiKey) {
          setError("Не задан API ключ Yandex Maps.");
          setLoading(false);
          return;
        }
        await loadScript(`https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`);
        await new Promise<void>((resolve) => window.ymaps?.ready(resolve));

        if (!mounted) {
          return;
        }

        if (!mapRef.current) {
          mapRef.current = new window.ymaps.Map("map-container", {
            center: mapCenter,
            zoom: mapZoom,
            controls: []
          });

          const zoomControl = new window.ymaps.control.ZoomControl({
            position: { right: 16, top: 120 }
          });
          const geoControl = new window.ymaps.control.GeolocationControl({
            position: { right: 16, top: 16 }
          });
          mapRef.current.controls.add(zoomControl);
          mapRef.current.controls.add(geoControl);

          mapRef.current.events.add("boundschange", () => {
            if (!mapRef.current) {
              return;
            }
            setMapCenter(mapRef.current.getCenter());
            setMapZoom(mapRef.current.getZoom());
          });
        }

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const center = [pos.coords.latitude, pos.coords.longitude];
              mapRef.current?.setCenter(center);
              setMapCenter(center);
            },
            () => {
              logger.log("warn", "Geolocation permission denied");
              setError("Не удалось получить геолокацию.");
            },
            { enableHighAccuracy: true, timeout: 5000 }
          );
        } else {
          setError("Геолокация недоступна.");
        }

        setLoading(false);
      } catch (err) {
        logger.log("error", "Failed to init Yandex map", err);
        setError("Не удалось загрузить карту.");
        setLoading(false);
      }
    };

    void initMap();

    return () => {
      mounted = false;
    };
  }, [apiKey, mapCenter, mapZoom, online, setMapCenter, setMapZoom]);

  useEffect(() => {
    if (!mapRef.current || !routeFrom || !routeTo) {
      return;
    }
    if (routeRef.current) {
      routeRef.current.model.setReferencePoints([routeFrom, routeTo]);
      return;
    }
    routeRef.current = new window.ymaps.multiRouter.MultiRoute(
      {
        referencePoints: [routeFrom, routeTo],
        params: { routingMode: "auto" }
      },
      { boundsAutoApply: true }
    );
    mapRef.current.geoObjects.add(routeRef.current);
  }, [routeFrom, routeTo]);

  const handleRoute = (event: React.FormEvent) => {
    event.preventDefault();
    if (!routeFrom || !routeTo || !mapRef.current) {
      return;
    }
    if (routeRef.current) {
      routeRef.current.model.setReferencePoints([routeFrom, routeTo]);
      return;
    }
    routeRef.current = new window.ymaps.multiRouter.MultiRoute(
      {
        referencePoints: [routeFrom, routeTo],
        params: { routingMode: "auto" }
      },
      { boundsAutoApply: true }
    );
    mapRef.current.geoObjects.add(routeRef.current);
  };

  return (
    <section className="flex h-full flex-col gap-4 p-4">
      <header className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Yandex Map</h2>
        <div className="text-sm text-slate-400">Touch режим</div>
      </header>

      <form onSubmit={handleRoute} className="flex flex-col gap-3">
        <div className="flex gap-3">
          <input
            value={routeFrom}
            onChange={(event) => setRouteFrom(event.target.value)}
            placeholder="Откуда"
            className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-lg"
          />
          <input
            value={routeTo}
            onChange={(event) => setRouteTo(event.target.value)}
            placeholder="Куда"
            className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-lg"
          />
        </div>
        <button
          type="submit"
          className="rounded-xl bg-slate-800 px-5 py-3 text-lg"
        >
          Построить маршрут
        </button>
      </form>

      <div className="relative flex-1 overflow-hidden rounded-2xl bg-slate-900">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70 text-lg">
            Загрузка карты...
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70 text-red-200">
            {error}
          </div>
        )}
        <div id="map-container" className="h-full w-full" />
      </div>
    </section>
  );
}
