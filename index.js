const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = 3000;
const isDevelop = false;

app.use(express.static('public'));

async function fetchFirstImage(query) {
  const searchUrl = `https://www.google.com/search?hl=en&tbm=isch&q=${encodeURIComponent(query)}`;

  try {
    const { data } = await axios.get(searchUrl);
    const $ = cheerio.load(data);
    const image = $('img').eq(1).attr('src');
    return image || '이미지를 찾을 수 없습니다.';
  } catch (error) {
    return '이미지를 가져오는 중 오류가 발생했습니다.';
  }
}

const isAllowedRequest = (req, res, next) => {
  const referer = req.get('Referer');
  const allowedOrigin = isDevelop ? 'http://localhost:3000/' : 'https://status-chat.ijw.app/';
  if (referer && referer.startsWith(allowedOrigin)) {
    return next();
  }
  return res.status(403).json({ error: '요청이 거부되었습니다.' });
};

app.get('/api/search', isAllowedRequest, async (req, res) => {
  const query = req.query.q;

  if (!query) {
    return res.status(400).json({ error: '검색어를 제공해 주세요.' });
  }

  const imageUrl = await fetchFirstImage(query);
  res.json({ imageUrl });
});

app.get('/api/status-codes', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'status-code.json');
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(err.status).end();
    }
  });
});

io.on('connection', (socket) => {
  socket.on('message', (msg) => {
    io.emit('message', msg);
  });
});

server.listen(PORT, () => {
  console.log(`listening on port ${PORT}...`);
});
