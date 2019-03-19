function onFormSubmit(e) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var props = getProperties();

  var values = e.values;
  
  if (values[props.formData.columnIndices.processMode] != props.formData.processModes.hasContent) {
    var info = toReceiptInfo(values);
    notifyReceiptInfo(props, info);
    return;
  }

  var currentMonth = getCurrentMonth(spreadsheet, props);
  var payment = toPayment(values);

  try {
    addPayments(spreadsheet, props, currentMonth, [payment]);
    markAsProcessed(e);
  } catch (error) {
    notifyPayment(props, payment, error);
    throw error;
  }

  notifyPayment(props, payment);

  function toReceiptInfo(values) {
    return {
      date: getByColumnName(values, 'date'),
      payer: getByColumnName(values, 'payer'),
      receipt: getByColumnName(values, 'receiptNoContent'),
      comment: getByColumnName(values, 'comment')
    };
  }

  function notifyReceiptInfo(props, info) {
    var message = {
      text: '新しいレシートが添付されました。',
      attachments: [
        {
          color: 'good',
          fields: [
            {
              title: '支払った人',
              value: info.payer,
              short: true
            },
            {
              title: '日付',
              value: info.date,
              short: true
            },
            {
              title: 'レシート画像',
              value: info.receipt,
              short: false
            },
            {
              title: 'コメント',
              value: info.comment,
              short: false
            }
          ]
        }
      ]
    };
    sendToSlack(props, message);
  }

  function toPayment(values) {
    return {
      date: getByColumnName(values, 'date'),
      payer: getByColumnName(values, 'payer'),
      category: getByColumnName(values, 'category'),
      content: getByColumnName(values, 'content'),
      amount: getByColumnName(values, 'amount'),
      tax: getByColumnName(values, 'tax'),
      receipt: getByColumnName(values, 'receiptHasContent')
    };
  }

  function notifyPayment(props, payment, error) {
    var text = error ? ('支出入力でエラーが発生しました。\n```' + error.message + '```') : '新しい支出が入力されました。';
    var color = error ? 'danger' : 'good';
    var message = {
      text: text,
      attachments: [
        {
          color: color,
          fields: [
            {
              title: '支払った人',
              value: payment.payer,
              short: true
            },
            {
              title: '日付',
              value: payment.date,
              short: true
            },
            {
              title: '費目',
              value: payment.category,
              short: true
            },
            {
              title: '内容',
              value: payment.content,
              short: true
            },
            {
              title: '金額 (円)',
              value: payment.amount,
              short: true
            },
            {
              title: '消費税',
              value: payment.tax,
              short: true
            },
            {
              title: 'レシート画像',
              value: payment.receipt,
              short: false
            }
          ]
        }
      ]
    };
    sendToSlack(props, message);
  }

  function getByColumnName(values, columnName) {
    return values[props.formData.columnIndices[columnName]];
  }

  function markAsProcessed(event) {
    var lock = LockService.getDocumentLock();
    lock.waitLock(props.lockTimeoutMillis);

    try {
      var range = event.range;
      var sheet = spreadsheet.getSheetByName(props.formData.sheetName);
      var processedCell = sheet.getRange(range.getRow(), props.formData.columnIndices.processed + 1);
      processedCell.setValue(true);

    } finally {
      SpreadsheetApp.flush();
      lock.releaseLock();
    }
  }
}
