var fs = require('fs');
var console = require('console');
var workPath = process.argv[2], exts, plugin, counter = 1;

if (workPath == undefined) {
  console.log('Please specify the path this program works in.');
}
else checkWorkPath();

function checkWorkPath () {
  console.log('Checking work path:', workPath);
  workPath += '/';

  try {
    fs.readFile(workPath + '.yingzheng.control', { 'encoding': 'utf8' }, obtain(data));
    console.log(data);
    exts = parseExt(data);

    fs.exists(workPath + '.yingzheng.plugin.js', cont(exist));
    if (exist) plugin = require(workPath + '.yingzheng.plugin.js').entry;
    else plugin = function (files) {
      console.log('No plugin founded. Print all modified and tracked files');
      console.log(files);
    }
    
    fs.exists(workPath + '.yingzheng', cont(exist));
    if (exist) track();
    else init();
  }
  catch (err) {
    console.log(err);
    console.log('Please read the documentation and check the work path.');
  }
}

function parseExt (data) {
  var lines = data.split('\n');
  var exts = new Array();

  for (var i in lines) {
    if (lines[i][0] == '*' && lines[i][1] == '.') exts.push(lines[i].substr(2));
  }

  return exts;
}

function getLastSector (string, spliter) {
  var array = string.split(spliter);
  return array[array.length - 1];
}

function scan (path, track, ret) {
  fs.readdir(workPath + path, cont(err, files));
  if (err) throw err;

  for (var i = 0; i < files.length; i ++) {
    if (files[i][0] == '.') continue;
    var rpath = path + '/' + files[i];

    fs.stat(workPath + rpath, cont(err, stats));
    if (err) throw err;

    if (stats.isDirectory()) {
      counter ++;
      scan(rpath, track, ret);
    }
    else {
      var file = files[i];
      var ext = getLastSector(file, '.');
      if (ext == file) continue;

      var isMember = false;
      for (var j = 0; j < exts.length; j ++)
        if (exts[j] == ext) isMember = true;
      if (!isMember) continue;

      track[rpath] = new Object();
      track[rpath].mtime = stats.mtime;
    }
  }
  counter --;
  ret(null);
}

function init () {
  var track = new Object();

  try {
    scan('.', track, function () {
      if (counter != 0) return;

      fs.mkdir(workPath + '.yingzheng', obtain());

      var ts = timestamp(new Date());
      fs.writeFile(workPath + '.yingzheng/' + ts + '.json', JSON.stringify(track), obtain());
      fs.symlink(workPath + '.yingzheng/' + ts + '.json', workPath + '.yingzheng/latest.json', obtain());

      var files = new Array();
      for (var file in track) {
        files.push(file);
      }

      plugin(files, new Array());
    });
  } catch (err) {
    console.log(err);
    console.log('Error happens during initialization.');
    console.log('Please delete directory ".yingzheng"');
  }
}

function track () {
  var track = new Object();

  try {
    scan('.', track, function () {
      if (counter != 0) return;

      var oldTrack = require(workPath + '.yingzheng/latest.json');

      var newFiles = new Array();
      for (var file in track) {
        if (oldTrack[file] == undefined || oldTrack[file].mtime < track[file].mtime)
          newFiles.push(file);
      }

      var deletedFiles = new Array();
      for (var file in oldTrack) {
        if (track[file] == undefined) deletedFiles.push(file);
      }

      fs.unlink(workPath + '.yingzheng/latest.json', obtain());

      var ts = timestamp(new Date());
      fs.writeFile(workPath + '.yingzheng/' + ts + '.json', JSON.stringify(track), obtain());
      fs.symlink(workPath + '.yingzheng/' + ts + '.json', workPath + '.yingzheng/latest.json', obtain());

      plugin(newFiles, deletedFiles);
    });      
  } catch (err) {
    console.log(err);
    console.log('Error happens during tracking.');
    console.log('Try to fix it manually. May the Force be with you.');
  }
}

function timestamp (date) {
  function alignDate (value) {
    if (value < 10) return '0' + value;
    else return value;
  }

  return date.getUTCFullYear() + '-' +
         alignDate(date.getUTCMonth() + 1) + '-' +
         alignDate(date.getUTCDate() + 1) + 'S' +
         alignDate(date.getUTCHours()) + ':' +
         alignDate(date.getUTCMinutes()) + ':' +
         alignDate(date.getUTCSeconds());
}