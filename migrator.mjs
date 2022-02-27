import pg from 'pg';

/**
 * 
 * @param {pg.Client} db The PostgreSQL database.
 * @param {Record<string, Record<string, any>>} json The JSON data from the old database.
 */
export default async function migrate(db, json) {
  console.info('Now migrating data to PostgreSQL ' + db.database);
  console.debug('All data is', json);
}
