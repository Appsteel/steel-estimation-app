import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { EstimateData } from '../types/estimate';

const COMPANY_ADDRESS = '323 Deerhurst Drive, Brampton, Ontario. L6T 5K3';

export const downloadAsPDF = (data: EstimateData, type: 'front-sheet' | 'quotation') => {
  const doc = new jsPDF();
  const { projectInfo, structuralSteel, metalDeck, miscellaneousSteel } = data;
  
  if (type === 'front-sheet') {
    // Front sheet PDF generation logic...
    doc.save(`${projectInfo.quoteNumber}-${type}.pdf`);
    return;
  }

  // Quotation letter specific logic
  const quotationData = data as any; // Contains additional quotation fields

  // Header
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');

  // Company logo placeholder (you should replace this with actual logo)
  doc.text('COMPANY LOGO', 14, 20);
  doc.setFontSize(10);
  doc.text(COMPANY_ADDRESS, 14, 30);

  // Date
  doc.text(projectInfo.date, 170, 20, { align: 'right' });

  // Client info
  let yPos = 45;
  doc.text(projectInfo.gcName, 14, yPos);
  yPos += 7;
  doc.text(projectInfo.gcAddress, 14, yPos);
  
  yPos += 15;
  doc.text(`Attention: ${projectInfo.contactPerson}`, 14, yPos);
  
  yPos += 15;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Re: ${projectInfo.projectName}`, 14, yPos);
  yPos += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(projectInfo.projectAddress, 14, yPos);
  
  yPos += 15;
  doc.text(`Dear ${projectInfo.contactPerson},`, 14, yPos);
  
  yPos += 10;
  const introText = `We are pleased to submit our quotation for the supply and installation of structural steel${metalDeck.visible ? ' and metal deck' : ''} as per referenced drawings:`;
  doc.text(introText, 14, yPos);
  
  yPos += 10;
  if (projectInfo.structuralDrawings) {
    doc.text(`• ${projectInfo.structuralDrawings} dated ${projectInfo.structuralDrawingsDate}${projectInfo.structuralDrawingsRevision ? ` (Rev. ${projectInfo.structuralDrawingsRevision})` : ''}`, 20, yPos);
    yPos += 7;
  }
  if (projectInfo.architecturalDrawings) {
    doc.text(`• ${projectInfo.architecturalDrawings} dated ${projectInfo.architecturalDrawingsDate}${projectInfo.architecturalDrawingsRevision ? ` (Rev. ${projectInfo.architecturalDrawingsRevision})` : ''}`, 20, yPos);
    yPos += 7;
  }

  yPos += 10;

  // Component prices and descriptions
  if (structuralSteel.visible) {
    doc.text(`• Structural Steel: $${(structuralSteel.overriddenTotalCost ?? structuralSteel.totalCost).toLocaleString()}`, 14, yPos);
    yPos += 7;
    if (quotationData.quotation.structuralDescription) {
      const lines = doc.splitTextToSize(quotationData.quotation.structuralDescription, 180);
      doc.text(lines, 20, yPos);
      yPos += (7 * lines.length);
    }
    yPos += 5;
  }

  if (metalDeck.visible) {
    doc.text(`• Metal Deck: $${(metalDeck.overriddenTotalCost ?? metalDeck.totalCost).toLocaleString()}`, 14, yPos);
    yPos += 7;
    if (quotationData.quotation.metalDeckDescription) {
      const lines = doc.splitTextToSize(quotationData.quotation.metalDeckDescription, 180);
      doc.text(lines, 20, yPos);
      yPos += (7 * lines.length);
    }
    yPos += 5;
  }

  if (miscellaneousSteel.visible) {
    doc.text(`• Miscellaneous Steel: $${(miscellaneousSteel.overriddenTotalCost ?? miscellaneousSteel.totalCost).toLocaleString()}`, 14, yPos);
    yPos += 7;
    if (quotationData.quotation.miscellaneousDescription) {
      const lines = doc.splitTextToSize(quotationData.quotation.miscellaneousDescription, 180);
      doc.text(lines, 20, yPos);
      yPos += (7 * lines.length);
    }
  }

  yPos += 10;

  // Miscellaneous items table if any
  if (quotationData.quotation.miscItems && quotationData.quotation.miscItems.length > 0) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Miscellaneous Steel Items:', 14, yPos);
    yPos += 10;

    autoTable(doc, {
      startY: yPos,
      head: [['Type', 'Description', 'Unit', 'Ref. Dwg.']],
      body: quotationData.quotation.miscItems.map((item: any) => [
        item.type,
        item.description,
        item.unit,
        item.refDrawing || ''
      ]),
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] }
    });

    yPos = doc.lastAutoTable?.finalY || yPos;
    yPos += 10;
  }

  // Additional description if any
  if (quotationData.quotation.additionalDescription) {
    const lines = doc.splitTextToSize(quotationData.quotation.additionalDescription, 180);
    doc.text(lines, 14, yPos);
    yPos += (7 * lines.length);
    yPos += 10;
  }

  // Standard clauses
  doc.text('All prices are exclusive of H.S.T.', 14, yPos);
  
  yPos += 15;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Qualifications:', 14, yPos);
  
  yPos += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('• All materials to receive one coat of commercial grey primer as per CISC/CPMA 1-73a standard.', 20, yPos);
  yPos += 7;
  doc.text('• Area to be free and clear of any obstruction before installation can commence.', 20, yPos);
  yPos += 7;
  doc.text('• One mobilization allowed for each scope: structural steel, steel deck and miscellaneous steel.', 20, yPos);
  yPos += 7;
  doc.text('• This quotation is to be read in conjunction with attached Appendix A.', 20, yPos);
  
  yPos += 15;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Exclusions:', 14, yPos);
  
  yPos += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const exclusionsText = 'Finish paint, insulation, fireproofing, galvanizing unless noted, metal stud framing, shoring, rebar, wood blocking, concrete scanning, Lateral connections to precast wall/glazing/imp wall panel, testing and inspection.';
  const exclusionsLines = doc.splitTextToSize(exclusionsText, 180);
  doc.text(exclusionsLines, 14, yPos);
  yPos += (7 * exclusionsLines.length);
  
  yPos += 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Delivery:', 14, yPos);
  
  yPos += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('To be arranged.', 14, yPos);
  
  yPos += 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Terms:', 14, yPos);
  
  yPos += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const termsText = 'Net 30 days from date of invoice. Subject to progress invoicing. Supply of material may be invoice separately, 10% holdback applies to installation portion only and it is due within 60 days from date of substantial completion of our portion of the scope.';
  const termsLines = doc.splitTextToSize(termsText, 180);
  doc.text(termsLines, 14, yPos);
  yPos += (7 * termsLines.length);
  
  yPos += 15;
  doc.text('Trusting the above meets with your approval, we look forward to working with you.', 14, yPos);
  
  yPos += 15;
  doc.text('Yours truly,', 14, yPos);
  yPos += 10;
  doc.setFont('helvetica', 'bold');
  doc.text(projectInfo.estimator, 14, yPos);

  // Save the PDF
  doc.save(`${projectInfo.quoteNumber}-${type}.pdf`);
};

export const downloadAsExcel = (data: EstimateData, type: 'front-sheet' | 'quotation') => {
  const workbook = XLSX.utils.book_new();
  const { projectInfo, structuralSteel, metalDeck, miscellaneousSteel } = data;
  
  // Project Information sheet
  const projectInfoData = [
    ['Quote #', projectInfo.quoteNumber],
    ['Date', projectInfo.date],
    ['Project Name', projectInfo.projectName],
    ['Project Address', projectInfo.projectAddress],
    ['General Contractor', projectInfo.gcName],
    ['GC Address', projectInfo.gcAddress],
    ['Contact Person', projectInfo.contactPerson],
    ['Contact Phone', projectInfo.contactPhone],
    ['Closing Date', projectInfo.closingDate],
    ['Estimator', projectInfo.estimator],
  ];
  
  const projectInfoSheet = XLSX.utils.aoa_to_sheet(projectInfoData);
  XLSX.utils.book_append_sheet(workbook, projectInfoSheet, 'Project Information');

  if (type === 'quotation') {
    const quotationData = data as any;
    const quotationSheet = [
      ['Component', 'Cost', 'Description'],
    ];

    if (structuralSteel.visible) {
      quotationSheet.push([
        'Structural Steel',
        (structuralSteel.overriddenTotalCost ?? structuralSteel.totalCost).toLocaleString(),
        quotationData.quotation.structuralDescription || ''
      ]);
    }

    if (metalDeck.visible) {
      quotationSheet.push([
        'Metal Deck',
        (metalDeck.overriddenTotalCost ?? metalDeck.totalCost).toLocaleString(),
        quotationData.quotation.metalDeckDescription || ''
      ]);
    }

    if (miscellaneousSteel.visible) {
      quotationSheet.push([
        'Miscellaneous Steel',
        (miscellaneousSteel.overriddenTotalCost ?? miscellaneousSteel.totalCost).toLocaleString(),
        quotationData.quotation.miscellaneousDescription || ''
      ]);
    }

    quotationSheet.push(['', '']);
    quotationSheet.push(['Additional Description', quotationData.quotation.additionalDescription || '']);

    if (quotationData.quotation.miscItems?.length > 0) {
      quotationSheet.push(['', '']);
      quotationSheet.push(['Miscellaneous Items', '', '', '']);
      quotationSheet.push(['Type', 'Description', 'Unit', 'Ref. Dwg.']);
      quotationData.quotation.miscItems.forEach((item: any) => {
        quotationSheet.push([item.type, item.description, item.unit, item.refDrawing || '']);
      });
    }

    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(quotationSheet), 'Quotation');
  }

  // Save the Excel file
  XLSX.writeFile(workbook, `${projectInfo.quoteNumber}-${type}.xlsx`);
};