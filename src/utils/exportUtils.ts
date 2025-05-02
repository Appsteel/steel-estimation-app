import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { EstimateData } from '../types/estimate';
import * as XLSX from 'xlsx';

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN_TOP = 20;
const MARGIN_BOTTOM = 20;
const MARGIN_LEFT = 20;
const MARGIN_RIGHT = 20;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;
const LINE_HEIGHT = 5;
const SECTION_SPACING = 8;
const INDENT = 5;
const SIGNATURE_LINE_WIDTH = 70;

const COMPANY_ADDRESS = '323 Deerhurst Drive, Brampton, Ontario. L6T 5K3';

const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

export const downloadAsPDF = async (data: EstimateData, type: 'front-sheet' | 'quotation') => {
  const doc = new jsPDF();
  const { projectInfo, structuralSteel, metalDeck, miscellaneousSteel } = data;

  let logo: HTMLImageElement | null = null;
  try {
    logo = await loadImage('/logo.png');
  } catch (error) {
    console.error('Failed to load logo:', error);
  }

  const pageNumbers: number[] = [];

  const addHeader = () => {
    if (logo) doc.addImage(logo, 'PNG', MARGIN_LEFT, MARGIN_TOP - 5, 40, 15);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(COMPANY_ADDRESS, MARGIN_LEFT, MARGIN_TOP + 15);
    doc.text(projectInfo.date, PAGE_WIDTH - MARGIN_RIGHT, MARGIN_TOP + 15, { align: 'right' });
    doc.setDrawColor(200, 200, 200);
    doc.line(MARGIN_LEFT, MARGIN_TOP + 18, PAGE_WIDTH - MARGIN_RIGHT, MARGIN_TOP + 18);
    pageNumbers.push(doc.getNumberOfPages());
  };

  const addFooter = () => {
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.text(`Page ${i} of ${pageCount}`, PAGE_WIDTH - MARGIN_RIGHT, PAGE_HEIGHT - 10, {
        align: 'right',
      });
    }
  };

  const addText = (
    text: string,
    x: number,
    y: number,
    maxWidth: number = CONTENT_WIDTH
  ): number => {
    const lines = doc.splitTextToSize(text, maxWidth);
    const pageHeight = PAGE_HEIGHT - MARGIN_BOTTOM;
    doc.setFontSize(10);
    for (const line of lines) {
      if (y + LINE_HEIGHT > pageHeight) {
        doc.addPage();
        addHeader();
        y = MARGIN_TOP + 25;
      }
      doc.text(line, x, y);
      y += LINE_HEIGHT;
    }
    return y;
  };

  const checkPageBreak = (currentY: number, neededSpace: number = 40) => {
    if (currentY + neededSpace > PAGE_HEIGHT - MARGIN_BOTTOM) {
      doc.addPage();
      addHeader();
      return MARGIN_TOP + 25;
    }
    return currentY;
  };

  if (type === 'front-sheet') {
    if (logo) doc.addImage(logo, 'JPEG', MARGIN_LEFT, 10, 40, 15);
    doc.setFontSize(10);
    doc.text(COMPANY_ADDRESS, MARGIN_LEFT, 30);
    doc.save(`${projectInfo.quoteNumber}-front-sheet.pdf`);
    return;
  }

  addHeader();

  let yPos = MARGIN_TOP + 25;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  yPos = addText(projectInfo.gcName, MARGIN_LEFT, yPos);
  doc.setFont('helvetica', 'normal');
  yPos = addText(projectInfo.gcAddress, MARGIN_LEFT, yPos + 1);
  yPos = addText(`Attention: ${projectInfo.contactPerson}`, MARGIN_LEFT, yPos + SECTION_SPACING);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  yPos = addText(`Re: ${projectInfo.projectName}`, MARGIN_LEFT, yPos + SECTION_SPACING);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  yPos = addText(projectInfo.projectAddress, MARGIN_LEFT, yPos + 1);
  yPos = addText(`Dear ${projectInfo.contactPerson},`, MARGIN_LEFT, yPos + SECTION_SPACING);

  const introText = `We are pleased to submit our quotation for the supply and installation of structural steel${metalDeck.visible ? ' and metal deck' : ''} as per referenced drawings:`;
  yPos = addText(introText, MARGIN_LEFT, yPos + SECTION_SPACING);

  if (projectInfo.structuralDrawings) {
    yPos = addText(`• ${projectInfo.structuralDrawings} dated ${projectInfo.structuralDrawingsDate}${projectInfo.structuralDrawingsRevision ? ` (Rev. ${projectInfo.structuralDrawingsRevision})` : ''}`, MARGIN_LEFT + INDENT, yPos + 2);
  }
  if (projectInfo.architecturalDrawings) {
    yPos = addText(`• ${projectInfo.architecturalDrawings} dated ${projectInfo.architecturalDrawingsDate}${projectInfo.architecturalDrawingsRevision ? ` (Rev. ${projectInfo.architecturalDrawingsRevision})` : ''}`, MARGIN_LEFT + INDENT, yPos + 2);
  }

  if (structuralSteel.visible) {
    doc.setFont('helvetica', 'bold');
    yPos = addText(`• Structural Steel: $${(structuralSteel.overriddenTotalCost ?? structuralSteel.totalCost).toLocaleString()}`, MARGIN_LEFT, yPos + SECTION_SPACING);
    doc.setFont('helvetica', 'normal');
    if (data.quotation?.structuralDescription) {
      yPos = addText(data.quotation.structuralDescription, MARGIN_LEFT + INDENT, yPos + 2);
    }
  }

  if (metalDeck.visible) {
    doc.setFont('helvetica', 'bold');
    yPos = addText(`• Metal Deck: $${(metalDeck.overriddenTotalCost ?? metalDeck.totalCost).toLocaleString()}`, MARGIN_LEFT, yPos + SECTION_SPACING);
    doc.setFont('helvetica', 'normal');
    if (data.quotation?.metalDeckDescription) {
      yPos = addText(data.quotation.metalDeckDescription, MARGIN_LEFT + INDENT, yPos + 2);
    }
  }

  if (miscellaneousSteel.visible) {
    doc.setFont('helvetica', 'bold');
    yPos = addText(`• Miscellaneous Steel: $${(miscellaneousSteel.overriddenTotalCost ?? miscellaneousSteel.totalCost).toLocaleString()}`, MARGIN_LEFT, yPos + SECTION_SPACING);
    doc.setFont('helvetica', 'normal');
    if (data.quotation?.miscellaneousDescription) {
      yPos = addText(data.quotation.miscellaneousDescription, MARGIN_LEFT + INDENT, yPos + 2);
    }
  }

  yPos = checkPageBreak(yPos, 60);

  if (data.quotation?.miscItems?.length > 0) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    yPos = addText('Miscellaneous Steel Items:', MARGIN_LEFT, yPos + SECTION_SPACING);

    autoTable(doc, {
      startY: yPos + 3,
      head: [['Type', 'Description', 'Unit', 'Ref. Dwg.']],
      body: data.quotation.miscItems.map((item: any) => [
        item.type,
        item.description,
        item.unit,
        item.refDrawing || ''
      ]),
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246], fontSize: 9, cellPadding: 2 },
      bodyStyles: { fontSize: 9, cellPadding: 2 },
      margin: { left: MARGIN_LEFT, right: MARGIN_RIGHT },
      tableWidth: CONTENT_WIDTH,
      didDrawPage: () => addHeader()
    });

    yPos = (doc.lastAutoTable?.finalY || yPos) + 3;
  }

  if (data.quotation?.additionalDescription) {
    doc.setFontSize(10);
    yPos = addText(data.quotation.additionalDescription, MARGIN_LEFT, yPos + SECTION_SPACING);
  }

  doc.setFont('helvetica', 'bold');
  yPos = addText('All prices are exclusive of H.S.T.', MARGIN_LEFT, yPos + SECTION_SPACING);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  yPos = addText('Qualifications:', MARGIN_LEFT, yPos + SECTION_SPACING);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  yPos = addText('• All materials to receive one coat of commercial grey primer as per CISC/CPMA 1-73a standard.', MARGIN_LEFT + INDENT, yPos + 2);
  yPos = addText('• Area to be free and clear of any obstruction before installation can commence.', MARGIN_LEFT + INDENT, yPos + 2);
  yPos = addText('• One mobilization allowed for each scope: structural steel, steel deck and miscellaneous steel.', MARGIN_LEFT + INDENT, yPos + 2);
  yPos = addText('• This quotation is to be read in conjunction with attached Appendix A.', MARGIN_LEFT + INDENT, yPos + 2);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  yPos = addText('Exclusions:', MARGIN_LEFT, yPos + SECTION_SPACING);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  yPos = addText('Finish paint, insulation, fireproofing, galvanizing unless noted, metal stud framing, shoring, rebar, wood blocking, concrete scanning, Lateral connections to precast wall/glazing/imp wall panel, testing and inspection.', MARGIN_LEFT, yPos + 2);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  yPos = addText('Delivery:', MARGIN_LEFT, yPos + SECTION_SPACING);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  yPos = addText('To be arranged.', MARGIN_LEFT, yPos + 2);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  yPos = addText('Terms:', MARGIN_LEFT, yPos + SECTION_SPACING);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  yPos = addText('Net 30 days from date of invoice. Subject to progress invoicing. Supply of material may be invoice separately, 10% holdback applies to installation portion only and it is due within 60 days from date of substantial completion of our portion of the scope.', MARGIN_LEFT, yPos + 2);

  yPos = addText('Trusting the above meets with your approval, we look forward to working with you.', MARGIN_LEFT, yPos + SECTION_SPACING);
  yPos = addText('Yours truly,', MARGIN_LEFT, yPos + SECTION_SPACING);

  doc.setFont('helvetica', 'bold');
  yPos = addText(projectInfo.estimator, MARGIN_LEFT, yPos + 3);

  // Signature fields with smaller width and proper margins
  yPos = checkPageBreak(yPos, 40);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  // Signature line
  const signatureY = yPos + 15;
  doc.text('Accepted by:', MARGIN_LEFT, signatureY);
  doc.line(MARGIN_LEFT + 20, signatureY + 3, MARGIN_LEFT + SIGNATURE_LINE_WIDTH, signatureY + 3);
  doc.text('Authorized Signature', MARGIN_LEFT + 20, signatureY + 7, { align: 'left' });

  // Date line
  const dateLineX = PAGE_WIDTH - MARGIN_RIGHT - 60; // Start of line
  const dateLineWidth = 60; // You can make this as long as needed
  doc.line(dateLineX, signatureY + 3, dateLineX + dateLineWidth, signatureY + 3); // Longer line
  doc.text('Date', dateLineX, signatureY + 7); // Left-justified text aligned to the start of the line



  addFooter();
  doc.save(`${projectInfo.quoteNumber}-quotation.pdf`);
};

export const downloadAsExcel = async (data: EstimateData, type: 'front-sheet' | 'quotation') => {
  const workbook = XLSX.utils.book_new();
  const { projectInfo, structuralSteel, metalDeck, miscellaneousSteel } = data;

  // Create worksheet data
  const wsData = [
    ['Company Address', COMPANY_ADDRESS],
    ['Date', projectInfo.date],
    [''],
    ['General Contractor', projectInfo.gcName],
    ['GC Address', projectInfo.gcAddress],
    ['Contact Person', projectInfo.contactPerson],
    [''],
    ['Project Name', projectInfo.projectName],
    ['Project Address', projectInfo.projectAddress],
    [''],
    ['Referenced Drawings'],
  ];

  if (projectInfo.structuralDrawings) {
    wsData.push([
      'Structural Drawings',
      `${projectInfo.structuralDrawings} dated ${projectInfo.structuralDrawingsDate}${
        projectInfo.structuralDrawingsRevision ? ` (Rev. ${projectInfo.structuralDrawingsRevision})` : ''
      }`,
    ]);
  }

  if (projectInfo.architecturalDrawings) {
    wsData.push([
      'Architectural Drawings',
      `${projectInfo.architecturalDrawings} dated ${projectInfo.architecturalDrawingsDate}${
        projectInfo.architecturalDrawingsRevision ? ` (Rev. ${projectInfo.architecturalDrawingsRevision})` : ''
      }`,
    ]);
  }

  wsData.push(['']);

  // Add sections
  if (structuralSteel.visible) {
    wsData.push(
      ['Structural Steel', `$${(structuralSteel.overriddenTotalCost ?? structuralSteel.totalCost).toLocaleString()}`],
      ['Description', data.quotation?.structuralDescription || ''],
      ['']
    );
  }

  if (metalDeck.visible) {
    wsData.push(
      ['Metal Deck', `$${(metalDeck.overriddenTotalCost ?? metalDeck.totalCost).toLocaleString()}`],
      ['Description', data.quotation?.metalDeckDescription || ''],
      ['']
    );
  }

  if (miscellaneousSteel.visible) {
    wsData.push(
      ['Miscellaneous Steel', `$${(miscellaneousSteel.overriddenTotalCost ?? miscellaneousSteel.totalCost).toLocaleString()}`],
      ['Description', data.quotation?.miscellaneousDescription || ''],
      ['']
    );
  }

  // Add miscellaneous items if present
  if (data.quotation?.miscItems?.length > 0) {
    wsData.push(['Miscellaneous Steel Items']);
    wsData.push(['Type', 'Description', 'Unit', 'Ref. Dwg.']);
    data.quotation.miscItems.forEach(item => {
      wsData.push([item.type, item.description, item.unit, item.refDrawing || '']);
    });
    wsData.push(['']);
  }

  // Add additional description if present
  if (data.quotation?.additionalDescription) {
    wsData.push(['Additional Description', data.quotation.additionalDescription], ['']);
  }

  // Add standard sections
  wsData.push(
    ['Qualifications'],
    ['• All materials to receive one coat of commercial grey primer as per CISC/CPMA 1-73a standard.'],
    ['• Area to be free and clear of any obstruction before installation can commence.'],
    ['• One mobilization allowed for each scope: structural steel, steel deck and miscellaneous steel.'],
    ['• This quotation is to be read in conjunction with attached Appendix A.'],
    [''],
    ['Exclusions'],
    ['Finish paint, insulation, fireproofing, galvanizing unless noted, metal stud framing, shoring, rebar, wood blocking, concrete scanning, Lateral connections to precast wall/glazing/imp wall panel, testing and inspection.'],
    [''],
    ['Delivery'],
    ['To be arranged.'],
    [''],
    ['Terms'],
    ['Net 30 days from date of invoice. Subject to progress invoicing. Supply of material may be invoice separately, 10% holdback applies to installation portion only and it is due within 60 days from date of substantial completion of our portion of the scope.'],
    [''],
    ['Estimator', projectInfo.estimator]
  );

  // Create worksheet and add to workbook
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  const colWidths = [{ wch: 20 }, { wch: 80 }];
  ws['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(workbook, ws, 'Quotation');

  // Generate Excel file
  XLSX.writeFile(workbook, `${projectInfo.quoteNumber}-${type}.xlsx`);
};
