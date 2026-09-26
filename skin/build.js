// Inlines the logo mark into skin.src.css → skin.css
const fs = require('fs'), path = require('path');
const dir = __dirname;
const svg = fs.readFileSync(path.join(dir, '../assets/brand/favicon.svg'), 'utf8').replace(/\s+/g, ' ').trim();
const uri = 'data:image/svg+xml,' + encodeURIComponent(svg).replace(/'/g, '%27').replace(/"/g, '%22');
const css = fs.readFileSync(path.join(dir, 'skin.src.css'), 'utf8').replace('__MARK__', uri);
fs.writeFileSync(path.join(dir, 'skin.css'), css);
console.log('skin.css', css.length, 'bytes');
