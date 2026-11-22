package com.kisansetu.grievance.service;

import com.kisansetu.grievance.entity.Grievance;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
public class GrievancePdfService {

    public byte[] generateGrievancePdf(Grievance grievance) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 40, 40, 40, 40);
            PdfWriter.getInstance(document, out);
            document.open();

            // Fonts
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, Font.BOLD, new Color(20, 80, 40));
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, Font.BOLD, Color.BLACK);
            Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Font.NORMAL, Color.DARK_GRAY);
            Font boldBodyFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Font.BOLD, Color.BLACK);

            // Title Header
            Paragraph title = new Paragraph("KISANSETU – AGRICULTURAL ENTITLEMENT GRIEVANCE", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(5);
            document.add(title);

            Paragraph subtitle = new Paragraph("Official Representation for Financial Rectification under Govt. Guidelines", bodyFont);
            subtitle.setAlignment(Element.ALIGN_CENTER);
            subtitle.setSpacingAfter(15);
            document.add(subtitle);

            // Metadata Table
            PdfPTable metaTable = new PdfPTable(2);
            metaTable.setWidthPercentage(100);
            metaTable.setSpacingAfter(15);

            addCell(metaTable, "Grievance ID:", boldBodyFont, Color.LIGHT_GRAY);
            addCell(metaTable, "GRV-" + grievance.getId(), bodyFont, Color.WHITE);
            addCell(metaTable, "Submission Date:", boldBodyFont, Color.LIGHT_GRAY);
            addCell(metaTable, grievance.getCreatedAt().format(DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm")), bodyFont, Color.WHITE);
            addCell(metaTable, "Applicant Name:", boldBodyFont, Color.LIGHT_GRAY);
            addCell(metaTable, grievance.getFarmer().getFarmerName(), bodyFont, Color.WHITE);
            addCell(metaTable, "Mobile Number:", boldBodyFont, Color.LIGHT_GRAY);
            addCell(metaTable, grievance.getFarmer().getMobileNumber(), bodyFont, Color.WHITE);
            addCell(metaTable, "Geographical Location:", boldBodyFont, Color.LIGHT_GRAY);
            addCell(metaTable, String.format("Village: %s, Tehsil: %s, District: %s, State: %s",
                    grievance.getFarmer().getVillage(), grievance.getFarmer().getTehsil(),
                    grievance.getFarmer().getDistrict(), grievance.getFarmer().getState()), bodyFont, Color.WHITE);
            document.add(metaTable);

            // Subject
            Paragraph subjectPara = new Paragraph("SUBJECT: " + grievance.getSubject(), headerFont);
            subjectPara.setSpacingAfter(10);
            document.add(subjectPara);

            // Discrepancy Details Table if available
            if (grievance.getDiscrepancy() != null) {
                Paragraph discTitle = new Paragraph("RECORDED FINANCIAL DISCREPANCY SUMMARY:", headerFont);
                discTitle.setSpacingAfter(5);
                document.add(discTitle);

                PdfPTable finTable = new PdfPTable(4);
                finTable.setWidthPercentage(100);
                finTable.setSpacingAfter(15);

                addCell(finTable, "Category", boldBodyFont, Color.LIGHT_GRAY);
                addCell(finTable, "Expected Entitlement", boldBodyFont, Color.LIGHT_GRAY);
                addCell(finTable, "Actual Disbursed", boldBodyFont, Color.LIGHT_GRAY);
                addCell(finTable, "Recorded Shortfall", boldBodyFont, Color.LIGHT_GRAY);

                addCell(finTable, grievance.getDiscrepancy().getCategory().name(), bodyFont, Color.WHITE);
                addCell(finTable, "INR " + grievance.getDiscrepancy().getExpectedAmount(), bodyFont, Color.WHITE);
                addCell(finTable, "INR " + grievance.getDiscrepancy().getActualAmount(), bodyFont, Color.WHITE);
                addCell(finTable, "INR " + grievance.getDiscrepancy().getDifferenceAmount(), boldBodyFont, Color.WHITE);

                document.add(finTable);
            }

            // Grievance Content Body
            Paragraph bodyTitle = new Paragraph("APPLICATION DETAILS / विवरण:", headerFont);
            bodyTitle.setSpacingAfter(5);
            document.add(bodyTitle);

            Paragraph contentPara = new Paragraph(grievance.getGrievanceContent(), bodyFont);
            contentPara.setSpacingAfter(15);
            contentPara.setLeading(14);
            document.add(contentPara);

            // Checklist
            if (grievance.getEvidenceChecklist() != null && !grievance.getEvidenceChecklist().isBlank()) {
                Paragraph checkTitle = new Paragraph("SUPPORTING EVIDENCE CHECKLIST (ATTACHED):", headerFont);
                checkTitle.setSpacingAfter(5);
                document.add(checkTitle);

                Paragraph checkList = new Paragraph(grievance.getEvidenceChecklist(), bodyFont);
                checkList.setSpacingAfter(25);
                document.add(checkList);
            }

            // Signature Section
            PdfPTable sigTable = new PdfPTable(2);
            sigTable.setWidthPercentage(100);
            addCell(sigTable, "Verified via KisanSetu Transparency Platform\nAudit Ref: KS-AUDIT-" + grievance.getId(), bodyFont, Color.WHITE);
            addCell(sigTable, "\n\n___________________________________\nSignature / Thumb Impression of Farmer", boldBodyFont, Color.WHITE);
            document.add(sigTable);

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new IllegalStateException("Failed to generate Grievance PDF", e);
        }
    }

    private void addCell(PdfPTable table, String text, Font font, Color bgColor) {
        PdfPCell cell = new PdfPCell(new Phrase(text != null ? text : "", font));
        cell.setPadding(6);
        cell.setBackgroundColor(bgColor);
        cell.setBorderColor(Color.GRAY);
        table.addCell(cell);
    }
}
