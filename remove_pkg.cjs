const fs = require('fs');
let content = fs.readFileSync('src/data/products.ts', 'utf8');
const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('"name":')) {
        lines[i] = lines[i].replace(/باكدج\s*/g, '');
    }
}
fs.writeFileSync('src/data/products.ts', lines.join('\n'));
console.log('Removed باكدج only from names');
