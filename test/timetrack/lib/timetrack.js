const qs = require('querystring');

exports.sendHtml = function(res, html) {
  res.setHeader('content-Type', 'text/html; chatset=utf8');
  res.setHeader('content-Length', Buffer.byteLength(html));
  res.end(html);
}

exports.parseReceivedData = function(req, cb) {
  let body = '';
  req.setEncoding('utf8')
  req.on('data', (err, chunk) => {
    body += chunk;
  });
  req.on('end', () => {
    let data = qs.parse(body);
    cb(data);
  });
}

exports.actionForm = function(id, path, label) {
  let html = `
    <form method="POST" action="${path}">
      <input type="hidden" name="id" value="${id}" />
      <input type="submit" value="${label}"/>
    </form>`;
  return html;
}

exports.add = function(db, req, res) {
  exports.parseReceivedData(req, function(work) {
    db.query(
      "INSERT INTO work (hours, date, description) "
      + "VALUES (?, ?, ?)",
      [work.hours, work.date, work.description],
      function(err) {
        if (err) throw err;
        exports.show(db, res);
      }
    );
  });
}

exports.delete = function(db, req, res) {
  exports.parseReceivedData(req, function(work) {
    db.query(
      "DELETE FROM work WHERE id=?",
      [work.id],
      function(err) {
        if (err) throw err;
        exports.show(db, res);
      }
    );
  });
}

exports.archive = function(db, req, res) {
  exports.parseReceivedData(req, function(work) {
    db.query(
      "UPDATE work SET archive=1 WHERE id=?",
      [work.id],
      function(err) {
        if (err) throw err;
        exports.show(db, res);
      }
    );
  });
}

exports.show = function(db, res, showArchived) {
  let query = "SELECT * FROM work "
    + "WHERE archived=? "
    + "ORDER BY date DESC";
  let archiveValue = (showArchived) ? 1 : 0;
  db.query(
    query,
    [archiveValue],
    function(err) {
      if (err) throw err;
      let html = (showArchived)
        ? ''
        : '<a href="/archived">Archived Work</a><br/>';
        html += exports.workHitlistHtml(rows);
        html += exports.workFormHtml();
        exports.sendHtml(res, html);
    }
  );
}

exports.showArchived = function(db, res) {
  exports.show(db, re, true);
}

exports.workHitlistHtml = function(rows) {
  let html = '<table>';
  for(let i in rows) {
    html += '<tr>';
    html += '<td>' + rows[i].date + '</td>';
    html += '<td>' + row[i].hours + '</td>';
    html += '<td>' + rows[i].description + '</td>';
    if (!rows[i].archived) {
      html += '<td>' + exports.workArchiveForm(rows[i].id) + '</td>';
    }
    html += '<td>' + exports.workArchiveForm(rows[i].id) + '</td>';
    html += '</tr>';
  }
  html += '</table>';
  return html;
}
