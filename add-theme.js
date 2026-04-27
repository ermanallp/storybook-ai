const fs = require('fs');
const path = require('path');

const translations = {
    'tr.json': 'Neşeli Ev',
    'en.json': 'Fun House',
    'es.json': 'Casa Divertida',
    'de.json': 'Spaßhaus',
    'fr.json': 'Maison Amusante',
    'it.json': 'Casa Divertente',
    'ja.json': '楽しい家',
    'ko.json': '재미있는 집',
    'zh.json': '欢乐屋'
};

const messagesDir = path.join(__dirname, 'messages');
const files = fs.readdirSync(messagesDir).filter(f => f.endsWith('.json'));

for (const file of files) {
    const filePath = path.join(messagesDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const json = JSON.parse(content);
    
    if (json.HomePage && json.HomePage.themes) {
        if (!json.HomePage.themes.neseliev) {
            json.HomePage.themes.neseliev = translations[file] || 'Fun House';
            fs.writeFileSync(filePath, JSON.stringify(json, null, 2) + '\n', 'utf8');
            console.log(`Updated ${file}`);
        } else {
            console.log(`${file} already has neseliev`);
        }
    }
}
