//----------------------------------------------- 
//Js-TT Version 1.50 (2014.11.5)
//Copyright(c) 2004-2006 by Hazel
//modified 2014 by tesuri
//----------------------------------------------- 


//-------------------------------------------------  
//定数・グローバル変数設定
//-------------------------------------------------  

var Version = "1.5.0";

var TableData;
var HolidayData;
var TableSelectList = new Array();
var ViewSelectList = new Array();

var State = {
    selTable: -1,
    selView: -1,
    selFilter: -1,
    filter: new RegExp(".*")
}

var intervalID = 0;
var lock = false;


//-------------------------------------------------  
//init()
//Js-TTロード完了後の初期化処理をおこなう
//-------------------------------------------------  

function init() {
    var element;
    var loop;
    var count;


    // 祝日定義データロード 
    // ----
    element = document.getElementById('holiday');
    HolidayData = new loadHoliday(element.innerHTML);


    // 時刻表データタイトルロード
    // ----
    element = document.getElementsByTagName('pre');
    count = 0;

    for (loop = 0; loop < element.length; loop++) {
        if (/tbl/.test(element.item(loop).id)) {
            element.item(loop).innerHTML.match(/[;#] *(.*)\s/);
            TableSelectList[count] = {
                ID: element.item(loop).id,
                string: RegExp.$1
            };
            count += 1;
        }
    }


    // 表示方法選択メニューロード
    // ----
    for (loop = 1; loop < document.menuform.viewlist.options.length; loop++)
        ViewSelectList[loop - 1] = document.menuform.viewlist.options[loop].value;


    // 時刻表データが1件だけの場合は、メニューおよび、時刻表を表示する
    // 時刻表データが2件以上ある場合はメニューを表示する
    // ----
    if (count > 1)
        dispMenu('first');

    else if (count == 1) {
        dispMenu('first');
        document.menuform.tablelist.selectedIndex = 1;
        selectTable(0);
        dispMenu('table');
        dispTimeTable(false);
    } else
        dispMsg(MSGLIST.ERROR_BROKEN);

    return;
}



//-------------------------------------------------
//dispMenu()
//メニュー表示
//-------------------------------------------------  

function dispMenu(dispMode) {
    var loop;


    // 時刻表リスト
    // ----
    if (dispMode == 'first') {
        for (loop = 0; loop < TableSelectList.length; loop++)
            document.menuform.tablelist.options[loop + 1] = new Option(TableSelectList[loop].string, TableSelectList[loop].ID);
    }

    // 抽出方法リスト
    // ----
    if (dispMode == 'table') {
        for (loop = document.menuform.filterlist.options.length; loop > 2; loop--)
            document.menuform.filterlist.options[loop] = null;

        for (loop = 0; loop < TableData.comarray.length; loop++)
            document.menuform.filterlist.options[loop + 2] = new Option(TableData.comment[TableData.comarray.charAt(loop)], TableData.comarray.charAt(loop));

        document.menuform.viewlist.selectedIndex = State.selView + 1;
        document.menuform.filterlist.selectedIndex = State.selFilter + 1;
    }

    return;
}



//-------------------------------------------------
//dispMsg()
//時刻表エリアにメッセージを表示
//-------------------------------------------------  

function dispMsg(message) {
    document.getElementById('disptimetable').innerHTML = ("<div class=message>" + message + "</div>");
    return;
}


//-------------------------------------------------
//dispDate()
//時刻エリアにメッセージを表示
//-------------------------------------------------  

function dispDate(message) {
    document.getElementById('dispdate').innerHTML = message;
    return;
}


//-------------------------------------------------  
//dispTimeTable()
//時刻リストを表示 
//-------------------------------------------------  

function dispTimeTable(callByTimer) {
    if (lock && callByTimer)
        return;

    var now = new Date();
    var table;
    var loop;
    var string;
    var pos;
    var selView;



    // 時刻表データのロード
    // ----
    selView = State.selView;
    if (selView == -1)
        selView = 0;

    if (/next/.test(ViewSelectList[selView]))
        var TableList = new getNextList(now, ViewSelectList[selView], State.filter, 10);
    else if (/last/.test(ViewSelectList[selView]))
        var TableList = new getLastList(now, State.filter, 3);
    else
        var TableList = new getAllList(ViewSelectList[selView], State.filter);



    // 時刻表表示
    // ----
    if (TableList.length == 0) {
        if (State.filter.source != ".*")
            dispMsg(MSGLIST.NOT_APPLICABLE + "<br>[" + State.filter.source + "]");
        else
            dispMsg(MSGLIST.OUT_OF_SERVICE);
    } else {
        table = TableData[TableList.table];

        if (/祝|休日|土曜|日曜/.test(TableList.name)) {
            var color = ["hol1", "hol2", "hol3"];
        } else {
            var color = ["wek1", "wek2", "wek3"];
        }

        var output = "";
        output += "<a name=\"top\"></a>\n";
        output += "<table class=list cellspacing=0>\n";
        output += "<tr><td colspan=2 class=\"list_t " + color[2] + "\">" + TableList.name + "</td></tr>\n";

        for (loop = 0; loop < TableList.length; loop++) {

            output += "<tr>";

            output += "<td class=\"list_h " + color[loop % 2] + "\">";
            output += (((TableList[loop].hour % 24) > 9 ? "" : "&nbsp;") + (TableList[loop].hour % 24) + ":");
            output += (((TableList[loop].min > 9 ? "" : "0") + TableList[loop].min) + " </td>");

            output += "<td class=\"list_c " + color[loop % 2] + "\">";
            if (State.filter.source == ".*")
                output += TableList[loop].comment;
            else
                output += TableList[loop].comment.replace(State.filter, "<span class=\"match\">$&</span>");
            output += "</td>";

            output += "</tr>\n";

            if ((TableList.isRealtime) && (loop < 3)) {
                output += "<tr>";
                output += "<td colspan=2 class=\"lasttime " + color[loop % 2] + "\">";
                time = TableList.baseTime + (TableList[loop].hour * 60 + TableList[loop].min) * 60000;
                time_diff = Math.ceil((time - now.getTime()) / 60000);
                if (time_diff >= 60)
                    time_last = (MSGLIST.UNTIL + Math.floor(time_diff / 60) + MSGLIST.HOUR + (time_diff % 60) + MSGLIST.MIN);
                else if (time_diff > 0)
                    time_last = (MSGLIST.UNTIL + (time_diff % 60) + MSGLIST.MIN);
                else
                    time_last = (MSGLIST.LEFT);

                output += (time_last + "</td></tr>\n");
            }
        }
        output += "<tr><td colspan=2 class=\"list_t " + color[2] + "\">" + TableList.name + "</td></tr>\n";
        output += "</table>\n";
        output += "<a name=\"bottom\"></a><div class=\"link\"><a href=\"#top\">▲</a></div>\n";

        document.getElementById('disptimetable').innerHTML = output;

        if (TableList.isRealtime) {
            var interval = 60000 - Math.floor(now.getTime() % (60 * 1000));
            intervalID = window.setTimeout("dispTimeTable(true)", interval);
        }
    }


    // 現在日時の表示
    // ----
    dispDate(TableList.dateString);


    return;
}

//-------------------------------------------------  
//selectTable()
//時刻表データ選択処理
//-------------------------------------------------  

function selectTable(index) {
    if (index < 0)
        return;

    var element;

    lock = true;

    if ((State.selTable != index) && (TableSelectList[index].ID != 'top')) {
        State.selTable = index;
        if (intervalID != 0) {
            window.clearInterval(intervalID);
            delete TableData;
        }

        dispMsg(MSGLIST.WAIT_MSG);
        dispDate("&nbsp;");

        element = document.getElementById(TableSelectList[index].ID);
        TableData = new loadData(element.innerHTML);

        if (/next|last/.test(ViewSelectList[State.selView]) == false)
            State.selView = -1;
        State.selFilter = -1;
        State.filter.compile(".*");

        dispMenu('table');
        dispTimeTable(false);
    }

    lock = false;
    return;
}


//-------------------------------------------------  
//selectView()
//表示方法選択処理
//-------------------------------------------------  

function selectView(index) {
    if ((index < 0) || (State.selTable == -1))
        return;

    lock = true;

    if (State.selView != index) {
        State.selView = index;
        if (intervalID != 0)
            window.clearInterval(intervalID);

        dispMsg(MSGLIST.WAIT_MSG);
        dispDate("&nbsp;");
        dispMenu('view');
        dispTimeTable(false);
    }

    lock = false;

    return;
}


//-------------------------------------------------  
//selectFilter()
//抽出フィルタ選択処理
//-------------------------------------------------  

function selectFilter(index) {
    if (index < 0)
        return;

    var filter = new RegExp();
    var value;

    lock = true;

    State.selFilter = index;

    if (index == 0)
        filter.compile(".*");
    else {
        value = TableData.comment[TableData.comarray.charAt(index - 1)];
        value = value.replace(/[\(\)\[\]\&\.\^\$\+\*\:\=\{\}\\\/]/g, "\\$&")
        filter.compile(value, "g");
    }

    if (State.filter.source != filter.source) {
        if (intervalID != 0)
            window.clearInterval(intervalID);

        State.filter = filter;

        dispMsg(MSGLIST.WAIT_MSG);
        dispDate("&nbsp;");
        dispMenu('filter');
        dispTimeTable(false);
    }

    lock = false;
    return;
}



//-------------------------------------------------  
//loadTable()
//時刻表データロード
//-------------------------------------------------  

function loadData(data) {
    var tmp;
    var tokens;
    var token;
    var t;
    var hour, hour_old;
    var cnt;
    var loop;

    // 時刻データを行単位に分割する
    tmp = data.replace(/ ([a-zA-Z0-9]+:)/g, "\n$1");
    tmp = tmp.replace(/ ([;$#\[])/g, "\n$1");
    tokens = tmp.split("\n");


    // 初期データ設定
    t = 0;
    cnt = 0;
    this[t] = {
        data: new Array(),
        hour: new Array(),
        name: ""
    };
    this.comment = new Array();
    this.comarray = "";
    this.week = [0, 0, 0, 0, 0, 0, 0, 0];


    // 解析メインループ
    for (loop = 0; loop < tokens.length; loop++) {
        token = tokens[loop];

        // 時刻切り出し
        if (/^[0-9]/.test(token)) {
            if (/^([0-9]+):([ 0-9A-Za-z^;]+)/.test(token)) {
                hour = Number(RegExp.$1);
                tmp = RegExp.$2;
                if (/[0-9]/.test(tmp)) {
                    if (hour_old > hour) {
                        hour += 24
                    };
                    hour_old = hour;
                    this[t].hour[cnt] = hour;
                    this[t].data[cnt] = tmp;
                    cnt += 1;
                }
            }
        }

        // 備考欄切り出し
        else if (/^[a-zA-Z]:/.test(token)) {
            token.match(/^([a-zA-Z]):([^;]+)/);
            this.comment[RegExp.$1] = RegExp.$2;
            this.comarray += RegExp.$1;
        }

        // タイトル行切り出し
        else if (token.charAt(0) == '#') {
            token.match(/# *(.+)/);
            this[t].name = RegExp.$1;
        }

        // 曜日指定切り出し
        else if (token.charAt(0) == '[') {
            t += 1;
            this[t] = {
                data: new Array(),
                hour: new Array(),
                name: ""
            };
            cnt = 0;
            hour_old = 0;

            week = token.match(/\[[A-Z]+\]/g);
            for (var j = 0; j < week.length; j++) {
                if (week[j] == '[SUN]')
                    this.week[0] = t;
                else if (week[j] == '[MON]')
                    this.week[1] = t;
                else if (week[j] == '[TUE]')
                    this.week[2] = t;
                else if (week[j] == '[WED]')
                    this.week[3] = t;
                else if (week[j] == '[THU]')
                    this.week[4] = t;
                else if (week[j] == '[FRI]')
                    this.week[5] = t;
                else if (week[j] == '[SAT]')
                    this.week[6] = t;
                else if (week[j] == '[HOL]')
                    this.week[7] = t;
            }
        }
    }
}



//-------------------------------------------------
//loadHoliday()
//祝日データを解析し、オブジェクトを生成 
//-------------------------------------------------  

function loadHoliday(data) {

    var row;
    var line = data.split("\n");
    this.length = 0;

    for (row in line) {
        if (/([0-9]+)\/([0-9]+)\/([0-9]+):(.*)/.test(line[row])) {
            this[this.length] = {
                y: RegExp.$1,
                m: RegExp.$2,
                d: RegExp.$3,
                c: RegExp.$4
            };
            this.length += 1;
        } else if (/([0-9]+)\/([0-9]+):(.*)/.test(line[row])) {
            this[this.length] = {
                y: 0,
                m: RegExp.$1,
                d: RegExp.$2,
                c: RegExp.$3
            };
            this.length += 1;
        }
    }

    return (this);
}



//-------------------------------------------------
//loadMenu()
//メニューデータを解析し、オブジェクトを生成 
//-------------------------------------------------  

function loadMenu(data) {
    var row;
    var line = data.split("\n");

    this.length = 0;

    for (row = 0; row < line.length; row++) {
        if (/^\w+/.test(line[row])) {
            line[row].match(/(\w+),(.*)/);
            this[this.length] = {
                ID: RegExp.$1,
                string: RegExp.$2
            };
            this.length += 1;
        }
    }

    return (this);
}



//-------------------------------------------------  
//getNextList()
//次発リストを取得する
//-------------------------------------------------  

function getNextList(date, method, filter, max) {
    var token;
    var table;
    var row, col;
    var loop;
    var cache = new Array();

    method.match(/next_([0-9]+)/);
    var today = new Date(date.getTime() + Number(RegExp.$1) * 60000);

    var yesterday = new Date(today.getTime() - (24 * 3600 * 1000));
    var tomorrow = new Date(today.getTime() + (24 * 3600 * 1000));
    var t, first, last, now, time;
    var baseTime = 0;

    now = today.getHours() * 60 + today.getMinutes();

    t = getTableByDate(today);
    table = TableData[t];

    if (table.data.length == 0) {
        this.length = 0;
        this.dateString = MSGLIST.PRE_OF_TABLE + ((today.getMonth() + 1) + "/" + today.getDate() + "(" + WeekString[today.getDay()] + ")" + MSGLIST.POST_OF_TABLE);
        return (this);
    }

    token = table.data[0].match(/[0-9]+/g);
    first = table.hour[0] * 60 + Number(token[0]);
    token = table.data[table.data.length - 1].match(/[0-9]+/g);
    last = table.hour[table.hour.length - 1] * 60 + Number(token[token.length - 1]);

    // 今日の終電が既に発車している場合は、明日のテーブル表示 
    if (now >= last) {
        t = getTableByDate(tomorrow);
        baseTime = Date.parse(tomorrow.getFullYear() + "/" + (tomorrow.getMonth() + 1) + "/" + tomorrow.getDate());
        now -= (1440); // 1440(min) = 24(hour) * 60(min)
        this.dateString = MSGLIST.PRE_OF_TABLE + (((tomorrow.getMonth() + 1) + "/" + tomorrow.getDate() + "(" + WeekString[tomorrow.getDay()] + ")" + MSGLIST.POST_OF_TABLE));
    }

    // 今日の始発が既に発車済みの場合は、今日のテーブル表示 
    else if (now >= first) {
        //      t = getTableByDate(today) ;
        baseTime = Date.parse(today.getFullYear() + "/" + (today.getMonth() + 1) + "/" + today.getDate());
        this.dateString = MSGLIST.PRE_OF_TABLE + (((today.getMonth() + 1) + "/" + today.getDate() + "(" + WeekString[today.getDay()] + ")" + MSGLIST.POST_OF_TABLE));
    }

    // 深夜電車のチェック
    else {
        t = getTableByDate(yesterday);
        table = TableData[t];

        if (table.data.length > 0) {
            token = table.data[0].match(/[0-9]+/g);
            first = table.hour[0] * 60 + Number(token[0]);
            token = table.data[table.data.length - 1].match(/[0-9]+/g);
            last = table.hour[table.hour.length - 1] * 60 + Number(token[token.length - 1]);
        } else
            last = 24 * 60;

        // 深夜(24時以降)の電車が残っている場合は、昨日のテーブル表示 
        if ((now + (1440)) < last) {
            //          t = getTableByDate(yesterday) ;
            baseTime = Date.parse(yesterday.getFullYear() + "/" + (yesterday.getMonth() + 1) + "/" + yesterday.getDate());
            now += 1440;
            this.dateString = MSGLIST.PRE_OF_TABLE + (((yesterday.getMonth() + 1) + "/" + yesterday.getDate() + "(" + WeekString[yesterday.getDay()] + ")" + MSGLIST.MIDNIGHT));
        }

        // 始発電車を待つ 
        else {
            t = getTableByDate(today);
            baseTime = Date.parse(today.getFullYear() + "/" + (today.getMonth() + 1) + "/" + today.getDate());
            this.dateString = MSGLIST.PRE_OF_TABLE + (((today.getMonth() + 1) + "/" + today.getDate() + "(" + WeekString[today.getDay()] + ")" + MSGLIST.POST_OF_TABLE));
        }
    }


    // 現在時刻サーチ
    // ---------------------------
    table = TableData[t];
    var hasComment;
    hasComment = false;

    for (row = 0; row < table.hour.length; row++) {
        if (((table.hour[row] + 1) * 60) > now) {
            token = table.data[row].match(/[a-zA-Z]+|[0-9]+/g);

            for (col = 0; col < token.length; col++) {
                if (isNaN(token[col]))
                    hasComment = true;
                else {
                    time = table.hour[row] * 60 + Number(token[col]);
                    if (now < time)
                        break;
                    hasComment = false;
                }
            }
            if (col < token.length) {
                for (loop = 0; loop < col - 1; loop++)
                    token.shift();
                if ((hasComment == false) && (col != 0))
                    token.shift();
                break;
            }
        }
    }
    first = row;


    // 時刻リスト生成
    // ---------------------------
    var count = 0;
    var string = '';
    var isMatch = false;

    for (row = first; row < table.hour.length && count < max; row++) {
        if (row != first)
            token = table.data[row].match(/[a-zA-Z]+|[0-9]+/g);

        for (col = 0; col < token.length && count < max; col++) {
            if (isNaN(token[col])) {
                if (cache[token[col]] == false)
                    col += 1;
                else if (cache[token[col]] != undefined) {
                    isMatch = true;
                    string = cache[token[col]];
                } else {
                    string = '';
                    for (loop = 0; loop < token[col].length; loop++)
                        string += (TableData.comment[token[col].charAt(loop)] + " ");

                    filter.lastIndex = 0;
                    if (filter.test(string)) {
                        isMatch = true;
                        cache[token[col]] = string;
                    } else {
                        isMatch = false;
                        cache[token[col]] = false;
                        col += 1;
                    }
                }
            } else {
                if (isMatch) {
                    this[count] = {
                        hour: Number(table.hour[row]),
                        min: Number(token[col]),
                        comment: string
                    };
                    count += 1;
                } else if (filter.source == ".*") {
                    this[count] = {
                        hour: Number(table.hour[row]),
                        min: Number(token[col]),
                        comment: ''
                    };
                    count += 1;
                }
                isMatch = false;
                string = '';
            }
        }
    }

    this.baseTime = baseTime;
    this.name = table.name;
    this.length = count;
    this.isRealtime = true;

    return (this);
}

//-------------------------------------------------  
//getLastList()
//終電リストを生成 
//-------------------------------------------------  

function getLastList(today, filter, max) {
    var token;
    var table;
    var row, col;
    var loop;


    var yesterday = new Date(today.getTime() - (24 * 3600 * 1000));
    var t, first, last, now, time;
    var baseTime = 0;

    now = today.getHours() * 60 + today.getMinutes();

    t = getTableByDate(today);
    table = TableData[t];

    if (table.data.length == 0) {
        this.length = 0;
        this.dateString = MSGLIST.PRE_OF_TABLE + ((today.getMonth() + 1) + "/" + today.getDate() + "(" + WeekString[today.getDay()] + ")" + MSGLIST.POST_OF_TABLE);
        return (this);
    }

    token = table.data[0].match(/[0-9]+/g);
    first = table.hour[0] * 60 + Number(token[0]);
    token = table.data[table.data.length - 1].match(/[0-9]+/g);
    last = table.hour[table.hour.length - 1] * 60 + Number(token[token.length - 1]);

    // 今日の始発が既に発車済みの場合は、今日の終電を表示 
    if (now >= first) {
        //      t = getTableByDate(today) ;
        baseTime = Date.parse(today.getFullYear() + "/" + (today.getMonth() + 1) + "/" + today.getDate());
        this.dateString = MSGLIST.PRE_OF_TABLE + ((today.getMonth() + 1) + "/" + today.getDate() + "(" + WeekString[today.getDay()] + ")" + MSGLIST.POST_OF_TABLE);
    }

    // 昨日の終電を表示 
    else {
        t = getTableByDate(yesterday);
        baseTime = Date.parse(yesterday.getFullYear() + "/" + (yesterday.getMonth() + 1) + "/" + yesterday.getDate());
        now += 1440;
        this.dateString = MSGLIST.PRE_OF_TABLE + ((yesterday.getMonth() + 1) + "/" + yesterday.getDate() + "(" + WeekString[yesterday.getDay()] + ")" + MSGLIST.POST_OF_TABLE);
    }


    // 終電リスト生成 
    // ---------------------------
    table = TableData[t];
    var string;
    var count = 0;
    var work = new Array();

    for (row = table.hour.length - 1; row >= 0 && count < max; row--) {
        min = table.data[row].match(/[0-9]+/g);
        token = table.data[row].match(/[a-zA-Z]*[0-9]+/g);

        for (col = token.length - 1; col >= 0 && count < max; col--) {
            string = "";
            for (loop = 0; loop < token[col].length; loop++) {
                if (isNaN(token[col].charAt(loop)))
                    string += (TableData.comment[token[col].charAt(loop)] + " ");
            }

            if (filter.source != ".*") {
                filter.lastIndex = 0;
                if (filter.test(string)) {
                    work[count] = {
                        hour: Number(table.hour[row]),
                        min: Number(min[col]),
                        comment: string
                    };
                    count += 1;
                }
            } else {
                work[count] = {
                    hour: Number(table.hour[row]),
                    min: Number(min[col]),
                    comment: string
                };
                count += 1;
            }
        }
    }

    work.reverse();
    for (loop = 0; loop < count; loop++)
        this[loop] = {
            hour: work[loop].hour,
            min: work[loop].min,
            comment: work[loop].comment
    };


    this.baseTime = baseTime;
    this.name = table.name;
    this.length = count;
    this.isRealtime = true;

    return (this);
}


//-------------------------------------------------  
//getAllList()
//一日全てのリストを生成する
//-------------------------------------------------  

function getAllList(method, filter) {
    var token;
    var row, col, loop;
    var cache = new Array();


    if (method == 'sun') {
        var t = TableData.week[0];
        this.dateString = MSGLIST.TABLE_OF_SUN;
    } else if (method == 'mon') {
        var t = TableData.week[1];
        this.dateString = MSGLIST.TABLE_OF_MON;
    } else if (method == 'tue') {
        var t = TableData.week[2];
        this.dateString = MSGLIST.TABLE_OF_TUE;
    } else if (method == 'wed') {
        var t = TableData.week[3];
        this.dateString = MSGLIST.TABLE_OF_WED;
    } else if (method == 'thu') {
        var t = TableData.week[4];
        this.dateString = MSGLIST.TABLE_OF_THU;
    } else if (method == 'fri') {
        var t = TableData.week[5];
        this.dateString = MSGLIST.TABLE_OF_FRI;
    } else if (method == 'sat') {
        var t = TableData.week[6];
        this.dateString = MSGLIST.TABLE_OF_SAT;
    } else if (method == 'hol') {
        var t = TableData.week[7];
        this.dateString = MSGLIST.TABLE_OF_HOL;
    } else
        var t = 0;



    // 時刻リスト生成
    // ---------------------------
    table = TableData[t];
    var string = '';
    var isMatch = false;
    var count = 0;

    for (row = 0; row < table.hour.length; row++) {
        token = table.data[row].match(/[a-zA-Z]+|[0-9]+/g);

        for (col = 0; col < token.length; col++) {
            if (isNaN(token[col])) {
                if (cache[token[col]] == false)
                    col += 1;
                else if (cache[token[col]] != undefined) {
                    isMatch = true;
                    string = cache[token[col]];
                } else {
                    string = '';
                    for (loop = 0; loop < token[col].length; loop++)
                        string += (TableData.comment[token[col].charAt(loop)] + " ");

                    filter.lastIndex = 0;
                    if (filter.test(string)) {
                        isMatch = true;
                        cache[token[col]] = string;
                    } else {
                        isMatch = false;
                        cache[token[col]] = false;
                        col += 1;
                    }
                }
            } else {
                if (isMatch) {
                    this[count] = {
                        hour: Number(table.hour[row]),
                        min: Number(token[col]),
                        comment: string
                    };
                    count += 1;
                } else if (filter.source == ".*") {
                    this[count] = {
                        hour: Number(table.hour[row]),
                        min: Number(token[col]),
                        comment: ''
                    };
                    count += 1;
                }
                isMatch = false;
                string = '';
            }
        }
    }


    this.baseTime = 0;
    this.name = table.name;
    this.length = count;
    this.isRealtime = false;

    return (this);
}


//-------------------------------------------------  
//getTableByDate()
//日付をもとに使用するテーブルを選択する 
//-------------------------------------------------  

function getTableByDate(date) {
    var week = date.getDay();

    for (var loop = 0; loop < HolidayData.length; loop++) {
        if ((date.getFullYear() == HolidayData[loop].y) &&
            ((date.getMonth() + 1) == HolidayData[loop].m) &&
            (date.getDate() == HolidayData[loop].d)) {
            week = 7;
            break;
        } else if ((HolidayData[loop].y == 0) &&
            ((date.getMonth() + 1) == HolidayData[loop].m) &&
            (date.getDate() == HolidayData[loop].d)) {
            week = 7;
            break;
        }
    }

    return (TableData.week[week]);
}