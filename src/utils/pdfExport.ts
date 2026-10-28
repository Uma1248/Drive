import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PdfExportOptions {
  filename?: string;
  projectName?: string;
  onProgress?: (status: string) => void;
}

/**
 * Exports a target DOM container as a high-fidelity multi-page A4 PDF document.
 */
export async function exportElementToPdf(
  element: HTMLElement,
  options: PdfExportOptions = {}
): Promise<boolean> {
  const filename =
    options.filename ||
    `TaskReview-${(options.projectName || 'Audit-Report').toLowerCase().replace(/[^a-z0-9]/g, '-')}.pdf`;

  try {
    options.onProgress?.('Preparing document styles...');

    // A4 dimensions in mm
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pageWidth = 210; // mm
    const pageHeight = 297; // mm
    const margin = 10; // mm
    const contentWidth = pageWidth - margin * 2; // 190 mm

    options.onProgress?.('Capturing high-resolution document canvas...');

    // Render HTML to canvas with 2x scale for crisp printing
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    options.onProgress?.('Formatting PDF layout...');

    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    const imgWidth = contentWidth;
    const imgHeight = (canvas.height * contentWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = margin;
    let pageNum = 1;

    // Add first page
    pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= (pageHeight - margin * 2);

    // If document extends over multiple pages
    while (heightLeft > 0) {
      position = margin - (pageNum * (pageHeight - margin * 2));
      pdf.addPage();
      pageNum++;
      pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= (pageHeight - margin * 2);
    }

    options.onProgress?.('Saving PDF file...');
    pdf.save(filename);
    return true;
  } catch (error) {
    console.error('Direct PDF export error, falling back to window.print():', error);
    // Fallback to browser print dialog
    window.print();
    return false;
  }
}
