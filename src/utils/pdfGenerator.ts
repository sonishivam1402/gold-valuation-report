import { jsPDF } from 'jspdf';
import autoTable, { applyPlugin } from 'jspdf-autotable';
import { ShopSettings, ValuationReport } from '../types';
import {
  formatDateDisplay,
  formatCurrencyForPDF,
  formatMobileDisplay,
  formatWeight,
  numberToIndianWords,
} from './calculations';

// Ensure autoTable plugin is registered on jsPDF constructor/prototype
try {
  if (typeof applyPlugin === 'function') {
    applyPlugin(jsPDF);
  } else if (typeof (autoTable as any)?.applyPlugin === 'function') {
    (autoTable as any).applyPlugin(jsPDF);
  }
} catch (e) {
  console.warn('AutoTable plugin registration note:', e);
}

/**
 * Universal runner for autoTable across all Vite / Rollup bundler export formats
 */
function renderAutoTable(doc: jsPDF, options: any): void {
  if (typeof (doc as any).autoTable === 'function') {
    (doc as any).autoTable(options);
    return;
  }
  if (typeof autoTable === 'function') {
    (autoTable as any)(doc, options);
    return;
  }
  if (typeof (autoTable as any)?.default === 'function') {
    (autoTable as any).default(doc, options);
    return;
  }
  try {
    const plugin = typeof applyPlugin === 'function' ? applyPlugin : (autoTable as any)?.applyPlugin;
    if (typeof plugin === 'function') {
      plugin(jsPDF);
      if (typeof (doc as any).autoTable === 'function') {
        (doc as any).autoTable(options);
        return;
      }
    }
  } catch {}

  throw new Error('PDF Table Generator plugin (jspdf-autotable) is not available');
}

/**
 * Loads an image from a URL or data URI with a safe timeout
 */
function loadImage(url: string, timeoutMs = 3500): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const timer = setTimeout(() => {
      reject(new Error('Image load timed out'));
    }, timeoutMs);

    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      clearTimeout(timer);
      resolve(img);
    };
    img.onerror = (e) => {
      clearTimeout(timer);
      reject(e);
    };
    img.src = url;
  });
}

/**
 * Generates an A4 PDF for the Valuation Report
 */
export async function generateValuationPDF(
  report: ValuationReport,
  settings: ShopSettings,
  action: 'download' | 'preview_url' | 'print' = 'download'
): Promise<string | void> {
  // A4 dimensions: 210mm x 297mm
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const leftMargin = 12;
  const rightMargin = 12;
  const contentWidth = pageWidth - leftMargin - rightMargin;

  // Gold & Brown Brand Colors
  const darkBrown: [number, number, number] = [44, 26, 14]; // #2c1a0e
  const goldPrimary: [number, number, number] = [184, 134, 11]; // #b8860b
  const goldLight: [number, number, number] = [212, 175, 55]; // #d4af37
  const warmGray: [number, number, number] = [248, 247, 244];
  const borderGray: [number, number, number] = [210, 210, 210];
  const textDark: [number, number, number] = [30, 41, 59];
  const textMuted: [number, number, number] = [100, 116, 139];

  let currentY = 12;
  let isFullPageLetterhead = false;
  // Address ink ends near 60mm; leave the same gap above the customer box as below it.
  const fullPageHeaderClearance = 65;
  let cachedImg: HTMLImageElement | null = null;

  // Handle Letterhead
  if (report.letterheadMode === 'full') {
    if (settings.letterheadImageUrl) {
      try {
        cachedImg = await loadImage(settings.letterheadImageUrl);
        const ratio = cachedImg.naturalHeight / cachedImg.naturalWidth;

        // If ratio > 1.1, the image is a full A4 pre-printed letterhead sheet (e.g. 1102x1427)
        if (ratio > 1.1) {
          isFullPageLetterhead = true;
          // Render full page background without distortion
          doc.addImage(cachedImg, 'PNG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');
          // Content starts below the official letterhead header, after the address line
          currentY = fullPageHeaderClearance;
        } else {
          // It's a horizontal top banner
          const bannerHeight = Math.min(50, (pageWidth * cachedImg.naturalHeight) / cachedImg.naturalWidth);
          doc.addImage(cachedImg, 'PNG', 0, 0, pageWidth, bannerHeight, undefined, 'FAST');
          doc.setDrawColor(...goldPrimary);
          doc.setLineWidth(0.8);
          doc.line(leftMargin, bannerHeight, pageWidth - rightMargin, bannerHeight);
          currentY = bannerHeight + 5;
        }
      } catch (err) {
        console.warn('Could not load letterhead image, using vector header fallback:', err);
      }
    }

    if (!cachedImg) {
      // Vector header fallback
      doc.setFillColor(...darkBrown);
      doc.rect(0, 0, pageWidth, 28, 'F');

      doc.setFillColor(...goldPrimary);
      doc.rect(0, 28, pageWidth, 2, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text(settings.businessName.toUpperCase(), leftMargin, 12);

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...goldLight);
      doc.text(settings.tagline, leftMargin, 17);

      doc.setTextColor(230, 230, 230);
      doc.setFontSize(7.5);
      doc.text(settings.address, leftMargin, 22, { maxWidth: 125 });

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text(settings.proprietor, pageWidth - rightMargin, 12, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...goldLight);
      doc.text(`Mobile: ${formatMobileDisplay(settings.mobile)}`, pageWidth - rightMargin, 17, { align: 'right' });

      currentY = 35;
    }
  } else {
    // Content-only mode for pre-printed letterhead paper: leave generous clearance at top
    currentY = 58;
  }

  // Customer details and date sit above the report heading
  const infoBoxHeight = 24;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...borderGray);
  doc.setLineWidth(0.3);
  doc.roundedRect(leftMargin, currentY, contentWidth, infoBoxHeight, 1.5, 1.5, 'FD');

  // Left side: Customer details
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...goldPrimary);
  doc.text('CUSTOMER DETAILS', leftMargin + 3, currentY + 4.5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...textDark);
  doc.setFontSize(8.5);
  doc.text(`Name: ${report.customer.name || 'N/A'}`, leftMargin + 3, currentY + 9.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...textMuted);
  const addressMaxWidth = contentWidth - 42;
  doc.text(`Mobile: ${formatMobileDisplay(report.customer.mobile) || 'N/A'}`, leftMargin + 3, currentY + 14);

  const addressLines = doc.splitTextToSize(`Address: ${report.customer.address || 'N/A'}`, addressMaxWidth);
  doc.text(addressLines.slice(0, 2), leftMargin + 3, currentY + 18.5);

  // Date on one line at the right, with no divider
  const dateRight = pageWidth - rightMargin - 3;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...textDark);
  doc.text(`Date: ${formatDateDisplay(report.customer.valuationDate)}`, dateRight, currentY + 5.2, { align: 'right' });

  currentY += infoBoxHeight + 4;

  // Report heading below the customer details
  doc.setFillColor(...warmGray);
  doc.setDrawColor(...goldPrimary);
  doc.setLineWidth(0.6);
  doc.roundedRect(leftMargin, currentY, contentWidth, 8, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...darkBrown);
  doc.text('GOLD JEWELLERY VALUATION REPORT', pageWidth / 2, currentY + 5.5, { align: 'center' });

  currentY += 11;

  // Table Data Preparation
  // Note: Using 'Rate (Rs/g)' and 'Value (Rs.)' so PDF standard fonts never mangle currency symbols
  const tableHead = [
    [
      'Sr. No.',
      'Description of Gold Ornaments',
      'Number of Articles',
      'Gross Weight (In grams)',
      'Impurity Weight/ Stone Weight etc',
      'Net Weight (In grams)',
      'Purity (in terms of carat)',
      'Gold Rate',
      'Value of Ornaments',
    ],
  ];

  const tableBody = report.items.map((item, idx) => [
    item.srNo || idx + 1,
    item.description || '-',
    item.articlesCount,
    item.grossWeight.toFixed(3),
    item.impurityWeight.toFixed(3),
    item.netWeight.toFixed(3),
    `${item.purityCarat}K`,
    new Intl.NumberFormat('en-IN').format(item.goldRate),
    formatCurrencyForPDF(item.ornamentValue, true),
  ]);

  // Total summary footer row directly inside the table for pixel-perfect vertical column alignment
  const tableFoot = [
    [
      { content: 'TOTAL SUMMARY', colSpan: 2, styles: { halign: 'left', fontStyle: 'bold', fillColor: [245, 240, 230] } },
      { content: String(report.totals.articlesCount), styles: { halign: 'center', fontStyle: 'bold', fillColor: [245, 240, 230] } },
      { content: report.totals.grossWeight.toFixed(3), styles: { halign: 'right', fontStyle: 'bold', fillColor: [245, 240, 230] } },
      { content: report.totals.impurityWeight.toFixed(3), styles: { halign: 'right', fontStyle: 'bold', fillColor: [245, 240, 230] } },
      { content: report.totals.netWeight.toFixed(3), styles: { halign: 'right', fontStyle: 'bold', fillColor: [245, 240, 230], textColor: darkBrown } },
      { content: '-', styles: { halign: 'center', fillColor: [245, 240, 230] } },
      { content: '', styles: { fillColor: [245, 240, 230] } },
      { content: formatCurrencyForPDF(report.totals.totalValue, true), styles: { halign: 'right', fontStyle: 'bold', fillColor: darkBrown, textColor: [255, 255, 255] } },
    ],
  ];

  // Render Table via AutoTable with perfectly budgeted column widths (Total = 186mm)
  renderAutoTable(doc, {
    startY: currentY,
    head: tableHead,
    body: tableBody,
    foot: tableFoot,
    theme: 'grid',
    margin: {
      left: leftMargin,
      right: rightMargin,
      top: isFullPageLetterhead ? fullPageHeaderClearance : 16,
      bottom: 16,
    },
    styles: {
      font: 'helvetica',
      fontSize: 7.5,
      cellPadding: 2,
      textColor: textDark,
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
      valign: 'middle',
    },
    headStyles: {
      fillColor: darkBrown,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 6.2,
      halign: 'center',
      valign: 'middle',
      cellPadding: 1.3,
    },
    footStyles: {
      textColor: textDark,
      fontStyle: 'bold',
      fontSize: 7.5,
      lineColor: [200, 200, 200],
      lineWidth: 0.3,
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 11 },
      1: { halign: 'left', cellWidth: 36 },
      2: { halign: 'center', cellWidth: 16 },
      3: { halign: 'right', cellWidth: 18 },
      4: { halign: 'right', cellWidth: 26 },
      5: { halign: 'right', cellWidth: 18, fontStyle: 'bold' },
      6: { halign: 'center', cellWidth: 18 },
      7: { halign: 'right', cellWidth: 17 },
      8: { halign: 'right', cellWidth: 26, fontStyle: 'bold' },
    },
    didDrawPage: (data: any) => {
      // If table continues to page 2+, draw background on subsequent pages too
      if (data.pageNumber > 1 && isFullPageLetterhead && cachedImg) {
        doc.addImage(cachedImg, 'PNG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');
      }
    },
  });

  const finalTableY = (doc as any).lastAutoTable?.finalY ?? currentY + 30;
  currentY = finalTableY + 4;

  // Valuation Summary & Amount in Words Card
  const totalsBoxHeight = 16;
  if (currentY + totalsBoxHeight + 50 > pageHeight) {
    doc.addPage();
    if (isFullPageLetterhead && cachedImg) {
      doc.addImage(cachedImg, 'PNG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');
    }
    currentY = isFullPageLetterhead ? fullPageHeaderClearance : 20;
  }

  doc.setFillColor(...warmGray);
  doc.setDrawColor(...goldPrimary);
  doc.setLineWidth(0.4);
  doc.roundedRect(leftMargin, currentY, contentWidth, totalsBoxHeight, 1.5, 1.5, 'FD');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkBrown);
  doc.text('VALUATION SUMMARY', leftMargin + 3, currentY + 4.5);

  // Grand Total Highlight on Right (with generous margin to prevent clipping)
  const totalValStr = `Total Estimated Value: ${formatCurrencyForPDF(report.totals.totalValue, true)}`;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...darkBrown);
  doc.text(totalValStr, pageWidth - rightMargin - 4, currentY + 4.5, { align: 'right' });

  // Weight summary breakdown
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...textDark);
  doc.text(
    `Total Articles: ${report.totals.articlesCount} pcs   |   Gross: ${formatWeight(report.totals.grossWeight)}   |   Stone/Impurity: ${formatWeight(report.totals.impurityWeight)}   |   Net Gold: ${formatWeight(report.totals.netWeight)}`,
    leftMargin + 3,
    currentY + 9
  );

  // Amount in words
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(...goldPrimary);
  const words = numberToIndianWords(report.totals.totalValue);
  doc.text(`Amount in Words: ${words}`, leftMargin + 3, currentY + 13.5, {
    maxWidth: contentWidth - 6,
  });

  currentY += totalsBoxHeight + 4;

  // Remarks if entered
  if (report.remarks && report.remarks.trim()) {
    const remarkBoxHeight = 9;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...borderGray);
    doc.rect(leftMargin, currentY, contentWidth, remarkBoxHeight, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...textDark);
    doc.text('Remarks / Notes: ', leftMargin + 3, currentY + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textMuted);
    doc.text(report.remarks.trim(), leftMargin + 26, currentY + 5.5, {
      maxWidth: contentWidth - 30,
    });

    currentY += remarkBoxHeight + 3;
  }

  // Check room for terms and the shop signatory
  const termsEstimatedHeight = report.termsAccepted ? 16 : 0;
  const signaturesHeight = 22;
  const neededHeight = termsEstimatedHeight + signaturesHeight + 6;

  if (currentY + neededHeight > pageHeight - 16) {
    doc.addPage();
    if (isFullPageLetterhead && cachedImg) {
      doc.addImage(cachedImg, 'PNG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');
    }
    currentY = isFullPageLetterhead ? fullPageHeaderClearance : 20;
  }

  // Terms & Conditions Section (if accepted)
  if (report.termsAccepted && report.termsList && report.termsList.length > 0) {
    doc.setFillColor(...warmGray);
    doc.rect(leftMargin, currentY, contentWidth, 4.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(...darkBrown);
    doc.text('DISCLAIMER & TERMS AND CONDITIONS', leftMargin + 2, currentY + 3.2);

    currentY += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(70, 70, 70);

    report.termsList.forEach((term, index) => {
      const termText = `${index + 1}. ${term}`;
      const lines = doc.splitTextToSize(termText, contentWidth - 4);
      doc.text(lines, leftMargin + 2, currentY);
      currentY += lines.length * 2.8;
    });

    currentY += 2.5;
  }

  // Shop signatory only — customer signature is not printed
  const sigBoxY = currentY;
  const sigBoxWidth = (contentWidth - 6) / 2;
  const rightSigX = leftMargin + sigBoxWidth + 6;

  doc.setDrawColor(...borderGray);
  doc.setLineWidth(0.3);
  doc.rect(rightSigX, sigBoxY, sigBoxWidth, signaturesHeight);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...darkBrown);
  doc.text(`FOR ${settings.businessName.toUpperCase()}`, rightSigX + 3, sigBoxY + 4.5);

  doc.line(rightSigX + 3, sigBoxY + 16.5, rightSigX + sigBoxWidth - 3, sigBoxY + 16.5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...darkBrown);
  doc.text(settings.proprietor, rightSigX + 3, sigBoxY + 20);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.setTextColor(...textMuted);
  doc.text(settings.signatureTitle || 'Proprietor / Authorized Signatory', rightSigX + sigBoxWidth - 3, sigBoxY + 20, {
    align: 'right',
  });

  // Footer on all pages (Page numbers & shop address)
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    if (isFullPageLetterhead) {
      // The image already has the gold/brown metallic footer bar at Y=280-297
      // Print crisp white/gold text directly on top of the footer bar
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(240, 240, 240);
      doc.text(
        `${settings.businessName}  |  ${settings.address}  |  Tel: ${formatMobileDisplay(settings.mobile)}`,
        leftMargin,
        pageHeight - 5
      );
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - rightMargin, pageHeight - 5, {
        align: 'right',
      });
    } else {
      // Standard footer line for content-only or custom banner
      doc.setDrawColor(...borderGray);
      doc.setLineWidth(0.2);
      doc.line(leftMargin, pageHeight - 9, pageWidth - rightMargin, pageHeight - 9);

      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...textMuted);
      doc.text(
        `${settings.businessName} | ${settings.address} | Tel: ${formatMobileDisplay(settings.mobile)}`,
        leftMargin,
        pageHeight - 5
      );

      doc.text(`Page ${i} of ${totalPages}`, pageWidth - rightMargin, pageHeight - 5, {
        align: 'right',
      });
    }
  }

  // Handle action
  const safeFilename = `${report.reportNumber.replace(/[\/\\?%*:|"<>]/g, '_')}_${report.customer.name.replace(
    /\s+/g,
    '_'
  )}_Valuation.pdf`;

  if (action === 'download') {
    doc.save(safeFilename);
    return;
  } else if (action === 'preview_url') {
    return doc.output('bloburl').toString();
  } else if (action === 'print') {
    doc.autoPrint();
    const blobUrl = doc.output('bloburl').toString();
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = blobUrl;
    document.body.appendChild(iframe);
    iframe.onload = () => {
      iframe.contentWindow?.print();
    };
    return blobUrl;
  }
}
