import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';

if (!MONGODB_URI) {
  console.warn('MONGODB_URI not set. Database operations will fail.');
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseConn: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined;
}

let cached = global.mongooseConn;

if (!cached) {
  cached = global.mongooseConn = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached!.conn) return cached!.conn;
  if (!cached!.promise) {
    const opts = {
      bufferCommands: false,
      dbName: process.env.MONGODB_DB || undefined,
    } as any;
    cached!.promise = mongoose.connect(MONGODB_URI, opts).then((m) => m);
  }
  cached!.conn = await cached!.promise;
  return cached!.conn;
}
