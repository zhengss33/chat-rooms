const http = require('http');
const fs = require('fs');
const path = require('path');
const mime = require('mime');
const chatServer = require('./lib/chat_server');
let cache = {};

// 创建HTTP服务器处理每个请求
const server = http.createServer((request, response) => {
  let filePath = false;

  if (request.url == '/') {
    filePath = 'public/index.html';
  } else {
    // 将URL路径转为文件的相对路径
    filePath = `public${request.url}`;
  }
  const absPath = `./${filePath}`;
  serverStatic(response, cache, absPath);
});

server.listen(3000, () => {
  console.log('Server listen listening on http://localhost:3000');
});

// 启动Socket.IO服务器, 并与HTTP共享同一个TCP/IP端口
chatServer.listen(server);



function send404(response) {
  response.writeHead(404, { 'Content-Type': 'text/plain' });
  response.write('Error 404: resource not found.');
  response.end();
}

function sendFile(response, filePath, fileContents) {
  response.writeHead(200, {
    'Content-Type': mime.lookup(path.basename(filePath))
    }
  );
  response.end(fileContents);
}

function serverStatic(response, cache, absPath) {
  // 检查文件是否在缓存中
  if (cache[absPath]) {
    sendFile(response, absPath, cache[absPath]);
  } else {
    // 检查文件是否存在
    fs.access(absPath, (err) => {
      if (!err) {
        // 从硬盘中读取文件
        fs.readFile(absPath, (err, data) => {
          if (err) {
            send404(response);
          } else {
            // 从硬盘中读取文件并返回
            cache[absPath] = data;
            sendFile(response, absPath, data);
          }
        });
      } else {
        send404(response);
      }
    });
  }
}
