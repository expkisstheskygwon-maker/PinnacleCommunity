const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '../app/(main)/odds/page.tsx');
const content = fs.readFileSync(filePath, 'utf8');

let depth = 0;
let inString = null;
let inComment = false;
let inJSXComment = false;

for (let i = 0; i < content.length; i++) {
  const char = content[i];
  const next = content[i+1];

  // JSX Comments {/* ... */}
  if (!inString && !inComment && char === '{' && next === '/' && content[i+2] === '*') {
    inJSXComment = true;
    i += 2;
    continue;
  }
  if (inJSXComment && char === '*' && next === '/' && content[i+2] === '}') {
    inJSXComment = false;
    i += 2;
    continue;
  }
  if (inJSXComment) continue;

  // Regular Comments
  if (!inString && char === '/' && next === '*') { inComment = true; i++; continue; }
  if (inComment && char === '*' && next === '/') { inComment = false; i++; continue; }
  if (inComment) continue;

  // Single line comments
  if (!inString && char === '/' && next === '/') {
    while (i < content.length && content[i] !== '\n') i++;
    continue;
  }

  // Strings
  if (!inComment && (char === "'" || char === '"' || char === '`')) {
    if (inString === char) inString = null;
    else if (!inString) inString = char;
    continue;
  }
  if (inString) continue;

  // Curly braces
  if (char === '{') depth++;
  if (char === '}') depth--;
}

console.log('Final curly depth:', depth);
