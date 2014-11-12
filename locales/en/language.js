var WeekString = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
var MSGLIST = {
    'WAIT_MSG': 'Wait a moment...',
    'ERROR_BROKEN': 'Can\'t find timetable',
    'OUT_OF_SERVICE': 'Out of Service',
    'NOT_APPLICABLE': 'Not applicable',
    'MIN': "min",
    'HOUR': "hours",
    'UNTIL': 'Until departure:',
    'LEFT': 'It has been left',
    'PRE_OF_TABLE': 'TimeTable of ',
    'POST_OF_TABLE': '',
    'MIDNIGHT': ' midnight',
    'TABLE_OF_SUN': 'TimeTable of Sunday',
    'TABLE_OF_MON': 'TimeTable of Monday',
    'TABLE_OF_TUE': 'TimeTable of Tuesday',
    'TABLE_OF_WED': 'TimeTable of Wednesday',
    'TABLE_OF_THU': 'TimeTable of Thursday',
    'TABLE_OF_FRI': 'TimeTable of Friday',
    'TABLE_OF_SAT': 'TimeTable of Saturday',
    'TABLE_OF_HOL': 'TimeTable of Holiday'
};
var SAMPLETBLPATH='sample.en.tbl';
var HOLIDAYDATPATH='holiday.en.dat';

function initMenu() {
    document.menuform.tablelist.options[0] = new Option('Choice Train', 'top');

    document.menuform.viewlist.options[0] = new Option('Choice Table', 'next_0');
    document.menuform.viewlist.options[1] = new Option('Now', 'next_0');
    document.menuform.viewlist.options[2] = new Option('After 15 min', 'next_15');
    document.menuform.viewlist.options[3] = new Option('After 30 min', 'next_30');
    document.menuform.viewlist.options[4] = new Option('After 45 min', 'next_45');
    document.menuform.viewlist.options[5] = new Option('After 1 hour', 'next_60');
    document.menuform.viewlist.options[6] = new Option('Last train', 'last');
    document.menuform.viewlist.options[7] = new Option('Monday', 'mon');
    document.menuform.viewlist.options[8] = new Option('Tuesday', 'tue');
    document.menuform.viewlist.options[9] = new Option('Wednesday', 'wed');
    document.menuform.viewlist.options[10] = new Option('Thursday', 'thu');
    document.menuform.viewlist.options[11] = new Option('Friday', 'fri');
    document.menuform.viewlist.options[12] = new Option('Saturday', 'sat');
    document.menuform.viewlist.options[13] = new Option('Sunday', 'sun');
    document.menuform.viewlist.options[14] = new Option('Holiday', 'hol');

    document.menuform.filterlist.options[0] = new Option('Choice Filter', '0');
    document.menuform.filterlist.options[1] = new Option('All', '0');
}