const { PDFDocument } = require("pdf-lib");
const fs = require("fs").promises;
const path = require("path");

class PDFMergeService {
  /**
   * Merges two PDF files (appending the second to the first) and saves the result to a new file.
   * @param {string} originalPath - Path to the original patient chart PDF.
   * @param {string} evidencePath - Path to the uploaded evidence PDF.
   * @param {string} outputPath - Path where the new merged PDF should be saved.
   * @returns {Promise<{pagesCount: number, size: number}>}
   */
  async mergePDFs(originalPath, evidencePath, outputPath) {
    try {
      if (!originalPath || !evidencePath) {
        throw new Error("Both originalPath and evidencePath are required for merging PDFs.");
      }
      // Read files
      const originalBytes = await fs.readFile(originalPath);
      const evidenceBytes = await fs.readFile(evidencePath);

      // Load documents
      const originalDoc = await PDFDocument.load(originalBytes);
      const evidenceDoc = await PDFDocument.load(evidenceBytes);

      // Create a brand new merged document
      const mergedDoc = await PDFDocument.create();

      // Copy pages from original document
      const originalPageIndices = originalDoc.getPageIndices();
      const copiedOriginalPages = await mergedDoc.copyPages(originalDoc, originalPageIndices);
      copiedOriginalPages.forEach((page) => mergedDoc.addPage(page));

      // Copy pages from evidence document
      const evidencePageIndices = evidenceDoc.getPageIndices();
      const copiedEvidencePages = await mergedDoc.copyPages(evidenceDoc, evidencePageIndices);
      copiedEvidencePages.forEach((page) => mergedDoc.addPage(page));

      // Save merged document
      const mergedPdfBytes = await mergedDoc.save();

      // Ensure directory exists
      await fs.mkdir(path.dirname(outputPath), { recursive: true });

      // Write merged file
      await fs.writeFile(outputPath, mergedPdfBytes);

      return {
        pagesCount: mergedDoc.getPageCount(),
        size: mergedPdfBytes.length,
      };
    } catch (error) {
      console.error("[PDFMergeService] Error merging PDFs:", error);
      throw new Error(`Failed to merge PDFs: ${error.message}`);
    }
  }
}

module.exports = new PDFMergeService();
