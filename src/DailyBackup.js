function doDailyBackup() {
  var props = getProperties();
  var sheetId = SpreadsheetApp.getActiveSpreadsheet().getId();
  var sheetFile = DriveApp.getFileById(sheetId);

  var name = sheetFile.getName() + '_' + Utilities.formatDate(new Date(), 'JST', 'yyyyMMdd');
  var destination = DriveApp.getFolderById(props.backupFolderId);
  sheetFile.makeCopy(name, destination);
}
