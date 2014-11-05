var WeekString = ['日', '月', '火', '水', '木', '金', '土'];
var MSGLIST = {
    'WAIT_MSG': 'お待ち下さい...',
    'ERROR_BROKEN': '時刻表データが見つかりません。',
    'OUT_OF_SERVICE': '運休日です。',
    'NOT_APPLICABLE': '該当条件なし',
    'MIN': "分",
    'HOUR': "時間",
    'UNTIL': '出発まであと',
    'LEFT': '出発済み',
    'PRE_OF_TABLE': '',
    'POST_OF_TABLE': 'の時刻表',
    'MIDNIGHT': '深夜の時刻表',
    'TABLE_OF_SUN': "日曜日の時刻表",
    'TABLE_OF_MON': "月曜日の時刻表",
    'TABLE_OF_TUE': "火曜日の時刻表",
    'TABLE_OF_WED': "水曜日の時刻表",
    'TABLE_OF_THU': "木曜日の時刻表",
    'TABLE_OF_FRI': "金曜日の時刻表",
    'TABLE_OF_SAT': "土曜日の時刻表",
    'TABLE_OF_HOL': "祝日の時刻表",
};

function initMenu() {
    document.menuform.tablelist.options[0] = new Option('時刻表を選択', 'top');

    document.menuform.viewlist.options[0] = new Option('表示方法を選択', 'next_0');
    document.menuform.viewlist.options[1] = new Option('出発リスト[現在]', 'next_0');
    document.menuform.viewlist.options[2] = new Option('出発リスト[15分後]', 'next_15');
    document.menuform.viewlist.options[3] = new Option('出発リスト[30分後]', 'next_30');
    document.menuform.viewlist.options[4] = new Option('出発リスト[45分後]', 'next_45');
    document.menuform.viewlist.options[5] = new Option('出発リスト[1時間後]', 'next_60');
    document.menuform.viewlist.options[6] = new Option('最終便リスト', 'last');
    document.menuform.viewlist.options[7] = new Option('時刻表[月曜日]', 'mon');
    document.menuform.viewlist.options[8] = new Option('時刻表[火曜日]', 'tue');
    document.menuform.viewlist.options[9] = new Option('時刻表[水曜日]', 'wed');
    document.menuform.viewlist.options[10] = new Option('時刻表[木曜日]', 'thu');
    document.menuform.viewlist.options[11] = new Option('時刻表[金曜日]', 'fri');
    document.menuform.viewlist.options[12] = new Option('時刻表[土曜日]', 'sat');
    document.menuform.viewlist.options[13] = new Option('時刻表[日曜日]', 'sun');
    document.menuform.viewlist.options[14] = new Option('時刻表[祝日]', 'hol');

    document.menuform.filterlist.options[0] = new Option('抽出条件を選択', '0');
    document.menuform.filterlist.options[1] = new Option('すべて', '0');
}