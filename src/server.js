const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const mysql = require('mysql2');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const db = mysql.createPool({
  host: 'mysql',
  user: 'node_user',
  password: 'node_pass',
  database: 'node_db'
});

db.getConnection(err => {
  if (err) {
    console.error('MySQLへの接続に失敗しました:', err);
    return;
  }
  console.log('MySQLに接続されました');
});

app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.get('/messages', (req, res) => {
  db.query('SELECT * FROM messages', (err, results) => {
    if (err) {
      res.status(500).send('データベースエラー');
      return;
    }
    res.json(results);
  });
});

io.on('connection', (socket) => {
  console.log('ユーザーが接続しました');

  socket.on('chat message', (data) => {
    if (!data.id || !data.msg) {
      console.error('不正なデータが送信されました。');
      socket.emit('chat error', '不正なデータが送信されました。');
      return;
    }

    db.query(
      'INSERT INTO messages (userId, message) VALUES (?, ?)',
      [data.id, data.msg],
      (err, result) => {
        if (err) {
          console.error('メッセージ保存時にエラーが発生しました:', err);
          socket.emit('chat error', 'メッセージの保存に失敗しました。');
          return;
        }
        console.log('メッセージが保存されました');
        socket.broadcast.emit('chat message', data);
      }
    );
  });

  socket.on('disconnect', () => {
    console.log('ユーザーが切断しました');
  });
});

// 環境変数からポート番号を取得し、デフォルトは3000とする
const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`サーバーがポート${port}で起動しました`);
});
