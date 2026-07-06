import RNFS from 'react-native-fs';

import { buildExportData } from './buildExportData';

export async function exportToJSON(): Promise<string> {
  const data = buildExportData();

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const fileName = `licka-backup-${timestamp}.json`;
  const filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

  await RNFS.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');

  return filePath;
}
