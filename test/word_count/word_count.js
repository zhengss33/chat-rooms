const fs = require('fs');
const filesDir = './text';
let completedTasks = 0;
let wordCounts = {};
let tasks = [];

function checkIfComplete() {
  completedTasks++;
  if (completedTasks === tasks.length) {
    console.log(wordCounts);
    for (let word in wordCounts) {
      console.log(`${word}: ${wordCounts[word]}`);
    }
  }
}

function countWordsInText(text) {
  let words = text
          .toString()
          .toLowerCase()
          .split(/\W+/)
          .sort();
  for (let i in words) {
    let word = words[i];
    if (word) {
      wordCounts[word] = (wordCounts[word]) ? wordCounts[word] + 1 : 1;
    }
  }
}

fs.readdir(filesDir, (err, files) => {
  if (err) {
    throw err;
  }
  for (let i in files) {
    let task = (function(file) {
      return function() {
        fs.readFile(file, (err, text) => {
          if (err) { throw err; }
          countWordsInText(text);
          checkIfComplete();
        });
      }
    })(`${filesDir}/${files[i]}`)
    tasks.push(task);
  }

  for (let task in tasks) {
    tasks[task]()
  }
});
