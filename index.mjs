import pg from 'pg';
import config from './config.mjs';
import readLiteDb from './litedb.mjs';
import migrate from './migrator.mjs';

console.info('Creating PostgreSQL Client...');
const client = new pg.Client(config('ConnectionStrings:SahneeBotModelContext'))
await client.connect();
console.info('Client created an connected to database.');

const liteDb = readLiteDb();
await migrate(client, liteDb);

console.info(' === SAHNEE-BOT-MIGRATOR RAN TO COMPLETION - PLEASE REVIEW THE LOG FOR POTENTIAL ERRORS === ');
console.info('GitHub: https://github.com/Sahnee-DE/sahnee-bot-migrator');

process.exit(0);
