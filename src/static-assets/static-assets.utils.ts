import { randomUUID } from 'node:crypto';
import { extname, isAbsolute, join, posix } from 'node:path';

export const DEFAULT_STATIC_ASSETS_DIR = 'storage/static-assets';
export const DEFAULT_STATIC_ASSETS_ROUTE_PREFIX = 'static-assets';
export const DEFAULT_STATIC_ASSET_MAX_SIZE_MB = 20;

export const STATIC_ASSET_FILE_TYPES = [
  'image',
  'video',
  'audio',
  'document',
  'archive',
  'other',
] as const;

export type StaticAssetFileType = (typeof STATIC_ASSET_FILE_TYPES)[number];

const DOCUMENT_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.ms-excel',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
]);

const ARCHIVE_MIME_TYPES = new Set([
  'application/zip',
  'application/x-zip-compressed',
  'application/x-7z-compressed',
  'application/x-rar-compressed',
  'application/gzip',
  'application/x-tar',
]);

const EXTENSION_TO_MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  mp4: 'video/mp4',
  webm: 'video/webm',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  txt: 'text/plain',
  md: 'text/markdown',
  zip: 'application/zip',
  rar: 'application/x-rar-compressed',
  '7z': 'application/x-7z-compressed',
  gz: 'application/gzip',
  tar: 'application/x-tar',
};

const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico']);
const VIDEO_EXTENSIONS = new Set(['mp4', 'webm', 'mov', 'avi', 'mkv']);
const AUDIO_EXTENSIONS = new Set(['mp3', 'wav', 'aac', 'ogg', 'm4a', 'flac']);
const DOCUMENT_EXTENSIONS = new Set([
  'pdf',
  'doc',
  'docx',
  'xls',
  'xlsx',
  'ppt',
  'pptx',
  'txt',
  'md',
  'csv',
]);
const ARCHIVE_EXTENSIONS = new Set(['zip', 'rar', '7z', 'gz', 'tar']);

export function normalizeRoutePrefix(routePrefix?: string | null) {
  const normalized = routePrefix?.trim().replace(/^\/+|\/+$/g, '');
  return normalized || DEFAULT_STATIC_ASSETS_ROUTE_PREFIX;
}

export function resolveStaticAssetsRootDir(configuredDir?: string | null) {
  const normalized = configuredDir?.trim() || DEFAULT_STATIC_ASSETS_DIR;
  return isAbsolute(normalized) ? normalized : join(process.cwd(), normalized);
}

export function buildStaticAssetAccessPath(storagePath: string, routePrefix?: string | null) {
  return `/${normalizeRoutePrefix(routePrefix)}/${storagePath}`;
}

export function buildStaticAssetAccessUrl(
  storagePath: string,
  routePrefix?: string | null,
  publicBaseUrl?: string | null,
) {
  const accessPath = buildStaticAssetAccessPath(storagePath, routePrefix);
  const normalizedBase = publicBaseUrl?.trim().replace(/\/+$/g, '');
  return normalizedBase ? `${normalizedBase}${accessPath}` : accessPath;
}

export function resolveStaticAssetExtension(
  originalName?: string | null,
  mimetype?: string | null,
) {
  const byName = extname(originalName ?? '')
    .replace(/^\./, '')
    .trim()
    .toLowerCase();
  if (byName) {
    return byName.slice(0, 20);
  }

  const byMime = Object.entries(EXTENSION_TO_MIME).find(([, value]) => value === mimetype)?.[0];
  return byMime ?? 'bin';
}

export function resolveStaticAssetMimeType(mimetype?: string | null, extension?: string | null) {
  const normalizedMime = mimetype?.trim().toLowerCase();
  if (normalizedMime) {
    return normalizedMime.slice(0, 120);
  }

  const normalizedExtension = extension?.trim().toLowerCase();
  if (normalizedExtension && EXTENSION_TO_MIME[normalizedExtension]) {
    return EXTENSION_TO_MIME[normalizedExtension];
  }

  return 'application/octet-stream';
}

export function inferStaticAssetFileType(
  mimetype?: string | null,
  extension?: string | null,
): StaticAssetFileType {
  const normalizedMime = mimetype?.trim().toLowerCase();
  const normalizedExtension = extension?.trim().toLowerCase();

  if (
    normalizedMime?.startsWith('image/') ||
    (normalizedExtension && IMAGE_EXTENSIONS.has(normalizedExtension))
  ) {
    return 'image';
  }

  if (
    normalizedMime?.startsWith('video/') ||
    (normalizedExtension && VIDEO_EXTENSIONS.has(normalizedExtension))
  ) {
    return 'video';
  }

  if (
    normalizedMime?.startsWith('audio/') ||
    (normalizedExtension && AUDIO_EXTENSIONS.has(normalizedExtension))
  ) {
    return 'audio';
  }

  if (
    normalizedMime?.startsWith('text/') ||
    (normalizedMime && DOCUMENT_MIME_TYPES.has(normalizedMime)) ||
    (normalizedExtension && DOCUMENT_EXTENSIONS.has(normalizedExtension))
  ) {
    return 'document';
  }

  if (
    (normalizedMime && ARCHIVE_MIME_TYPES.has(normalizedMime)) ||
    (normalizedExtension && ARCHIVE_EXTENSIONS.has(normalizedExtension))
  ) {
    return 'archive';
  }

  return 'other';
}

export function buildStaticAssetStoragePath(extension?: string | null) {
  const now = new Date();
  const year = String(now.getFullYear());
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const ext = extension?.trim().toLowerCase();
  const fileName = `${Date.now()}-${randomUUID()}${ext ? `.${ext}` : ''}`;
  return posix.join(year, month, day, fileName);
}

export function buildStaticAssetAbsolutePath(rootDir: string, storagePath: string) {
  return join(rootDir, ...storagePath.split('/'));
}
