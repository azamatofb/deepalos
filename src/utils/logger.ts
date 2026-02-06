export type LogLevel = "info" | "warn" | "error";

export const logger = {
  log(level: LogLevel, message: string, data?: unknown) {
    const payload = data ? [message, data] : [message];
    if (level === "error") {
      console.error("[auto-display]", ...payload);
      return;
    }
    if (level === "warn") {
      console.warn("[auto-display]", ...payload);
      return;
    }
    console.info("[auto-display]", ...payload);
  }
};
