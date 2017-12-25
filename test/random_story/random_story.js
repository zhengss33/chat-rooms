const fs = require('fs');
const request = require('request');
const htmlparser = require('htmlparser');
const configFilename = './rss_feeds.txt';

// 读取并解析包含URL的文件
// 将URL分割成数组,并返回其中任意一个URL
function readRSSFile() {
  fs.readFile(configFilename, function(err, feedList) {
    if (err) { return next(err); }
    feedList = feedList
                .toString()
                .replace(/^\s|\s$/g, '')
                .split('\n');
    let random = Math.floor(Math.random() * feedList.length);

    next(null, feedList[random]);
  });
}

// 发送http请求数据
function downloadRSSFeed(feedUrl) {
  request({ url: feedUrl }, (err, res, body) => {
    if (err) { return next(err); }
    if (res.statusCode != 200) {
      return next(new Error('Abnormal response status code'));
    }

    next(null, body);
  });
}

//解析数据并显示信息
function parseRSSFeed(rss) {
  const handler = new htmlparser.RssHandler();
  const parser = new htmlparser.Parser(handler);

  parser.parseComplete(rss);

  if (!handler.dom.items.length) {
    return next(new Error('No RSS items found'));
  }

  let item = handler.dom.items.shift();
  console.log(item);
  console.log(item.link);
}

// 将任务按顺序添加到数组
const tasks = [
  readRSSFile,
  downloadRSSFeed,
  parseRSSFeed,
];

// 从任务数组取出任务执行,如有异常则抛出
function next(err, result) {
  if (err) {
    throw err;
  }
  let currentTask = tasks.shift();

  if (currentTask) {
    currentTask(result);
  }
}

next();
