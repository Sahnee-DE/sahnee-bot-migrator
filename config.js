const fs = require('fs');

/**
 * Reads the config file from disk.
 * @returns {Record<string, any>} The config JSON.
 */
function readConfig() {
  const data = fs.readFileSync(process.env.SBM_APPSETTINGS || './appsettings.json');
  const str = data.toString();
  return JSON.parse(str);
}

/**
 * The current config values.
 */
let config = readConfig();

/**
 * Gets the config value at the given path.
 * @param {string} path The path
 * @returns {any} The config value.
 * @example
 * get('MigratorSettings:TestSetting')
 */
module.exports = function get(path) {
  const els = path.split(':');
  let current = config;
  for (let i = 0; i < els.length; i++) {
    current = current[els[i]];
    if (current == undefined) {
      return undefined;
    }
  }
  return current;
}
