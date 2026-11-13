<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Sesión Expirada (419) - Carrera de Psicología</title>
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=instrument-sans:400,600,700,800" rel="stylesheet" />
    <style>
        :root {
            --bg: #030712;
            --card-bg: rgba(15, 23, 42, 0.75);
            --border: rgba(255, 255, 255, 0.12);
            --text-main: #f8fafc;
            --text-muted: #94a3b8;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
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
        }
        .card {
            max-width: 540px;
            width: 100%;
            background: var(--card-bg);
            backdrop-filter: blur(20px);
            border: 1px solid var(--border);
            border-radius: 1.75rem;
            padding: 2.5rem 2rem;
            text-align: center;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
        }
        .code {
            font-size: 3.5rem;
            font-weight: 900;
            line-height: 1;
            margin-bottom: 0.5rem;
            background: linear-gradient(135deg, #f59e0b, #06b6d4);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        h1 { font-size: 1.5rem; font-weight: 800; margin-bottom: 0.75rem; color: #f8fafc; }
        p { font-size: 0.95rem; color: var(--text-muted); line-height: 1.6; margin-bottom: 2rem; }
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
            text-decoration: none;
            background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%);
            color: #ffffff;
            border: none;
            width: 100%;
            box-shadow: 0 10px 20px -5px rgba(79, 70, 229, 0.4);
        }
    </style>
</head>
<body>
    <div class="card">
        <div class="code">419</div>
        <h1>Sesión de Seguridad Caducada</h1>
        <p>Por motivos de protección y seguridad de datos, tu sesión ha expirado tras un período de inactividad. Por favor, recarga la página para continuar.</p>
        <button type="button" class="btn" onclick="window.location.reload();">Actualizar Página</button>
    </div>
</body>
</html>

