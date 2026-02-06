import { useEffect, useState } from "react";

export default function FullscreenToggle() {
  const [isFullscreen, setIsFullscreen] = useState(
    () => Boolean(document.fullscreenElement)
  );

  useEffect(() => {
    const handler = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const toggle = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };

  return (
    <button
      type="button"
      onClick={() => void toggle()}
      className="rounded-full bg-slate-800 px-5 py-2 text-sm font-semibold"
    >
      {isFullscreen ? "Выход из Fullscreen" : "Fullscreen"}
    </button>
  );
}
