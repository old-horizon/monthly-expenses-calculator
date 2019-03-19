function onOpen(e) {
  var ui = SpreadsheetApp.getUi();
  var props = getProperties();

  if (Session.getActiveUser().getEmail() != props.adminUserEmail) {
    return;
  }

  ui.createMenu('管理者メニュー')
    .addItem('テンプレート更新', 'updateTemplate')
    .addItem('動的参照の修復', 'fixDynamicReferences')
    .addSeparator()
    .addItem('月別シートを削除', 'deleteAllMonths')
    .addToUi();
}
