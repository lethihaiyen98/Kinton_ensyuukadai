(function () {
    "use strict";
    //     レコードの保存時
    kintone.events.on(['app.record.create.submit', 'app.record.edit.submit'
    ], function (event) {
        var timeRecord = event.record.作業日.value;
        timeRecord = parseInt(timeRecord.replaceAll('-', ''));
        // ・「担当者」が複数人入力されている場合は入力エラーを表示する
        if (event.record.担当者.value.length > 1) {
            event.record.担当者.error = "「担当者」が複数人入力されている";
        }
        // 「報告内容」テーブルの「作業時間（分）」の値が「0以下」の場合は入力エラーを表示する
        var tableRecords = event.record.報告内容.value;
        for (var i = 0; i < tableRecords.length; i++) {
            if (tableRecords[i].value['作業時間_分'].value <= 0) {
                tableRecords[i].value['作業時間_分'].error = "「作業時間（分）」の値が「0以下」です";
            }
        }
        // ・「合計時間」の値が8時間を超えている場合は勤務時間超過エラーを表示する
        if (event.record.合計時間.value > 8) {
            event.record.合計時間.error = "「合計時間」の値が8時間を超えている";
        }
        // ・登録されている日報の中に、「担当者」と「作業日」の組合せが同じレコードが存在する場合は重複エラーを表示する
        var recordNow = kintone.app.record.getId();
        var app = 25;
        var fields = ['担当者', '作業日', 'レコード番号'];
        var query = '担当者 in ("' + event.record.担当者.value[0].code + '") and 作業日 ="' + event.record.作業日.value + '"';
        var totalCount = false;
        var kintoneRecord = new kintoneJSSDK.Record();
        kintoneRecord.getRecords({ app, query, fields, totalCount })
            .then((rsp) => {
                if (recordNow == null) {
                    if (rsp.records.length != 0) {
                        event.record.担当者.error = "「担当者」と「作業日」の組合せが同じレコードが存在する";
                        event.record.作業日.error = "「担当者」と「作業日」の組合せが同じレコードが存在する";
                    }
                }
                else {
                    if (rsp.records[0].レコード番号.value != recordNow) {
                        event.record.担当者.error = "「担当者」と「作業日」の組合せが同じレコードが存在する";
                        event.record.作業日.error = "「担当者」と「作業日」の組合せが同じレコードが存在する";
                    }
                }
            });
        return event;
    });
})();