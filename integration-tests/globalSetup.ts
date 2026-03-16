import { execSync } from 'child_process';

export default async function globalSetup() {
  // Start MongoDB via docker-compose if not already running
  try {
    execSync('docker compose -f docker-compose.test.yml up -d', { stdio: 'inherit' });
    // Wait for MongoDB to be ready
    await new Promise((r) => setTimeout(r, 3000));
    console.log('✅ Test MongoDB started');
  } catch {
    console.log('MongoDB may already be running or docker not available');
  }
}
