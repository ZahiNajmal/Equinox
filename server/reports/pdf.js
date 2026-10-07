const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const reportsDir = path.join(__dirname, '..', 'reports');
if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir);

function createLabReport({ title = 'Lab Report', experimentId = 'exp', series = [], user }) {
  const filename = `lab-report-${experimentId}-${Date.now()}.pdf`;
  const filepath = path.join(reportsDir, filename);
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(filepath));
  doc.fontSize(18).text(title, { underline: true });
  doc.moveDown();
  doc.fontSize(12).text(`Author: ${user?.name || 'Unknown'}`);
  doc.text(`Experiment: ${experimentId}`);
  doc.moveDown();
  series.forEach(s => doc.text(`t=${s.t}, value=${s.value}`));
  doc.end();
  return filename;
}

function createProgressReport({ progress = {}, user }) {
  const filename = `progress-report-${user?.id || 'user'}-${Date.now()}.pdf`;
  const filepath = path.join(reportsDir, filename);
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(filepath));
  doc.fontSize(18).text('Progress Report', { underline: true });
  doc.moveDown();
  doc.fontSize(12).text(`Student: ${user?.name || 'Unknown'}`);
  doc.moveDown();
  doc.text(JSON.stringify(progress, null, 2));
  doc.end();
  return filename;
}

module.exports = { createLabReport, createProgressReport };