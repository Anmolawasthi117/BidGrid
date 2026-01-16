// PDF Parser Service - handles PDF text extraction

class PdfParserService {
  constructor() {
    this.pdfParse = null;
    this.initialized = false;
  }

  // Initialize pdf-parse
  async loadParser() {
    if (this.initialized) {
      return this.pdfParse;
    }
    
    this.initialized = true;
    
    try {
      // Method 1: Use createRequire for CommonJS module
      const { createRequire } = await import('module');
      const require = createRequire(import.meta.url);
      const pdfParseModule = require('pdf-parse');
      
      // Handle different module export formats
      if (typeof pdfParseModule === 'function') {
        this.pdfParse = pdfParseModule;
      } else if (typeof pdfParseModule.default === 'function') {
        this.pdfParse = pdfParseModule.default;
      } else {
        // If it's a module object, look for the main function
        this.pdfParse = pdfParseModule;
      }
      
      console.log("PDF parser loaded, type:", typeof this.pdfParse);
      return this.pdfParse;
    } catch (err) {
      console.log("PDF parser load error:", err.message);
      return null;
    }
  }

  // Extract text from a PDF buffer
  async extractText(buffer) {
    try {
      const parser = await this.loadParser();
      
      if (!parser) {
        console.log("PDF parser not available");
        return { text: "", numPages: 0, error: "PDF parser not available" };
      }

      // Ensure we have a valid buffer
      if (!buffer || buffer.length === 0) {
        return { text: "", numPages: 0, error: "Empty buffer" };
      }

      // Call the parser
      let data;
      if (typeof parser === 'function') {
        data = await parser(buffer);
      } else if (typeof parser.default === 'function') {
        data = await parser.default(buffer);
      } else {
        console.log("Parser type issue, parser keys:", Object.keys(parser));
        return { text: "", numPages: 0, error: "Parser function not found" };
      }
      
      console.log(`PDF extracted: ${data.numpages} pages, ${data.text.length} chars`);
      return {
        text: data.text,
        numPages: data.numpages,
        info: data.info,
      };
    } catch (err) {
      console.error("PDF extraction error:", err.message);
      return { text: "", numPages: 0, error: err.message };
    }
  }

  // Extract text from multiple PDF attachments
  async extractFromAttachments(attachments) {
    const results = [];

    if (!attachments || attachments.length === 0) {
      return results;
    }

    console.log(`Processing ${attachments.length} attachment(s)`);
    
    for (const attachment of attachments) {
      const isPdf = attachment.contentType === "application/pdf" ||
                    attachment.filename?.toLowerCase().endsWith(".pdf");
      
      if (isPdf) {
        console.log(`Extracting: ${attachment.filename} (${attachment.content?.length || 0} bytes)`);
        const result = await this.extractText(attachment.content);
        results.push({
          filename: attachment.filename,
          ...result,
        });
      }
    }

    return results;
  }

  // Combine all text from email body and PDFs
  combineAllText(emailBody, pdfResults) {
    let combined = emailBody || "";

    for (const pdf of pdfResults) {
      if (pdf.text) {
        combined += `\n\n--- PDF: ${pdf.filename} ---\n${pdf.text}`;
      }
    }

    console.log(`Combined text: ${combined.length} chars`);
    return combined;
  }
}

export const pdfParserService = new PdfParserService();
