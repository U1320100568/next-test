#!/usr/bin/env ts-node
import 'dotenv/config';
import mongoose from 'mongoose';
import { User } from '../src/lib/models/User';
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
      const user = await User.create({ username, email, password: hashed });
      console.log('使用者建立成功:', { id: String(user._id), username: user.username, email: user.email });
      break;
    }
    case 'list': {
      const users = await User.find().select('-password');
      if (users.length === 0) {
        console.log('沒有使用者帳號');
      } else {
        users.forEach((u) =>
          console.log(`ID: ${u._id} | 帳號: ${u.username} | 信箱: ${u.email}`)
        );
      }
      break;
    }
    case 'update': {
      const { id, email, password } = opts;
      if (!id) { console.error('用法: update --id <id> [--email <e>] [--password <p>]'); process.exit(1); }
      const user = await User.findById(id);
      if (!user) { console.error('使用者不存在'); process.exit(1); }
      if (email) user.email = email;
      if (password) user.password = await hashPassword(password);
      await user.save();
      console.log('使用者更新成功:', { id: String(user._id), username: user.username, email: user.email });
      break;
    }
    case 'delete': {
      const { id } = opts;
      if (!id) { console.error('用法: delete --id <id>'); process.exit(1); }
      const user = await User.findByIdAndDelete(id);
      if (!user) { console.error('使用者不存在'); process.exit(1); }
      console.log('使用者已刪除:', { id: String(user._id), username: user.username });
      break;
    }
    default:
      console.log('指令: create | list | update | delete');
  }

  await mongoose.disconnect();
}

main().catch(console.error);
