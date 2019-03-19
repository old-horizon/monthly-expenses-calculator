function updateTemplate() {
  var ui = SpreadsheetApp.getUi();

  var alert = ui.alert('各月のシートを最新のテンプレートで更新しますか？\n処理中は他の操作を実行しないでください。', ui.ButtonSet.OK_CANCEL);
  if (alert == ui.Button.CANCEL) {
    return;
  }

  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var props = getProperties();

  var templateSheet = spreadsheet.getSheetByName(props.template.sheetName);
  var templateRange = getMaxRange(templateSheet);
  var targetMonths = getTargetMonths(spreadsheet, props);

  targetMonths.forEach(function(month) {
    var sheet = spreadsheet.getSheetByName(month);
    var oldSheet;

    if (sheet) {
      oldSheet = sheet.copyTo(spreadsheet);
      templateRange.copyTo(getMaxRange(sheet));
    } else {
      sheet = templateSheet.copyTo(spreadsheet).setName(month);
      protectSheet(props, sheet);
    }

    var monthCell = sheet.getRange(props.template.monthCell);
    monthCell.setValue(month);

    if (oldSheet) {
      var oldRecords = getRecordRange(oldSheet, props);
      var records = getRecordRange(sheet, props);
      oldRecords.copyTo(records);
      spreadsheet.deleteSheet(oldSheet);
    }
  });

  function protectSheet(props, sheet) {
    var protection = sheet.protect();

    var editableRanges = props.template.editableRanges.map(function(range) {
      return sheet.getRange(range);
    });
    protection.setUnprotectedRanges(editableRanges);

    var me = Session.getActiveUser();
    protection.addEditor(me);
    protection.removeEditors(protection.getEditors());
  }
}

function fixDynamicReferences() {
  var ui = SpreadsheetApp.getUi();
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var props = getProperties();

  var alert = ui.alert('動的参照を修復しますか？\nセルの数式を一旦クリアして再計算を行います。', ui.ButtonSet.OK_CANCEL);

  if (alert == ui.Button.CANCEL) {
    return;
  }

  props.dynamicReferencingSheetNames.forEach(function(sheetName) {
    var sheet = spreadsheet.getSheetByName(sheetName);
    var range = getMaxRange(sheet);
    var formulas = range.getFormulas();

    for (var row = 0; row < formulas.length; row++) {
      var columns = formulas[row];

      for (var column = 0; column < columns.length; column++) {
        var formula = columns[column];

        if (formula) {
          var cell = sheet.getRange(row + 1, column + 1);
          cell.setFormula('');
          cell.setFormula(formula);
        }

      }
    }

  });
}

function deleteAllMonths() {
  var ui = SpreadsheetApp.getUi();
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var props = getProperties();

  var alert = ui.alert('各月のシートを削除しますか？\n既存のデータがすべて削除されます。運用中の実行は避けてください。', ui.ButtonSet.OK_CANCEL);

  if (alert == ui.Button.CANCEL) {
    return;
  }

  var targetMonths = getTargetMonths(spreadsheet, props);

  targetMonths.forEach(function(month) {
    var sheet = spreadsheet.getSheetByName(month);

    if (sheet) {
      spreadsheet.deleteSheet(sheet);
    } 
  });
}
