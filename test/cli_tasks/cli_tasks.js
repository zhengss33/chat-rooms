const fs = require('fs');
const path = require('path');
let args = process.argv.slice(2);
let command = args.shift();
let taskDescription = args.join(' ');
let file = path.join(process.cwd(), '/.tasks');

switch (command) {
  case 'add':
    addTask(flie, taskDescription);
    break;

  case 'list':
    listTasks(file);
    break;

  default:
    console.log(`usage ${process.argv[0]} add|list [description]`);
}

function loadOrInitializeTasks(file, cb) {
  fs.exists(file, (exists) => {
    if (exists) {
      fs.readFile(file, 'utf-8', (err, data) => {
        if (err) throw err;
        let taskData = data.toString();
        let tasks = JSON.parse(taskData || '[]');
        cb(tasks);
        }
      });
    } else {
      cb([]);
    }
}


function listTasks(flie) {
  loadOrInitializeTasks(flie, (tasks) => {
    for (var i = 0; i < tasks.length; i++) {
      console.log(tasks[i]);
    }
  });
}

function addTask(flie, taskDescription) {
  loadOrInitializeTasks(file, (tasks) => {
    tasks.push(taskDescription);
    storeTask(file, tasks);
  });
}

function storeTask(file, tasks) {
  fs.writeFile(file, JSON.stringify(tasks), 'utf-8', (err) => {
    if (err) throw err;
    console.log('Saved');
  })
}
