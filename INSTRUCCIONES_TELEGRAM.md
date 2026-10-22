# 📱 Guía para Configurar Notificaciones por Telegram en Dominio Público

Esta guía detalla los pasos para activar el Bot de Notificaciones de Telegram en el sistema una vez que tu proyecto esté desplegado en un servidor o dominio público con **HTTPS**.

---

## 1. Requisitos Previos

1. **Dominio Público con HTTPS**:
   - Telegram exige obligatoriamente certificado SSL (`https://`).
   - Ejemplo de dominio: `https://psicologia.upea.bo` o `https://mi-dominio.com`.
2. **Bot de Telegram Creado**:
   - Debes tener el **Token** proporcionado por [@BotFather](https://t.me/BotFather).

---

## 2. Configuración en el Archivo `.env`

Abre el archivo `.env` en tu servidor y configura las siguientes variables:

```env
# 1. Tu URL pública con HTTPS (sin barra al final)
APP_URL=https://tu-dominio.com

# 2. La palanca de Telegram (ponla en true para activarlo, o false para apagarlo)
TELEGRAM_ENABLED=true

# 3. El token de tu bot obtenido en @BotFather
TELEGRAM_BOT_TOKEN="8674361430:AAEFMO0OpnDhFyikEcjUUYcYpMJiINPrlXE"
```

> **Nota sobre la palanca (`TELEGRAM_ENABLED`):**
> - Si está en `false`, el sistema **NO** intentará conectarse a Telegram y funcionará normalmente sin ningún mensaje de error.
> - Cuando esté en `true`, se enviarán las notificaciones en segundo plano y se activará el webhook.

---

## 3. Registrar el Webhook en Telegram

Una vez configurado el `.env`, ejecuta el siguiente comando en la terminal de tu servidor:

```bash
php artisan telegram:set-webhook
```

El comando registrará automáticamente la URL `https://tu-dominio.com/telegram/webhook` en los servidores de Telegram.

Si todo es correcto, verás:
```
✅ ¡Webhook configurado exitosamente en Telegram!
Respuesta de Telegram: Webhook was set
```

*(Opcional: Si quieres registrar una URL manual, puedes pasarla como parámetro: `php artisan telegram:set-webhook https://mi-dominio.com/telegram/webhook`)*.

---

## 4. Secuencia para que un Estudiante o Docente se Vincule

Para que un usuario registrado reciba sus notas y avisos en Telegram:

1. **Abrir el Bot**: El usuario abre Telegram en su celular y busca al bot por su nombre de usuario (ejemplo: `@MiBotPsicologia`).
2. **Iniciar**: Pulsa el botón **Iniciar** o escribe `/start`.
3. **Ingresar CI**: El bot le responderá:
   > *"¡Hola! 👋 Soy el bot de notificaciones. Para vincularte, envíame tu CI."*
   El usuario escribe su número de Cédula de Identidad (ejemplo: `8492019`).
4. **Confirmar Teléfono**: El bot lo busca en la base de datos y le muestra un botón interactivo:
   > `📱 Compartir mi número`
   El usuario presiona el botón. Telegram enviará su número verificado.
5. **Listo**: Si el número coincide con el celular que tiene registrado en su cuenta, el bot responderá:
   > *"🎉 ¡Vinculación exitosa! A partir de ahora recibirás tus notificaciones aquí."*
   Y le enviará de inmediato cualquier notificación pendiente que tuviera en espera.

---

## 5. Probar Localmente antes de tener Dominio (Opcional)

Si deseas probar el bot en tu computadora (`localhost`) antes de subir a un dominio, puedes usar **ngrok**:

1. Descarga e inicia ngrok:
   ```bash
   ngrok http 8000
   ```
2. ngrok te dará una URL pública temporal (ej: `https://abcd-1234.ngrok-free.app`).
3. En tu `.env` pon:
   ```env
   APP_URL=https://abcd-1234.ngrok-free.app
   TELEGRAM_ENABLED=true
   ```
4. Ejecuta:
   ```bash
   php artisan telegram:set-webhook
   ```
5. ¡Prueba chatear con tu bot desde Telegram!
