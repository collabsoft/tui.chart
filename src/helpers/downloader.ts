import { isString, isUndefined, isNumber } from '@src/helpers/utils';
import { DataToExport } from '@src/component/exportMenu';

export type SpreadSheetExtension = 'csv' | 'xls';
type ImageExtension = 'png' | 'jpeg';
type Extension = SpreadSheetExtension | ImageExtension;

const DATA_URI_HEADERS = {
  xls: 'data:application/vnd.ms-excel;base64,',
  csv: 'data:text/csv;charset=utf-8,%EF%BB%BF' /* BOM for utf-8 */,
};

function getDownloadMethod() {
  let method;

  const isDownloadAttributeSupported = !isUndefined(document.createElement('a').download);
  const isMSSaveOrOpenBlobSupported = !isUndefined(
    window.Blob && window.navigator.msSaveOrOpenBlob
  );

  if (isMSSaveOrOpenBlobSupported) {
    method = downloadWithMSSaveOrOpenBlob;
  } else if (isDownloadAttributeSupported) {
    method = downloadWithAnchorElementDownloadAttribute;
  }

  return method;
}

/**
 * Base64 string to blob
 * original source ref: https://github.com/miguelmota/base64toblob/blob/master/base64toblob.js
 * Licence: MIT Licence
 */
function base64toBlob(base64String: string) {
  const contentType = base64String
    .substr(0, base64String.indexOf(';base64,'))
    .substr(base64String.indexOf(':') + 1);
  const sliceSize = 1024;
  const byteCharacters = atob(base64String.substr(base64String.indexOf(',') + 1));
  const byteArrays: Uint8Array[] = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);
    const byteNumbers = new Array(slice.length);

    for (let i = 0; i < slice.length; i += 1) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new window.Uint8Array(byteNumbers);

    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: contentType });
}

function isImageExtension(extension: Extension) {
  return extension === 'jpeg' || extension === 'png';
}

function downloadWithMSSaveOrOpenBlob(
  fileName: string,
  extension: Extension,
  content: string,
  contentType?: string
) {
  const blobObject = isImageExtension(extension)
    ? base64toBlob(content)
    : new Blob([content], { type: contentType });
  window.navigator.msSaveOrOpenBlob(blobObject, `${fileName}.${extension}`);
}

function downloadWithAnchorElementDownloadAttribute(
  fileName: string,
  extension: Extension,
  content?: string
) {
  if (content) {
    const anchorElement = document.createElement('a');

    anchorElement.href = content;
    anchorElement.target = '_blank';
    anchorElement.download = `${fileName}.${extension}`;

    document.body.appendChild(anchorElement);

    anchorElement.click();
    anchorElement.remove();
  }
}

function oneLineTrim(...args: [TemplateStringsArray, string]) {
  const normalTag = (template, ...expressions) =>
    template.reduce((accumulator, part, i) => accumulator + expressions[i - 1] + part);

  return normalTag(...args).replace(/\n\s*/g, '');
}

function isNeedDataEncoding() {
  const isDownloadAttributeSupported = !isUndefined(document.createElement('a').download);
  const isMSSaveOrOpenBlobSupported = !isUndefined(
    window.Blob && window.navigator.msSaveOrOpenBlob
  );

  return !isMSSaveOrOpenBlobSupported && isDownloadAttributeSupported;
}

function get2DArrayFromRawData(data: DataToExport) {
  const resultArray: any[][] = [];
  const { categories = [] } = data;

  // @TODO: 각 차트별 데이터 생성 필요
  // resultArray.push(['', ...categories]);

  Object.keys(data.series).forEach((type) => {
    data.series[type].forEach((datum) => {
      resultArray.push([datum.name, ...datum.data]);
    });
  });

  return resultArray;
}

function getTableElementStringForXLS(chartData2DArray: any[][]) {
  let tableElementString = '<table>';
  chartData2DArray.forEach((row, rowIndex) => {
    const cellTagName = rowIndex === 0 ? 'th' : 'td';

    tableElementString += '<tr>';

    row.forEach((cell, cellIndex) => {
      const cellNumberClass = rowIndex !== 0 || cellIndex === 0 ? ' class="number"' : '';
      const cellString = `<${cellTagName}${cellNumberClass}>${cell}</${cellTagName}>`;

      tableElementString += cellString;
    });

    tableElementString += '</tr>';
  });

  tableElementString += '</table>';

  return tableElementString;
}

function makeXLSBodyWithRawData(chartData2DArray: any[][]) {
  return oneLineTrim`<html xmlns:o="urn:schemas-microsoft-com:office:office" 
        xmlns:x="urn:schemas-microsoft-com:office:excel" 
        xmlns="http://www.w3.org/TR/REC-html40">
        <head>
            <!--[if gte mso 9]>
                <xml>
                    <x:ExcelWorkbook>
                        <x:ExcelWorksheets>
                            <x:ExcelWorksheet>
                                <x:Name>Ark1</x:Name>
                                <x:WorksheetOptions>
                                    <x:DisplayGridlines/>
                                </x:WorksheetOptions>
                            </x:ExcelWorksheet>
                        </x:ExcelWorksheets>
                        </x:ExcelWorkbook>
                </xml>
            <![endif]-->
            <meta name=ProgId content=Excel.Sheet>
            <meta charset=UTF-8>
        </head>
        <body>
            ${getTableElementStringForXLS(chartData2DArray)}
        </body>
        </html>`;
}

function makeCSVBodyWithRawData(
  chartData2DArray: any[][],
  option: { lineDelimiter?: string; itemDelimiter?: string } = {}
) {
  const { lineDelimiter = '\u000a', itemDelimiter = ',' } = option;
  const lastRowIndex = chartData2DArray.length - 1;
  let csvText = '';

  chartData2DArray.forEach((row, rowIndex) => {
    const lastCellIndex = row.length - 1;

    row.forEach((cell, cellIndex) => {
      const cellContent = isNumber(cell) ? cell : `"${cell}"`;

      csvText += cellContent;

      if (cellIndex < lastCellIndex) {
        csvText += itemDelimiter;
      }
    });

    if (rowIndex < lastRowIndex) {
      csvText += lineDelimiter;
    }
  });

  return csvText;
}

export function execDownload(
  fileName: string,
  extension: Extension,
  content: string,
  contentType?: string
) {
  const downloadMethod = getDownloadMethod();
  if (!isString(content) || !downloadMethod) {
    return;
  }

  downloadMethod(fileName, extension, content, contentType);
}

export function downloadSpreadSheet(
  fileName: string,
  extension: SpreadSheetExtension,
  data: DataToExport
) {
  const chartData2DArray = get2DArrayFromRawData(data);
  const contentType = DATA_URI_HEADERS[extension].replace(/(data:|;base64,|,%EF%BB%BF)/g, '');
  let content = '';

  if (extension === 'csv') {
    content = makeCSVBodyWithRawData(chartData2DArray);
  } else {
    content = makeXLSBodyWithRawData(chartData2DArray);
  }

  if (isNeedDataEncoding()) {
    if (extension !== 'csv') {
      // base64 encoding for data URI scheme.
      content = window.btoa(unescape(encodeURIComponent(content)));
    }
    content = DATA_URI_HEADERS[extension] + content;
  }

  execDownload(fileName, extension, content, contentType);
}