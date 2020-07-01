import { Db, MongoClient } from "mongodb";

let _client: MongoClient;
let _db: Db;

const initializers: Array<(db: Db) => void> = [];

export async function connect(dbConn: string = process.env.MONGO_CONN, dbName: string = process.env.MONGO_DB): Promise<void> {
  try {
    _client = await MongoClient.connect(dbConn, { useNewUrlParser: true, useUnifiedTopology: true });
    _db = _client.db(dbName || /* istanbul ignore next */ process.env.MONGO_DB);
    await Promise.all(initializers.map(cb => cb(_db)));
  } catch (e) {
    /* istanbul ignore next */
    console.log(e);
  }
}

export async function disconnect(): Promise<void> {
  await _client.close();
  _client = null;
  _db = null;
}

export function initializeDb(cb: (db: Db) => Promise<void>) {
  initializers.push(cb);
}

// Don't need this yet
// export function client(): MongoClient {
//   return _client;
// }

export function db() {
  return _db;
}
