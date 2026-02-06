import { logger } from "./logger";

const loadedScripts = new Map<string, Promise<void>>();

export function loadScript(src: string): Promise<void> {
  if (loadedScripts.has(src)) {
    return loadedScripts.get(src)!;
  }

  const promise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = (error) => {
      logger.log("error", `Failed to load script ${src}`, error);
      reject(new Error(`Failed to load script ${src}`));
    };
    document.body.appendChild(script);
  });

  loadedScripts.set(src, promise);
  return promise;
}
