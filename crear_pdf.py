from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import cm

doc = SimpleDocTemplate('GUIA_INICIO_SESION.pdf', pagesize=A4,
    rightMargin=2*cm, leftMargin=2*cm, topMargin=2*cm, bottomMargin=2*cm)

styles = getSampleStyleSheet()
story = []

title_style = ParagraphStyle('title', parent=styles['Title'], fontSize=22, textColor=colors.HexColor('#6C63FF'), spaceAfter=6)
h1_style = ParagraphStyle('h1', parent=styles['Heading1'], fontSize=14, textColor=colors.HexColor('#6C63FF'), spaceBefore=16, spaceAfter=6)
h2_style = ParagraphStyle('h2', parent=styles['Heading2'], fontSize=11, textColor=colors.HexColor('#333333'), spaceBefore=10, spaceAfter=4)
body_style = ParagraphStyle('body', parent=styles['Normal'], fontSize=10, spaceAfter=4, leading=14)
code_style = ParagraphStyle('code', parent=styles['Normal'], fontSize=9, fontName='Courier', backColor=colors.HexColor('#f0f0f0'), leftIndent=12, spaceAfter=6, leading=13)
warn_style = ParagraphStyle('warn', parent=styles['Normal'], fontSize=10, textColor=colors.HexColor('#FF6B00'), spaceAfter=4)

story.append(Paragraph('PrivateSnap', title_style))
story.append(Paragraph('Guia de inicio de sesion de desarrollo', styles['Heading2']))
story.append(Spacer(1, 0.3*cm))
story.append(Paragraph('Sigue estos pasos ANTES de decirle a Claude que continuemos.', warn_style))
story.append(Spacer(1, 0.4*cm))

# PASO 1
story.append(Paragraph('PASO 1 - Abre estas paginas web en el navegador', h1_style))

urls = [
    ['Que abrir', 'URL', 'Para que sirve'],
    ['Railway (backend)', 'https://railway.app', 'Servidor de la app'],
    ['GitHub app', 'https://github.com/alfonsoalhama-ui/privatesnap-app', 'Codigo de la app'],
    ['GitHub backend', 'https://github.com/alfonsoalhama-ui/privatesnap-backend', 'Codigo del servidor'],
    ['Expo builds', 'https://expo.dev/accounts/alhama/projects/privatesnap/builds', 'Para crear APK nuevos'],
]

t = Table(urls, colWidths=[4*cm, 8.5*cm, 4.5*cm])
t.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#6C63FF')),
    ('TEXTCOLOR', (0,0), (-1,0), colors.white),
    ('FONTSIZE', (0,0), (-1,0), 9),
    ('FONTSIZE', (0,1), (-1,-1), 8),
    ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
    ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
    ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f8f8ff')]),
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ('TOPPADDING', (0,0), (-1,-1), 5),
    ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ('WORDWRAP', (0,0), (-1,-1), True),
]))
story.append(t)
story.append(Spacer(1, 0.3*cm))
story.append(Paragraph('En Railway: verifica que el servicio sunny-stillness esta Online (punto verde).', warn_style))

# PASO 2
story.append(Paragraph('PASO 2 - Abre dos PowerShell', h1_style))
story.append(Paragraph('PowerShell 1 - Para la APP:', h2_style))
story.append(Paragraph('Abre el Explorador de archivos y ve a:', body_style))
ruta1 = r'C:\Users\alfon\Documents\Claude\Projects\app\PrivateSnap'
story.append(Paragraph(ruta1, code_style))
story.append(Paragraph('Haz clic en la barra de direcciones, escribe: powershell y pulsa Enter.', body_style))

story.append(Paragraph('PowerShell 2 - Para el BACKEND (si necesitas hacer cambios):', h2_style))
ruta2 = r'C:\Users\alfon\Documents\Claude\Projects\app\PrivateSnap-backend'
story.append(Paragraph(ruta2, code_style))

# PASO 3
story.append(Paragraph('PASO 3 - Comandos utiles', h1_style))

story.append(Paragraph('Arrancar la app en Expo (pruebas rapidas):', h2_style))
story.append(Paragraph('npx expo start --lan', code_style))

story.append(Paragraph('Crear un nuevo APK (tras cambios con codigo nativo):', h2_style))
story.append(Paragraph('eas build --platform android --profile preview', code_style))

story.append(Paragraph('Subir cambios al BACKEND a Railway:', h2_style))
story.append(Paragraph('git add .', code_style))
story.append(Paragraph('git commit -m "descripcion del cambio"', code_style))
story.append(Paragraph('git push', code_style))
story.append(Paragraph('Railway despliega automaticamente. Espera 2-3 minutos.', warn_style))

story.append(Paragraph('Subir cambios de la APP a GitHub:', h2_style))
story.append(Paragraph('git add .', code_style))
story.append(Paragraph('git commit -m "descripcion del cambio"', code_style))
story.append(Paragraph('git push', code_style))

# PASO 4
story.append(Paragraph('PASO 4 - Dispositivos de prueba', h1_style))
data2 = [
    ['Dispositivo', 'Usuario', 'Estado'],
    ['Google Pixel 10 Pro XL', 'lobo', 'APK instalado'],
    ['Tablet Huawei', 'cabra', 'APK instalado'],
]
t2 = Table(data2, colWidths=[6*cm, 4*cm, 5*cm])
t2.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#6C63FF')),
    ('TEXTCOLOR', (0,0), (-1,0), colors.white),
    ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
    ('FONTSIZE', (0,0), (-1,-1), 9),
    ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
    ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f8f8ff')]),
    ('TOPPADDING', (0,0), (-1,-1), 5),
    ('BOTTOMPADDING', (0,0), (-1,-1), 5),
]))
story.append(t2)

# PASO 5
story.append(Paragraph('PASO 5 - Estado actual', h1_style))

features = [
    'Registro y login con username + contrasena (sin email)',
    'Chat en tiempo real entre dispositivos',
    'Estado online/offline en tiempo real',
    'Envio de fotos - FUNCIONA (Nivel 1)',
    'Envio de videos - FUNCIONA (requiere ambos conectados)',
    'Auto-destruccion: una vez / 1h / 24h / 7 dias - FUNCIONA',
    'APK instalado en ambos dispositivos sin Expo Go',
]
pendiente = [
    'Notificaciones push (PROXIMO PASO)',
    'Nivel 2 - Streaming P2P desde el emisor (WebRTC)',
    'Nivel 3 - Camara frontal del receptor',
    'Cifrado E2E real (AES-256)',
    'Publicar en Play Store',
]

story.append(Paragraph('Completado:', h2_style))
for f in features:
    story.append(Paragraph('  - ' + f, body_style))

story.append(Spacer(1, 0.3*cm))
story.append(Paragraph('Pendiente - Proximo: notificaciones push:', h2_style))
for p in pendiente:
    story.append(Paragraph('  - ' + p, body_style))

# Nota contexto
story.append(Spacer(1, 0.5*cm))
story.append(Paragraph('NOTA - Sobre la memoria de Claude', h1_style))
story.append(Paragraph(
    'Cuando la ventana de contexto se llene o empieces una nueva sesion, '
    'Claude no recordara esta conversacion. Para continuar, abre una sesion nueva y escribe: '
    '"continuamos con PrivateSnap". Claude leera el archivo ESTADO_PROYECTO.md '
    'de la carpeta del proyecto y sabra exactamente donde estamos.',
    warn_style))

doc.build(story)
print('PDF creado correctamente: GUIA_INICIO_SESION.pdf')
