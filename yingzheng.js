var fs = require('fs');
var console = require('console');

if (!process.argv[2]) {
  console.log('Please specify the path this program works in.');
}
else checkWorkPath(process.argv[2]);

function checkWorkPath (workPath) {
  console.log('Checking work path:', workPath);

  
}