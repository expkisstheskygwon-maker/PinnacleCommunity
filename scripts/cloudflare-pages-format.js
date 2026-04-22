const fs = require('fs');
const path = require('path');

const src = '.open-next';
const dest = path.join('.open-next', 'assets');

try {
  // Read all files/folders in .open-next
  const items = fs.readdirSync(src);
  
  // Move everything into .open-next/assets
  for (const item of items) {
    if (item !== 'assets') {
      const oldPath = path.join(src, item);
      const newPath = path.join(dest, item);
      fs.renameSync(oldPath, newPath);
    }
  }

  // Rename worker.js to _worker.js
  const workerPath = path.join(dest, 'worker.js');
  const newWorkerPath = path.join(dest, '_worker.js');
  if (fs.existsSync(workerPath)) {
    fs.renameSync(workerPath, newWorkerPath);
    console.log('Successfully structured OpenNext output for Cloudflare Pages!');
  } else {
    console.error('worker.js not found!');
  }
} catch (e) {
  console.error('Error structuring Cloudflare Pages output:', e);
  process.exit(1);
}
