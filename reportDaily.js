(function () {
    "use strict";
    // 検索ボタンの押下で検索処理を行い、検索結果を一覧に表示する
    kintone.events.on('app.record.index.show', function (event) {
        // !一覧ID判断
        if (event.viewName !== '日報検索') {
            return;
        }
        // また、jQuery-ui-datepickerを使用し、カレンダーの日付を選択して入力できるようにする
        var timeTo = "";
        var timeFrom = "";
        jQuery("#datepicker").datepicker({ dateFormat: 'yy-mm-dd' });
        jQuery("#datepicker1").datepicker({ dateFormat: 'yy-mm-dd' });

        // get user
        // ドロップダウンの選択肢は、JavaScriptでcybozu.com のユーザー情報を取得し、動的に生成する
        var username = "すべて";
        var recordUsers = document.getElementById("recordUsers");
        var listUsers = new Array();
        var select = document.createElement('select'); // selectを作成
        select.className = 'kintoneplugin-select';
        select.id = 'testId';
        var option1 = document.createElement('option'); // option作成
        option1.text = "すべて";
        option1.value = "すべて";
        var objectCategories = new Array();

        // recordContent
        var recordContent = document.getElementById('recordContent');
        var records = event.records;
        var listRecords = new Array();
        var app = 30;

        //         ※実装においては、日報アプリからのレコード取得処理と、表示順設定アプリからのレコード取得処理を、それぞれ
        var app = 30;
        var fields = ['担当者', '表示順'];
        var query = 'order by 表示順 asc';
        var totalCount = false;
        var kintoneRecord = new kintoneJSSDK.Record();
        kintoneRecord.getRecords({ app, query, fields, totalCount })
            .then(function (resp1) {
                recordUsers.innerHTML = "";
                select.appendChild(option1);
                for (var i = 0; i < resp1.records.length; i++) {
                    listUsers.push([resp1.records[i].担当者.value[0].name, resp1.records[i].表示順.value]);
                    var option = document.createElement('option');
                    option.text = resp1.records[i].担当者.value[0].name;
                    option.value = resp1.records[i].担当者.value[0].code;
                    select.appendChild(option);
                }
                recordUsers.appendChild(select);
                // チェックボックスは、JavaScriptでプロジェクトアプリの「カテゴリ」フィールドに設定されている選択肢を取得し、動的に生成する
                return kintone.api(kintone.api.url('/k/v1/app/form/fields', true), 'GET', bodyProject)
            })
            .then(function (resp) {
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
                categories.innerHTML = "";
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
                query = '';
                app = 25;
                fields = ['担当者', '作業日', '報告内容'];
                return kintoneRecord.getRecords({ app, query, fields, totalCount })
            })
            .then(function (resp2) {
                for (var i = 0; i < resp2.records.length; i++) {
                    var record = resp2.records[i];

                    for (var j = 0; j < record.報告内容.value.length; j++) {
                        var record1 = record.報告内容.value[j];
                        for (var k = 0; k < listUsers.length; k++) {
                            for (var h = 0; h < objectCategories.length; h++) {
                                if (listUsers[k][0] == record.担当者.value[0].name && objectCategories[h][0] == record1.value.カテゴリ.value) {
                                    listRecords.push([listUsers[k][0], listUsers[k][1], objectCategories[h][1], record1.value.プロジェクトコード.value, record1.value.プロジェクト名.value, record1.value.カテゴリ.value, record1.value.作業時間_分.value, record.作業日.value]);
                                    break;
                                }
                            }
                        }
                    }
                }

                // ※検索結果の表示順は、「担当者の表示順」の昇順、「プロジェクトコード」の昇順とする
                // 担当者の表示順は表示順設定アプリより取得し、カテゴリの表示順は、プロジェクトアプリの「カテゴリ」フィールドに設定されている選択肢の順番とする
                listRecords.sort(sortFunction2); //project
                listRecords.sort(sortFunction1); //categori
                listRecords.sort(sortFunction); //username
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
                    var code = document.getElementById("testId").value;
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
                    for (var m = 0; m < listRecords.length; m++) {
                        if (timeFrom <= parseInt(listRecords[m][7].replaceAll("-", "")) && parseInt(listRecords[m][7].replaceAll("-", "")) <= timeTo) {
                            listRecordsSubmit.push([listRecords[m][0], listRecords[m][1], listRecords[m][2], listRecords[m][3], listRecords[m][4], listRecords[m][5], listRecords[m][6], listRecords[m][7]])
                        }
                    }
                    // 結果 :担当者＋プロジェクトコード＋プロジェクト名＋カテゴリ毎に、作業時間をサマリーした

                    query = '';
                    if (code === "すべて");
                    else query = '担当者 in ("' + code + '")';
                    if (document.getElementById("datepicker").value == '');
                    else {
                        if (query.length > 0) query = query + ' and 作業日 >= "' + document.getElementById("datepicker").value + '"';
                        else query = '作業日 >= "' + document.getElementById("datepicker").value + '"';
                    }
                    if (document.getElementById("datepicker1").value == '');
                    else {
                        if (query.length > 0) query = query + ' and 作業日 <= "' + document.getElementById("datepicker1").value + '"';
                        else query = '作業日 <= "' + document.getElementById("datepicker1").value + '"';
                    }
                    app = 25;
                    fields = ['担当者', '作業日', '報告内容'];
                    return kintoneRecord.getRecords({ app, query, fields, totalCount })
                        .then((rsp) => {
                            var recordList = new Array();
                            for (var i = 0; i < rsp.records.length; i++) {
                                var recordrsp = rsp.records[i];

                                for (var j = 0; j < recordrsp.報告内容.value.length; j++) {
                                    var recordrsp1 = recordrsp.報告内容.value[j];
                                    for (var k = 0; k < listUsers.length; k++) {
                                        for (var h = 0; h < objectCategories.length; h++) {
                                            if (listUsers[k][0] == recordrsp.担当者.value[0].name && objectCategories[h][0] == recordrsp1.value.カテゴリ.value) {
                                                recordList.push([listUsers[k][0], listUsers[k][1], objectCategories[h][1], recordrsp1.value.プロジェクトコード.value, recordrsp1.value.プロジェクト名.value, recordrsp1.value.カテゴリ.value, recordrsp1.value.作業時間_分.value, recordrsp.作業日.value]);
                                                break;
                                            }
                                        }
                                    }
                                }
                            }
                            recordList.sort(sortFunction2); //project
                            recordList.sort(sortFunction1); //categori
                            recordList.sort(sortFunction); //username
                            var listWhereDiff = new Array();
                            var zero = 0;
                            listWhereDiff.push(zero);
                            var listRecordsCopy = new Array();
                            for (var m = 1; m < recordList.length; m++) {
                                if (recordList[m][0] != recordList[m - 1][0] || recordList[m][3] != recordList[m - 1][3]) {
                                    listWhereDiff.push(m);
                                }
                            }
                            listWhereDiff.push(recordList.length);
                            for (var m = 0; m < listWhereDiff.length - 1; m++) {
                                var SumTimes = 0;
                                for (var n = listWhereDiff[m]; n < listWhereDiff[m + 1]; n++) {
                                    SumTimes = SumTimes + parseInt(recordList[n][6]);
                                }
                                listRecordsCopy.push([recordList[listWhereDiff[m]][0], recordList[listWhereDiff[m]][3], recordList[listWhereDiff[m]][4], recordList[listWhereDiff[m]][5], SumTimes]);
                            }
                            for (var m = 0; m < listRecordsCopy.length; m++) {
                                if (checkboxes.length == readCheckbox.childElementCount) {
                                    renderData(listRecordsCopy[m][0], listRecordsCopy[m][1], listRecordsCopy[m][2], listRecordsCopy[m][3], listRecordsCopy[m][4]);
                                }
                                else {
                                    var booleanCheck = false;
                                    for (var n = 0; n < checkboxes.length; n++) {
                                        if (checkboxes[n] == listRecordsCopy[m][3]) {
                                            booleanCheck = true;
                                        }
                                    }
                                    if (booleanCheck == true) {
                                        renderData(listRecordsCopy[m][0], listRecordsCopy[m][1], listRecordsCopy[m][2], listRecordsCopy[m][3], listRecordsCopy[m][4]);
                                    }
                                }
                            }
                            return event;
                        });
                });
            });
    });
})();