const EventEmitter = require('events').EventEmitter;
const fs = require('fs');

class Watcher extends EventEmitter {
  constructor(watchDir, processedDir) {
    super();
    this.watchDir = watchDir;
    this.processedDir = processedDir;
  }
  // 对目录的监控, 当目录中有事情发生时触发
  start() {
    fs.watchFile(this.watchDir, () => {
      this.watch();
    });
  }
  // 遍历目录,处理其中的所有文件
  watch() {
    fs.readdir(this.watchDir, (err, files) => {
      if (err) {
        throw err;
      }
      for (let f in files) {
        this.emit('process', files[f]);
      }
    });
  }
}

const watchDir = './test/watch';
const processedDir = './test/done';
const watcher = new Watcher(watchDir, processedDir);

watcher.on('process', function(flie) {
  let watchFile = `${this.watchDir}/${flie}`;
  let processFile = `${this.processedDir}/${flie.toLowerCase()}`;

  fs.rename(watchFile, processFile, (err) => {
    if (err) {
      throw err;
    }
  });
});

watcher.start();
