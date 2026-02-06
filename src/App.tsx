import { useEffect, useMemo, useState } from "react";
import FullscreenToggle from "./components/FullscreenToggle";
import MapPanel from "./components/MapPanel";
import OfflineOverlay from "./components/OfflineOverlay";
import VideoPanel from "./components/VideoPanel";
import { useOnlineStatus } from "./hooks/useOnlineStatus";

export default function App() {
  const online = useOnlineStatus();
  const [playing, setPlaying] = useState(false);

  const shortcuts = useMemo(
    () => ({
      togglePlayback: () => window.dispatchEvent(new Event("video-toggle")),
      volumeUp: () => window.dispatchEvent(new Event("video-volume-up")),
      volumeDown: () => window.dispatchEvent(new Event("video-volume-down"))
    }),
    []
  );

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement) {
        return;
      }
      if (event.key === " ") {
        event.preventDefault();
        shortcuts.togglePlayback();
      }
      if (event.key.toLowerCase() === "p") {
        shortcuts.togglePlayback();
      }
      if (event.key.toLowerCase() === "f") {
        void document.documentElement.requestFullscreen();
      }
      if (event.key === "ArrowUp") {
        shortcuts.volumeUp();
      }
      if (event.key === "ArrowDown") {
        shortcuts.volumeDown();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [shortcuts]);

  return (
    <div className="relative flex h-screen w-screen flex-col bg-panel">
      <header className="flex items-center justify-between border-b border-slate-800 px-6 py-3">
        <div>
          <p className="text-xl font-semibold">Auto Display</p>
          <p className="text-sm text-slate-400">
            {online ? "Онлайн" : "Оффлайн"} · {playing ? "Видео" : "Пауза"}
          </p>
        </div>
        <div className="flex items-center gap-3 text-slate-300">
          <div className="text-xs">
            <p>Hotkeys</p>
            <p>Space/P: Play · ↑/↓: Volume · F: Fullscreen</p>
          </div>
          <FullscreenToggle />
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        <div className="w-2/5 border-r border-slate-800">
          <MapPanel online={online} />
        </div>
        <div className="w-3/5">
          <VideoPanel online={online} onPlaybackStateChange={setPlaying} />
        </div>
      </main>

      <OfflineOverlay show={!online} />
    </div>
  );
}
