<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Error de Conexión - Carrera de Psicología</title>
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=instrument-sans:400,600,700,800" rel="stylesheet" />
    <style>
        :root {
            --primary: #4f46e5;
            --secondary: #06b6d4;
            --bg: #030712;
            --card-bg: rgba(15, 23, 42, 0.75);
            --border: rgba(255, 255, 255, 0.12);
            --text-main: #f8fafc;
            --text-muted: #94a3b8;
        }
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        body {
            font-family: 'Instrument Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background-color: var(--bg);
            color: var(--text-main);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1.5rem;
            position: relative;
            overflow-x: hidden;
        }
        .ambient-glow {
            position: absolute;
            width: 450px;
            height: 450px;
            border-radius: 50%;
            filter: blur(120px);
            opacity: 0.35;
            pointer-events: none;
            z-index: 0;
        }
        .glow-1 {
            top: -100px;
            right: -100px;
            background: radial-gradient(circle, #f43f5e 0%, transparent 70%);
        }
        .glow-2 {
            bottom: -100px;
            left: -100px;
            background: radial-gradient(circle, #f59e0b 0%, transparent 70%);
        }
        .card {
            position: relative;
            z-index: 10;
            max-width: 580px;
            width: 100%;
            background: var(--card-bg);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid var(--border);
            border-radius: 1.75rem;
            padding: 2.5rem 2rem;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(244, 63, 94, 0.15);
            text-align: center;
        }
        .icon-wrap {
            width: 80px;
            height: 80px;
            margin: 0 auto 1.5rem;
            border-radius: 1.5rem;
            background: linear-gradient(135deg, rgba(244, 63, 94, 0.2), rgba(245, 158, 11, 0.2));
            border: 1px solid rgba(244, 63, 94, 0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 10px 25px -5px rgba(244, 63, 94, 0.3);
            animation: pulse-glow 3s infinite alternate;
        }
        @keyframes pulse-glow {
            0% { transform: scale(1); box-shadow: 0 10px 25px -5px rgba(244, 63, 94, 0.3); }
            100% { transform: scale(1.04); box-shadow: 0 15px 35px -5px rgba(245, 158, 11, 0.45); }
        }
        .badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.35rem 0.85rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 700;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            background: rgba(244, 63, 94, 0.15);
            color: #fb7185;
            border: 1px solid rgba(244, 63, 94, 0.3);
            margin-bottom: 1.25rem;
        }
        .badge-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background-color: #f43f5e;
            box-shadow: 0 0 8px #f43f5e;
        }
        h1 {
            font-size: 1.75rem;
            font-weight: 800;
            line-height: 1.25;
            margin-bottom: 0.75rem;
            background: linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        p.subtitle {
            font-size: 0.95rem;
            line-height: 1.6;
            color: var(--text-muted);
            margin-bottom: 1.75rem;
        }
        .info-box {
            background: rgba(0, 0, 0, 0.35);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 1rem;
            padding: 1.1rem;
            text-align: left;
            margin-bottom: 1.75rem;
            font-size: 0.85rem;
        }
        .info-title {
            font-weight: 700;
            color: #e2e8f0;
            margin-bottom: 0.4rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .info-text {
            color: #94a3b8;
            line-height: 1.5;
        }
        .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            padding: 0.75rem 1.75rem;
            border-radius: 0.85rem;
            font-size: 0.9rem;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s ease;
            text-decoration: none;
            border: none;
            width: 100%;
        }
        .btn-primary {
            background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%);
            color: #ffffff;
            box-shadow: 0 10px 20px -5px rgba(79, 70, 229, 0.4);
        }
        .btn-primary:hover {
            opacity: 0.92;
            transform: translateY(-2px);
            box-shadow: 0 15px 25px -5px rgba(79, 70, 229, 0.55);
        }
        .btn-primary:active {
            transform: translateY(0);
        }
        .footer-note {
            margin-top: 1.5rem;
            font-size: 0.75rem;
            color: #64748b;
        }
    </style>
</head>
<body>
    <div class="ambient-glow glow-1"></div>
    <div class="ambient-glow glow-2"></div>

    <div class="card">
        <div class="icon-wrap">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                <path d="M3 5V19A9 3 0 0 0 21 19V5"></path>
                <path d="M3 12A9 3 0 0 0 21 12"></path>
                <line x1="12" y1="12" x2="12" y2="16"></line>
                <circle cx="12" cy="18" r="0.5" fill="#f43f5e"></circle>
            </svg>
        </div>

        <div class="badge">
            <span class="badge-dot"></span>
            <span>Alerta del Sistema</span>
        </div>

        <h1>{{ $titulo ?? 'Error de Conexión a la Base de Datos' }}</h1>

        <p class="subtitle">
            {{ $detalle ?? 'No se pudo establecer comunicación con el servidor de base de datos. Por favor, asegúrate de que el servicio MySQL o MariaDB esté activo y en ejecución.' }}
        </p>

        <div class="info-box">
            <div class="info-title">
                <span>💡</span>
                <span>¿Qué puedes hacer?</span>
            </div>
            <div class="info-text">
                • Si eres administrador: verifica que el servicio de base de datos (MySQL/MariaDB/Sail) esté iniciado en el servidor.<br>
                • Si eres usuario: espera unos segundos y pulsa el botón de abajo para reintentar la conexión automáticamente.
            </div>
        </div>

        <button type="button" class="btn btn-primary" onclick="window.location.reload();">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                <path d="M3 3v5h5"></path>
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path>
                <path d="M16 16h5v5"></path>
            </svg>
            <span>Reintentar Conexión</span>
        </button>

        <p class="footer-note">
            Carrera de Psicología · Universidad Pública de El Alto
        </p>
    </div>
</body>
</html>

