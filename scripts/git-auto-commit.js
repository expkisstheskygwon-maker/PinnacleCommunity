const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

// Configuration
const DEBOUNCE_MS = 10000; // 10 seconds of silence before committing
const WATCH_DIR = path.resolve(__dirname, '..');
const LOG_FILE = path.join(WATCH_DIR, 'scratch', 'git-watcher.log');

// Ensure scratch directory exists
const scratchDir = path.join(WATCH_DIR, 'scratch');
if (!fs.existsSync(scratchDir)) {
  fs.mkdirSync(scratchDir, { recursive: true });
}

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
}

log(`Starting Git Auto-Commit Watcher in: ${WATCH_DIR}`);

// Ignore patterns
const ignorePatterns = [
  /^[/\\]?\.git[/\\]?/,
  /^[/\\]?node_modules[/\\]?/,
  /^[/\\]?\.next[/\\]?/,
  /^[/\\]?\.open-next[/\\]?/,
  /^[/\\]?\.vercel[/\\]?/,
  /^[/\\]?\.wrangler[/\\]?/,
  /tsconfig\.tsbuildinfo$/,
  /\.DS_Store$/,
  /\.log$/,
  /^[/\\]?scratch[/\\]?/
];

function shouldIgnore(relativePath) {
  return ignorePatterns.some(pattern => pattern.test(relativePath));
}

let debounceTimer = null;
let changedFiles = new Set();

// Watch directory recursively
try {
  fs.watch(WATCH_DIR, { recursive: true }, (eventType, filename) => {
    if (!filename) return;

    // Check ignore patterns
    if (shouldIgnore(filename)) {
      return;
    }

    log(`File change detected: [${eventType}] ${filename}`);
    changedFiles.add(filename);

    // Reset debounce timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    debounceTimer = setTimeout(processChanges, DEBOUNCE_MS);
  });
  log('File watcher successfully established.');
} catch (err) {
  log(`Error initializing file watcher: ${err.message}`);
  process.exit(1);
}

function getActiveBranch() {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', { cwd: WATCH_DIR, encoding: 'utf8' }).trim();
  } catch (err) {
    log(`Error getting active branch: ${err.message}`);
    return 'main';
  }
}

function processChanges() {
  debounceTimer = null;
  const filesToCommit = Array.from(changedFiles);
  changedFiles.clear();

  if (filesToCommit.length === 0) return;

  log(`Processing changes for files: ${filesToCommit.join(', ')}`);

  try {
    // Check if git is available and repo is initialized
    try {
      execSync('git rev-parse --is-inside-work-tree', { cwd: WATCH_DIR, stdio: 'ignore' });
    } catch (e) {
      log('Git is not initialized or not working in this directory.');
      return;
    }

    // Check git status to see if there are actual changes
    const statusOutput = execSync('git status --porcelain', { cwd: WATCH_DIR, encoding: 'utf8' }).trim();
    if (!statusOutput) {
      log('No actual changes to commit according to git status.');
      return;
    }

    log('Staging changes (git add -A)...');
    execSync('git add -A', { cwd: WATCH_DIR });

    const branch = getActiveBranch();
    const timestamp = new Date().toLocaleString();
    
    // Create a descriptive commit message
    let commitMsg = `Auto-commit: ${timestamp}`;
    if (filesToCommit.length <= 3) {
      commitMsg += ` - updated ${filesToCommit.join(', ')}`;
    } else {
      commitMsg += ` - updated ${filesToCommit.slice(0, 3).join(', ')} and ${filesToCommit.length - 3} other files`;
    }

    log(`Committing changes: "${commitMsg}"`);
    execSync(`git commit -m "${commitMsg.replace(/"/g, '\\"')}"`, { cwd: WATCH_DIR });

    log(`Pushing changes to origin ${branch}...`);
    // Run push with timeout and capture output
    const pushOutput = execSync(`git push origin ${branch}`, { cwd: WATCH_DIR, encoding: 'utf8', stdio: 'pipe' });
    log(`Push completed successfully:\n${pushOutput}`);
  } catch (err) {
    log(`Error during git operation: ${err.message}`);
    if (err.stdout) log(`stdout: ${err.stdout}`);
    if (err.stderr) log(`stderr: ${err.stderr}`);
  }
}
