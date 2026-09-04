const fs = require('fs');
const file = fs.readFileSync('src/pages/Reviews.jsx', 'utf8');
const newFile = file.replace('alert("Failed to submit review");', 'const text = await res.text(); alert(`Failed to submit review: ${text}`); console.error(text);');
fs.writeFileSync('src/pages/Reviews.jsx', newFile);
