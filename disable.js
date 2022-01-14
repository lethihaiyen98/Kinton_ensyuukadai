(function () {
    "use strict";
    // 新規登録/編集 画面の表示時
    kintone.events.on(['app.record.create.show', 'app.record.edit.show', 'app.record.index.edit.show'], function (event) {
        // ・「合計時間」フィールドを編集不可（非活性）にする
        event.record['合計時間'].disabled = true;
        // ・「日報一括登録レコードID」フィールドを編集不可（非活性）にする
        event.record['日報一括登録レコードID'].disabled = true;
        return event;
    });
})();