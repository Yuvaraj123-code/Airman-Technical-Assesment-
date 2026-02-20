/* eslint-disable no-console */
const { execSync } = require('child_process');

try {
  execSync('npx prisma db push --schema=src/prisma/schema.prisma', { stdio: 'inherit' });
  execSync('npx prisma generate --schema=src/prisma/schema.prisma', { stdio: 'inherit' });
  console.log('Migration and generate completed');
} catch (error) {
  console.error('Migration failed', error);
  process.exit(1);
}
