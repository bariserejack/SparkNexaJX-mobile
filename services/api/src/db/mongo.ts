import mongoose from 'mongoose';
import { config } from '../config.js';

export async function connectMongo() {
  if (mongoose.connection.readyState === 1) {
    return;
  }
  await mongoose.connect(config.mongodbUri);
}

export async function checkMongo() {
  const state = mongoose.connection.readyState;
  if (state !== 1) {
    return false;
  }
  const admin = mongoose.connection.db?.admin();
  if (!admin) {
    return false;
  }
  const ping = await admin.ping();
  return ping.ok === 1;
}
