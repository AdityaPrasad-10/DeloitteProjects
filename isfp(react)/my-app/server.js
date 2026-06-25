const express = require('express');
const fs      = require('fs');
const path    = require('path');
const app  = express();
const PORT = 4000;
const LOG_FILE = path.join(__dirname, 'submissions.log');
 
const FIELD_LABELS = {
 
  dpn  : 'Data Provider Name',
  psc   : 'Provider Short Code',
  sourceContainer : 'Source Container',
  scp  : 'Source Container Path',
  countryCode : 'Country Code',
  countryName  : 'Country',
  categoryCoverage: 'Category Coverage',
  datasetCode : 'Dataset Code',
  
  uniqueId  : 'Unique IDs Present',
  derive   : 'Derive Country from Filename',
  direct    : 'Feed Type',
  writemode   : 'Write Mode',
  merge   : 'Key Columns to Merge',
  transform : 'Transform Set',
  dimension : 'Dimension Routing Set',
  overlap : 'Overlap Delete Column'
};
 
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});
function getSubmissionCount() {
  if (!fs.existsSync(LOG_FILE)) return 0;
  const content = fs.readFileSync(LOG_FILE, 'utf8');
  return (content.match(/^SUBMISSION #/gm) || []).length;
}
function formatSection(obj) {
  return Object.entries(obj)
    .map(([key, value]) => {
      const label = FIELD_LABELS[key] || key;
      const paddedLabel = label.padEnd(25, ' ');
      return `  ${paddedLabel}: ${value || '—'}`;
    })
    .join('\n');
}
app.post('/submit', (req, res) => {
  const { user, sme } = req.body;
 
  if (!user || !sme) {
    return res.status(400).send('Missing user or sme data.');
  }
  const count = getSubmissionCount() + 1;
  const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
 
  const entry =
    `========================================\n` +
    `SUBMISSION #${count} — ${timestamp}\n` +
    `========================================\n` +
    `\n--- USER ---\n` +
    `${formatSection(user)}\n` +
    `\n--- SME ---\n` +
    `${formatSection(sme)}\n` +
    `========================================\n\n`;
 
  fs.appendFileSync(LOG_FILE, entry, 'utf8');
 
  console.log(`[${timestamp}] Submission #${count} saved to submissions.log`);
  res.sendStatus(200);
});
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Submissions will be saved to: ${LOG_FILE}`);
});