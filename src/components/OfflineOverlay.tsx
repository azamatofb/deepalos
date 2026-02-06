type OfflineOverlayProps = {
  show: boolean;
};

export default function OfflineOverlay({ show }: OfflineOverlayProps) {
  if (!show) {
    return null;
  }

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/80 text-center">
      <div className="max-w-md rounded-2xl bg-slate-900 p-6 text-xl">
        <p className="mb-2 font-semibold">Нет подключения к интернету</p>
        <p className="text-base text-slate-300">
          Проверьте сеть. Видео и карта будут доступны после восстановления соединения.
        </p>
      </div>
    </div>
  );
}
