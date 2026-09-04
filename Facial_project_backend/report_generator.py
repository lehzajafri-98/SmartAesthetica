import io
import datetime
import base64
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle, PageBreak
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER, TA_LEFT

class ClinicalReportGenerator:
    """
    Generates a professional medical-grade PDF report for SmartAesthetica simulations.
    """

    def __init__(self):
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()

    def _setup_custom_styles(self):
        # Professional Heading
        self.header_style = ParagraphStyle(
            'ClinicalHeader',
            parent=self.styles['Heading1'],
            fontSize=26,
            textColor=colors.HexColor("#1A2B4C"), # Deep Medical Blue
            alignment=TA_CENTER,
            spaceAfter=20,
            fontName='Helvetica-Bold'
        )
        
        # Subheadings
        self.subhead_style = ParagraphStyle(
            'ClinicalSubhead',
            parent=self.styles['Heading2'],
            fontSize=16,
            textColor=colors.HexColor("#B59553"), # Gold Accent
            alignment=TA_LEFT,
            spaceBefore=15,
            spaceAfter=10,
            fontName='Helvetica-Bold'
        )

        # Body Text
        self.body_style = ParagraphStyle(
            'ClinicalBody',
            parent=self.styles['Normal'],
            fontSize=11,
            leading=14,
            textColor=colors.HexColor("#333333"),
            alignment=TA_LEFT
        )

    def _decode_image(self, b64_str):
        if not b64_str:
            return None
        try:
            if "," in b64_str:
                b64_str = b64_str.split(",")[1]
            img_data = base64.b64decode(b64_str)
            return io.BytesIO(img_data)
        except Exception as e:
            print(f"Error decoding image: {e}")
            return None

    def generate(self, before_b64, after_b64, recommendations, patient_name="Patient-A1"):
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=50,
            leftMargin=50,
            topMargin=50,
            bottomMargin=50
        )

        elements = []

        # 1. HEADER
        elements.append(Paragraph("SmartAesthetica™", self.header_style))
        elements.append(Paragraph("Clinical Consultation & Aesthetic Report", 
                                  ParagraphStyle('SubTitle', parent=self.styles['Normal'], fontSize=12, alignment=TA_CENTER, textColor=colors.grey)))
        elements.append(Spacer(1, 0.4 * inch))

        # 2. METADATA TABLE
        meta_data = [
            ["Consultation ID:", f"SA-{datetime.datetime.now().strftime('%Y%m%d%H%M')}"],
            ["Date:", datetime.datetime.now().strftime("%B %d, %Y")],
            ["Patient Name:", patient_name],
            ["Status:", "AI-Assisted Simulation"]
        ]
        meta_table = Table(meta_data, colWidths=[1.5 * inch, 4 * inch])
        meta_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor("#1A2B4C")),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        elements.append(meta_table)
        elements.append(Spacer(1, 0.5 * inch))

        # 3. VISUAL ANALYSIS (Side-by-Side Images)
        elements.append(Paragraph("Facial Comparison Analysis", self.subhead_style))
        
        before_img_data = self._decode_image(before_b64)
        after_img_data = self._decode_image(after_b64)

        if before_img_data and after_img_data:
            img_width = 2.6 * inch
            img_height = 2.6 * inch # Maintain square aspect ratio if possible
            
            img_before = Image(before_img_data, width=img_width, height=img_height)
            img_after = Image(after_img_data, width=img_width, height=img_height)
            
            img_table = Table([
                [img_before, img_after],
                [Paragraph("Baseline Photo (Before)", ParagraphStyle('ct', alignment=TA_CENTER, fontSize=9)),
                 Paragraph("AI Predicted Outcome (After)", ParagraphStyle('ct', alignment=TA_CENTER, fontSize=9))]
            ], colWidths=[3 * inch, 3 * inch])
            
            img_table.setStyle(TableStyle([
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ]))
            elements.append(img_table)
        else:
            elements.append(Paragraph("[Visual Data Unavailable]", self.body_style))

        elements.append(Spacer(1, 0.5 * inch))

        # 4. TREATMENT RECOMMENDATIONS
        elements.append(Paragraph("AI Treatment Recommendations", self.subhead_style))
        
        if recommendations:
            rec_data = [["Recommended Procedure", "Clinical Rationale"]]
            for rec in recommendations:
                proc = rec.get('procedure', 'Consultation')
                reason = rec.get('reason', 'Based on facial metric analysis.')
                rec_data.append([
                    Paragraph(f"<b>{proc}</b>", self.body_style),
                    Paragraph(reason, self.body_style)
                ])
            
            rec_table = Table(rec_data, colWidths=[2 * inch, 4 * inch])
            rec_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#F0F4F8")),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor("#1A2B4C")),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                ('TOPPADDING', (0, 0), (-1, -1), 8),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ]))
            elements.append(rec_table)
        else:
            elements.append(Paragraph("No specific treatments recommended at this time.", self.body_style))

        # 5. DISCLAIMER (Bottom of Page)
        elements.append(Spacer(1, 1 * inch))
        disclaimer = """
        <b>Medical Disclaimer:</b> This report is generated by SmartAesthetica AI for educational and simulation 
        purposes only. It does not constitute medical advice or a guarantee of surgical results. 
        Final medical decisions must be made in consultation with a board-certified professional.
        """
        elements.append(Paragraph(disclaimer, ParagraphStyle('Disclaimer', fontSize=8, textColor=colors.grey, alignment=TA_CENTER)))

        # BUILD PDF
        doc.build(elements)
        buffer.seek(0)
        return buffer
