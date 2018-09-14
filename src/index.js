'use strict';

const axios = require('axios');
const PDFParser = require('pdf2json');
const fs = require('fs');

// District calendars
const districtCalendars = ['MANTI', 'MOAB', 'SLC', 'WEST_JORDAN', 'OGDEN'];

// Justice Court Calendars
const justiceCalendars = [
  'Just_HEBER_CITY_2607',
  'Just_Draper_1823',
  'Just_South_Jordan_1878',
  'Just_SALT_LAKE_CITY_1867',
  'Just_SANDY_1873',
  'Just_Taylorsville_1881',
  'Just_Herriman_1833'
];

const run = async _calendar => {
  const parser = new PDFParser();
  parser.on('pdfParser_dataError', errData => console.error(errData.parserError));
  parser.on('pdfParser_dataReady', pdfData => {
    const pageLines = [];
    const formattedPages = [];
    const allPages = pdfData['formImage']['Pages'];
    for (let i = 0; i < allPages.length; i++) {
      const Page = allPages[i];
      Page['Texts'] = Page['Texts'].map(_TEXT => {
        return _TEXT['R'].map(_R => {
          _R['T'] = _R['T'].replace(/%20/g, ' ');
          pageLines.push(_R['T']);
          return _R;
        });
      });
      formattedPages.push(Page);
    }
    for (let j = 0; j < formattedPages.length; j++) {
      const pg = formattedPages[j];
      pg.PageText = pg['Texts'].map(_text => _text[0]['T']);
      formattedPages[j] = pg;
    }
    fs.writeFileSync(
      `./src/pdfs/${_calendar}.${new Date().getMonth()}-${new Date().getDay()}-${new Date().getFullYear()}.json`,
      JSON.stringify(pdfData)
    );
  });
  const response = await axios.get(`https://www.utcourts.gov/cal/data/${_calendar}_Calendar.pdf`, {
    responseType: 'arraybuffer'
  });
  parser.parseBuffer(Buffer.from(response.data));
};

for (let i = 0; i < districtCalendars.length; i++) {
  run(districtCalendars[i]);
}

for (let k = 0; k < justiceCalendars.length; k++) {
  run(justiceCalendars[k]);
}
