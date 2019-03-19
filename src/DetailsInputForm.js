function submitDetailsInputForm() {
  var ui = SpreadsheetApp.getUi();

  var alert = ui.alert('入力した明細を登録しますか？', ui.ButtonSet.OK_CANCEL);
  if (alert == ui.Button.CANCEL) {
    return;
  }

  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var props = getProperties();

  var header = getHeader();
  var details = getDetails();

  var currentMonth = getCurrentMonth(spreadsheet, props);
  var payments = toPayments(header, details);
  addPayments(spreadsheet, props, currentMonth, payments);

  markAsProcessed(formatDate(header.timeStampValue));

  clearDetailsInputForm();

  function getHeader() {
    var header = props.detailsInputForm.header;
    return parseRange(header.rangeName, header.columns);
  }

  function getDetails() {
    var details = props.detailsInputForm.details;
    var rowCount = spreadsheet.getRangeByName(details.rowCountCell).getValue();

    if (rowCount < 1) {
      throw new Error('明細が入力されていません。');
    }

    return parseRange(details.rangeName, details.columns, rowCount);
  }

  function toPayments(header, details) {
    return details.map(function(detail) {
      return {
        date: header.date,
        payer: header.payer,
        category: detail.category,
        content: detail.content,
        amount: detail.amount,
        tax: detail.tax,
        receipt: header.receiptUrl
      };
    });
  }

  function markAsProcessed(timeStamp) {
    var lock = LockService.getDocumentLock();
    lock.waitLock(props.lockTimeoutMillis);

    try {
      var sheet = spreadsheet.getSheetByName(props.formData.sheetName);
      var values = getMaxRange(sheet).getValues();

      for (var row = 0; row < values.length; row++) {
        var columns = values[row];
        var timeStampCell = columns[props.formData.columnIndices.timeStamp];

        if (!(timeStampCell instanceof Date) || formatDate(timeStampCell) != timeStamp) {
          continue;
        }

        var processedCell = sheet.getRange(row + 1, props.formData.columnIndices.processed + 1);
        processedCell.setValue(true);
        break;
      }

    } finally {
      SpreadsheetApp.flush();
      lock.releaseLock();
    }
  }

  function formatDate(date) {
    return Utilities.formatDate(date, 'JST', 'yyyy/MM/dd HH:mm:ss');
  }

  function parseRange(rangeName, columns, rowCount) {
    var count = rowCount || 1;
    var records = [];
    var values = spreadsheet.getRangeByName(rangeName).getValues();

    for (var i = 0; i < count; i++) {
      var row = values[i];
      var record = {};

      Object.keys(columns).forEach(function(key) {
        var columnDef = columns[key];
        var column = row[columnDef.index];

        if (columnDef.required && !column) {
          var errorMessage = '[' + columnDef.name + '] が入力されていません。';
          rowCount && (errorMessage += '(' + (i + 1) + '行目)');
          throw new Error(errorMessage);
        }

        record[key] = column;
      });

      records.push(record);
    }

    return rowCount ? records : records[0];
  }
}

function clearDetailsInputForm() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var props = getProperties();
  var sheet = spreadsheet.getSheetByName(props.detailsInputForm.sheetName);

  clearHeader();
  clearDetails();

  function clearHeader() {
    var header = props.detailsInputForm.header;
    clearRange(header.rangeName, header.columns);
  }

  function clearDetails() {
    var details = props.detailsInputForm.details;
    var rowCount = spreadsheet.getRangeByName(details.rowCountCell).getValue();

    if (rowCount < 1) {
      return;
    }

    clearRange(details.rangeName, details.columns, rowCount);
  }

  function clearRange(rangeName, columns, rowCount) {
    rowCount = rowCount || 1;
    var startRow = spreadsheet.getRangeByName(rangeName).getRow();

    Object.keys(columns).map(function(key) {
      return columns[key];
    })
    .filter(function(c) {
      return c.editable;
    })
    .forEach(function(c) {
      var range = sheet.getRange(startRow, c.index + 1, rowCount);
      range.clear({contentsOnly: true});
    });
  }
}
