function getCurrentMonth(spreadsheet, props) {
  return spreadsheet.getRangeByName(props.namedRanges.currentMonth).getValue();
}

function getTargetMonths(spreadsheet, props) {
  return spreadsheet.getRangeByName(props.namedRanges.targetMonth).getValues();
}

function getRecordRange(sheet, props) {
  return sheet.getRange(props.template.record.range);
}

function getMaxRange(sheet) {
  return sheet.getRange(1, 1, sheet.getMaxRows(), sheet.getMaxColumns());
}

function addPayments(spreadsheet, props, month, payments) {
  var lock = LockService.getDocumentLock();
  lock.waitLock(props.lockTimeoutMillis);

  try {
    var sheet = spreadsheet.getSheetByName(month);
    var recordCount = sheet.getRange(props.template.record.countCell).getValue();
    var row = props.template.record.startRow + recordCount;
    var columnIndices = props.template.record.columnIndices;

    writeColumns(row, ['date', 'payer', 'category', 'content', 'amount', 'tax']);
    writeColumns(row, ['receipt']);

  } finally {
    SpreadsheetApp.flush();
    lock.releaseLock();
  }

  function writeColumns(row, keys) {
    var column = columnIndices[keys[0]] + 1;
    var numColumns = keys.length;
    var range = sheet.getRange(row, column, payments.length, numColumns);

    range.getValues()[0].forEach(function(c, i) {
      if (c) {
        throw new Error('書き込み対象のセルに値が存在します。[行番号:' + row + ', 列番号:' + (column + i) + ']');
      }
    });

    var values = payments.map(function(payment) {
      return keys.map(function(key) {
        return payment[key];
      });
    });

    range.setValues(values);
  }
}

function sendToSlack(props, message) {
  var params = {
    method: 'POST',
    contentType: 'application/json',
    payload: JSON.stringify(message)
  };
  UrlFetchApp.fetch(props.slackWebhookUrl, params);
}
