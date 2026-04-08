const fs = require('fs');
const PDFDocument = require('pdfkit');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = require('docx');

// --- SLA Content ---
const slaTitle = "SusuPay Service Level Agreement (SLA)";
const slaText = `Effective Date: April 5, 2026

1. Introduction
This Service Level Agreement ("SLA") governs the use of the SusuPay platform and services ("Services") provided to you ("Customer" or "User").

2. Service Availability
SusuPay strives to maintain a 99.9% uptime for the core application, excluding scheduled maintenance.
- Scheduled Maintenance: Usually performed during low-traffic periods (12:00 AM - 4:00 AM GMT).
- Unplanned Outages: In the event of an unplanned outage, our engineering team will aim to restore services within 4 hours.

3. Financial Transactions
- Deposits (MoMo): Processed instantly upon successful authorization via Paystack.
- Withdrawals: Requests are reviewed by Administrators. Approved withdrawals are transferred to the designated Mobile Money account within 24-48 hours.

4. Support and Response Times
- Critical Issues (e.g., complete system failure, payment gateway down): 1-2 hours response time.
- High Priority (e.g., withdrawal delays): 4-6 hours response time.
- General Inquiries: 24-48 hours response time.

5. Security and Compliance
All data is secured using industry-standard encryption. User passwords are encrypted, and all financial transactions are processed securely via Paystack, a PCI-DSS certified provider.

6. Liability
SusuPay is not liable for delays caused by third-party telecom operators (MTN, Telecel, AT) or payment gateways.

SusuPay Management`;

// --- Manual Content ---
const manualTitle = "SusuPay User Manual";
const manualText = `1. Getting Started
Welcome to SusuPay! This platform digitizes your Susu savings.

1.1 Registration
1. Navigate to the App homepage.
2. Click "Launch Terminal" and go to "Register".
3. Fill in your Full Name, Email, Password, and Mobile Money Number.
4. Select your MoMo Provider (MTN, Vodafone, or AirtelTigo).
5. Click "Create Account".

2. Dashboard Interface [🖥️]
Your Dashboard provides a complete overview of your finances.
- Total Balance: Displayed at the top in large text.
- Recent Transactions: A graph and list showing your latest deposits and withdrawals.
- Savings Goals: Active goals with progress bars.

3. Making a Deposit (MoMo) [💸]
1. Click "Deposit" on the sidebar.
2. Enter the amount you wish to save.
3. Confirm your MoMo Provider.
4. Click "Initiate Deposit".
5. You will receive a prompt on your phone. Enter your MoMo PIN to authorize.
6. The balance will update instantly upon success.

4. Setting Savings Goals [🎯]
1. On the Dashboard, click "Create Goal".
2. Enter a Goal Title (e.g., "New Laptop").
3. Set your Target Amount and Category.
4. Click "Start Saving".

5. Requesting a Withdrawal [🏧]
1. Go to the "Withdrawals" page.
2. Enter the amount.
3. Submit the request.
4. An Administrator will review the request. Once approved, funds will be sent to your registered MoMo number.

6. Field Terminal (For Collectors) [📱]
*Only accessible to Authorized Collectors.*
1. Navigate to "Field Terminal".
2. Search for a Customer.
3. Enter the Cash Amount collected in the field.
4. Add any notes or receipt numbers.
5. Click "Confirm & Sync Collection". The customer's balance is updated immediately.`;

function createPDF(filename, title, text) {
  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(fs.createWriteStream(filename));
  doc.fontSize(20).text(title, { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(text, { align: 'justify', lineGap: 5 });
  doc.end();
  console.log('Created PDF:', filename);
}

async function createDocx(filename, title, text) {
  const paragraphs = text.split('\n').map(line => {
    if (line.match(/^\d+\./)) {
      return new Paragraph({
        text: line,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 }
      });
    } else if (line.trim() === '') {
      return new Paragraph({ text: '', spacing: { after: 100 } });
    } else {
      return new Paragraph({
        children: [new TextRun(line)],
        spacing: { after: 100 }
      });
    }
  });

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: title,
          heading: HeadingLevel.HEADING_1,
          spacing: { after: 300 },
          alignment: AlignmentType.CENTER
        }),
        ...paragraphs
      ]
    }]
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(filename, buffer);
  console.log('Created DOCX:', filename);
}

async function run() {
  createPDF('../SusuPay_SLA.pdf', slaTitle, slaText);
  createPDF('../SusuPay_Manual.pdf', manualTitle, manualText);
  await createDocx('../SusuPay_SLA.docx', slaTitle, slaText);
  await createDocx('../SusuPay_Manual.docx', manualTitle, manualText);
}

run().catch(console.error);