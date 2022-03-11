const pg = require('pg');

/**
 * 
 * @param {pg.Client} db The PostgreSQL database.
 * @param {Record<string, Record<string, any>[]>} json The JSON data from the old database.
 */
module.exports = async function migrate(db, json) {
  console.info('Now migrating data to PostgreSQL ' + db.database);

  await transaction(db, async db => {
    console.info('Migrating ' + json.warnings?.length + ' warnings...');
    // WARNINGS
    await db.query(`DELETE FROM "Warnings";`);
    for(const warning of json.warnings) {
      console.debug(' ... Parsing warnings (' + warning._id + ')');
      const warningSnowflake = guidToSnowflake(warning._id);
      console.debug(' ... Inserting Warnings (' + warningSnowflake + ')');
      await db.query(`
        INSERT INTO "Warnings" ("Id", "GuildId", "UserId", "Time", "IssuerUserId", "Reason", "Number", "Type")
        VALUES                 ($1,   $2,        $3,       $4,     $5,             $6,       $7,       $8    );
      `, [
        warningSnowflake,
        $numberLong(warning.GuildId),
        $numberLong(warning.To),
        $date(warning.Time),
        $numberLong(warning.From),
        warning.Reason || "/",
        $numberLong(warning.Number),
        warning.WarningType === 'Warning' ? 1 : 2,
      ]);
    }
    // CHANGELOGS
    console.info('Migrating ' + json.warningbot_changelog?.length + ' changelogs...');
    await db.query(`DELETE FROM "GuildStates";`);
    const changelogGuilds = new Map();
    for (const changelog of json.warningbot_changelog) {
      console.debug(' ... Parsing warningbot_changelog (' + changelog._id + ')');
      const guildId = $numberLong(changelog.GuildId);
      const version = changelog.LatestVersion.match(/\d+\.\d+.\d+/)[0];
      const oldVersion = changelogGuilds.get(guildId);
      if (!oldVersion || version > oldVersion) {
        changelogGuilds.set(guildId, version);
      }
    }
    for (const [guildId, version] of changelogGuilds) {
      console.debug(' ... Inserting GuildStates ' + guildId);
      await db.query(`
        INSERT INTO "GuildStates" ("GuildId", "SetRoles", "LastChangelogVersion")
        VALUES                    ($1,        true,       $2                    );
      `, [
        guildId,
        version,
      ]);
    }
    // ROLES
    console.info('Migrating ' + json.warningbot_roles?.length + ' roles...');
    await db.query(`DELETE FROM "Roles";`);
    for (const role of json.warningbot_roles) {
      console.debug(' ... Parsing warningbot_roles (' + role._id + ')');
      const guildId = $numberLong(role.GuildId);
      const roleId = $numberLong(role.RoleId);
      const roleType = role.RoleType;
      let roleEnum = 0b00;
      switch(roleType) {
        case 'WarningBotMod':
          roleEnum |= 0b10;
          break;
        case 'WarningBotAdmin':
          roleEnum |= 0b01;
          break;
        default:
          throw new Error('Unknown role type ' + roleType);
      }
      console.debug(' ... Inserting Roles (' + guildId + ',' + roleId + ')');
      await db.query(`
        INSERT INTO "Roles" ("GuildId", "RoleId", "RoleType")
        VALUES              ($1,        $2,       $3        );
      `, [
        guildId,
        roleId,
        roleEnum,
      ]);
    }
    // STATES
    console.info('Migrating ' + json.warningbot_state?.length + ' states...');
    await db.query(`DELETE FROM "UserGuildStates";`);
    for (const state of json.warningbot_state) {
      console.debug(' ... Parsing warningbot_state (' + state._id + ')');
      const guildId = $numberLong(state.GuildId);
      const userId = $numberLong(state.UserId);
      const number = $numberLong(state.Number);
      console.debug(' ... Inserting UserGuildStates (' + guildId + ',' + userId + ')');
      await db.query(`
        INSERT INTO "UserGuildStates" ("GuildId", "UserId", "WarningNumber", "MessageOptOut", "HasReceivedOptOutHint")
        VALUES                        ($1,        $2,       $3,              false,           false                  );
      `, [
        guildId,
        userId,
        number,
      ]);
    }
  })
}

/**
 * Wraps the given function in a transaction
 * @param {pg.Client} db The PostgreSQL database.
 * @param {(db: pg.Client) => Promise<void>} fn The transaction function.
 */
async function transaction(db, fn) {
  console.debug('Beginning transaction...');
  await db.query('BEGIN TRANSACTION');
  try {
    await fn(db);
    console.debug('Committing transaction...');
    await db.query('COMMIT');
  } catch(e) {
    console.debug('Rollbacking transaction...', e);
    await db.query('ROLLBACK');
    throw e;
  }
}

/**
 * Gets a long from the data.
 * @param {{$numberLong: string}} of The long string
 * @returns {string} The long as a string since JS has not enough bits.
 */
function $numberLong(of) {
  return of.$numberLong;
}

/**
 * Gets a data from the data.
 * @param {{$date: string}} of The date string
 * @returns {Date} The date.
 */
function $date(of) {
  return new Date(of.$date);
}

/**
 * Converts a GUID to a snowflake.
 * @param {string} guid The GUID
 * @returns {number} The pseudo snowflake.
 */
function guidToSnowflake(guid) {
  return guid.split('-').map(s => parseInt(s, 16)).reduce((a, n) => a + n, 0);
}
