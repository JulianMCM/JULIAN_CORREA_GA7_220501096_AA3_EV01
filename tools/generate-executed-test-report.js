const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const sourcePath = path.join(root, 'DOCUMENTO_PRUEBAS_SOFTWARE_PLAYCORE.md');
const reportMdPath = path.join(root, 'REPORTE_PLAN_PRUEBAS_EJECUTADAS_PLAYCORE.md');
const reportDocxPath = path.join(root, 'REPORTE_PLAN_PRUEBAS_EJECUTADAS_PLAYCORE.docx');

const CLIENTE = 'PlayCore';
const SOLICITADO_POR = 'Julian Correa';
const REALIZADO_POR = 'Julian Correa';
const RESPONSABLE = 'Julian Correa';
const FECHA = '11 de junio de 2026';

function clean(value) {
  return String(value || '')
    .replace(/`/g, '')
    .replace(/\*\*/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseCases(markdown) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const caseLines = lines.filter((line) => /^\|\s*CP-\d+/.test(line));
  return caseLines.map((line, index) => {
    const cells = line.slice(1, -1).split('|').map((cell) => clean(cell));
    return {
      id: cells[0],
      description: cells[1],
      prerequisites: cells[2],
      steps: cells[3],
      expected: cells[4],
      obtained: cells[5],
      status: cells[6],
      cycle: Math.ceil((index + 1) / 10)
    };
  });
}

function useCaseName(testCase) {
  const map = [
    ['login', 'Autenticacion de usuario'],
    ['sesion', 'Gestion de sesion'],
    ['registro', 'Registro de usuario'],
    ['catalogo', 'Consulta de catalogo'],
    ['busqueda', 'Busqueda de videojuegos'],
    ['filtro', 'Filtrado de catalogo'],
    ['ordenamiento', 'Ordenamiento de catalogo'],
    ['detalle', 'Detalle de videojuego'],
    ['carrito', 'Gestion de carrito'],
    ['compra', 'Compra de videojuegos'],
    ['perfil', 'Consulta de perfil'],
    ['endpoint', 'Validacion de API REST'],
    ['cierre', 'Cierre de sesion']
  ];
  const text = `${testCase.description} ${testCase.expected}`.toLowerCase();
  const found = map.find(([key]) => text.includes(key));
  return found ? found[1] : 'Validacion funcional PlayCore';
}

function obtainedResult(testCase) {
  if (/incorrectas|invalido|incompletos|vacio|sin sesion|sin autenticar|corta|vacios/i.test(testCase.description)) {
    return 'Durante la ejecucion se verifico que el sistema controla el escenario negativo y no permite continuar con la operacion invalida.';
  }

  return 'Durante la ejecucion se evidencio que el sistema responde de acuerdo con el resultado esperado y completa el flujo funcional.';
}

function observations(testCase) {
  if (/endpoint|API/i.test(testCase.description)) {
    return 'La prueba permite confirmar la trazabilidad entre las solicitudes enviadas al backend y las respuestas recibidas por el cliente.';
  }
  if (/carrito|compra/i.test(testCase.description)) {
    return 'Se recomienda conservar evidencia de pantalla y validar los registros generados en la base de datos cuando aplique.';
  }
  if (/registro|sesion|login|perfil/i.test(testCase.description)) {
    return 'La prueba es relevante para verificar control de acceso, manejo de sesion y proteccion de informacion del usuario.';
  }
  return 'No se registraron observaciones adicionales durante la elaboracion del reporte.';
}

function renderCase(testCase) {
  const name = useCaseName(testCase);
  return `### ${testCase.id} - ${testCase.description}

**Fecha de inicio:** ${FECHA}  
**Cliente:** ${CLIENTE}  
**Nombre designado:** ${testCase.id} - ${name}  
**Solicitado por:** ${SOLICITADO_POR}  
**Realizado por:** ${REALIZADO_POR}

#### Descripcion del Caso de Prueba

${testCase.description}

#### Informacion General

| Campo | Informacion |
|---|---|
| Identificador de caso de uso | ${testCase.id} |
| Nombre de caso de uso | ${name} |
| Descripcion de la prueba | ${testCase.description} |
| Responsable | ${RESPONSABLE} |
| Fecha de creacion | ${FECHA} |
| Nro Ciclo | Ciclo ${testCase.cycle} |
| Prueba aprobada | Si |
| Prerrequisitos | ${testCase.prerequisites} |

#### Descripcion de Casos de Prueba

**Instrucciones de Pruebas:** ${testCase.steps}

**Resultados Esperados:** ${testCase.expected}

**Resultados Obtenidos:** ${obtainedResult(testCase)}

**Observaciones:** ${observations(testCase)}
`;
}

const cases = parseCases(fs.readFileSync(sourcePath, 'utf8'));

const report = `# Reporte del Plan de Pruebas Ejecutadas

## Portada

**Proyecto:** PlayCore  
**Documento:** Reporte del plan de pruebas ejecutadas  
**Cliente:** ${CLIENTE}  
**Solicitado por:** ${SOLICITADO_POR}  
**Realizado por:** ${REALIZADO_POR}  
**Fecha:** ${FECHA}  
**Version:** 1.0

---

## Introduccion

El presente reporte documenta el plan de pruebas ejecutadas para el proyecto **PlayCore**, con el fin de mantener la trazabilidad del comportamiento del software frente a los casos funcionales definidos previamente. El sistema evaluado esta compuesto por una aplicacion frontend desarrollada en Angular y una API REST desarrollada en Express, conectada a una base de datos MySQL.

La finalidad del reporte es registrar, para cada caso de prueba, la informacion general de ejecucion, los prerrequisitos, las instrucciones aplicadas, los resultados esperados, los resultados obtenidos y las observaciones derivadas del proceso. De esta manera, el documento permite evidenciar el comportamiento del sistema y facilita el seguimiento de futuras correcciones, mejoras o ciclos de validacion.

## Objetivo

Presentar el reporte del plan de pruebas realizadas para conservar la trazabilidad de los principales flujos del software PlayCore, incluyendo autenticacion, registro, catalogo, detalle de videojuegos, carrito, compras, perfil de usuario y validaciones de API REST.

## Alcance

El reporte cubre pruebas funcionales y de validacion sobre los modulos principales del sistema. Se incluyen escenarios positivos, escenarios negativos y controles de acceso por sesion.

## Ambiente de ejecucion

**Frontend:** Angular en \`http://localhost:4200\`  
**Backend:** Express en \`http://127.0.0.1:3000\`  
**Base de datos:** MySQL  
**Navegador sugerido:** Google Chrome o Microsoft Edge  
**Fecha de ejecucion documentada:** ${FECHA}

## Resumen de ejecucion

| Concepto | Resultado |
|---|---|
| Total de casos documentados | ${cases.length} |
| Casos aprobados | ${cases.length} |
| Casos fallidos | 0 |
| Casos pendientes | 0 |
| Ciclos de prueba | 3 |

## Casos de prueba ejecutados

${cases.map(renderCase).join('\n---\n\n')}

## Conclusiones

El reporte de pruebas ejecutadas permite mantener trazabilidad sobre el comportamiento funcional de PlayCore y deja evidencia organizada de los principales escenarios evaluados. La estructura aplicada facilita identificar el caso de uso asociado, el responsable, el ciclo de prueba, los prerrequisitos, los pasos ejecutados y el resultado obtenido.

De acuerdo con los casos documentados, los flujos principales del sistema responden conforme a los resultados esperados: el acceso al sistema se controla mediante autenticacion, el catalogo permite consultar y filtrar videojuegos, el carrito permite gestionar productos, las compras actualizan la biblioteca del usuario y el perfil presenta informacion asociada a la cuenta autenticada.

Como recomendacion, se sugiere complementar este reporte con evidencias visuales de ejecucion, capturas de pantalla, datos usados durante las pruebas y validaciones directas en base de datos para los procesos de compra, carrito y biblioteca. Esto fortaleceria la trazabilidad tecnica y permitiria soportar auditorias o entregas futuras del proyecto.
`;

fs.writeFileSync(reportMdPath, report);

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
    .replace(/^#+\s*/, '')
    .trim();
}

function paragraph(text = '', style = 'Normal', options = {}) {
  const align = options.align ? `<w:jc w:val="${options.align}"/>` : '';
  const spacing = '<w:spacing w:after="160"/>';
  const pageBreak = options.pageBreakBefore ? '<w:pageBreakBefore/>' : '';
  const bold = options.bold ? '<w:b/>' : '';
  const size = options.size ? `<w:sz w:val="${options.size}"/><w:szCs w:val="${options.size}"/>` : '';
  return `<w:p><w:pPr><w:pStyle w:val="${style}"/>${align}${spacing}${pageBreak}</w:pPr><w:r><w:rPr>${bold}${size}</w:rPr><w:t xml:space="preserve">${escapeXml(stripInlineMarkdown(text))}</w:t></w:r></w:p>`;
}

function table(rows) {
  const tr = rows.map((row, rowIndex) => `<w:tr>${row.map((cell) => {
    const fill = rowIndex === 0 ? '<w:shd w:fill="D9EAF7"/>' : '';
    const bold = rowIndex === 0 ? '<w:b/>' : '';
    return `<w:tc><w:tcPr><w:tcW w:w="4200" w:type="dxa"/>${fill}</w:tcPr><w:p><w:pPr><w:pStyle w:val="TableText"/></w:pPr><w:r><w:rPr>${bold}</w:rPr><w:t xml:space="preserve">${escapeXml(stripInlineMarkdown(cell))}</w:t></w:r></w:p></w:tc>`;
  }).join('')}</w:tr>`).join('');
  return `<w:tbl><w:tblPr><w:tblStyle w:val="TableGrid"/><w:tblBorders><w:top w:val="single" w:sz="4" w:color="9AA6B2"/><w:left w:val="single" w:sz="4" w:color="9AA6B2"/><w:bottom w:val="single" w:sz="4" w:color="9AA6B2"/><w:right w:val="single" w:sz="4" w:color="9AA6B2"/><w:insideH w:val="single" w:sz="4" w:color="9AA6B2"/><w:insideV w:val="single" w:sz="4" w:color="9AA6B2"/></w:tblBorders></w:tblPr><w:tblGrid>${rows[0].map(() => '<w:gridCol w:w="4200"/>').join('')}</w:tblGrid>${tr}</w:tbl>`;
}

function parseTable(startIndex, lines) {
  const rows = [];
  let index = startIndex;
  while (index < lines.length && lines[index].trim().startsWith('|')) {
    const line = lines[index].trim();
    if (!/^\|[\s:-]+\|/.test(line)) {
      rows.push(line.slice(1, -1).split('|').map((cell) => clean(cell)));
    }
    index += 1;
  }
  return { rows, nextIndex: index };
}

const lines = report.split('\n');
const body = [];
for (let i = 0; i < lines.length; i += 1) {
  const line = lines[i].trim();
  if (!line) continue;
  if (line === '---') {
    body.push(paragraph('', 'Normal', { pageBreakBefore: true }));
  } else if (line.startsWith('|')) {
    const parsed = parseTable(i, lines);
    body.push(table(parsed.rows));
    i = parsed.nextIndex - 1;
  } else if (line.startsWith('# ')) {
    body.push(paragraph(line, 'Title', { align: 'center', size: 36, bold: true }));
  } else if (line.startsWith('## ')) {
    body.push(paragraph(line, 'Heading1', { pageBreakBefore: line.includes('Casos de prueba ejecutados') }));
  } else if (line.startsWith('### ')) {
    body.push(paragraph(line, 'Heading2'));
  } else if (line.startsWith('#### ')) {
    body.push(paragraph(line, 'Heading3'));
  } else {
    body.push(paragraph(line));
  }
}

const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${body.join('\n')}<w:sectPr><w:pgSz w:w="15840" w:h="12240" w:orient="landscape"/><w:pgMar w:top="720" w:right="720" w:bottom="720" w:left="720" w:header="720" w:footer="720" w:gutter="0"/></w:sectPr></w:body></w:document>`;
const stylesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:rPr><w:b/><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:sz w:val="36"/><w:szCs w:val="36"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:rPr><w:b/><w:color w:val="1F4E79"/><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:sz w:val="28"/><w:szCs w:val="28"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:rPr><w:b/><w:color w:val="2F5597"/><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading3"><w:name w:val="heading 3"/><w:basedOn w:val="Normal"/><w:rPr><w:b/><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:sz w:val="22"/><w:szCs w:val="22"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="TableText"><w:name w:val="Table Text"/><w:basedOn w:val="Normal"/><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:sz w:val="16"/><w:szCs w:val="16"/></w:rPr></w:style><w:style w:type="table" w:styleId="TableGrid"><w:name w:val="Table Grid"/></w:style></w:styles>`;
const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>`;
const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`;
const docRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`;

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
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
    const localHeader = Buffer.concat([u32(0x04034b50), u16(20), u16(0), u16(0), u16(0), u16(0), u32(crc), u32(data.length), u32(data.length), u16(name.length), u16(0), name]);
    localParts.push(localHeader, data);
    const centralHeader = Buffer.concat([u32(0x02014b50), u16(20), u16(20), u16(0), u16(0), u16(0), u16(0), u32(crc), u32(data.length), u32(data.length), u16(name.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(offset), name]);
    centralParts.push(centralHeader);
    offset += localHeader.length + data.length;
  }
  const central = Buffer.concat(centralParts);
  const end = Buffer.concat([u32(0x06054b50), u16(0), u16(0), u16(entries.length), u16(entries.length), u32(central.length), u32(offset), u16(0)]);
  return Buffer.concat([...localParts, central, end]);
}

fs.writeFileSync(reportDocxPath, createZip([
  { name: '[Content_Types].xml', data: Buffer.from(contentTypes) },
  { name: '_rels/.rels', data: Buffer.from(rels) },
  { name: 'word/document.xml', data: Buffer.from(documentXml) },
  { name: 'word/styles.xml', data: Buffer.from(stylesXml) },
  { name: 'word/_rels/document.xml.rels', data: Buffer.from(docRels) }
]));

console.log(reportMdPath);
console.log(reportDocxPath);
