import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Check where we are executing from
const inRoot = fs.existsSync('./frontend/src');

if (inRoot) {
  console.log('Building SurfTest frontend from root...');
  execSync('npm --prefix frontend run build', { stdio: 'inherit' });

  // Also mirror frontend/dist to root ./dist so both paths work for any Vercel configuration
  try {
    if (fs.existsSync('./frontend/dist')) {
      fs.cpSync('./frontend/dist', './dist', { recursive: true, force: true });
      console.log('Synchronized build output to ./dist');
    }
  } catch (err) {
    console.warn('Notice:', err.message);
  }
} else {
  console.log('Building SurfTest directly inside frontend directory...');
  execSync('npx vite build', { stdio: 'inherit' });
}
