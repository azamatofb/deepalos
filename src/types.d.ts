interface Window {
  YT?: typeof YT;
  onYouTubeIframeAPIReady?: () => void;
  ymaps?: typeof ymaps;
}

declare namespace YT {
  interface PlayerOptions {
    height?: string;
    width?: string;
    videoId?: string;
    playerVars?: Record<string, string | number | undefined>;
    events?: {
      onReady?: (event: PlayerEvent) => void;
      onStateChange?: (event: OnStateChangeEvent) => void;
      onError?: (event: { data: number }) => void;
    };
  }

  interface Player {
    playVideo: () => void;
    pauseVideo: () => void;
    mute: () => void;
    unMute: () => void;
    setVolume: (volume: number) => void;
    getVolume: () => number;
    loadVideoById: (videoId: string) => void;
    destroy: () => void;
    getIframe: () => HTMLIFrameElement;
  }

  interface PlayerEvent {
    target: Player;
  }

  interface OnStateChangeEvent {
    data: number;
    target: Player;
  }

  const Player: new (elementId: string, options: PlayerOptions) => Player;
  const PlayerState: {
    ENDED: number;
    PLAYING: number;
    PAUSED: number;
  };
}

declare namespace ymaps {
  interface MapOptions {
    center: number[];
    zoom: number;
    controls?: string[];
  }

  interface Map {
    setCenter: (center: number[]) => void;
    setZoom: (zoom: number) => void;
    events: {
      add: (event: string, handler: () => void) => void;
    };
    controls: {
      add: (control: unknown) => void;
    };
    geoObjects: {
      add: (obj: unknown) => void;
      removeAll: () => void;
    };
    getCenter: () => number[];
    getZoom: () => number;
  }

  interface MultiRoute {
    model: {
      setReferencePoints: (points: (string | number[])[]) => void;
    };
  }

  interface ControlKey {
    position?: { right?: number; top?: number; left?: number; bottom?: number };
  }

  const ready: (callback: () => void) => void;
  const Map: new (id: string, options: MapOptions) => Map;
  const control: {
    ZoomControl: new (options?: { position?: { right?: number; top?: number } }) => unknown;
    GeolocationControl: new (options?: { position?: { right?: number; top?: number } }) => unknown;
  };
  const multiRouter: {
    MultiRoute: new (
      options: { referencePoints: (string | number[])[]; params?: { routingMode?: string } },
      settings?: { boundsAutoApply?: boolean }
    ) => MultiRoute;
  };
}
