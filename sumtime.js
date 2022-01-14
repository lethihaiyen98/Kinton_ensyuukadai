(function() {
    "use strict";
    // 「作業時間（分）」の入力時
    // ・「報告内容」テーブルの「作業時間（分）」の合計を分から時間に換算し、「合計時間」フィールドにセットする
    kintone.events.on(['app.record.create.change.報告内容', 'app.record.edit.change.報告内容', 'app.record.create.change.作業時間_分', 'app.record.edit.change.作業時間_分'], function (event) {
        var total = 0;
        var totalHours;
        var tableRecords = event.record.報告内容.value;
        for (var i = 0; i < tableRecords.length; i++) {
            var workingHours = tableRecords[i].value['作業時間_分'].value;
            total = total + parseFloat(workingHours);
            console.log(total);
        }
        totalHours = total / 60;
        totalHours = totalHours.toFixed(2);
        event.record.合計時間.value = totalHours;
        return event;
    });
})();