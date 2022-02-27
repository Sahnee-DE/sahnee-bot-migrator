const pg = require('pg');
const config = require('./config');
const readLiteDb = require('./litedb');
const migrate = require('./migrator');

(async function() {
  console.info('Creating PostgreSQL Client...');
  const client = new pg.Client({
    connectionString: config('ConnectionStrings:SahneeBotModelContext'),
  });
  await client.connect();
  console.info('Client created an connected to database.');
  
  const liteDb = readLiteDb();
  await migrate(client, liteDb);
  
  console.info(' === SAHNEE-BOT-MIGRATOR RAN TO COMPLETION - PLEASE REVIEW THE LOG FOR POTENTIAL ERRORS === ');
  console.info('GitHub: https://github.com/Sahnee-DE/sahnee-bot-migrator');
  console.info('LiteDB.Studio: https://github.com/Sahnee-DE/LiteDB.Studio/releases/tag/v1.0.2-SAHNEE');
  
  process.exit(0);
})();
