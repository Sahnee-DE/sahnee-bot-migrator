import config from './config.mjs';
import fs from 'fs';

/**
 * Reads all old LiteDB files.
 * @returns {Record<string, Record<string, any>>} All parsed data.
 */
export default function readLiteDb() {
  const files = config('LiteDb');
  console.info('Now loading LiteDB files', Object.keys(files));
  const acc = {};
  for(const file in files) {
    console.debug(' ... Reading:', file);
    const path = files[file];
    const data = fs.readFileSync(path);
    const str = data.toString();
    const json = JSON.parse(str);
    acc[file] = json;
  }
  console.info('Done loading LiteDB files!');
  return acc;
}