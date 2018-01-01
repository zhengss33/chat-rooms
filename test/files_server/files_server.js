const http = require('http');
const formidable = require('formidable');

const server = http.createServer(function(req, res) {
  switch (req.method) {
    case 'GET':
      show(res);
      break;

    case 'POST':
      upload(req, res);
      break;
  }
});

server.listen(3000, function() {
  console.log('listening on port 3000');
});

function upload(req, res) {
  if (!isFormData(req)) {
    res.statusCode = 400;
    res.end('Bad Request: expecting multipart/form-data');
    return;
  }

  const form = new formidable.IncomingForm();

  // form.on('field', function(field, value) {
  //   console.log('is filed');
  //   console.log(field);
  //   console.log(value);
  // });
  //
  // form.on('file', function(name, file) {
  //   console.log('is file');
  //   console.log(name);
  //   console.log(file);
  // });
  //
  // form.on('end', function() {
  //   res.end('upload complete!');
  // });

  form.on('progress', (bytesReceived, bytesExpected) => {
    var percent = Math.floor((bytesReceived / bytesExpected) * 100);
    console.log(`${percent}%`);
  });

  form.parse(req, (err, fields, files) => {
    console.log(fields);
    console.log(files);
    res.end('upload complete!');
  });
}

function isFormData(req) {
  const type = req.headers['content-type'] || '';
  return type.indexOf('multipart/form-data') === 0;
}

function show(res) {
  const temp = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>files server</title>
      </head>
      <body>
        <form method="post" action="/" enctype="multipart/form-data">
          <p><input type="text" name="name"/></p>
          <p><input type="file" name="file" /></p>
          <p><input type="submit" value="Upload" /></p>
        </form>
      </body>
    </html>
  `;
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Content-Length', Buffer.byteLength(temp));
  res.end(temp);
}
