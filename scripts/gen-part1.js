const fs = require('fs');
const path = require('path');

function writeFile(filePath, content) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log('  [' + path.relative(process.cwd(), filePath).replace(/\/g, '/').substring(0, 60) + '...]');
}

const root = 'C:/Users/aaron/2blea-platform';
console.log('Generating files...');

