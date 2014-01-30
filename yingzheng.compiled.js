var fs, console, workPath, exts, plugin, counter;
fs = require('fs');
console = require('console');
workPath = process.argv[2];
counter = 1;
if (workPath == undefined) {
  console.log('Please specify the path this program works in.');
} else {
  checkWorkPath();
}
function checkWorkPath() {
  var _$err, data, exist;
  console.log('Checking work path:', workPath);
  workPath += '/';
  (function (_$cont) {
    try {
      fs.readFile(workPath + '.yingzheng.control', { 'encoding': 'utf8' }, function (arguments, _$param0, _$param1) {
        try {
          _$err = _$param0;
          data = _$param1;
          if (_$err)
            throw _$err;
          console.log(data);
          exts = parseExt(data);
          fs.exists(workPath + '.yingzheng.plugin.js', function (arguments, _$param2) {
            try {
              exist = _$param2;
              if (exist) {
                plugin = require(workPath + '.yingzheng.plugin.js').entry;
              } else {
                plugin = function (files) {
                  console.log('No plugin founded. Print all modified and tracked files');
                  console.log(files);
                };
              }
              fs.exists(workPath + '.yingzheng', function (arguments, _$param3) {
                try {
                  exist = _$param3;
                  if (exist) {
                    track();
                  } else {
                    init();
                  }
                  _$cont();
                } catch (_$err) {
                  _$cont(_$err);
                }
              }.bind(this, arguments));
            } catch (_$err) {
              _$cont(_$err);
            }
          }.bind(this, arguments));
        } catch (_$err) {
          _$cont(_$err);
        }
      }.bind(this, arguments));
    } catch (_$err) {
      _$cont(_$err);
    }
  }(function (err) {
    if (err !== undefined) {
      console.log(err);
      console.log('Please read the documentation and check the work path.');
    }
  }));
}
function parseExt(data) {
  var lines, exts, i, _$itmp_list, _$itmp;
  lines = data.split('\n');
  exts = new Array();
  _$itmp_list = [];
  for (i in lines) {
    _$itmp_list.push(i);
  }
  _$itmp = 0;
  while (_$itmp < _$itmp_list.length) {
    i = _$itmp_list[_$itmp];
    if (lines[i][0] == '*' && lines[i][1] == '.') {
      exts.push(lines[i].substr(2));
    }
    ++_$itmp;
  }
  return exts;
}
function getLastSector(string, spliter) {
  var array;
  array = string.split(spliter);
  return array[array.length - 1];
}
function scan(path, track, ret) {
  var err, files, i, rpath, stats, file, ext, isMember, j;
  fs.readdir(workPath + path, function (arguments, _$param4, _$param5) {
    err = _$param4;
    files = _$param5;
    if (err) {
      throw err;
    }
    i = 0;
    function _$loop_0(_$loop_0__$cont) {
      if (i < files.length) {
        if (files[i][0] == '.') {
          return i++, _$loop_0(_$loop_0__$cont);
        }
        rpath = path + '/' + files[i];
        fs.stat(workPath + rpath, function (arguments, _$param6, _$param7) {
          err = _$param6;
          stats = _$param7;
          if (err) {
            throw err;
          }
          if (stats.isDirectory()) {
            counter++;
            scan(rpath, track, ret);
          } else {
            file = files[i];
            ext = getLastSector(file, '.');
            if (ext == file) {
              return i++, _$loop_0(_$loop_0__$cont);
            }
            isMember = false;
            j = 0;
            while (j < exts.length) {
              if (exts[j] == ext) {
                isMember = true;
              }
              j++;
            }
            if (!isMember) {
              return i++, _$loop_0(_$loop_0__$cont);
            }
            track[rpath] = new Object();
            track[rpath].mtime = stats.mtime;
          }
          i++;
          _$loop_0(_$loop_0__$cont);
        }.bind(this, arguments));
      } else {
        _$loop_0__$cont();
      }
    }
    _$loop_0(function () {
      counter--;
      ret(null);
    });
  }.bind(this, arguments));
}
function init() {
  var track;
  track = new Object();
  try {
    scan('.', track, function () {
      var _$err, ts, files, file, _$itmp_list, _$itmp;
      if (counter != 0) {
        return;
      }
      fs.mkdir(workPath + '.yingzheng', function (arguments, _$param8) {
        _$err = _$param8;
        if (_$err)
          throw _$err;
        ts = timestamp(new Date());
        fs.writeFile(workPath + '.yingzheng/' + ts + '.json', JSON.stringify(track), function (arguments, _$param9) {
          _$err = _$param9;
          if (_$err)
            throw _$err;
          fs.symlink(workPath + '.yingzheng/' + ts + '.json', workPath + '.yingzheng/latest.json', function (arguments, _$param10) {
            _$err = _$param10;
            if (_$err)
              throw _$err;
            files = new Array();
            _$itmp_list = [];
            for (file in track) {
              _$itmp_list.push(file);
            }
            _$itmp = 0;
            while (_$itmp < _$itmp_list.length) {
              file = _$itmp_list[_$itmp];
              files.push(file);
              ++_$itmp;
            }
            plugin(files, new Array());
          }.bind(this, arguments));
        }.bind(this, arguments));
      }.bind(this, arguments));
    });
  } catch (err) {
    console.log(err);
    console.log('Error happens during initialization.');
    console.log('Please delete directory ".yingzheng"');
  }
}
function track() {
  var track;
  track = new Object();
  try {
    scan('.', track, function () {
      var oldTrack, newFiles, file, _$itmp_list, _$itmp, deletedFiles, _$err, ts;
      if (counter != 0) {
        return;
      }
      oldTrack = require(workPath + '.yingzheng/latest.json');
      newFiles = new Array();
      _$itmp_list = [];
      for (file in track) {
        _$itmp_list.push(file);
      }
      _$itmp = 0;
      while (_$itmp < _$itmp_list.length) {
        file = _$itmp_list[_$itmp];
        if (oldTrack[file] == undefined || oldTrack[file].mtime < track[file].mtime) {
          newFiles.push(file);
        }
        ++_$itmp;
      }
      deletedFiles = new Array();
      _$itmp_list = [];
      for (file in oldTrack) {
        _$itmp_list.push(file);
      }
      _$itmp = 0;
      while (_$itmp < _$itmp_list.length) {
        file = _$itmp_list[_$itmp];
        if (track[file] == undefined) {
          deletedFiles.push(file);
        }
        ++_$itmp;
      }
      fs.unlink(workPath + '.yingzheng/latest.json', function (arguments, _$param11) {
        _$err = _$param11;
        if (_$err)
          throw _$err;
        ts = timestamp(new Date());
        fs.writeFile(workPath + '.yingzheng/' + ts + '.json', JSON.stringify(track), function (arguments, _$param12) {
          _$err = _$param12;
          if (_$err)
            throw _$err;
          fs.symlink(workPath + '.yingzheng/' + ts + '.json', workPath + '.yingzheng/latest.json', function (arguments, _$param13) {
            _$err = _$param13;
            if (_$err)
              throw _$err;
            plugin(newFiles, deletedFiles);
          }.bind(this, arguments));
        }.bind(this, arguments));
      }.bind(this, arguments));
    });
  } catch (err) {
    console.log(err);
    console.log('Error happens during tracking.');
    console.log('Try to fix it manually. May the Force be with you.');
  }
}
function timestamp(date) {
  function alignDate(value) {
    if (value < 10) {
      return '0' + value;
    } else {
      return value;
    }
  }
  return date.getUTCFullYear() + '-' + alignDate(date.getUTCMonth() + 1) + '-' + alignDate(date.getUTCDate() + 1) + 'S' + alignDate(date.getUTCHours()) + ':' + alignDate(date.getUTCMinutes()) + ':' + alignDate(date.getUTCSeconds());
}
/* Generated by Continuation.js v0.1.4 */
//@ sourceMappingURL=yingzheng.compiled.js.map