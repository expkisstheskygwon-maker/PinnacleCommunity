const fs = require('fs');
const path = require('path');

const binPath = path.join('node_modules', '.bin', 'opennextjs-cloudflare');
const isWin = process.platform === "win32";

try {
  if (fs.existsSync(binPath) || fs.existsSync(binPath + '.cmd')) {
    const realBin = fs.realpathSync(binPath);
    
    // Create the wrapper script
    const wrapper = `#!/usr/bin/env node
const cp = require('child_process');
try {
  // Run the original OpenNext build
  cp.execSync('node ' + JSON.stringify(${JSON.stringify(realBin)}) + ' ' + process.argv.slice(2).join(' '), { stdio: 'inherit' });
  
  // If this was a build command, run our format script
  if (process.argv.includes('build')) {
    console.log('--- Running OpenNext Pages Formatter ---');
    cp.execSync('node scripts/cloudflare-pages-format.js', { stdio: 'inherit' });
  }
} catch (e) {
  process.exit(e.status || 1);
}
`;
    
    // Overwrite the original .bin executable (Cloudflare uses Linux so modifying the main file works)
    if (!isWin) {
      fs.writeFileSync(binPath, wrapper);
      fs.chmodSync(binPath, 0o755);
    } else {
      // On Windows locally, we might need to modify the .cmd file as well, or just skip it since the user's local build already uses pages:build
      console.log('Skipping bin wrapper on Windows local environment');
    }
    console.log('Successfully installed opennextjs-cloudflare wrapper hook!');
  }
} catch (e) {
  console.error('Failed to install wrapper:', e);
}
