const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'import.json'), 'utf8'));

for (const key of Object.keys(data)) {
    if (key === 'counts') continue;
    if (Array.isArray(data[key])) {
        fs.writeFileSync(path.join(__dirname, `${key}.json`), JSON.stringify(data[key], null, 2));
        console.log(`Created ${key}.json with ${data[key].length} records.`);
    }
}
