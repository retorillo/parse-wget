const fs = require('fs');
const jsonFormat = require('json-format');
const execSync = require('child_process').execSync;
const join = require('path').join;
const parseWget = require('../')
const dataDir = join(__dirname, 'data');
const returnDir = process.cwd();

console.log(`Entering directory: ${dataDir}`);
if (!fs.existsSync(dataDir))
   fs.mkdirSync(dataDir);
process.chdir(dataDir);

if (!fs.existsSync('output')) {
   console.log(`Downloading sample wget output...`);
   try {
      execSync('wget -rHl1 --output-file=output https://nodejs.org/en/');
   }
   catch (e) {
      // Skip HTTP errors
   }
}

var json = jsonFormat(parseWget('output'));
console.log(json);
fs.writeFileSync('parsed', json, 'utf-8');

console.log(`Leaving directory: ${process.cwd()}`);
process.chdir(returnDir);
