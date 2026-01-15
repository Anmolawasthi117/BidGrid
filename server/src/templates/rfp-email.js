// Professional HTML email template for RFP
export function generateRFPEmailTemplate(rfp, senderName = "BidGrid") {
  const formatDate = (date) => {
    if (!date) return "Not specified";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatBudget = (budget) => {
    if (!budget) return "To be discussed";
    const currency = budget.currency || "USD";
    const symbol = currency === "USD" ? "$" : currency;
    if (budget.min && budget.max) {
      return `${symbol}${budget.min.toLocaleString()} - ${symbol}${budget.max.toLocaleString()}`;
    }
    if (budget.max) {
      return `Up to ${symbol}${budget.max.toLocaleString()}`;
    }
    return "To be discussed";
  };

  const requirementsList = rfp.requirements && rfp.requirements.length > 0
    ? rfp.requirements.map(req => `<li style="margin-bottom: 8px; color: #374151;">${req}</li>`).join("")
    : "<li style=\"color: #6b7280;\">No specific requirements listed</li>";

  const specsSection = rfp.specs && Object.keys(rfp.specs).length > 0
    ? Object.entries(rfp.specs)
        .map(([key, value]) => `
          <tr>
            <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280; text-transform: capitalize;">${key}</td>
            <td style="padding: 8px 12px; border-bottom: 1px solid #e5e7eb; color: #111827; font-weight: 500;">${value}</td>
          </tr>
        `)
        .join("")
    : "";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Request for Proposal - ${rfp.title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f3f4f6;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 32px 40px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">
                📋 Request for Proposal
              </h1>
              <p style="margin: 8px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">
                From ${senderName} via BidGrid
              </p>
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td style="padding: 32px 40px 16px 40px;">
              <h2 style="margin: 0; color: #111827; font-size: 22px; font-weight: 600;">
                ${rfp.title || "Untitled RFP"}
              </h2>
            </td>
          </tr>

          <!-- Description -->
          <tr>
            <td style="padding: 0 40px 24px 40px;">
              <p style="margin: 0; color: #4b5563; font-size: 15px; line-height: 1.6;">
                ${rfp.description || "No description provided."}
              </p>
            </td>
          </tr>

          <!-- Key Details -->
          <tr>
            <td style="padding: 0 40px 24px 40px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f9fafb; border-radius: 8px;">
                <tr>
                  <td style="padding: 20px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td width="50%" style="padding: 8px;">
                          <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Quantity</p>
                          <p style="margin: 0; color: #111827; font-size: 18px; font-weight: 600;">${rfp.quantity || "TBD"}</p>
                        </td>
                        <td width="50%" style="padding: 8px;">
                          <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Budget Range</p>
                          <p style="margin: 0; color: #111827; font-size: 18px; font-weight: 600;">${formatBudget(rfp.budget)}</p>
                        </td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding: 8px;">
                          <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Deadline</p>
                          <p style="margin: 0; color: #10b981; font-size: 18px; font-weight: 600;">${formatDate(rfp.deadline)}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Requirements -->
          <tr>
            <td style="padding: 0 40px 24px 40px;">
              <h3 style="margin: 0 0 12px 0; color: #111827; font-size: 16px; font-weight: 600;">Requirements</h3>
              <ul style="margin: 0; padding-left: 20px; list-style-type: disc;">
                ${requirementsList}
              </ul>
            </td>
          </tr>

          ${specsSection ? `
          <!-- Specifications -->
          <tr>
            <td style="padding: 0 40px 24px 40px;">
              <h3 style="margin: 0 0 12px 0; color: #111827; font-size: 16px; font-weight: 600;">Specifications</h3>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                ${specsSection}
              </table>
            </td>
          </tr>
          ` : ""}

          <!-- CTA -->
          <tr>
            <td style="padding: 16px 40px 32px 40px;">
              <p style="margin: 0 0 16px 0; color: #4b5563; font-size: 14px;">
                Interested in this opportunity? Reply to this email with your proposal.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f9fafb; border-radius: 0 0 12px 12px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #6b7280; font-size: 12px; text-align: center;">
                Sent via <strong style="color: #10b981;">BidGrid</strong> - AI-Powered RFP Management
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
