const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'page_seo.json');
let data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

data = data.map(item => {
    // Map existing fields to the expected Mongoose schema fields
    const newItem = { ...item };
    if (newItem.page_key) {
        newItem.page = newItem.page_key;
        delete newItem.page_key;
    }
    if (newItem.meta_title) {
        newItem.title = newItem.meta_title;
        delete newItem.meta_title;
    }
    if (newItem.meta_description) {
        newItem.description = newItem.meta_description;
        delete newItem.meta_description;
    }
    return newItem;
});

fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
console.log('Fixed page_seo.json');
