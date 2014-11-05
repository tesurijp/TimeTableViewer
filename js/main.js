function load_holiday(next) {
    tizen.filesystem.resolve(
        'wgt-package/holiday.dat', function(file) {
        file.readAsText(function(data) {
            document.getElementById('holiday').innerHTML = data;
            next();
        });
    }, function(err) {
        console.log(err);
    }, 'r');
}

function read_timetable_next(files, count, next) {
    if (files.length > count) {
        if (files[count].name.match('.*\.[tT][bB][lL]')) {
            tizen.filesystem.resolve(
                files[count].fullPath, function(file) {
                file.readAsText(function(data) {
                    var elm = document.createElement("pre");
                    elm.id = 'tbl' + count;
                    elm.innerHTML = data;
                    document.getElementById("tables").appendChild(elm);
                    read_timetable_next(files, count + 1, next);
                })
            }, function(err) {
                console.log(err);
            }, 'r');
        } else {
            read_timetable_next(files, count + 1, next);
        }
    } else {
        next();
    }
}

function read_timetable_first(files, next) {
    if (files.length > 0) {
        read_timetable_next(files, 0, next)
    } else {
        next();
    }
}

function load_timetable(next) {
    tizen.filesystem.resolve("documents/timetable", function(dir) {
        dir.listFiles(function(files) {
            read_timetable_first(files, next);
        });
    }, function() {
        tizen.filesystem.resolve("documents", function(dir) {
            dir.createDirectory('timetable');
            dir.copyTo('wgt-package/sample.tbl', 'documents/timetable/sample.tbl', false, function() {
                load_timetable(next);
            }, function(err) {
                console.log(err)
            });
        }, function(err) {
            console.log(err)
        }, "w");
    }, 'r')
}

function main_init() {
    initMenu();
    load_holiday(function() {
        load_timetable(init)
    });
}

(function() {
    window.addEventListener('tizenhwkey', function(ev) {
        if (ev.keyName == "back") {
            tizen.application.getCurrentApplication().exit();
        }
    });
})();