# monthly-expenses-calculator

## Overview

* Collect bills to the spreadsheet.
* Notify to Slack when new bill added.
* Summarize expenses of the month.
* Calculates the amount according to Japanese consumption tax and burden rate of each person.
* Create daily backup of the spreadsheet.

## Architecture

Serverless architecture composed by the following products.

* Google Spreadsheets
    * Datastore for bills
    * Define calculation parameters
    * Generate graphs

* Google Forms
    * Input form for bills

* Google Sites
    * Frontend

* Google Apps Script
    * Backend (This repository)

## Installation

1. Create the spreadsheet used for datastore.
    * [You can copy sample sheet from here](https://docs.google.com/spreadsheets/d/1FrCCn4C3pugB3ff_yJJLS9ORPuB3RM6v_qYbqlflJxA/edit?usp=sharing).
1. Customize `マスタ` sheet.
1. Add backend scripts to the spreadsheet.
1. Customize `Properties.js`.
1. Create input form with name `支出入力` and questions as follows:

    |Section|Name|Type|Remarks|
    |--|--|--|--|
    |1|支払った人|Multiple choice|Specify values within named range `名前`.|
    |1|日付|Date||
    |1|(N/A)|Multiple choice|Available values:<ul><li>`内容を入力する`: Go to section 2.</li><li>`レシートを添付して後から入力する`: Go to section 3.</li></ul>|
    |2|費目|Multiple choice|Specify values within named range `費目`.|
    |2|内容|Short answer||
    |2|金額 (円)|Short answer||
    |2|消費税|Multiple choice|Available values:<ul><li>`税抜`</li><li>`税込`</li></ul>|
    |2|レシート画像|File upload|<ul><li>Allow only specific file types: `Image`</li><li>Maximum number of files: `1`</li><li>Maximum file size: `10MB`</li></ul>|
    |3|レシート画像|File upload|<ul><li>Allow only specific file types: `Image`</li><li>Maximum number of files: `1`</li><li>Maximum file size: `10MB`</li></ul>|
    |3|コメント|Paragraph|

1. Link form to the spreadsheet.
1. Define triggers for backend scripts.

    |Event|Function|
    |--|--|
    |Time-based|doDailyBackup|
    |From spreadsheet - On form submit|onFormSubmit|
    |From spreadsheet - On open|onOpen|

1. Create new site with the following contents.
    * Links to the spreadsheet and input form.
    * Embedded charts located in these sheets: `ダッシュボード(今月)` and `ダッシュボード(年間)`.

## Usage

### Record a single bill

1. Access the site.
1. Follow the link to the form.
1. Enter contents and submit.

### Show total amount you have to pay

1. Access the site.
1. Find out the amount from table chart named `差額計算`.

### Change month to record for

1. Access the site.
1. Follow the link to spreadsheet.
1. Open `マスタ` sheet.
1. Change the value of `計上月`.
1. Execute `管理者メニュー` > `動的参照の修復` on menu.

## Known issues

* After executing `管理者メニュー` > `動的参照の修復` on menu, `予算比` chart will be broken.
    * Please fix formulas of range `'ダッシュボード (年間)'!B3:B14`.

## License

MIT
