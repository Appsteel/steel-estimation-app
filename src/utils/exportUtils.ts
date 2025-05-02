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
    addHeader();
    let yPos = MARGIN_TOP + 25;

    // Project Information
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    yPos = addText('Project Information', MARGIN_LEFT, yPos);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const projectFields = [
      ['Quote Number:', projectInfo.quoteNumber],
      ['Date:', projectInfo.date],
      ['Project Name:', projectInfo.projectName],
      ['Project Address:', projectInfo.projectAddress],
      ['General Contractor:', projectInfo.gcName],
      ['GC Address:', projectInfo.gcAddress],
      ['Contact Person:', projectInfo.contactPerson],
      ['Contact Phone:', projectInfo.contactPhone],
      ['Closing Date:', projectInfo.closingDate],
      ['Estimator:', projectInfo.estimator],
    ];

    projectFields.forEach(([label, value]) => {
      yPos = checkPageBreak(yPos);
      doc.setFont('helvetica', 'bold');
      yPos = addText(label, MARGIN_LEFT, yPos + 5);
      doc.setFont('helvetica', 'normal');
      yPos = addText(value || '', MARGIN_LEFT + 80, yPos - LINE_HEIGHT);
    });

    // Drawings Information
    yPos = checkPageBreak(yPos, 60);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    yPos = addText('Drawings Information', MARGIN_LEFT, yPos + 10);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const drawingsFields = [
      ['Structural Drawings:', projectInfo.structuralDrawings],
      ['Date:', projectInfo.structuralDrawingsDate],
      ['Revision:', projectInfo.structuralDrawingsRevision],
      ['Architectural Drawings:', projectInfo.architecturalDrawings],
      ['Date:', projectInfo.architecturalDrawingsDate],
      ['Revision:', projectInfo.architecturalDrawingsRevision],
    ];

    drawingsFields.forEach(([label, value]) => {
      yPos = checkPageBreak(yPos);
      doc.setFont('helvetica', 'bold');
      yPos = addText(label, MARGIN_LEFT, yPos + 5);
      doc.setFont('helvetica', 'normal');
      yPos = addText(value || '', MARGIN_LEFT + 80, yPos - LINE_HEIGHT);
    });

    // Cost Summary
    yPos = checkPageBreak(yPos, 80);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    yPos = addText('Cost Summary', MARGIN_LEFT, yPos + 10);
    doc.setFontSize(10);

    if (structuralSteel.visible) {
      yPos = checkPageBreak(yPos);
      doc.setFont('helvetica', 'bold');
      yPos = addText('Structural Steel:', MARGIN_LEFT, yPos + 5);
      doc.setFont('helvetica', 'normal');
      yPos = addText(`$${(structuralSteel.overriddenTotalCost ?? structuralSteel.totalCost).toLocaleString()}`, MARGIN_LEFT + 80, yPos - LINE_HEIGHT);
    }

    if (metalDeck.visible) {
      yPos = checkPageBreak(yPos);
      doc.setFont('helvetica', 'bold');
      yPos = addText('Metal Deck:', MARGIN_LEFT, yPos + 5);
      doc.setFont('helvetica', 'normal');
      yPos = addText(`$${(metalDeck.overriddenTotalCost ?? metalDeck.totalCost).toLocaleString()}`, MARGIN_LEFT + 80, yPos - LINE_HEIGHT);
    }

    if (miscellaneousSteel.visible) {
      yPos = checkPageBreak(yPos);
      doc.setFont('helvetica', 'bold');
      yPos = addText('Miscellaneous Steel:', MARGIN_LEFT, yPos + 5);
      doc.setFont('helvetica', 'normal');
      yPos = addText(`$${(miscellaneousSteel.overriddenTotalCost ?? miscellaneousSteel.totalCost).toLocaleString()}`, MARGIN_LEFT + 80, yPos - LINE_HEIGHT);
    }

    yPos = checkPageBreak(yPos);
    doc.setFont('helvetica', 'bold');
    yPos = addText('Total Cost:', MARGIN_LEFT, yPos + 8);
    doc.setFont('helvetica', 'normal');
    yPos = addText(`$${data.totalCost.toLocaleString()}`, MARGIN_LEFT + 80, yPos - LINE_HEIGHT);

    // Remarks
    if (data.remarks) {
      yPos = checkPageBreak(yPos, 60);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      yPos = addText('Remarks', MARGIN_LEFT, yPos + 10);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      yPos = addText(data.remarks, MARGIN_LEFT, yPos + 5);
    }

    addFooter();
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

  if (type === 'front-sheet') {
    // Project Information Sheet
    const projectInfoData = [
      ['Project Information'],
      ['Quote Number', projectInfo.quoteNumber],
      ['Date', projectInfo.date],
      ['Project Name', projectInfo.projectName],
      ['Project Address', projectInfo.projectAddress],
      ['General Contractor', projectInfo.gcName],
      ['GC Address', projectInfo.gcAddress],
      ['Contact Person', projectInfo.contactPerson],
      ['Contact Phone', projectInfo.contactPhone],
      ['Closing Date', projectInfo.closingDate],
      ['Estimator', projectInfo.estimator],
      ['Architect', projectInfo.architect],
      ['Architect Phone', projectInfo.architectPhone],
      ['Engineer', projectInfo.engineer],
      ['Engineer Phone', projectInfo.engineerPhone],
    ];
    const wsProjectInfo = XLSX.utils.aoa_to_sheet(projectInfoData);
    XLSX.utils.book_append_sheet(workbook, wsProjectInfo, 'Project Info');

    // Drawings Sheet
    const drawingsData = [
      ['Drawings Information'],
      ['Structural Drawings', projectInfo.structuralDrawings],
      ['Date', projectInfo.structuralDrawingsDate],
      ['Revision', projectInfo.structuralDrawingsRevision],
      ['Architectural Drawings', projectInfo.architecturalDrawings],
      ['Date', projectInfo.architecturalDrawingsDate],
      ['Revision', projectInfo.architecturalDrawingsRevision],
    ];
    const wsDrawings = XLSX.utils.aoa_to_sheet(drawingsData);
    XLSX.utils.book_append_sheet(workbook, wsDrawings, 'Drawings');

    // Structural Steel Sheet
    if (structuralSteel.visible) {
      const structuralData = [
        ['Structural Steel Information'],
        ['Area', structuralSteel.area],
        ['Weight', structuralSteel.weight],
        ['Connection Allowance', structuralSteel.connectionAllowance],
        ['Total Weight', structuralSteel.totalWeight],
        ['Total Tons', structuralSteel.totalTons],
        [''],
        ['Material Items'],
        ['Description', 'Weight', 'Unit Rate', 'Total Cost'],
        ...structuralSteel.material.map(item => [
          item.description,
          item.weight,
          item.unitRate,
          item.totalCost
        ]),
        [''],
        ['Shop Labour'],
        ['Member Group', 'Total Pieces', 'Pieces/Day', 'Hours', 'Hourly Rate', 'Total Cost'],
        ...structuralSteel.shopLabour.map(item => [
          item.memberGroup,
          item.totalPcs,
          item.pcsPerDay,
          item.hours,
          item.hourlyRate,
          item.totalCost
        ]),
        [''],
        ['OWSJ Information'],
        ['Supplier', structuralSteel.owsj.supplier],
        ['Pieces', structuralSteel.owsj.pcs],
        ['Weight', structuralSteel.owsj.weight],
        ['Price/Weight', structuralSteel.owsj.pricePerWeight],
        ['Cost', structuralSteel.owsj.cost],
        [''],
        ['Engineering & Drafting'],
        ['Engineering Cost', structuralSteel.engineeringDrafting.engineering],
        ['Drafting Tons', structuralSteel.engineeringDrafting.draftingTons],
        ['Drafting Price/Ton', structuralSteel.engineeringDrafting.draftingPricePerTon],
        ['Drafting Cost', structuralSteel.engineeringDrafting.draftingCost],
        ['Total Cost', structuralSteel.engineeringDrafting.totalCost],
        [''],
        ['Erection & Freight'],
        ['Erector', structuralSteel.erectionFreight.erector],
        ['Tons', structuralSteel.erectionFreight.tons],
        ['Price/Ton', structuralSteel.erectionFreight.pricePerTon],
        ['Premium', structuralSteel.erectionFreight.premium],
        ['Erection Cost', structuralSteel.erectionFreight.erectionCost],
        ['Regular Trips', structuralSteel.erectionFreight.regularTrips],
        ['Regular Trip Cost', structuralSteel.erectionFreight.regularTripCost],
        ['Trailer Trips', structuralSteel.erectionFreight.trailerTrips],
        ['Trailer Trip Cost', structuralSteel.erectionFreight.trailerTripCost],
        ['Freight Cost', structuralSteel.erectionFreight.freightCost],
        ['Total Cost', structuralSteel.erectionFreight.totalCost],
        [''],
        ['Overhead & Profit'],
        ['Overhead %', structuralSteel.overheadProfit.overhead],
        ['Profit %', structuralSteel.overheadProfit.profit],
        ['Total %', structuralSteel.overheadProfit.totalPercentage],
        [''],
        ['Final Costs'],
        ['Total Cost', structuralSteel.totalCost],
        ['Overridden Total Cost', structuralSteel.overriddenTotalCost || 'N/A'],
      ];
      const wsStructural = XLSX.utils.aoa_to_sheet(structuralData);
      XLSX.utils.book_append_sheet(workbook, wsStructural, 'Structural Steel');
    }

    // Metal Deck Sheet
    if (metalDeck.visible) {
      const metalDeckData = [
        ['Metal Deck Information'],
        ['Area', metalDeck.area],
        ['Cost/Sq.ft', metalDeck.costPerSqft],
        ['Total Cost', metalDeck.totalCost],
        ['Overridden Total Cost', metalDeck.overriddenTotalCost || 'N/A'],
      ];
      const wsMetalDeck = XLSX.utils.aoa_to_sheet(metalDeckData);
      XLSX.utils.book_append_sheet(workbook, wsMetalDeck, 'Metal Deck');
    }

    // Miscellaneous Steel Sheet
    if (miscellaneousSteel.visible) {
      const miscData = [
        ['Miscellaneous Steel Items'],
        ['Type', 'Description', 'Unit', 'Unit Rate', 'Total Cost'],
        ...miscellaneousSteel.items.map(item => [
          item.type,
          item.description,
          item.unit,
          item.unitRate,
          item.totalCost
        ]),
        [''],
        ['Total Cost', miscellaneousSteel.totalCost],
        ['Overridden Total Cost', miscellaneousSteel.overriddenTotalCost || 'N/A'],
      ];
      const wsMisc = XLSX.utils.aoa_to_sheet(miscData);
      XLSX.utils.book_append_sheet(workbook, wsMisc, 'Miscellaneous Steel');
    }

    // Summary Sheet
    const summaryData = [
      ['Cost Summary'],
      ['Section', 'Cost'],
      structuralSteel.visible ? ['Structural Steel', (structuralSteel.overriddenTotalCost ?? structuralSteel.totalCost)] : [],
      metalDeck.visible ? ['Metal Deck', (metalDeck.overriddenTotalCost ?? metalDeck.totalCost)] : [],
      miscellaneousSteel.visible ? ['Miscellaneous Steel', (miscellaneousSteel.overriddenTotalCost ?? miscellaneousSteel.totalCost)] : [],
      [''],
      ['Total Cost', data.totalCost],
      [''],
      ['Remarks', data.remarks || 'N/A'],
    ].filter(row => row.length > 0);
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, wsSummary, 'Summary');

    // Set column widths for all sheets
    const sheets = workbook.SheetNames;
    sheets.forEach(sheetName => {
      const ws = workbook.Sheets[sheetName];
      ws['!cols'] = [{ wch: 25 }, { wch: 50 }];
    });

    XLSX.writeFile(workbook, `${projectInfo.quoteNumber}-front-sheet.xlsx`);
    return;
  }

  // Create worksheet data for quotation
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
