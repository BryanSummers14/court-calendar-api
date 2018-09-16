'use strict';

const fs = require('fs');
const axios = require('axios');
const PDFParser = require('pdf2json');

const admin = require('firebase-admin');
const serviceAccount = require('./secrets/utah-court-calendar-firebase-admin.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://utah-court-calendar.firebaseio.com'
});

const db = admin.firestore();
db.settings({ timestampsInSnapshots: true });

// District calendars
const districtCalendars = [
  { url: 'MANTI', court: 'MANTI' },
  { url: 'MOAB', court: 'MOAB' },
  { url: 'SLC', court: 'SLC' },
  { url: 'WEST_JORDAN', court: 'WEST JORDAN' }
];

// Justice Court Calendars
const justiceCalendars = [
  { url: 'Just_HEBER_CITY_2607', court: 'HEBER' },
  { url: 'Just_Draper_1823', court: 'DRAPER' },
  { url: 'Just_South_Jordan_1878', court: 'SOUTH JORDAN' },
  { url: 'Just_Midvale_1851', court: 'MIDVALE' },
  { url: 'Just_SANDY_1873', court: 'SANDY' },
  { url: 'Just_Taylorsville_1881', court: 'TAYLORSVILLE' },
  { url: 'Just_Herriman_1833', court: 'HERRIMAN' }
];

const separator = '------------------------------------------------------------------------------';

const run = async (_calendar, _type = 'DISTRICT') => {
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
      const indices = [];
      for (let idx = 0; idx < pg.PageText.length; idx++) {
        if (pg.PageText[idx].includes(separator)) {
          indices.push(idx);
        }
      }
      pg.separators = indices;
      formattedPages[j] = pg;
    }
    const courtInfo = [];
    for (let _page of formattedPages) {
      let fsPage = {
        pageText: _page['PageText'],
        separators: _page.separators
      };
      courtInfo.push(fsPage);
    }
    db.collection(`courts/${_type.toLowerCase()}/${_calendar.court.toLowerCase()}`).add({
      courtInfo,
      date: new Date()
    })
    .then(_ => {
      fs.writeFileSync(
        `./src/pdfs/${_type}/${_calendar.court}.${new Date().getMonth()}-${new Date().getDay()}-${new Date().getFullYear()}.json`,
        JSON.stringify(pdfData)
      );
    })
    .catch(_err => {
      console.log(_calendar.court);
      console.log(_err);
      process.exit(0);
    })

    // fs.writeFileSync(
    //   `./src/pdfs/${_type}/${
    //     _calendar.court
    //   }.${new Date().getMonth()}-${new Date().getDay()}-${new Date().getFullYear()}.json`,
    //   JSON.stringify(pdfData)
    // );
  });
  const response = await axios.get(`https://www.utcourts.gov/cal/data/${_calendar.url}_Calendar.pdf`, {
    responseType: 'arraybuffer'
  });
  parser.parseBuffer(Buffer.from(response.data));
};

for (let i = 0; i < districtCalendars.length; i++) {
  run(districtCalendars[i]);
}

for (let k = 0; k < justiceCalendars.length; k++) {
  run(justiceCalendars[k], 'JUSTICE');
}
