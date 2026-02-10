const IMAGE_EXT = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg']);
const VIDEO_EXT = new Set(['mp4', 'webm', 'mov', 'avi', 'm4v', 'mkv']);

const cleanPath = (value: string) => value.split('#')[0].split('?')[0];

const getExt = (value: string) => {
  const clean = cleanPath(value);
  const idx = clean.lastIndexOf('.');
  if (idx === -1) {
    return '';
  }
  return clean.slice(idx + 1).toLowerCase();
};

const getNameFromUrl = (url: string) => {
  const clean = cleanPath(url);
  const name = clean.split('/').pop() || '';
  try {
    return decodeURIComponent(name);
  } catch {
    return name;
  }
};

const resolveKind = (fileNameOrUrl: string) => {
  const ext = getExt(fileNameOrUrl);
  if (IMAGE_EXT.has(ext)) {
    return 'image';
  }
  if (VIDEO_EXT.has(ext)) {
    return 'video';
  }
  return 'file';
};

const isImage = (fileNameOrUrl: string) => resolveKind(fileNameOrUrl) === 'image';

const getFileIconName = (ext: string) => {
  if (!ext) {
    return 'file-unknown';
  }
  const normalized = ext.toLowerCase();
  if (['pdf'].includes(normalized)) {
    return 'file-pdf';
  }
  if (['doc', 'docx', 'wps'].includes(normalized)) {
    return 'file-word';
  }
  if (['xls', 'xlsx', 'csv', 'et'].includes(normalized)) {
    return 'file-excel';
  }
  if (['ppt', 'pptx', 'dps'].includes(normalized)) {
    return 'file-powerpoint';
  }
  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'].includes(normalized)) {
    return 'file-zip';
  }
  if (['mp3', 'wav', 'flac', 'aac', 'm4a', 'ogg'].includes(normalized)) {
    return 'file-music';
  }
  if (
    [
      'js',
      'ts',
      'jsx',
      'tsx',
      'json',
      'xml',
      'yml',
      'yaml',
      'html',
      'css',
      'scss',
      'less',
      'md',
      'txt',
      'log',
    ].includes(normalized)
  ) {
    return 'file-code';
  }
  if (['psd', 'ai', 'sketch', 'fig', 'xd'].includes(normalized)) {
    return 'file-image';
  }
  if (['apk', 'exe', 'dmg', 'pkg', 'msi', 'deb', 'rpm'].includes(normalized)) {
    return 'file-safety';
  }
  return 'file-unknown';
};

export { getExt, getFileIconName, getNameFromUrl, resolveKind, isImage };
