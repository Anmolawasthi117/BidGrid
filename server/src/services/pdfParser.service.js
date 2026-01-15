class PdfParserService {
  // Extract text from a PDF buffer
  async extractText(buffer) {
    try {
      // Dynamic import for ESM compatibility
      const pdfParse = (await import("pdf-parse")).default;
      const data = await pdfParse(buffer);
      return {
        text: data.text,
        numPages: data.numpages,
        info: data.info,
      };
    } catch (err) {
      console.error("Error parsing PDF:", err.message);
      return { text: "", numPages: 0, error: err.message };
    }
  }

  // Extract text from multiple PDF attachments
  async extractFromAttachments(attachments) {
    const results = [];

    if (!attachments || attachments.length === 0) {
      return results;
    }

    for (const attachment of attachments) {
      if (
        attachment.contentType === "application/pdf" ||
        attachment.filename?.toLowerCase().endsWith(".pdf")
      ) {
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

    return combined;
  }
}

export const pdfParserService = new PdfParserService();

