const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '../app/(main)/odds/page.tsx');
const content = fs.readFileSync(filePath, 'utf8');

let curly = 0;
let div = 0;
let lines = content.split('\n');

lines.forEach((line, i) => {
  let lCurly = (line.match(/\{/g) || []).length;
  let rCurly = (line.match(/\}/g) || []).length;
  curly += lCurly - rCurly;

  let lDiv = (line.match(/<div/g) || []).length;
  let rDiv = (line.match(/<\/div>/g) || []).length;
  div += lDiv - rDiv;
});

console.log(`Final balance: curly=${curly}, div=${div}`);
