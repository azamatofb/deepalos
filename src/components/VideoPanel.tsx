import { useEffect, useMemo, useRef, useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { logger } from "../utils/logger";
import { loadScript } from "../utils/loadScript";

const DEFAULT_VIDEO_ID = "dQw4w9WgXcQ";

type VideoItem = {
  id: string;
  title: string;
  channel: string;
  thumbnail: string;
};

type VideoPanelProps = {
  online: boolean;
  onPlaybackStateChange: (playing: boolean) => void;
};

export default function VideoPanel({ online, onPlaybackStateChange }: VideoPanelProps) {
  const [videoId, setVideoId] = useLocalStorage("lastVideoId", DEFAULT_VIDEO_ID);
  const [volume, setVolume] = useLocalStorage("playerVolume", 70);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const playerRef = useRef<YT.Player | null>(null);

  const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;

  const playerContainerId = useMemo(() => `youtube-player-${Math.random().toString(36).slice(2)}` , []);

  useEffect(() => {
    if (!online) {
      return;
    }

    let isMounted = true;

    const initPlayer = async () => {
      setLoading(true);
      setError(null);
      try {
        await loadScript("https://www.youtube.com/iframe_api");

        await new Promise<void>((resolve) => {
          if (window.YT?.Player) {
            resolve();
            return;
          }
          window.onYouTubeIframeAPIReady = () => resolve();
        });

        if (!isMounted) {
          return;
        }

        if (playerRef.current) {
          playerRef.current.destroy();
        }

        playerRef.current = new window.YT.Player(playerContainerId, {
          height: "100%",
          width: "100%",
          videoId,
          playerVars: {
            autoplay: 1,
            controls: 1,
            rel: 0,
            modestbranding: 1
          },
          events: {
            onReady: (event) => {
              event.target.setVolume(volume);
              event.target.playVideo();
              const iframe = event.target.getIframe();
              iframe.setAttribute(
                "sandbox",
                "allow-scripts allow-same-origin allow-presentation allow-popups"
              );
              iframe.setAttribute("allow", "autoplay; encrypted-media; fullscreen");
              iframe.setAttribute("allowfullscreen", "true");
              setLoading(false);
            },
            onStateChange: (event) => {
              const isPlaying = event.data === window.YT.PlayerState.PLAYING;
              setPlaying(isPlaying);
              onPlaybackStateChange(isPlaying);
            },
            onError: (event) => {
              logger.log("error", "YouTube player error", event.data);
              setError("Ошибка плеера YouTube. Проверьте подключение.");
              setLoading(false);
            }
          }
        });
      } catch (err) {
        logger.log("error", "Failed to initialize YouTube player", err);
        setError("Не удалось загрузить YouTube плеер.");
        setLoading(false);
      }
    };

    void initPlayer();

    return () => {
      isMounted = false;
    };
  }, [online, playerContainerId, videoId, volume, onPlaybackStateChange]);

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!searchQuery.trim()) {
      return;
    }
    if (!apiKey) {
      setError("Не задан API ключ YouTube Data API.");
      return;
    }

    try {
      setError(null);
      const params = new URLSearchParams({
        part: "snippet",
        type: "video",
        maxResults: "5",
        q: searchQuery,
        key: apiKey
      });
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?${params.toString()}`
      );
      if (!response.ok) {
        throw new Error("Search request failed");
      }
      const data = (await response.json()) as {
        items: {
          id: { videoId: string };
          snippet: { title: string; channelTitle: string; thumbnails: { medium: { url: string } } };
        }[];
      };
      const mapped = data.items.map((item) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        channel: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails.medium.url
      }));
      setResults(mapped);
    } catch (err) {
      logger.log("error", "YouTube search failed", err);
      setError("Ошибка поиска YouTube. Проверьте API ключ.");
    }
  };

  const handleSelectVideo = (id: string) => {
    setVideoId(id);
    playerRef.current?.loadVideoById(id);
  };

  const handleToggle = () => {
    if (!playerRef.current) {
      return;
    }
    if (playing) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(event.target.value);
    setVolume(newVolume);
    playerRef.current?.setVolume(newVolume);
  };

  useEffect(() => {
    const handleToggleEvent = () => handleToggle();
    const handleVolumeUp = () => {
      const next = Math.min(100, volume + 5);
      setVolume(next);
      playerRef.current?.setVolume(next);
    };
    const handleVolumeDown = () => {
      const next = Math.max(0, volume - 5);
      setVolume(next);
      playerRef.current?.setVolume(next);
    };

    window.addEventListener("video-toggle", handleToggleEvent);
    window.addEventListener("video-volume-up", handleVolumeUp);
    window.addEventListener("video-volume-down", handleVolumeDown);
    return () => {
      window.removeEventListener("video-toggle", handleToggleEvent);
      window.removeEventListener("video-volume-up", handleVolumeUp);
      window.removeEventListener("video-volume-down", handleVolumeDown);
    };
  }, [volume]);

  return (
    <section className="flex h-full flex-col gap-4 p-4">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">YouTube</h1>
        <button
          type="button"
          onClick={handleToggle}
          className="rounded-full bg-accent px-6 py-2 text-lg font-semibold text-white shadow"
        >
          {playing ? "Pause" : "Play"}
        </button>
      </header>

      <form onSubmit={handleSearch} className="flex gap-3">
        <input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Поиск видео"
          className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-lg"
        />
        <button
          type="submit"
          className="rounded-xl bg-slate-800 px-5 py-3 text-lg"
        >
          Искать
        </button>
      </form>

      <div className="flex flex-1 flex-col gap-3 overflow-hidden">
        <div className="relative flex-1 overflow-hidden rounded-2xl bg-black">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-lg">
              Загрузка видео...
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-lg text-red-200">
              {error}
            </div>
          )}
          <div id={playerContainerId} className="h-full w-full" />
        </div>

        <div className="flex items-center gap-4">
          <label className="text-lg">Громкость</label>
          <input
            type="range"
            min={0}
            max={100}
            value={volume}
            onChange={handleVolumeChange}
            className="flex-1 accent-accent"
          />
          <span className="w-12 text-right text-lg">{volume}</span>
        </div>

        <div className="grid grid-cols-2 gap-3 overflow-y-auto pr-2">
          {results.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelectVideo(item.id)}
              className="flex gap-3 rounded-xl bg-slate-900 p-3 text-left hover:bg-slate-800"
            >
              <img src={item.thumbnail} alt="" className="h-16 w-28 rounded-lg object-cover" />
              <div className="flex flex-1 flex-col justify-between">
                <p className="max-h-10 overflow-hidden text-ellipsis text-base font-semibold">
                  {item.title}
                </p>
                <span className="text-sm text-slate-400">{item.channel}</span>
              </div>
            </button>
          ))}
          {!results.length && (
            <div className="col-span-2 text-slate-500">
              Введите запрос, чтобы найти видео.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
