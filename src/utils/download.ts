import { saveAs } from 'file-saver';
import JSZip from 'jszip';

export interface DeliveryDownloadFile {
  name?: string;
  url: string;
}

export interface DeliveryDownloadRecord {
  id: number | string;
  real_name?: string;
  mobile?: string;
  created_at?: string;
  delivery_files?: DeliveryDownloadFile[];
}

export const sanitizeDownloadName = (value: string) => value.replace(/[\\/:*?"<>|]/g, '_').trim();

export const formatDeliveryDateText = (value?: string) => {
  if (!value) {
    return '00000000';
  }
  const matched = value.match(/\d{4}[-/]\d{1,2}[-/]\d{1,2}/)?.[0];
  if (!matched) {
    return '00000000';
  }
  const [year, month, day] = matched.split(/[-/]/);
  return `${year}${month.padStart(2, '0')}${day.padStart(2, '0')}`;
};

export const getNameFromUrl = (url: string) => {
  try {
    const pathname = new URL(url).pathname;
    const segment = pathname.split('/').filter(Boolean).pop() || '';
    return decodeURIComponent(segment);
  } catch {
    return '';
  }
};

export const getBlobErrorMessage = async (blob: Blob) => {
  const contentType = blob.type.toLowerCase();
  if (!contentType.includes('application/json') && !contentType.startsWith('text/')) {
    return '';
  }

  const text = await blob.text();
  if (!text) {
    return '';
  }

  try {
    const parsed = JSON.parse(text);
    if (typeof parsed?.msg === 'string' && parsed.msg) {
      return parsed.msg;
    }
    if (typeof parsed?.message === 'string' && parsed.message) {
      return parsed.message;
    }
  } catch {
    return text;
  }

  return text;
};

export const downloadBlobFile = (blob: Blob, fileName: string) => {
  saveAs(blob, fileName);
};

export const withDuplicateSuffix = (fileName: string, index: number) => {
  if (index <= 1) {
    return fileName;
  }
  const dotIndex = fileName.lastIndexOf('.');
  if (dotIndex <= 0) {
    return `${fileName}_${index}`;
  }
  const name = fileName.slice(0, dotIndex);
  const ext = fileName.slice(dotIndex);
  return `${name}_${index}${ext}`;
};

export const getZipTimeText = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  const second = String(now.getSeconds()).padStart(2, '0');
  return `${year}_${month}_${day}_${hour}_${minute}_${second}`;
};

export const resolveDownloadUrl = (url: string, useDevProxy: boolean) => {
  if (!useDevProxy) {
    return url;
  }
  try {
    const parsed = new URL(url);
    return `/__download_proxy__${parsed.pathname}${parsed.search}`;
  } catch {
    return url;
  }
};

export const downloadDeliveryRecordsZip = async (options: {
  rows: DeliveryDownloadRecord[];
  taskTitle?: string;
  useDevProxy?: boolean;
}) => {
  const { rows, taskTitle, useDevProxy = false } = options;
  const zip = new JSZip();
  const usedNames = new Set<string>();
  const failedFiles: string[] = [];
  let addedCount = 0;

  await Promise.all(
    rows.flatMap((row, rowIndex) => {
      const files = Array.isArray(row.delivery_files) ? row.delivery_files : [];
      const namePart = sanitizeDownloadName(row.real_name || '未知姓名') || '未知姓名';
      const mobilePart = sanitizeDownloadName(row.mobile || '未知手机号') || '未知手机号';
      const datePart = formatDeliveryDateText(row.created_at);
      const folderSeq = String(rowIndex + 1).padStart(2, '0');
      const folderName = `${namePart}${mobilePart}${datePart}${folderSeq}`;
      return files
        .filter((file) => !!file.url)
        .map(async (file, fileIndex) => {
          const rawFileName = file.name || getNameFromUrl(file.url) || `文件_${fileIndex + 1}`;
          const safeFileName = sanitizeDownloadName(rawFileName) || `文件_${fileIndex + 1}`;
          let zipPath = `${folderName}/${safeFileName}`;
          let duplicateIndex = 1;
          while (usedNames.has(zipPath)) {
            duplicateIndex += 1;
            zipPath = `${folderName}/${withDuplicateSuffix(safeFileName, duplicateIndex)}`;
          }
          usedNames.add(zipPath);
          try {
            const response = await fetch(resolveDownloadUrl(file.url, useDevProxy));
            if (!response.ok) {
              throw new Error('fetch failed');
            }
            const blob = await response.blob();
            zip.file(zipPath, blob);
            addedCount += 1;
          } catch {
            failedFiles.push(zipPath);
          }
        });
    }),
  );

  if (addedCount <= 0) {
    return { addedCount, failedFiles };
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const safeTaskName = sanitizeDownloadName(taskTitle || '交付物') || '交付物';
  saveAs(zipBlob, `${safeTaskName}_${getZipTimeText()}.zip`);
  return { addedCount, failedFiles };
};
