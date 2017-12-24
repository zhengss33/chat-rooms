
const http = require('http');
const fs = require('fs');

http.createServer((req, res) => {
  if (req.url == '/') {
    getTitle(res);
  }
}).listen(3000, () => {
  console.log('Server listening on port 3000');
});

function getTitle(res) {
  fs.readFile('./data/titles.json', (err, data) => {
    if (err) {
      return hadError(err, res);
    } else {
      let titles = JSON.parse(data.toString());

      getTemplate(res, titles);
    }
  })
}

function getTemplate(res, titles) {
  fs.readFile('./template/template.html', (err, data) => {
    if (err) {
      return hadError(err, res);
    } else {
      let temp = data.toString();
      formatHtml(titles, temp, res);
    }
  });
}

function formatHtml(titles, temp, res) {
  let html = temp.replace('%', titles.join('</li><li>'));
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(html);
}

function hadError(err, res) {
  console.log(err);
  res.end('Server Error');
}
