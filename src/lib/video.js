// Shared helpers for the video section (public reel/wall + admin panel).
//
// Videos are uploaded in whatever shape the camera produced them — a vertical
// 9:16 reel, a 16:9 edit, a square cut. Nothing here ever crops: we keep the
// native ratio around so every surface can letterbox instead of cutting.

/** Fallback used when a video was recorded before we started storing metadata. */
export const DEFAULT_RATIO = 16 / 9;

/** Native width/height ratio of a stored video. */
export function videoRatio(v) {
  const w = Number(v?.width) || 0;
  const h = Number(v?.height) || 0;
  if (w > 0 && h > 0) return w / h;
  return DEFAULT_RATIO;
}

/** 'vertical' | 'square' | 'horizontal' — drives layout, never cropping. */
export function orientationOf(v) {
  const r = videoRatio(v);
  if (r < 0.95) return 'vertical';
  if (r > 1.05) return 'horizontal';
  return 'square';
}

export const ORIENTATION_LABEL = {
  vertical: 'Vertical',
  square: 'Cuadrado',
  horizontal: 'Horizontal',
};

/** m:ss — the format every player uses for short-form clips. */
export function formatDuration(seconds) {
  const total = Math.max(0, Math.round(Number(seconds) || 0));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** Human-readable file size for the admin upload list. */
export function formatBytes(bytes) {
  const n = Number(bytes) || 0;
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
