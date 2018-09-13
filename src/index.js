'use strict';

const axios = require('axios');
const pdfParser = require('pdf-parser');
const PDFParser = require("pdf2json");
const fs = require('fs');

const parser = new PDFParser();

const calendars = [
    'MANTI',
    'MOAB'
];

parser.on("pdfParser_dataError", errData => console.error(errData.parserError) );
parser.on("pdfParser_dataReady", pdfData => {
    fs.writeFileSync('./src/pdfs/MOAB.json', JSON.stringify(pdfData));
});

const run = async () => {
    const response = await axios.get('https://www.utcourts.gov/cal/data/MOAB_Calendar.pdf', { responseType: 'arraybuffer' });
    parser.parseBuffer(Buffer.from(response.data));
}

run();