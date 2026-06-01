# Estado del proyecto PrivateSnap
*Última actualización: Junio 2026*

---

## ¿Qué es esta app?
App de intercambio de fotos y vídeos íntimos para la comunidad liberal/swinger.
Anónima, segura, efímera. Sin email, sin teléfono — solo username y contraseña.

---

## Tecnología
- **Frontend**: React Native con Expo SDK 54 — carpeta `PrivateSnap`
- **Backend**: Node.js + Express + Socket.io + PostgreSQL — carpeta `PrivateSnap-backend`
- **Base de datos**: PostgreSQL en Railway (activa)
- **Hosting backend**: Railway (activo — sunny-stillness-production-dc44.up.railway.app)
- **App instalada**: APK real en Pixel (lobo) y tablet Huawei (cabra)

---

## Lo que está hecho ✅

### App
- Registro y login con username + contraseña contra servidor real
- Lista de conversaciones persistente (se guarda al cerrar la app)
- Añadir contacto por username → abre chat directamente
- Chat en tiempo real entre dispositivos (Socket.io)
- Estado online/offline en tiempo real
- Envío de fotos y vídeos con cifrado (Nivel 1 funcionando)
- Visualización segura con auto-destrucción (Once / 1h / 24h / 7d)
- 3 niveles de seguridad seleccionables en el envío
- Iconos Lucide en toda la app (sin emojis)
- Safe area correcta en todos los dispositivos
- Todo en inglés
- APK instalado directamente (sin Expo Go)

### Backend (Railway)
- Autenticación: registro, login, búsqueda de usuario
- Conversaciones: listar, crear, mensajes
- Media cifrada: subida y descarga con auto-destrucción
- Socket.io para mensajería y presencia en tiempo real
- Base de datos PostgreSQL con tablas: users, conversations, messages, media

---

## Los 3 niveles de seguridad
1. 🔒 **Standard** — foto/vídeo cifrado en servidor, auto-destrucción ✅ FUNCIONA
2. 🔒🔒 **Private** — streaming desde el móvil del emisor (pendiente WebRTC)
3. 🔒🔒🔒 **Max security** — igual que Private + cámara frontal del receptor (pendiente)

---

## Pendiente ❌ — Por orden de prioridad

### Próximo paso
1. **Notificaciones push** — que lleguen mensajes aunque la app esté cerrada
2. **Nivel 2 — WebRTC** — streaming P2P desde el móvil del emisor
3. **Nivel 3** — cámara frontal del receptor en tiempo real
4. **Cifrado real E2E** — AES-256 en el móvil antes de subir (ahora mismo el archivo sube sin cifrar realmente)
5. **Frase de recuperación** — alternativa a recuperar contraseña sin email
6. **Publicar en Play Store** — cuando esté lista

---

## Credenciales y URLs importantes
- **Railway**: https://railway.app — proyecto "serene-mercy"
- **Backend URL**: https://sunny-stillness-production-dc44.up.railway.app
- **Base de datos Railway** (pública): postgresql://postgres:TBnjkWFiMTtQDtiuzmuNMWNWkvCkvHko@switchyard.proxy.rlwy.net:40625/railway
- **GitHub app**: https://github.com/alfonsoalhama-ui/privatesnap-app
- **GitHub backend**: https://github.com/alfonsoalhama-ui/privatesnap-backend
- **Expo**: https://expo.dev — cuenta alhama
- **Último APK**: https://expo.dev/accounts/alhama/projects/privatesnap/builds/ (ver el más reciente)

---

## Usuarios de prueba
- **lobo** — Pixel (móvil)
- **cabra** — Tablet Huawei

---

## Cómo arrancar para continuar el desarrollo

### 1. Arrancar la app (solo si usas Expo Go para pruebas rápidas)
```
cd "C:\Users\alfon\Documents\Claude\Projects\app\PrivateSnap"
npx expo start --lan
```

### 2. Hacer un nuevo build (APK real)
```
cd "C:\Users\alfon\Documents\Claude\Projects\app\PrivateSnap"
eas build --platform android --profile preview
```

### 3. Subir cambios al backend
```
cd "C:\Users\alfon\Documents\Claude\Projects\app\PrivateSnap-backend"
git add .
git commit -m "descripción del cambio"
git push
```
Railway despliega automáticamente tras el push.

### 4. Guardar cambios de la app en GitHub
```
cd "C:\Users\alfon\Documents\Claude\Projects\app\PrivateSnap"
git add .
git commit -m "descripción del cambio"
git push
```

---

## Notas técnicas importantes
- Usar siempre `--legacy-peer-deps` al instalar paquetes en el frontend
- `expo-file-system` debe importarse desde `expo-file-system/legacy`
- `SafeAreaView` siempre de `react-native-safe-area-context`
- El backend guarda los archivos cifrados en la base de datos (no en disco)
- Railway tiene un plan de prueba con créditos — vigilar que no se agoten
