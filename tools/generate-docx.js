const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const inputPath = process.argv[2]
  ? path.resolve(root, process.argv[2])
  : path.join(root, 'DOCUMENTO_PRUEBAS_SOFTWARE_PLAYCORE.md');
const outputPath = process.argv[3]
  ? path.resolve(root, process.argv[3])
  : path.join(root, 'DOCUMENTO_PRUEBAS_SOFTWARE_PLAYCORE.docx');

const markdown = fs.readFileSync(inputPath, 'utf8').replace(/\r\n/g, '\n');

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function stripInlineMarkdown(value) {
  return value
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .trim();
}

function paragraph(text = '', style = 'Normal', options = {}) {
  const align = options.align ? `<w:jc w:val="${options.align}"/>` : '';
  const spacing = options.spacing === false ? '' : '<w:spacing w:after="160"/>';
  const pageBreak = options.pageBreakBefore ? '<w:pageBreakBefore/>' : '';
  const bold = options.bold ? '<w:b/>' : '';
  const size = options.size ? `<w:sz w:val="${options.size}"/><w:szCs w:val="${options.size}"/>` : '';

  return [
    '<w:p>',
    `<w:pPr><w:pStyle w:val="${style}"/>${align}${spacing}${pageBreak}</w:pPr>`,
    `<w:r><w:rPr>${bold}${size}</w:rPr><w:t xml:space="preserve">${escapeXml(stripInlineMarkdown(text))}</w:t></w:r>`,
    '</w:p>'
  ].join('');
}

function table(rows) {
  const cells = rows.map((row, rowIndex) => {
    const rowXml = row.map((cell) => {
      const fill = rowIndex === 0 ? '<w:shd w:fill="D9EAF7"/>' : '';
      const bold = rowIndex === 0;
      return [
        '<w:tc>',
        `<w:tcPr><w:tcW w:w="2400" w:type="dxa"/>${fill}</w:tcPr>`,
        paragraph(cell, 'TableText', { spacing: false, bold }),
        '</w:tc>'
      ].join('');
    }).join('');
    return `<w:tr>${rowXml}</w:tr>`;
  }).join('');

  return [
    '<w:tbl>',
    '<w:tblPr><w:tblStyle w:val="TableGrid"/><w:tblW w:w="0" w:type="auto"/><w:tblBorders>',
    '<w:top w:val="single" w:sz="4" w:space="0" w:color="9AA6B2"/>',
    '<w:left w:val="single" w:sz="4" w:space="0" w:color="9AA6B2"/>',
    '<w:bottom w:val="single" w:sz="4" w:space="0" w:color="9AA6B2"/>',
    '<w:right w:val="single" w:sz="4" w:space="0" w:color="9AA6B2"/>',
    '<w:insideH w:val="single" w:sz="4" w:space="0" w:color="9AA6B2"/>',
    '<w:insideV w:val="single" w:sz="4" w:space="0" w:color="9AA6B2"/>',
    '</w:tblBorders></w:tblPr>',
    `<w:tblGrid>${rows[0].map(() => '<w:gridCol w:w="2400"/>').join('')}</w:tblGrid>`,
    cells,
    '</w:tbl>'
  ].join('');
}

function parseTable(startIndex, lines) {
  const rows = [];
  let index = startIndex;

  while (index < lines.length && lines[index].trim().startsWith('|')) {
    const line = lines[index].trim();
    if (!/^\|[\s:-]+\|/.test(line)) {
      rows.push(line.slice(1, -1).split('|').map((cell) => stripInlineMarkdown(cell)));
    }
    index += 1;
  }

  return { rows, nextIndex: index };
}

const lines = markdown.split('\n');
const body = [];
let inList = false;

for (let i = 0; i < lines.length; i += 1) {
  const raw = lines[i];
  const line = raw.trim();

  if (!line) {
    inList = false;
    continue;
  }

  if (line === '---') {
    body.push(paragraph('', 'Normal', { pageBreakBefore: true }));
    continue;
  }

  if (line.startsWith('|')) {
    const parsed = parseTable(i, lines);
    body.push(table(parsed.rows));
    i = parsed.nextIndex - 1;
    inList = false;
    continue;
  }

  if (line.startsWith('# ')) {
    body.push(paragraph(line.replace(/^#\s+/, ''), 'Title', { align: 'center', size: 36, bold: true }));
    continue;
  }

  if (line.startsWith('## ')) {
    body.push(paragraph(line.replace(/^##\s+/, ''), 'Heading1', { pageBreakBefore: line.includes('Casos de prueba') }));
    continue;
  }

  if (line.startsWith('- ')) {
    body.push(paragraph(`• ${line.replace(/^-\s+/, '')}`, 'Normal'));
    inList = true;
    continue;
  }

  if (inList) {
    inList = false;
  }

  body.push(paragraph(line));
}

const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"
  xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
  xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
  xmlns:v="urn:schemas-microsoft-com:vml"
  xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing"
  xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
  xmlns:w10="urn:schemas-microsoft-com:office:word"
  xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
  xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml"
  xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup"
  xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk"
  xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml"
  xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape"
  mc:Ignorable="w14 wp14">
  <w:body>
    ${body.join('\n')}
    <w:sectPr>
      <w:pgSz w:w="15840" w:h="12240" w:orient="landscape"/>
      <w:pgMar w:top="720" w:right="720" w:bottom="720" w:left="720" w:header="720" w:footer="720" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`;

const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal"/>
    <w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Title">
    <w:name w:val="Title"/>
    <w:basedOn w:val="Normal"/>
    <w:rPr><w:b/><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:sz w:val="36"/><w:szCs w:val="36"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="Heading1">
    <w:name w:val="heading 1"/>
    <w:basedOn w:val="Normal"/>
    <w:rPr><w:b/><w:color w:val="1F4E79"/><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:sz w:val="28"/><w:szCs w:val="28"/></w:rPr>
  </w:style>
  <w:style w:type="paragraph" w:styleId="TableText">
    <w:name w:val="Table Text"/>
    <w:basedOn w:val="Normal"/>
    <w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:sz w:val="16"/><w:szCs w:val="16"/></w:rPr>
  </w:style>
  <w:style w:type="table" w:styleId="TableGrid">
    <w:name w:val="Table Grid"/>
    <w:tblPr><w:tblBorders>
      <w:top w:val="single" w:sz="4" w:space="0" w:color="auto"/>
      <w:left w:val="single" w:sz="4" w:space="0" w:color="auto"/>
      <w:bottom w:val="single" w:sz="4" w:space="0" w:color="auto"/>
      <w:right w:val="single" w:sz="4" w:space="0" w:color="auto"/>
      <w:insideH w:val="single" w:sz="4" w:space="0" w:color="auto"/>
      <w:insideV w:val="single" w:sz="4" w:space="0" w:color="auto"/>
    </w:tblBorders></w:tblPr>
  </w:style>
</w:styles>`;

const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`;

const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

const docRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

const files = [
  { name: '[Content_Types].xml', data: Buffer.from(contentTypes) },
  { name: '_rels/.rels', data: Buffer.from(rels) },
  { name: 'word/document.xml', data: Buffer.from(documentXml) },
  { name: 'word/styles.xml', data: Buffer.from(stylesXml) },
  { name: 'word/_rels/document.xml.rels', data: Buffer.from(docRels) }
];

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k += 1) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  return c >>> 0;
});

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function u16(value) {
  const buffer = Buffer.alloc(2);
  buffer.writeUInt16LE(value);
  return buffer;
}

function u32(value) {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32LE(value >>> 0);
  return buffer;
}

function createZip(entries) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  for (const entry of entries) {
    const name = Buffer.from(entry.name);
    const data = entry.data;
    const crc = crc32(data);
    const localHeader = Buffer.concat([
      u32(0x04034b50), u16(20), u16(0), u16(0), u16(0), u16(0),
      u32(crc), u32(data.length), u32(data.length), u16(name.length), u16(0), name
    ]);
    localParts.push(localHeader, data);

    const centralHeader = Buffer.concat([
      u32(0x02014b50), u16(20), u16(20), u16(0), u16(0), u16(0), u16(0),
      u32(crc), u32(data.length), u32(data.length), u16(name.length), u16(0),
      u16(0), u16(0), u16(0), u32(0), u32(offset), name
    ]);
    centralParts.push(centralHeader);
    offset += localHeader.length + data.length;
  }

  const central = Buffer.concat(centralParts);
  const end = Buffer.concat([
    u32(0x06054b50), u16(0), u16(0), u16(entries.length), u16(entries.length),
    u32(central.length), u32(offset), u16(0)
  ]);

  return Buffer.concat([...localParts, central, end]);
}

fs.writeFileSync(outputPath, createZip(files));
console.log(outputPath);
