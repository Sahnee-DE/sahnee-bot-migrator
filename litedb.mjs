import config from './config.mjs';
import fs from 'fs';

/**
 * Reads all old LiteDB files.
 * @returns {Record<string, Record<string, any>[]>} All parsed data.
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
    const json = parseJson(str);
    acc[file] = json;
  }
  console.info('Done loading LiteDB files!');
  return acc;
}

/**
 * Parses a single LiteDB table string.
 * @param {string} str The DB string
 * @returns {Record<string, any>[]} The records of this file.
 */
function parseJson(str) {
  if (str.endsWith('\n/* Limit exceeded */\n') || str.endsWith('\n/* Limit exceeded */\r\n')) {
    throw new Error('Your database is too big (>1000 records) for the official LiteDB.Studio exporter. Please use our custom one at https://github.com/Sahnee-DE/LiteDB.Studio/releases/tag/v1.0.2-SAHNEE');
  }
  // The number comment (e.g. /* 42 */)
  const noComments = str.split(/^\/\*\s*\d+\s*\*\/$/gm);
  const jsonStr = '[' + noComments.filter(e => e).join(',') + ']';
  return JSON.parse(jsonStr);
}