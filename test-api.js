
fetch('http://localhost:3000/api/generate-story', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Ali', age: 5, interests: 'Cars', theme: 'Fun' })
}).then(async r => {
    console.log('Status:', r.status);
    console.log('Body:', await r.text());
}).catch(e => console.error(e));
