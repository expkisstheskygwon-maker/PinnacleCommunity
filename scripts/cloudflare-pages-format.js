const fs = require('fs');
const path = require('path');

const src = '.open-next';
const dest = path.join('.vercel', 'output', 'static');

// Ensure destination exists and is empty
if (fs.existsSync(dest)) {
  fs.rmSync(dest, { recursive: true, force: true });
}
fs.mkdirSync(dest, { recursive: true });

// Copy assets first
const openNextAssets = path.join('.open-next', 'assets');
if (fs.existsSync(openNextAssets)) {
  const assets = fs.readdirSync(openNextAssets);
  for (const item of assets) {
    fs.cpSync(path.join(openNextAssets, item), path.join(dest, item), { recursive: true });
  }
}

try {
  // Read all files/folders in .open-next
  const items = fs.readdirSync(src);
  
  // Move everything into .vercel/output/static
  for (const item of items) {
    if (item !== 'assets') {
      const oldPath = path.join(src, item);
      const newPath = path.join(dest, item);
      fs.cpSync(oldPath, newPath, { recursive: true });
    }
  }

  // Rename worker.js to _worker.js
  const workerPath = path.join(dest, 'worker.js');
  const newWorkerPath = path.join(dest, '_worker.js');
  if (fs.existsSync(workerPath)) {
    fs.renameSync(workerPath, newWorkerPath);
  }
  
  // Create _routes.json to ensure static files bypass the worker
  const routesJsonPath = path.join(dest, '_routes.json');
  const staticExcludes = [
    '/_next/static/*'
  ];
  
  // Exclude all files in the root (like favicon.ico, images, etc.)
  try {
    const destItems = fs.readdirSync(dest);
    for (const item of destItems) {
      const itemPath = path.join(dest, item);
      if (fs.statSync(itemPath).isFile() && item !== '_worker.js' && item !== '_routes.json') {
        staticExcludes.push(`/${item}`);
      } else if (fs.statSync(itemPath).isDirectory() && item !== '_next' && item !== 'server-functions' && item !== 'middleware' && item !== 'cache' && item !== '.build' && item !== 'cloudflare' && item !== 'cloudflare-templates' && item !== 'dynamodb-provider') {
        // Exclude static directories that are not OpenNext internal dirs
        staticExcludes.push(`/${item}/*`);
      }
    }
  } catch (e) {
    console.error('Warning: Failed to scan dest for static files:', e);
  }

  const routesJson = {
    version: 1,
    include: ['/*'],
    exclude: staticExcludes
  };
  fs.writeFileSync(routesJsonPath, JSON.stringify(routesJson, null, 2));
  console.log('Generated _routes.json:', routesJson);

  console.log('Successfully structured OpenNext output for Cloudflare Pages!');
} catch (e) {
  console.error('Error structuring Cloudflare Pages output:', e);
  process.exit(1);
}
