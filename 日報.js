(function () {
    "use strict";
    function loadJS(src) {
        document.write('<script type="text/javascript" src="' + src + '"></script>');
    }

    loadJS('https://js.cybozu.com/jquery/3.2.1/jquery.min.js');
    loadJS('https://js.cybozu.com/jqueryui/1.12.1/jquery-ui.min.js');
    loadJS('https://ajax.googleapis.com/ajax/libs/jqueryui/1/i18n/jquery.ui.datepicker-ja.min.js');

    // 新規登録/編集 画面の表示時
    // ・「合計時間」フィールドを編集不可（非活性）にする
    // ・「日報一括登録レコードID」フィールドを編集不可（非活性）にする
    kintone.events.on(['app.record.create.show', 'app.record.edit.show', 'app.record.index.edit.show'], function (event) {
        var record = event.record;
        record['合計時間'].disabled = true;
        record['日報一括登録レコードID'].disabled = true;
        return event;
    });

    //     レコードの保存時

    // ・「担当者」が複数人入力されている場合は入力エラーを表示する
    // 　※フィールドにエラーを表示して下さい（フィールドにエラーを表示する方法については、cybozu developer networkを参照）

    // ・「報告内容」テーブルの「作業時間（分）」の値が「0以下」の場合は入力エラーを表示する
    // 　※フィールドにエラーを表示して下さい（フィールドにエラーを表示する方法については、cybozu developer networkを参照）

    // ・「合計時間」の値が8時間を超えている場合は勤務時間超過エラーを表示する
    // 　※レコードにエラーを表示して下さい（レコードにエラーを表示する方法については、cybozu developer networkを参照）

    // ・登録されている日報の中に、「担当者」と「作業日」の組合せが同じレコードが存在する場合は重複エラーを表示する
    // 　※レコードにエラーを表示して下さい（レコードにエラーを表示する方法については、cybozu developer networkを参照）
    // 　※重複レコードを検索する際は、編集中のレコード自身が検索されないよう注意して下さい
    kintone.events.on(['app.record.create.submit', 'app.record.edit.submit'
    ], function (event) {
        var timeRecord = event.record.作業日.value;
        timeRecord = parseInt(timeRecord.replaceAll('-', ''));
        console.log(event.record.担当者);
        var recordNow = kintone.app.record.getId();
        var bodyReportDaily = {
            'app': 25
        };
        var bodyReportDailyRecord = {
            'app': 25,
            'id': recordNow
        };
        if (event.record.担当者.value.length > 1) {
            event.record.担当者.error = "「担当者」が複数人入力されている";
        }
        var tableRecords = event.record.報告内容.value;
        for (var i = 0; i < tableRecords.length; i++) {
            if (tableRecords[i].value['作業時間_分'].value <= 0) {
                tableRecords[i].value['作業時間_分'].error = "「作業時間（分）」の値が「0以下」です";
            }
        }
        if (event.record.合計時間.value > 8) {
            event.record.合計時間.error = "「合計時間」の値が8時間を超えている";
        }
        return kintone.api(kintone.api.url('/k/v1/records', true), 'GET', bodyReportDaily).then(function (resp) {
            if (recordNow == null) {
                for (var i = 0; i < resp.records.length; i++) {
                    var timeRecords = resp.records[i].作業日.value;
                    timeRecords = parseInt(timeRecords.replaceAll('-', ''));
                    if (event.record.担当者.value[0].name == resp.records[i].担当者.value[0].name && timeRecord == timeRecords) {
                        event.record.担当者.error = "「担当者」と「作業日」の組合せが同じレコードが存在する";
                        event.record.作業日.error = "「担当者」と「作業日」の組合せが同じレコードが存在する";
                        console.log(event.record.作業日);
                        break;
                    }
                }
            }
            else {
                for (var i = 0; i < resp.records.length; i++) {
                    if (i != recordNow) {
                        var timeRecords = resp.records[i].作業日.value;
                        timeRecords = parseInt(timeRecords.replaceAll('-', ''));
                        if (event.record.担当者.value[0].name == resp.records[i].担当者.value[0].name && timeRecord == timeRecords) {
                            event.record.担当者.error = "「担当者」と「作業日」の組合せが同じレコードが存在する";
                            event.record.作業日.error = "「担当者」と「作業日」の組合せが同じレコードが存在する";
                            break;
                        }
                    }
                }
            }
            return event;
        });

    });

    // 「作業時間（分）」の入力時
    // ・「報告内容」テーブルの「作業時間（分）」の合計を分から時間に換算し、「合計時間」フィールドにセットする
    // 　※計算式フィールドを使用するのではなく、JavaScriptでプログラムを組んで行うこと
    kintone.events.on(['app.record.create.change.報告内容', 'app.record.edit.change.報告内容', 'app.record.create.change.作業時間_分', 'app.record.edit.change.作業時間_分',
    ], function (event) {
        var total = 0;
        var totalHours;
        var tableRecords = event.record.報告内容.value;
        for (var i = 0; i < tableRecords.length; i++) {
            var workingHours = tableRecords[i].value['作業時間_分'].value;
            total = total + parseFloat(workingHours);
        }
        totalHours = total / 60;
        totalHours = totalHours.toFixed(2);
        event.record.合計時間.value = totalHours;
        return event;
    });

    // 検索ボタンの押下で検索処理を行い、検索結果を一覧に表示する
    kintone.events.on('app.record.index.show', function (event) {
        // !一覧ID判断
        if (event.viewId !== 5978624) {
            return;
        }
        // また、jQuery-ui-datepickerを使用し、カレンダーの日付を選択して入力できるようにする
        var timeTo = "";
        var timeFrom = "";
        jQuery("#datepicker").datepicker({ dateFormat: 'yy-mm-dd' });
        jQuery("#datepicker1").datepicker({ dateFormat: 'yy-mm-dd' });

        // get user
        // ドロップダウンの選択肢は、JavaScriptでcybozu.com のユーザー情報を取得し、動的に生成する
        //（ユーザー情報の取得については、cybozu developer networkを参照）
        var username = "すべて";
        var recordUsers = document.getElementById("recordUsers");
        var listUsers = new Array();
        var select = document.createElement('select'); // selectを作成
        select.className = 'kintoneplugin-select';
        select.id = 'testId';
        var option1 = document.createElement('option'); // option作成
        option1.text = "すべて";
        select.appendChild(option1);

        // ID app 表示順設定
        var bodySetting = {
            'app': 30
        };
        // ID app プロジェクト
        var bodyProject = {
            'app': 26
        };
        var objectCategories = new Array();

        // recordContent
        var recordContent = document.getElementById('recordContent');
        var records = event.records;
        var listRecords = new Array();

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
        //         ※実装においては、日報アプリからのレコード取得処理と、表示順設定アプリからのレコード取得処理を、それぞれ
        // 　　kintone.Promiseオブジェクトを返す関数として作成し、両関数をkintone.Promise.allを使用して同期処理を行う記述とすること
        // 　　（参考URL: https://developer.cybozu.io/hc/ja/articles/215029846-kintone-Promiseとは）
        return kintone.api(kintone.api.url('/k/v1/records', true), 'GET', bodySetting)
            .then(function (resp1) {
                for (var i = 0; i < resp1.records.length; i++) {
                    listUsers.push([resp1.records[i].担当者.value[0].name, resp1.records[i].表示順.value]);
                    var option = document.createElement('option');
                    option.text = resp1.records[i].担当者.value[0].name;
                    select.appendChild(option);
                }

                recordUsers.appendChild(select);
                // チェックボックスは、JavaScriptでプロジェクトアプリの「カテゴリ」フィールドに設定されている選択肢を取得し、動的に生成する
                // （フォームの設定情報の取得については、cybozu developer networkを参照）
                return kintone.api(kintone.api.url('/k/v1/app/form/fields', true), 'GET', bodyProject)
            })
            .then(function (resp) {
                // success
                var test = resp.properties.カテゴリA.options;
                var count = 0;
                var categories = document.getElementById('categories');
                for (const property in test) {
                    var check = 'test.' + property + '.index';
                    var check1 = eval(check);

                    objectCategories.push([property, check1]);
                }
                // 「担当者の表示順」の昇順
                objectCategories.sort(sortFunction);

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

                for (var i = 0; i < objectCategories.length; i++) {
                    var listCategories = document.createElement('div');
                    listCategories.className = 'kintoneplugin-input-checkbox';

                    var mySpan = document.createElement('span');
                    mySpan.className = 'kintoneplugin-input-checkbox-item';

                    var myInput = document.createElement('input');
                    myInput.id = 'checkbox_' + count;
                    myInput.type = 'checkbox';
                    myInput.checked = 'true';

                    var myLabel = document.createElement('label');
                    myLabel.htmlFor = myInput.id;
                    myLabel.innerHTML = objectCategories[i][0];

                    mySpan.appendChild(myInput);
                    mySpan.appendChild(myLabel);
                    listCategories.appendChild(mySpan);
                    categories.appendChild(listCategories);
                    count++;
                }
                for (var i = 0; i < records.length; i++) {
                    var record = records[i];

                    for (var j = 0; j < record.報告内容.value.length; j++) {
                        var record1 = record.報告内容.value[j];
                        for (var k = 0; k < listUsers.length; k++) {
                            for (var h = 0; h < objectCategories.length; h++) {
                                if (listUsers[k][0] == record.担当者.value[0].name && objectCategories[h][0] == record1.value.カテゴリ.value) {
                                    // console.log(listUsers[k][1]);
                                    // console.log(objectCategories[h][1]);
                                    listRecords.push([listUsers[k][0], listUsers[k][1], objectCategories[h][1], record1.value.プロジェクトコード.value, record1.value.プロジェクト名.value, record1.value.カテゴリ.value, record1.value.作業時間_分.value, record.作業日.value]);
                                    break;
                                }
                            }
                        }
                    }
                }
                // ※検索結果の表示順は、「担当者の表示順」の昇順、「プロジェクトコード」の昇順とする
                // 担当者の表示順は表示順設定アプリより取得し、カテゴリの表示順は、プロジェクトアプリの「カテゴリ」フィールドに設定されている選択肢の順番とする
                listRecords.sort(sortFunction2);
                listRecords.sort(sortFunction1);
                listRecords.sort(sortFunction);
                var listWhereDiff = new Array();
                var zero = 0;
                listWhereDiff.push(zero);
                var listRecordsCopy = new Array();
                for (var m = 1; m < listRecords.length; m++) {
                    if (listRecords[m][0] != listRecords[m - 1][0] || listRecords[m][3] != listRecords[m - 1][3]) {
                        listWhereDiff.push(m);
                    }
                }
                listWhereDiff.push(listRecords.length);
                for (var m = 0; m < listWhereDiff.length - 1; m++) {
                    var SumTimes = 0;
                    for (var n = listWhereDiff[m]; n < listWhereDiff[m + 1]; n++) {
                        SumTimes = SumTimes + parseInt(listRecords[n][6]);
                    }
                    listRecordsCopy.push([listRecords[listWhereDiff[m]][0], listRecords[listWhereDiff[m]][3], listRecords[listWhereDiff[m]][4], listRecords[listWhereDiff[m]][5], SumTimes]);
                }
                for (var m = 0; m < listRecordsCopy.length; m++) {
                    renderData(listRecordsCopy[m][0], listRecordsCopy[m][1], listRecordsCopy[m][2], listRecordsCopy[m][3], listRecordsCopy[m][4]);
                }
                submit.addEventListener("click", function () {
                    recordContent.innerHTML = '';
                    username = document.getElementById("testId").value;
                    timeFrom = document.getElementById("datepicker").value;
                    timeTo = document.getElementById("datepicker1").value;
                    timeTo = parseInt(timeTo.replaceAll('-', ''));
                    timeFrom = parseInt(timeFrom.replaceAll('-', ''));
                    if (isNaN(timeFrom)) timeFrom = 0;
                    if (isNaN(timeTo)) timeTo = 999999999;
                    var checkboxes = new Array();
                    var readCheckbox = document.getElementById('categories');
                    for (var i = 0; i < readCheckbox.childElementCount; i++) {
                        var checkSelected = document.getElementById('checkbox_' + i);
                        if (checkSelected.checked == true) {
                            checkboxes.push(checkSelected.parentNode.childNodes[1].innerHTML);
                        }
                    }
                    var listWhereDiffSubmit = new Array();
                    listWhereDiffSubmit.push(zero);
                    var listRecordsSubmit = new Array();
                    console.log(listRecords);
                    console.log(listRecordsSubmit);
                    for (var m = 0; m < listRecords.length; m++) {
                        if (timeFrom <= parseInt(listRecords[m][7].replaceAll("-", "")) && parseInt(listRecords[m][7].replaceAll("-", "")) <= timeTo) {
                            listRecordsSubmit.push([listRecords[m][0], listRecords[m][1], listRecords[m][2], listRecords[m][3], listRecords[m][4], listRecords[m][5], listRecords[m][6], listRecords[m][7]])
                        }
                    }
                    // 結果 :担当者＋プロジェクトコード＋プロジェクト名＋カテゴリ毎に、作業時間をサマリーした
                    var listRecordsCopySubmit = new Array();
                    if (listRecordsSubmit.length != 0) {
                        for (var m = 1; m < listRecordsSubmit.length; m++) {
                            if (listRecordsSubmit[m][0] != listRecordsSubmit[m - 1][0] || listRecordsSubmit[m][3] != listRecordsSubmit[m - 1][3]) {
                                listWhereDiffSubmit.push(m);
                            }
                        }
                        listWhereDiffSubmit.push(listRecordsSubmit.length);
                        for (var m = 0; m < listWhereDiffSubmit.length - 1; m++) {
                            var SumTimes = 0;
                            for (var n = listWhereDiffSubmit[m]; n < listWhereDiffSubmit[m + 1]; n++) {
                                SumTimes = SumTimes + parseInt(listRecordsSubmit[n][6]);
                            }
                            listRecordsCopySubmit.push([listRecordsSubmit[listWhereDiffSubmit[m]][0], listRecordsSubmit[listWhereDiffSubmit[m]][3], listRecordsSubmit[listWhereDiffSubmit[m]][4], listRecordsSubmit[listWhereDiffSubmit[m]][5], SumTimes]);
                        }

                        for (var m = 0; m < listRecordsCopySubmit.length; m++) {
                            if (username === "すべて") {
                                if (checkboxes.length == readCheckbox.childElementCount) {
                                    renderData(listRecordsCopySubmit[m][0], listRecordsCopySubmit[m][1], listRecordsCopySubmit[m][2], listRecordsCopySubmit[m][3], listRecordsCopySubmit[m][4]);
                                }
                                else {
                                    var booleanCheck = false;
                                    for (var n = 0; n < checkboxes.length; n++) {
                                        if (checkboxes[n] == listRecordsCopySubmit[m][3]) {
                                            booleanCheck = true;
                                        }
                                    }
                                    if (booleanCheck == true) {
                                        renderData(listRecordsCopySubmit[m][0], listRecordsCopySubmit[m][1], listRecordsCopySubmit[m][2], listRecordsCopySubmit[m][3], listRecordsCopySubmit[m][4]);
                                    }
                                }
                            }
                            else {
                                if (username === listRecords[m][0]) {
                                    if (checkboxes.length == readCheckbox.childElementCount) {
                                        renderData(listRecordsCopySubmit[m][0], listRecordsCopySubmit[m][1], listRecordsCopySubmit[m][2], listRecordsCopySubmit[m][3], listRecordsCopySubmit[m][4]);
                                    }
                                    else {
                                        var booleanCheck = false;
                                        for (var n = 0; n < checkboxes.length; n++) {
                                            if (checkboxes[n] == listRecordsCopySubmit[m][3]) {
                                                booleanCheck = true;
                                            }
                                        }
                                        if (booleanCheck == true) {
                                            renderData(listRecordsCopySubmit[m][0], listRecordsCopySubmit[m][1], listRecordsCopySubmit[m][2], listRecordsCopySubmit[m][3], listRecordsCopySubmit[m][4]);
                                        }
                                    }
                                }
                            }
                        }
                    }
                });

                return event;
            });
    });
})();