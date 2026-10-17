const PDFDocument = require('pdfkit');

const ROUTE_LABELS = {
  '/': 'Dashboard', '/atlas': 'Atlas Page', '/mentor': 'Mentor Page',
  '/prisma': 'Prisma Page', '/insight': 'Insight Page', '/codex': 'Codex Page',
  '/sdg': 'SDG Page', '/quiz': 'Quiz Page', '/vault': 'Vault Page'
};

function prettyRoute(pathname) {
  if (!pathname) return '';
  const raw = pathname.split('?')[0].split('#')[0];
  const normalized = raw.length > 1 ? raw.replace(/\/$/, '') : raw;
  if (ROUTE_LABELS[normalized]) return ROUTE_LABELS[normalized];
  return normalized.replace(/^\//, '').split('/').filter(Boolean)
    .map(seg => seg.replace(/[-_]+/g, ' '))
    .map(seg => seg.charAt(0).toUpperCase() + seg.slice(1)).join(' / ') + ' Page';
}

function formatProgressActivityRow(row) {
  const type = (row?.type || '').toString();
  const desc = (row?.description || '').toString();
  if (type.startsWith('interaction.pageview:')) {
    return { title: `Visited ${prettyRoute(type.replace('interaction.pageview:', ''))}`, meta: 'Page visit' };
  }
  if (type.startsWith('sdg.reflection:') || desc.toLowerCase().includes('sdg reflection')) {
    return { title: desc || 'Saved SDG reflection', meta: 'Reflection' };
  }
  if (type === 'interaction.activeMinute') return { title: desc || 'Stayed active in the app', meta: 'Engagement' };
  if (type.startsWith('interaction.quiz')) return { title: desc || 'Quiz activity', meta: 'Quiz' };
  return { title: desc || 'Completed activity', meta: type ? type.split(':')[0] : '' };
}

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
}

function createVaultProgressPdfBuffer({ user = {}, activity = [], reflections = [] }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('error', reject);
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    const pageWidth = doc.page.width;
    const cardW = pageWidth - 100;
    doc.save().rect(0, 0, pageWidth, 90).fill('#7c3aed');
    doc.fillColor('#ffffff').fontSize(22).text('Equinox Progress Report', 50, 28);
    doc.fontSize(11).text(`Generated: ${formatDate(new Date().toISOString())}`, 50, 58).restore();
    doc.moveDown(4);

    const cardX = 50;
    const cardY = doc.y;
    doc.save().roundedRect(cardX, cardY, cardW, 64, 10).fill('#f9fafb').restore();
    doc.fillColor('#111827').fontSize(12).text('Username', cardX + 14, cardY + 12);
    doc.fontSize(16).fillColor('#6d28d9').text(user.username || 'Student', cardX + 14, cardY + 30);
    doc.fillColor('#374151').fontSize(11).text(`Level: ${user.level || 1}`, cardX + cardW - 160, cardY + 14, { align: 'right', width: 140 });
    doc.text(`Total XP: ${user.xp || 0}`, cardX + cardW - 160, cardY + 34, { align: 'right', width: 140 });

    doc.y = cardY + 80;
    doc.fillColor('#111827').fontSize(14).text('Activity History');
    doc.moveDown(0.5);

    let y = doc.y;
    const drawHead = () => {
      doc.save().rect(50, y, cardW, 20).fill('#f3f4f6').fillColor('#374151').fontSize(10);
      doc.text('DATE', 56, y + 6).text('ACTIVITY', 196, y + 6)
        .text('XP', 50 + cardW - 60, y + 6, { width: 50, align: 'right' }).restore();
      y += 26;
    };
    drawHead();

    for (const row of activity) {
      if (y > 750) { doc.addPage(); y = 50; drawHead(); }
      const info = formatProgressActivityRow(row);
      doc.save().strokeColor('#e5e7eb').moveTo(50, y + 20).lineTo(50 + cardW, y + 20).stroke().restore();
      doc.fillColor('#111827').fontSize(9).text(formatDate(row.date), 56, y + 5);
      doc.text(info.title, 196, y + 5, { width: 280 });
      doc.fillColor('#6d28d9').text(`+${row.xp || 0}`, 50 + cardW - 60, y + 5, { align: 'right' });
      y += 25;
    }

    if (reflections.length > 0) {
      if (y > 650) { doc.addPage(); y = 50; } else { y += 40; }
      doc.fillColor('#111827').font('Helvetica-Bold').fontSize(16)
        .text('SDG Reflections', 50, y, { width: cardW, align: 'left' });
      doc.moveDown(0.8);
      y = doc.y;

      for (const reflection of reflections) {
        const reflectionText = reflection.reflection || 'No content';
        const textHeight = doc.heightOfString(reflectionText, { width: cardW - 30 });
        const boxHeight = Math.max(50, textHeight + 35);
        if (y + boxHeight > 750) { doc.addPage(); y = 50; }

        doc.save().roundedRect(50, y, cardW, boxHeight, 8).fill('#fdfaff').strokeColor('#ddd6fe').stroke().restore();
        doc.fillColor('#7c3aed').fontSize(10).font('Helvetica-Bold').text(`Goal ${reflection.sdg_id}`, 65, y + 10);
        doc.fillColor('#9ca3af').fontSize(8).font('Helvetica')
          .text(formatDate(reflection.date), cardX + cardW - 160, y + 10, { align: 'right', width: 145 });
        doc.fillColor('#374151').fontSize(10).font('Helvetica')
          .text(reflectionText, 65, y + 25, { width: cardW - 30 });
        y += boxHeight + 10;
      }
    }

    doc.end();
  });
}

module.exports = { createVaultProgressPdfBuffer };
