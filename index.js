// parse-wget (https://www.npmjs.com/package/parse-wget)
// Distributed under the MIT license
// Copyright (C) 2016 Retorillo

const fs = require('fs');

function parseBytes(val) {
   return eval(val.replace(/[KMG]$/, (m) => { switch (m) {
         case 'K': return '*1024'; case 'M': return '*1024*1024'; case 'G': return '*1024*1024*1024'; default: return m;
   }}));
}
function parseTime(val) {
   return eval(val.replace(/[hms]/g, (m) => { switch (m) {
         case 'h': return '*60*60+'; case 'm': return '*60+'; case 's': return '+'; default: return m;
   }}) + '0');
}
function parseDots(dots, style) {
   var d = dots.replace(/[^.]/g, '').length;
   switch (style) {
      case 'default': return d * 1024;
      case 'binary': return d * 8 * 1024;
      case 'mega': return d * 64 * 1024;
      case 'giga': return d * 1024 * 1024;
      default: throw new Error(`Invalid dot style: ${style}`);
   }
}
function parseWget(outputFile, encoding, dotStyle) {
   const delims = {
      RS: { // Record Separator
         regex: /^--(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2})--\s+(.+)$/,
         eval: (m, r) => {
            r.timestamp = Math.floor(Date.parse(m[1]) / 1000);
            r.remote = m[2];
         }
      },
      LS: { // Length
         regex: /^Length:\s*(unspecified|\d+)(?:\s*\([^)]+\))?(\s*\[([^\]]+)\])?$/,
         eval: (m, r) => {
            r.length = m[1] == 'unspecified' ? undefined : parseInt(m[1]);
            r.type = m[3];
         }
      },
      TO: { // Saving To
         regex: /^Saving to:\s*'(.+)'$/,
         eval: (m, r) => { r.local = m[1]; }
      },
      ER: { // Error
         regex: /^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}\s+ERROR\s+(\d+)\s*:\s+(.+)\s*$/,
         eval: (m, r) => {
            r.error = {
               code: parseInt(m[1]),
               message: m[2],
            };
         }
      },
      MV: { // Moved
         regex: /^Location:\s*(.+)\s+\[following\]\s*$/,
         eval: (m, r) => {
            r.redirect = m[1];
         },
      },
      PG: { // Progress Bar
         regex: /^\s*(\d+[KMG])([\s.]*)((\d+)%\s+)?([\d.]+[KMG])(\s+|=)((?:[\d.]+[hms]){1,2})\s*$/,
         eval: (m, r) => {
            r.read = parseBytes(m[1]) + parseDots(m[2], dotStyle || 'default');
            r.progress = m[3] ? parseInt(m[4]) : 100;
            // parseBytes(m[4]);
            r.complete = m[6] == '=';
            r.estimate = r.complete ? undefined : parseTime(m[6]);
            r.elapse = r.complete ? parseTime(m[7]) : undefined;
            // When length/LS is available, can deduce more accurate read size.
            // DO NOT use fs.statSync to compute accuracy read size. Concept of
            // this module is "standalone" allows to work with an single output
            // file that can be come from another filesystem.
            r.read = r.length ? r.length * (r.progress / 100) : r.read;
         }
      },
   };
   const enc = { encoding: encoding || 'utf-8' };
   const fields = [];
   fs.readFileSync(outputFile, enc).split(/\r?\n/).forEach(l => {
      for (dn in delims) {
         var d = delims[dn];
         if (!d.regex.test(l)) continue;
         fields.push({
            line: l,
            delim: d,
            regex: d.regex,
            eval: d.eval,
         });
      }
   });
   const records = [];
   var r = {};
   while (fields.length > 0) {
      var f = fields.shift();
      if (f.delim === delims.RS)
         records.push(r = {});
      else if (f.delim === delims.PG) {
         // Skip contiguos PG lines and only use last
         while (fields.length > 0 && fields[0].delim === delims.PG)
            f = fields.shift();
      }
      f.eval(f.line.match(f.regex), r);
   }
   return records;
}
module.exports = parseWget;
