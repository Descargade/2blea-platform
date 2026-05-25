const fs = require('fs');
const path = require('path');
const fp = process.argv[2];
const c = process.argv[3];
if (!fp || !c) { console.error("no args"); process.exit(1); }
const d = path.dirname(fp);
if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
fs.writeFileSync(fp, c);
console.log("OK:" + fp.length);