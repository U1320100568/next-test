#!/usr/bin/env ts-node
import 'dotenv/config';
import mongoose from 'mongoose';
import { AdminUser } from '../src/lib/models/AdminUser';
import { hashPassword } from '../src/lib/password';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'next-test';

async function connect() {
  await mongoose.connect(`${MONGODB_URI}/${MONGODB_DB_NAME}`);
}

function parseArgs() {
  const args = process.argv.slice(2);
  const command = args[0];
  const opts: Record<string, string> = {};
  for (let i = 1; i < args.length; i += 2) {
    if (args[i].startsWith('--')) opts[args[i].slice(2)] = args[i + 1];
  }
  return { command, opts };
}

async function main() {
  const { command, opts } = parseArgs();
  await connect();

  switch (command) {
    case 'create': {
      const { username, email, password } = opts;
      if (!username || !email || !password) {
        console.error('用法: create --username <u> --email <e> --password <p>');
        process.exit(1);
      }
      const hashed = await hashPassword(password);
      const admin = await AdminUser.create({ username, email, password: hashed });
      console.log('管理員建立成功:', { id: String(admin._id), username: admin.username, email: admin.email });
      break;
    }
    case 'list': {
      const admins = await AdminUser.find().select('-password');
      if (admins.length === 0) {
        console.log('沒有管理員帳號');
      } else {
        admins.forEach((a) =>
          console.log(`ID: ${a._id} | 帳號: ${a.username} | 信箱: ${a.email}`)
        );
      }
      break;
    }
    case 'update': {
      const { id, email, password } = opts;
      if (!id) { console.error('用法: update --id <id> [--email <e>] [--password <p>]'); process.exit(1); }
      const admin = await AdminUser.findById(id);
      if (!admin) { console.error('管理員不存在'); process.exit(1); }
      if (email) admin.email = email;
      if (password) admin.password = await hashPassword(password);
      await admin.save();
      console.log('管理員更新成功:', { id: String(admin._id), username: admin.username, email: admin.email });
      break;
    }
    case 'delete': {
      const { id } = opts;
      if (!id) { console.error('用法: delete --id <id>'); process.exit(1); }
      const admin = await AdminUser.findByIdAndDelete(id);
      if (!admin) { console.error('管理員不存在'); process.exit(1); }
      console.log('管理員已刪除:', { id: String(admin._id), username: admin.username });
      break;
    }
    default:
      console.log('指令: create | list | update | delete');
  }

  await mongoose.disconnect();
}

main().catch(console.error);
