const fs = require('fs');
const path = require('path');

const binPath = path.join('node_modules', '.bin', 'opennextjs-cloudflare');
const isWin = process.platform === "win32";

try {
  if (fs.existsSync(binPath) || fs.existsSync(binPath + '.cmd')) {
    const realBin = fs.realpathSync(binPath);
    const origBin = realBin.replace(/\.js$/, '.orig.js');
    
    // Rename original file if we haven't already
    if (!fs.existsSync(origBin)) {
      fs.renameSync(realBin, origBin);
    }
    
    // Create the wrapper script (using ESM syntax since package has "type": "module")
    const wrapper = `#!/usr/bin/env node
import cp from 'child_process';
import process from 'process';

try {
  // Run the original OpenNext build
  cp.execSync('node ' + JSON.stringify(${JSON.stringify(origBin)}) + ' ' + process.argv.slice(2).join(' '), { stdio: 'inherit' });
  
  // If this was a build command, run our format script
  if (process.argv.includes('build')) {
    console.log('--- Running OpenNext Pages Formatter ---');
    cp.execSync('node scripts/cloudflare-pages-format.js', { stdio: 'inherit' });
  }
} catch (e) {
  process.exit(e.status || 1);
}
`;
    
    // Write the wrapper to the real file location so the symlink points to it
    if (!isWin) {
      fs.writeFileSync(realBin, wrapper);
      fs.chmodSync(realBin, 0o755);
    } else {
      console.log('Skipping bin wrapper on Windows local environment');
    }
    console.log('Successfully installed opennextjs-cloudflare wrapper hook!');
  }
} catch (e) {
  console.error('Failed to install wrapper:', e);
}
