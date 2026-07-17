#!/usr/bin/env python3
"""
Lakive Issue Brief — Vancouver Livability & Worker Affordability, H1 2026
PDF Generator using ReportLab Platypus
"""

from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY, TA_RIGHT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, KeepTogether, PageBreak, Image as RLImage
)
from reportlab.platypus.flowables import Flowable
import os, sys

LOGO_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'lakive-logo-cropped.png')

# ── Color palette ────────────────────────────────────────────────────────────
C_TEAL      = colors.HexColor('#0D9488')
C_TEAL_LITE = colors.HexColor('#CCFBF1')
C_AMBER     = colors.HexColor('#D97706')
C_AMBER_LITE= colors.HexColor('#FEF3C7')
C_ORANGE    = colors.HexColor('#C2410C')
C_ORANGE_LT = colors.HexColor('#FFEDD5')
C_RED       = colors.HexColor('#DC2626')
C_RED_LITE  = colors.HexColor('#FEE2E2')
C_GREEN     = colors.HexColor('#059669')
C_GREEN_LT  = colors.HexColor('#D1FAE5')
C_NAVY      = colors.HexColor('#0F172A')
C_DARK      = colors.HexColor('#1E293B')
C_MID       = colors.HexColor('#475569')
C_MUTED     = colors.HexColor('#94A3B8')
C_RULE      = colors.HexColor('#E2E8F0')
C_ROW_ALT   = colors.HexColor('#F8FAFC')
C_HEADER_BG = colors.HexColor('#F1F5F9')
C_WHITE     = colors.white
C_PULLQUOTE = colors.HexColor('#FFFBEB')
C_BLUE_LT   = colors.HexColor('#EFF6FF')
C_TEAL_BOX  = colors.HexColor('#F0FDFA')

# ── 5-Level Rating System ────────────────────────────────────────────────────
# Lakive Rating = max(hpiLevel, rpiGrossLevel)
# hpiLevel: L1≤5 | L2≤8 | L3≤12 | L4≤18 | L5>18
# rpiLevel: L1≤25% | L2≤30% | L3≤38% | L4≤50% | L5>50%
LVL_COLOR = {
    1: (colors.HexColor('#0D9488'), colors.HexColor('#CCFBF1')),
    2: (colors.HexColor('#059669'), colors.HexColor('#D1FAE5')),
    3: (colors.HexColor('#D97706'), colors.HexColor('#FEF3C7')),
    4: (colors.HexColor('#C2410C'), colors.HexColor('#FFEDD5')),
    5: (colors.HexColor('#DC2626'), colors.HexColor('#FEE2E2')),
}
LVL_LABEL = {
    1: 'L1 Lower Pressure',
    2: 'L2 Manageable',
    3: 'L3 Under Pressure',
    4: 'L4 Difficult',
    5: 'L5 Severe Pressure',
}

# ── Data (CPP2-corrected afterTax; corrected Calgary calRpiNet) ──────────────
# Columns: name, salary, afterTax, hpi, rpiGross, rpiNet, level, note, atIndicative
OCCUPATIONS = [
    ('Family Physician / GP',  160960, 113346,  7.5,  23.1,  32.8, 2, '1', True),
    ('Lawyer',                 129968,  94716,  9.3,  28.6,  39.3, 3, '',  False),
    ('Software Developer',     102180,  76509, 11.9,  36.4,  48.6, 3, '',  False),
    ('Pharmacist',              97500,  73190, 12.5,  38.2,  50.8, 4, '',  False),
    ('Civil Engineer',          96993,  72826, 12.5,  38.4,  51.1, 4, '',  False),
    ('Registered Nurse',        92703,  69746, 13.1,  40.1,  53.3, 4, '',  False),
    ('Data Analyst',            87185,  65783, 13.9,  42.7,  56.5, 4, '',  False),
    ('Secondary Teacher',       86444,  65252, 14.1,  43.0,  57.0, 4, '',  False),
    ('Dentist',                 78000,  59469, 15.6,  47.7,  62.6, 4, '2', True),
    ('Social Worker',           71994,  55417, 16.9,  51.7,  67.1, 5, '',  False),
    ('Electrician',             67412,  52366, 18.0,  55.2,  71.0, 5, '',  False),
    ('Retail Sales Associate',  37050,  30741, 32.8, 100.4, 121.0, 5, '',  False),
]

# Columns: name, vanHpi, calHpi, vanRpiGross, calRpiGross, vanLvl, calLvl
CALGARY = [
    ('Registered Nurse',   13.1, 6.9, 40.1, 24.6, 4, 2),
    ('Software Developer', 11.9, 6.2, 36.4, 22.3, 3, 2),
    ('Secondary Teacher',  14.1, 7.4, 43.0, 26.4, 4, 2),
    ('Lawyer',              9.3, 4.9, 28.6, 17.5, 3, 1),
    ('Electrician',        18.0, 9.5, 55.2, 33.8, 5, 3),
    ('Social Worker',      16.9, 8.9, 51.7, 31.7, 5, 3),
]

HIGH_RENT_NET = sum(1 for o in OCCUPATIONS if o[5] >= 50)  # rpiNet >= 50%
L4_PLUS      = sum(1 for o in OCCUPATIONS if o[6] >= 4)   # level >= 4

# ── Styles ────────────────────────────────────────────────────────────────────
def S(name, **kw):
    defaults = dict(fontName='Helvetica', fontSize=10, leading=14,
                    textColor=C_DARK, spaceAfter=0, spaceBefore=0)
    defaults.update(kw)
    return ParagraphStyle(name, **defaults)

ST = {
    'meta':      S('meta', fontName='Helvetica', fontSize=8, textColor=C_MUTED, leading=10),
    'title':     S('title', fontName='Helvetica-Bold', fontSize=21, leading=26,
                   textColor=C_NAVY, spaceAfter=6),
    'title2':    S('title2', fontName='Helvetica-Bold', fontSize=21, leading=26,
                   textColor=C_AMBER, spaceAfter=14),
    'thesis':    S('thesis', fontName='Helvetica-Bold', fontSize=10.5, leading=15,
                   textColor=C_DARK, leftIndent=10, spaceAfter=0),
    'subtitle':  S('subtitle', fontName='Helvetica', fontSize=10, leading=15,
                   textColor=C_MID, spaceAfter=0),
    'h2':        S('h2', fontName='Helvetica-Bold', fontSize=13, leading=17,
                   textColor=C_NAVY, spaceBefore=16, spaceAfter=6),
    'h3':        S('h3', fontName='Helvetica-Bold', fontSize=10.5, leading=14,
                   textColor=C_MID, spaceBefore=12, spaceAfter=4),
    'body':      S('body', fontName='Helvetica', fontSize=9.5, leading=14.5,
                   textColor=C_MID, alignment=TA_JUSTIFY, spaceAfter=7),
    'find_num':  S('find_num', fontName='Helvetica-Bold', fontSize=10, leading=14,
                   textColor=C_AMBER),
    'find_bold': S('find_bold', fontName='Helvetica-Bold', fontSize=8.5, leading=13,
                   textColor=C_DARK),
    'find_text': S('find_text', fontName='Helvetica', fontSize=8.5, leading=13,
                   textColor=C_DARK, spaceAfter=4),
    'caption':   S('caption', fontName='Helvetica', fontSize=8, leading=12,
                   textColor=C_MUTED, spaceAfter=8),
    'pullquote': S('pullquote', fontName='Helvetica-Oblique', fontSize=10, leading=15.5,
                   textColor=C_DARK, leftIndent=12, spaceAfter=0),
    'note':      S('note', fontName='Helvetica', fontSize=7.5, leading=11,
                   textColor=C_MID),
    'meth':      S('meth', fontName='Helvetica', fontSize=8, leading=12,
                   textColor=C_MID, spaceAfter=5, alignment=TA_JUSTIFY),
    'tbl_hdr':   S('tbl_hdr', fontName='Helvetica-Bold', fontSize=7.5, leading=9.5,
                   textColor=C_WHITE, alignment=TA_CENTER),
    'tbl_hdr_l': S('tbl_hdr_l', fontName='Helvetica-Bold', fontSize=7.5, leading=9.5,
                   textColor=C_WHITE, alignment=TA_LEFT),
    'tbl_cell':  S('tbl_cell', fontName='Helvetica', fontSize=8.5, leading=11,
                   textColor=C_DARK),
    'tbl_cell_c':S('tbl_cell_c', fontName='Helvetica', fontSize=8.5, leading=11,
                   textColor=C_DARK, alignment=TA_CENTER),
    'tbl_bold':  S('tbl_bold', fontName='Helvetica-Bold', fontSize=8.5, leading=11,
                   textColor=C_DARK, alignment=TA_CENTER),
    'stat_val':  S('stat_val', fontName='Helvetica-Bold', fontSize=20, leading=22,
                   alignment=TA_CENTER),
    'stat_lbl':  S('stat_lbl', fontName='Helvetica-Bold', fontSize=7, leading=9,
                   textColor=C_DARK, alignment=TA_CENTER),
    'stat_sub':  S('stat_sub', fontName='Helvetica', fontSize=6.5, leading=8.5,
                   textColor=C_MUTED, alignment=TA_CENTER),
    'badge':     S('badge', fontName='Helvetica-Bold', fontSize=7, leading=9,
                   alignment=TA_CENTER),
    'who_title': S('who_title', fontName='Helvetica-Bold', fontSize=9, leading=12,
                   spaceAfter=5),
    'who_item':  S('who_item', fontName='Helvetica', fontSize=8.5, leading=12,
                   textColor=C_MID, spaceAfter=3),
    'callout':   S('callout', fontName='Helvetica-Bold', fontSize=8.5, leading=12,
                   textColor=C_TEAL),
    'callout_b': S('callout_b', fontName='Helvetica', fontSize=9, leading=14,
                   textColor=C_DARK),
    'method_note': S('method_note', fontName='Helvetica', fontSize=7.5, leading=11,
                     textColor=C_MID, alignment=TA_JUSTIFY),
}

# ── Custom Flowables ──────────────────────────────────────────────────────────
class HLine(Flowable):
    def __init__(self, width, color=C_RULE, thickness=0.5):
        super().__init__()
        self.width = width
        self.color = color
        self.thickness = thickness
        self.height = 0

    def draw(self):
        c = self.canv
        c.saveState()
        c.setStrokeColor(self.color)
        c.setLineWidth(self.thickness)
        c.line(0, 0, self.width, 0)
        c.restoreState()

# ── Header / Footer ───────────────────────────────────────────────────────────
def on_first_page(canvas, doc):
    _draw_footer(canvas, doc)

def on_later_pages(canvas, doc):
    _draw_header(canvas, doc)
    _draw_footer(canvas, doc)

def _draw_header(canvas, doc):
    canvas.saveState()
    W = doc.pagesize[0]
    y = doc.pagesize[1] - 0.52*inch
    canvas.setStrokeColor(C_RULE)
    canvas.setLineWidth(0.5)
    canvas.line(doc.leftMargin, y, W - doc.rightMargin, y)
    # Draw logo image in header (~24mm wide = ~68pt, left-aligned with content)
    logo_h_pt = 15.5                      # → logo_w ≈ 68pt ≈ 24mm
    logo_w_pt = logo_h_pt * (1230 / 280)
    try:
        canvas.drawImage(LOGO_PATH, doc.leftMargin, y + 0.5,
                         width=logo_w_pt, height=logo_h_pt, mask='auto')
    except Exception:
        canvas.setFont('Helvetica-Bold', 7.5)
        canvas.setFillColor(C_TEAL)
        canvas.drawString(doc.leftMargin, y + 4, 'LAKIVE')
    canvas.setFont('Helvetica', 7)
    canvas.setFillColor(C_MUTED)
    canvas.drawCentredString(W/2, y + 4, 'Vancouver Worker Affordability · H1 2026')
    canvas.drawRightString(W - doc.rightMargin, y + 4, f'Page {doc.page}')
    canvas.restoreState()

def _draw_footer(canvas, doc):
    canvas.saveState()
    W = doc.pagesize[0]
    y = doc.bottomMargin - 16
    canvas.setStrokeColor(C_RULE)
    canvas.setLineWidth(0.5)
    canvas.line(doc.leftMargin, y + 10, W - doc.rightMargin, y + 10)
    canvas.setFont('Helvetica', 7)
    canvas.setFillColor(C_MUTED)
    canvas.drawCentredString(W/2, y,
        'Lakive Issue Brief · H1 2026 · lakive.com · '
        'Data: Government of Canada Job Bank, REBGV, Rentals.ca/Zumper, CIHI/CMA, Statistics Canada')
    canvas.restoreState()

# ── Helpers ───────────────────────────────────────────────────────────────────
def rpi_color_g(v):
    if v >= 50: return C_RED
    if v >= 38: return C_ORANGE
    if v >= 30: return C_AMBER
    return C_GREEN

def rpi_color_n(v):
    if v >= 60: return C_RED
    if v >= 50: return C_ORANGE
    if v >= 38: return C_AMBER
    return C_GREEN

def fmt_k(n):
    return f'${round(n/1000)}K'

def make_badge(text, level, width=1.18*inch):
    fg, bg = LVL_COLOR[level]
    t = Table([[Paragraph(text, ParagraphStyle('b2', fontName='Helvetica-Bold',
               fontSize=6.5, leading=8.5, textColor=fg, alignment=TA_CENTER))]],
              colWidths=[width])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), bg),
        ('ROUNDEDCORNERS', [4]),
        ('TOPPADDING', (0,0), (-1,-1), 2),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
        ('LEFTPADDING', (0,0), (-1,-1), 3),
        ('RIGHTPADDING', (0,0), (-1,-1), 3),
    ]))
    return t

def colored_num(val_str, color):
    return Paragraph(
        f'<font color="#{color.hexval()[2:]}">{val_str}</font>',
        ST['tbl_bold'])

# ── Cover ─────────────────────────────────────────────────────────────────────
def build_cover(content_w):
    elems = []

    # ── Brand bar: Logo left | Issue Brief · Vancouver · H1 2026 right ──────────
    # Cover logo: ~46mm wide (target 44-48mm), left-aligned with content
    logo_h = 0.41 * inch   # → logo_w ≈ 1.80 inch ≈ 45.7mm
    logo_w = logo_h * (1230 / 280)
    logo_img = RLImage(LOGO_PATH, width=logo_w, height=logo_h)

    brand_right = Paragraph(
        'Issue Brief  ·  Vancouver  ·  H1 2026',
        ParagraphStyle('brand_r', fontName='Helvetica', fontSize=8.5,
                       textColor=C_MID, alignment=TA_RIGHT))

    brand_bar = Table(
        [[logo_img, brand_right]],
        colWidths=[logo_w + 10, content_w - logo_w - 10])
    brand_bar.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ALIGN', (1,0), (1,0), 'RIGHT'),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    elems.append(brand_bar)
    elems.append(Spacer(1, 14))
    elems.append(HLine(content_w, C_RULE, 1))
    elems.append(Spacer(1, 16))

    elems.append(Paragraph('Vancouver Is a Top-10 Livable City —', ST['title']))
    elems.append(Paragraph(
        '<font color="#D97706">But Can Local Workers Afford to Stay?</font>',
        ST['title2']))

    # Thesis statement with left border effect via table
    thesis_box = Table(
        [[Paragraph(
            'Vancouver ranks among the world\'s best cities — but remains financially '
            'out of reach for many of the workers who keep it running.',
            ST['thesis'])]],
        colWidths=[content_w])
    thesis_box.setStyle(TableStyle([
        ('LINEBEFORE', (0,0), (0,-1), 3, C_AMBER),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 14),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
    ]))
    elems.append(thesis_box)
    elems.append(Spacer(1, 10))

    elems.append(Paragraph(
        'Salary data from Government of Canada Job Bank (Lower Mainland–Southwest Region, '
        '2023–2024). Ratings based on Lakive\'s 5-level Housing Price Index and Rent '
        'Pressure Index system.',
        ST['subtitle']))
    elems.append(Spacer(1, 18))
    elems.append(HLine(content_w))
    return elems

# ── Key Findings ──────────────────────────────────────────────────────────────
FINDINGS = [
    ('Only 3 of 12 occupations rate L3 Under Pressure or better; '
     f'{L4_PLUS} fall into L4 Difficult or L5 Severe Pressure.',
     ''),
    ('Vancouver\'s composite benchmark HPI is 16.2 years at a $75,000 income, '
     'compared with 8.5 years in Calgary.',
     ''),
    (f'Estimated after-tax rent burden exceeds 50% for {HIGH_RENT_NET} of 12 occupations, '
     'highlighting cash-flow pressure beyond the gross-income rating.',
     ''),
    ('Among occupations examined, only Family Physicians and Lawyers fall below '
     '10 HPI Years.',
     ''),
    ('Salary data for 10 of 12 occupations is from Government of Canada Job Bank; '
     'physician and dentist figures use alternative official sources and carry caveats.',
     ''),
]

def build_findings(content_w):
    inner_w = content_w - 28
    rows = []
    for i, (bold_text, extra) in enumerate(FINDINGS):
        rows.append([
            Paragraph(str(i+1), ST['find_num']),
            Paragraph(f'<b>{bold_text}</b>{" " + extra if extra else ""}', ST['find_text']),
        ])
    t = Table(rows, colWidths=[0.22*inch, inner_w - 0.22*inch])
    t.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
    ]))
    outer = Table([[t]], colWidths=[content_w])
    outer.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), C_AMBER_LITE),
        ('BOX', (0,0), (-1,-1), 0.5, C_AMBER),
        ('ROUNDEDCORNERS', [6]),
        ('TOPPADDING', (0,0), (-1,-1), 12),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
        ('LEFTPADDING', (0,0), (-1,-1), 14),
        ('RIGHTPADDING', (0,0), (-1,-1), 14),
    ]))
    return outer

# ── Stats row ─────────────────────────────────────────────────────────────────
STATS = [
    ('#9',           'EIU Global Rank 2026',        'Out of 173 cities',    C_TEAL),
    ('16.2 yrs',     'Composite Benchmark HPI',     'At $75K median salary',C_AMBER),
    (f'{L4_PLUS}/12','L4 Difficult or worse',       'By occupation',        C_ORANGE),
    (f'{HIGH_RENT_NET}/12', 'Est. rent >50% of take-home', 'On a 2BR unit', C_RED),
]

def build_stats(content_w):
    cw = (content_w - 3*6) / 4
    stat_tables = []
    for val, label, sub, color in STATS:
        inner = Table([
            [Paragraph(f'<font color="#{color.hexval()[2:]}">{val}</font>', ST['stat_val'])],
            [Paragraph(label, ST['stat_lbl'])],
            [Paragraph(sub, ST['stat_sub'])],
        ], colWidths=[cw])
        inner.setStyle(TableStyle([
            ('TOPPADDING', (0,0), (-1,-1), 5),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
            ('LEFTPADDING', (0,0), (-1,-1), 3),
            ('RIGHTPADDING', (0,0), (-1,-1), 3),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('BOX', (0,0), (-1,-1), 0.5, color),
            ('ROUNDEDCORNERS', [5]),
        ]))
        stat_tables.append(inner)
    row = Table([stat_tables], colWidths=[cw]*4, hAlign='LEFT')
    row.setStyle(TableStyle([
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING', (0,0), (-1,-1), 3),
        ('RIGHTPADDING', (0,0), (-1,-1), 3),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
    ]))
    return row

# ── Occupation table (no NOC column) ─────────────────────────────────────────
def build_occ_table(content_w):
    # Columns: Occupation | Gross | Est. After-Tax | HPI Yrs | RPI Gross | Est. RPI Net | Lakive Rating
    col_w = [2.35*inch, 0.58*inch, 0.72*inch, 0.55*inch, 0.60*inch, 0.63*inch, 1.17*inch]
    # total = 6.60 (content_w = 6.8)

    HDR = ['Occupation', 'Gross', 'Est.\nAfter-Tax', 'HPI\nYrs',
           'RPI\nGross', 'Est.\nRPI Net', 'Lakive Rating\n(HPI + RPI Gross)']

    header_row = []
    for i, h in enumerate(HDR):
        style = ST['tbl_hdr_l'] if i == 0 else ST['tbl_hdr']
        header_row.append(Paragraph(h, style))

    data = [header_row]

    for name, salary, at, hpi, rpig, rpin, lvl, note, at_ind in OCCUPATIONS:
        lc, _ = LVL_COLOR[lvl]
        note_str = f'<super>{note}</super>' if note else ''
        ind_str = '~' if at_ind else ''

        data.append([
            Paragraph(f'{name}{note_str}', ST['tbl_cell']),
            Paragraph(fmt_k(salary), ST['tbl_cell_c']),
            Paragraph(f'{ind_str}{fmt_k(at)}',
                      ParagraphStyle('atc', fontName='Helvetica-Bold',
                                     fontSize=8.5, leading=11,
                                     textColor=C_MID if at_ind else C_DARK,
                                     alignment=TA_CENTER)),
            colored_num(str(hpi), lc),
            Paragraph(f'<font color="#{rpi_color_g(rpig).hexval()[2:]}">{rpig}%</font>',
                      ST['tbl_bold']),
            Paragraph(f'<font color="#{rpi_color_n(rpin).hexval()[2:]}">{rpin}%</font>',
                      ST['tbl_bold']),
            make_badge(LVL_LABEL[lvl], lvl, width=1.17*inch),
        ])

    t = Table(data, colWidths=col_w, repeatRows=1)
    style = [
        ('BACKGROUND', (0,0), (-1,0), C_NAVY),
        ('TEXTCOLOR', (0,0), (-1,0), C_WHITE),
        ('TOPPADDING', (0,0), (-1,0), 6),
        ('BOTTOMPADDING', (0,0), (-1,0), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
        ('FONTNAME', (0,1), (-1,-1), 'Helvetica'),
        ('FONTSIZE', (0,1), (-1,-1), 8.5),
        ('TOPPADDING', (0,1), (-1,-1), 7),
        ('BOTTOMPADDING', (0,1), (-1,-1), 7),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('LINEBELOW', (0,0), (-1,-1), 0.3, C_RULE),
        ('ALIGN', (1,1), (-1,-1), 'CENTER'),
    ]
    for i in range(1, len(data)):
        if i % 2 == 0:
            style.append(('BACKGROUND', (0,i), (-1,i), C_ROW_ALT))
    t.setStyle(TableStyle(style))
    return t

# ── Rating legend ─────────────────────────────────────────────────────────────
def build_legend(content_w):
    descs = [
        (1, 'HPI ≤5 yrs & RPI ≤25%'),
        (2, 'HPI ≤8 yrs & RPI ≤30%'),
        (3, 'HPI ≤12 yrs & RPI ≤38%'),
        (4, 'HPI ≤18 yrs & RPI ≤50%'),
        (5, 'HPI >18 yrs or RPI >50%'),
    ]
    items = []
    for lvl, desc in descs:
        lc, _ = LVL_COLOR[lvl]
        items.append(Paragraph(
            f'<font color="#{lc.hexval()[2:]}"><b>{LVL_LABEL[lvl]}</b></font>: {desc}',
            ParagraphStyle('leg', fontName='Helvetica', fontSize=7.5, leading=10, textColor=C_MID)))
    items.append(Paragraph(
        'Rating = max(HPI level, RPI Gross level) — RPI Net does not determine rating',
        ParagraphStyle('leg2', fontName='Helvetica-Oblique', fontSize=7, leading=9.5, textColor=C_MUTED)))

    rows = [[items[i], items[i+1] if i+1 < len(items) else Paragraph('', ST['note'])]
            for i in range(0, len(items), 2)]
    t = Table(rows, colWidths=[content_w/2, content_w/2])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), C_HEADER_BG),
        ('BOX', (0,0), (-1,-1), 0.3, C_RULE),
        ('ROUNDEDCORNERS', [4]),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    return t

# ── Pull quote ────────────────────────────────────────────────────────────────
def build_pullquote(text, content_w):
    t = Table([[Paragraph(text, ST['pullquote'])]], colWidths=[content_w])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), C_PULLQUOTE),
        ('LINEBEFORE', (0,0), (0,-1), 3, C_AMBER),
        ('TOPPADDING', (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
        ('LEFTPADDING', (0,0), (-1,-1), 14),
        ('RIGHTPADDING', (0,0), (-1,-1), 12),
    ]))
    return t

# ── Calgary comparison table ──────────────────────────────────────────────────
def build_cal_table(content_w):
    cw = [1.9*inch, 0.58*inch, 0.58*inch, 0.68*inch, 0.68*inch, 1.18*inch, 1.18*inch]

    h1 = [
        Paragraph('Occupation', ST['tbl_hdr_l']),
        Paragraph('HPI Years', ParagraphStyle('ch', fontName='Helvetica-Bold', fontSize=7.5,
                  leading=9.5, textColor=colors.HexColor('#93C5FD'), alignment=TA_CENTER)),
        Paragraph('', ST['tbl_hdr']),
        Paragraph('RPI Gross', ParagraphStyle('ch2', fontName='Helvetica-Bold',
                  fontSize=7.5, leading=9.5, textColor=colors.HexColor('#5EEAD4'), alignment=TA_CENTER)),
        Paragraph('', ST['tbl_hdr']),
        Paragraph('Lakive Rating', ST['tbl_hdr']),
        Paragraph('', ST['tbl_hdr']),
    ]
    h2 = [
        Paragraph('', ST['tbl_hdr']),
        Paragraph('Vancouver', ST['tbl_hdr']),
        Paragraph('Calgary', ST['tbl_hdr']),
        Paragraph('Vancouver', ST['tbl_hdr']),
        Paragraph('Calgary', ST['tbl_hdr']),
        Paragraph('Vancouver', ST['tbl_hdr']),
        Paragraph('Calgary', ST['tbl_hdr']),
    ]
    data = [h1, h2]

    for name, vh, ch, vr, cr, vl, cl in CALGARY:
        data.append([
            Paragraph(name, ST['tbl_cell']),
            colored_num(str(vh), C_ORANGE),
            colored_num(str(ch), C_TEAL),
            colored_num(f'{vr}%', C_ORANGE),
            colored_num(f'{cr}%', C_TEAL),
            make_badge(LVL_LABEL[vl], vl, width=1.18*inch),
            make_badge(LVL_LABEL[cl], cl, width=1.18*inch),
        ])

    t = Table(data, colWidths=cw, repeatRows=2)
    style = [
        ('BACKGROUND', (0,0), (-1,1), C_NAVY),
        ('TOPPADDING', (0,0), (-1,1), 5),
        ('BOTTOMPADDING', (0,0), (-1,1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ALIGN', (1,0), (-1,-1), 'CENTER'),
        ('LINEBELOW', (0,0), (-1,-1), 0.3, C_RULE),
        ('SPAN', (1,0), (2,0)),
        ('SPAN', (3,0), (4,0)),
        ('SPAN', (5,0), (6,0)),
        ('LINEBELOW', (0,1), (-1,1), 1, C_TEAL),
        ('TOPPADDING', (0,2), (-1,-1), 6),
        ('BOTTOMPADDING', (0,2), (-1,-1), 6),
    ]
    for i in range(2, len(data)):
        if i % 2 == 0:
            style.append(('BACKGROUND', (0,i), (-1,i), C_ROW_ALT))
    t.setStyle(TableStyle(style))
    return t

# ── Calgary nurse callout ─────────────────────────────────────────────────────
def build_cal_callout(content_w):
    text = (
        '<b><font color="#0D9488">Registered Nurse — Calgary vs. Vancouver</font></b><br/>'
        'Calgary reduces HPI Years from <b><font color="#C2410C">13.1</font></b> to '
        '<b><font color="#0D9488">6.9</font></b> and RPI Gross from '
        '<b><font color="#C2410C">40.1%</font></b> to '
        '<b><font color="#0D9488">24.6%</font></b> — moving from '
        '<b><font color="#C2410C">L4 Difficult</font></b> to '
        '<b><font color="#059669">L2 Manageable</font></b>.'
    )
    t = Table([[Paragraph(text, ST['callout_b'])]], colWidths=[content_w])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), C_TEAL_BOX),
        ('BOX', (0,0), (-1,-1), 0.5, C_TEAL),
        ('ROUNDEDCORNERS', [5]),
        ('TOPPADDING', (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
        ('LEFTPADDING', (0,0), (-1,-1), 14),
        ('RIGHTPADDING', (0,0), (-1,-1), 14),
    ]))
    return t

# ── Who faces lower/higher pressure (stacked vertically) ─────────────────────
WHO_GREEN = [
    'High-income professionals — physicians, senior lawyers, executives',
    'Dual-income households with combined income above $180K',
    'Remote workers earning USD or premium CAD tech salaries',
    'Long-term homeowners with substantial accumulated equity',
]
WHO_RED = [
    'Single-income households earning below $130K',
    'Newcomers starting from zero without existing capital',
    'Public sector workers — nurses, teachers, social workers',
    'Tradespeople and skilled workers outside high-demand tech sectors',
]

def build_who_box(items, color, bg, title, content_w):
    ps_title = ParagraphStyle('wt', fontName='Helvetica-Bold', fontSize=9,
                               leading=12, textColor=color, spaceAfter=5)
    ps_item  = ParagraphStyle('wi', fontName='Helvetica', fontSize=8.5,
                               leading=12, textColor=C_MID, spaceAfter=3)
    rows = [[Paragraph(title, ps_title)]]
    for item in items:
        rows.append([Paragraph(f'·  {item}', ps_item)])
    inner = Table(rows, colWidths=[content_w - 28])
    inner.setStyle(TableStyle([
        ('TOPPADDING', (0,0), (-1,-1), 1),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
    ]))
    outer = Table([[inner]], colWidths=[content_w])
    outer.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), bg),
        ('BOX', (0,0), (-1,-1), 0.5, color),
        ('ROUNDEDCORNERS', [5]),
        ('TOPPADDING', (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
        ('LEFTPADDING', (0,0), (-1,-1), 14),
        ('RIGHTPADDING', (0,0), (-1,-1), 14),
    ]))
    return outer

# ── Rating methodology note ───────────────────────────────────────────────────
def build_rating_note(content_w):
    text = (
        '<b>Lakive Rating</b> is determined by the worse of HPI Years and RPI Gross. '
        'Gross-income rent pressure is used for rating because it provides a standardized, '
        'comparable basis across occupations and jurisdictions. <b>Est. After-Tax</b> and '
        '<b>Est. RPI Net</b> are supplementary cash-flow indicators and do not affect the rating.'
    )
    t = Table([[Paragraph(text, ST['method_note'])]], colWidths=[content_w])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), C_BLUE_LT),
        ('BOX', (0,0), (-1,-1), 0.3, colors.HexColor('#BFDBFE')),
        ('ROUNDEDCORNERS', [4]),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
        ('RIGHTPADDING', (0,0), (-1,-1), 12),
    ]))
    return t

# ── Main build ────────────────────────────────────────────────────────────────
def build_pdf(output_path):
    L_MARGIN = R_MARGIN = 0.85*inch
    T_MARGIN = 0.85*inch
    B_MARGIN = 0.65*inch

    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=L_MARGIN, rightMargin=R_MARGIN,
        topMargin=T_MARGIN, bottomMargin=B_MARGIN,
        title='Lakive Issue Brief — Vancouver Livability & Worker Affordability, H1 2026',
        author='Lakive',
        subject='Worker affordability analysis for 12 occupations in Metro Vancouver',
    )
    W, H = letter
    content_w = W - L_MARGIN - R_MARGIN
    story = []

    # ── Page 1: Cover + Key Findings + Stats ──────────────────────────────────
    story += build_cover(content_w)
    story.append(Spacer(1, 16))

    story.append(Paragraph(
        '<font color="#D97706"><b>KEY FINDINGS</b></font>',
        ParagraphStyle('kf', fontName='Helvetica-Bold', fontSize=8,
                       leading=10, letterSpacing=1.5, spaceAfter=6)))
    story.append(build_findings(content_w))
    story.append(Spacer(1, 14))
    story.append(build_stats(content_w))
    story.append(Spacer(1, 20))

    # ── Section 1: EIU ────────────────────────────────────────────────────────
    story.append(HLine(content_w))
    story.append(Paragraph('What the EIU ranking actually measures', ST['h2']))
    story.append(Paragraph(
        'The EIU Global Liveability Index scores 173 cities across stability, healthcare, '
        'culture, education, and infrastructure. Vancouver\'s top-10 ranking reflects strong '
        'overall performance across these categories. Its political institutions are stable, '
        'its healthcare is universal, and its natural setting — mountains, ocean, Stanley Park '
        '— is genuinely exceptional.',
        ST['body']))
    story.append(Paragraph(
        'What the EIU does not measure: whether a nurse earning $92,703 can afford a '
        'two-bedroom unit without spending the majority of her take-home income on rent. '
        'Whether a teacher on $86,444 can realistically save for a down payment within a '
        'decade. These describe the financial reality of most of Vancouver\'s working population.',
        ST['body']))

    # ── Section 2: Occupation table ───────────────────────────────────────────
    story.append(HLine(content_w))
    story.append(Paragraph('Vancouver affordability by occupation', ST['h2']))
    story.append(Paragraph(
        'Salaries from Government of Canada Job Bank, Lower Mainland–Southwest Region '
        '(2023–2024). After-tax income estimated for a T4 salaried employee under 2026 '
        'Federal and BC tax rules. Reference 2BR Asking Rent: $3,100/month — representing '
        'new-tenant market rates, not CMHC occupied-unit averages. ~ denotes indicative estimate.',
        ST['caption']))

    # Keep all 12 rows together on one page
    story.append(KeepTogether([build_occ_table(content_w)]))
    story.append(Spacer(1, 8))
    story.append(build_legend(content_w))
    story.append(Spacer(1, 6))
    story.append(build_rating_note(content_w))
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        '<super>1</super> Family Physician: BC provincial median (CIHI/CMA, 2023–2024). No Lower '
        'Mainland regional breakdown from Job Bank. Represents gross clinical income. '
        '~ After-tax is indicative only — physicians may operate through professional corporations, '
        'incur practice overhead, or use payment structures that differ from standard T4 employment.  '
        '<super>2</super> Dentist: 2021 Census data; after-tax also indicative only.',
        ST['note']))
    story.append(Spacer(1, 18))

    # ── Section 3: Affordability gap ─────────────────────────────────────────
    story.append(HLine(content_w))
    story.append(Paragraph(
        'The ownership threshold: how Vancouver stacks up by occupation', ST['h2']))
    story.append(Paragraph(
        'Reaching below 10 HPI Years — the range where homeownership becomes a realistic '
        'medium-term goal — requires earning roughly $120,000 or more in Vancouver.',
        ST['body']))
    story.append(Paragraph(
        'Among occupations with verified Lower Mainland Job Bank salaries, only '
        '<b>Lawyers ($129,968)</b> meet this threshold at <b>9.3 HPI Years</b>. '
        'Family Physicians also fall below 10 years at <b>7.5 HPI Years</b>, but their '
        'figure is based on a BC-wide clinical income estimate, not a regional Job Bank salary. '
        'Software Developers sit just outside the threshold at <b>11.9 years</b>.',
        ST['body']))
    story.append(Paragraph(
        'Six occupations — Pharmacist, Civil Engineer, Registered Nurse, Data Analyst, '
        'Secondary Teacher, and Dentist — land in <b>L4 Difficult</b> at HPI 12–16 years. '
        'Their salaries range from $78K to $97.5K. In most Canadian cities, these represent '
        'comfortable, ownership-accessible incomes.',
        ST['body']))

    story.append(build_pullquote(
        'A registered nurse earning $92,703 per year in Vancouver faces a composite '
        'benchmark HPI of 13.1 years and an estimated after-tax rent burden of 53.3% — '
        'more than half of take-home pay for a two-bedroom unit. If 20% of the income '
        'remaining after rent were saved toward a down payment, building a 20% deposit '
        'on a benchmark-priced home would take several decades. This simplified static '
        'estimate excludes home-price growth, investment returns, and income growth.',
        content_w))
    story.append(Spacer(1, 10))
    story.append(Paragraph(
        'For Social Workers, Electricians, and Retail Associates, estimated after-tax rent '
        'burden exceeds <b>67%</b> — leaving very little for food, transport, and savings, '
        'let alone wealth accumulation.',
        ST['body']))

    # ── Section 4: Calgary ────────────────────────────────────────────────────
    story.append(HLine(content_w))
    story.append(Paragraph(
        'The Calgary alternative: same country, different math', ST['h2']))
    story.append(Paragraph(
        'Calgary operates within the same national immigration, banking, and labour-market '
        'framework as Vancouver — but the housing and cost numbers are materially different. '
        'Calgary\'s composite benchmark HPI stands at 8.5 years. Reference 2BR asking rent '
        'is approximately $1,900/month versus $3,100 in Metro Vancouver.',
        ST['body']))
    story.append(Paragraph(
        'Alberta also offers lower provincial income tax rates (10–15% versus BC\'s '
        '5.6–20.5%) and no provincial sales tax (BC charges 7% PST). Alberta does have '
        'provincial income tax — the advantage is lower rates and no PST, not the absence '
        'of provincial tax altogether.',
        ST['body']))

    story.append(build_cal_table(content_w))
    story.append(Spacer(1, 10))
    story.append(build_cal_callout(content_w))
    story.append(Spacer(1, 10))
    story.append(Paragraph(
        'The gap is consistent across occupations. Calgary rates one to two levels better '
        'for every occupation in this comparison, with five of the six improving by two '
        'levels. For workers in trades, public services, and mid-income professions, '
        'financial progress is significantly more difficult to achieve in Vancouver at '
        'current income and housing-cost levels.',
        ST['body']))

    # ── Section 5: Who faces lower/higher pressure ────────────────────────────
    story.append(HLine(content_w))
    story.append(Paragraph(
        'Who faces lower — and higher — financial pressure in Vancouver', ST['h2']))
    story.append(Paragraph(
        'This analysis is not a case against Vancouver. It is a case for honesty about '
        'who faces lower financial pressure here, and who faces structural headwinds.',
        ST['body']))

    story.append(build_who_box(WHO_GREEN, C_GREEN, C_GREEN_LT,
                               '✓  Lower financial pressure', content_w))
    story.append(Spacer(1, 8))
    story.append(build_who_box(WHO_RED, C_RED, C_RED_LITE,
                               '✗  Higher financial pressure', content_w))
    story.append(Spacer(1, 10))
    story.append(Paragraph(
        'This distinction matters most for newcomers, who enter the market with no existing '
        'equity, limited Canadian credit history, and often a credential recognition gap '
        'that temporarily suppresses income. Spending 50–70% of take-home income on rent '
        'in the early years leaves virtually no capital to build toward stability.',
        ST['body']))

    # ── Section 6: Outlook ────────────────────────────────────────────────────
    story.append(HLine(content_w))
    story.append(Paragraph('Outlook', ST['h2']))
    story.append(Paragraph(
        'Vancouver\'s affordability challenge is structural, not cyclical. Supply is '
        'constrained by geography, historically restrictive zoning, lengthy housing-delivery '
        'timelines, and sustained demand. Interest rate movements can shift monthly carrying '
        'costs but do not change the underlying price-to-income gap.',
        ST['body']))
    story.append(Paragraph(
        'For workers and newcomers making location decisions in 2026, Vancouver\'s global '
        'livability ranking is one data point among many. It captures real quality-of-life '
        'advantages. It does not capture whether those advantages are financially accessible '
        'to many of the workers who sustain the city.',
        ST['body']))

    # ── Data Sources (force to new page so Outlook ends page 4 cleanly) ──────
    story.append(PageBreak())
    story.append(Paragraph('Methodology & Data Sources', ST['h3']))
    story.append(Paragraph(
        'Occupation salaries: Government of Canada Job Bank, Lower Mainland–Southwest '
        'Region (region 39070), reference period 2023–2024 (Labour Force Survey / '
        'Statistics Canada; Small Area Estimation model for Civil Engineer and Electrician). '
        'Family Physician: CIHI / Canadian Medical Association, BC provincial, 2023–2024. '
        'Dentist: 2021 Census. Annual salary = median hourly wage × 1,950 hours where applicable.',
        ST['meth']))
    story.append(Paragraph(
        'Reference 2BR Asking Rent: $3,100/month Metro Vancouver; $1,900/month Calgary. '
        'Both figures represent estimated new-tenant market asking rates (Rentals.ca / Zumper '
        'aggregate data, H1 2026) — not the average rent paid across all occupied units. '
        'CMHC occupied-unit averages are lower because they include existing tenancies and '
        'older leases, while asking-rent data reflects the prices currently faced by new tenants. '
        'CMHC Rental Market Report 2025 records these averages at approximately '
        '$1,970 (Metro Vancouver) and $1,775 (Calgary).',
        ST['meth']))
    story.append(Paragraph(
        'Metro Vancouver composite benchmark home price: approximately $1,215,000 '
        '(REBGV, H1 2026). Calgary composite benchmark: approximately $637,500 '
        '(CREA, H1 2026). After-tax income estimated using 2026 Federal and provincial '
        'tax parameters (T4 salaried employee model). CPP includes 2026 second additional '
        'contribution (CPP2: YAMPE $85,000, rate 4%, max $416).',
        ST['meth']))
    story.append(Paragraph(
        'EIU Global Liveability Index 2026: Vancouver ranked #9 globally out of 173 cities '
        '(Economist Intelligence Unit press release, July 7, 2026). Lakive is not affiliated '
        'with the EIU or The Economist Group.',
        ST['meth']))

    doc.build(story, onFirstPage=on_first_page, onLaterPages=on_later_pages)
    print(f'PDF saved to: {output_path}')


if __name__ == '__main__':
    out = (sys.argv[1] if len(sys.argv) > 1
           else '/sessions/adoring-quirky-fermi/mnt/citycity/public/reports/pdf/Lakive_Vancouver_Worker_Affordability_Issue_Brief_H1_2026.pdf')
    build_pdf(out)
