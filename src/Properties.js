function getProperties() {
  return {
    adminUserEmail: 'YOUR_GOOGLE_ACCOUNT',
    backupFolderId: 'BACKUP_FOLDER_ID',
    slackWebhookUrl: 'YOUR_SLACK_WEBHOOK_URL',
    lockTimeoutMillis: 30 * 1000,
    template: {
      sheetName: 'テンプレート',
      monthCell: 'A1',
      record: {
        countCell: 'A2',
        startRow: 5,
        range: 'A5:K',
        columnIndices: {
          date: 0,
          payer: 1,
          category: 2,
          content: 3,
          amount: 4,
          tax: 5,
          receipt: 8
        }
      },
      editableRanges: ['A5:F', 'I5:I']
    },
    dynamicReferencingSheetNames: ['レシートから入力', 'ダッシュボード (今月)', 'ダッシュボード (年間)'],
    namedRanges: {
      currentMonth: '計上月',
      targetMonth: '年月'
    },
    formData: {
      sheetName: '支出入力',
      processModes: {
        hasContent: '内容を入力する',
        noContent: 'レシートを添付して後で入力する'
      },
      columnIndices: {
        timeStamp: 0,
        payer: 1,
        date: 2,
        processMode: 3,
        category: 4,
        content: 5,
        amount: 6,
        tax: 7,
        receiptHasContent: 8,
        receiptNoContent: 9,
        comment: 10,
        processed: 11
      }
    },
    detailsInputForm: {
      sheetName: 'レシートから入力',
      header: {
        rangeName: 'レシートから入力_ヘッダ',
        columns: {
          timeStamp: {
            name: 'タイムスタンプ',
            index: 0,
            required: true,
            editable: true
          },
          date: {
            name: '日付',
            index: 1,
            required: true,
            editable: false
          },
          payer: {
            name: '支払った人',
            index: 2,
            required: true,
            editable: false
          },
          receiptLink: {
            name: 'レシート画像',
            index: 3,
            required: false,
            editable: false
          },
          comment: {
            name: 'コメント',
            index: 4,
            required: false,
            editable: false
          },
          timeStampValue: {
            name: 'タイムスタンプ値',
            index: 5,
            required: true,
            editable: false
          },
          taxRate: {
            name: '消費税率',
            index: 6,
            required: true,
            editable: false
          },
          receiptUrl: {
            name: 'レシート画像URL',
            index: 7,
            required: true,
            editable: false
          }
        }
      },
      details: {
        rangeName: 'レシートから入力_明細',
        rowCountCell: 'レシートから入力_件数',
        columns: {
          category: {
            name: '費目',
            index: 0,
            required: true,
            editable: true
          },
          content: {
            name: '内容',
            index: 1,
            required: true,
            editable: true
          },
          amount: {
            name: '金額',
            index: 2,
            required: true,
            editable: true
          },
          tax: {
            name: '消費税',
            index: 3,
            required: true,
            editable: true
          },
          total: {
            name: '総額',
            index: 4,
            required: false,
            editable: false
          }
        }
      }
    }
  };
}
