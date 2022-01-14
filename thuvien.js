// ID app 表示順設定
const bodySetting = {
    'app': 30,
    // "query": 'limit ' + 20 + ' offset ' + 0
};
// ID app プロジェクト
const bodyProject = {
    'app': 26,
    // "query": 'limit ' + 20 + ' offset ' + 0
};
// Id app 日報
const bodyReportDaily = {
    'app': 25,
    // "query": 'limit ' + 10 + ' offset ' + 0
};
function renderData(arg1, arg2, arg3, arg4, arg5) {

    // 担当者
    var myRecordTd1 = document.createElement('td');
    myRecordTd1.className = 'kintoneplugin-table-td-control';
    var myRecordDiv1 = document.createElement('div');
    myRecordDiv1.className = 'kintoneplugin-table-td-control-value';
    myRecordDiv1.style.textAlign = 'center';
    myRecordDiv1.innerHTML = arg1;
    myRecordTd1.appendChild(myRecordDiv1);


    // プロジェクトコード
    var myRecordTd2 = document.createElement('td');
    myRecordTd2.className = 'kintoneplugin-table-td-control';
    var myRecordDiv2 = document.createElement('div');
    myRecordDiv2.className = 'kintoneplugin-table-td-control-value';
    myRecordDiv2.style.textAlign = 'center';
    myRecordDiv2.innerHTML = arg2;
    myRecordTd2.appendChild(myRecordDiv2);

    // プロジェクト名
    var myRecordTd3 = document.createElement('td');
    myRecordTd3.className = 'kintoneplugin-table-td-control';
    var myRecordDiv3 = document.createElement('div');
    myRecordDiv3.className = 'kintoneplugin-table-td-control-value';
    myRecordDiv3.style.textAlign = 'center';
    myRecordDiv3.innerHTML = arg3;
    myRecordTd3.appendChild(myRecordDiv3);

    // カテゴリ
    var myRecordTd4 = document.createElement('td');
    myRecordTd4.className = 'kintoneplugin-table-td-control';
    var myRecordDiv4 = document.createElement('div');
    myRecordDiv4.className = 'kintoneplugin-table-td-control-value';
    myRecordDiv4.style.textAlign = 'center';
    myRecordDiv4.innerHTML = arg4;
    myRecordTd4.appendChild(myRecordDiv4);

    // 作業時間
    var myRecordTd5 = document.createElement('td');
    myRecordTd5.className = 'kintoneplugin-table-td-control';
    var myRecordDiv5 = document.createElement('div');
    myRecordDiv5.className = 'kintoneplugin-table-td-control-value';
    myRecordDiv5.style.textAlign = 'center';
    myRecordDiv5.innerHTML = arg5;
    myRecordTd5.appendChild(myRecordDiv5);

    var myRecordTr = document.createElement('tr');
    myRecordTr.className = '';
    myRecordTr.style.marginLeft = '15px';
    myRecordTr.style.marginRight = '15px';
    myRecordTr.appendChild(myRecordTd1);
    myRecordTr.appendChild(myRecordTd2);
    myRecordTr.appendChild(myRecordTd3);
    myRecordTr.appendChild(myRecordTd4);
    myRecordTr.appendChild(myRecordTd5);

    recordContent.appendChild(myRecordTr);
}

function sortFunction(a, b) {
    if (a[1] === b[1]) {
        return 0;
    }
    else {
        return (a[1] < b[1]) ? -1 : 1;
    }
}

function sortFunction1(a, b) {
    if (a[2] === b[2]) {
        return 0;
    }
    else {
        return (a[2] < b[2]) ? -1 : 1;
    }
}

function sortFunction2(a, b) {
    if (a[3] === b[3]) {
        return 0;
    }
    else {
        return (a[3] < b[3]) ? -1 : 1;
    }
}
