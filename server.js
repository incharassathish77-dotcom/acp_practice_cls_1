const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;
const HOST = '0.0.0.0';

// Serve static assets from project root
app.use(express.static(path.join(__dirname), {
  extensions: ['html', 'htm']
}));

// Fallback to index.html for any unhandled GET requests
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});
