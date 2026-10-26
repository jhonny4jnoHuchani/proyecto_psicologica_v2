import { Head, router, usePage } from "@inertiajs/react";
import { FormEventHandler, useState } from "react";
import {
  Bot,
  Check,
  Copy,
  ExternalLink,
  Info,
  Key,
  LoaderCircle,
  MessageSquare,
  Send,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

import InputError from "@/components/input-error";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AppLayout from "@/layouts/app-layout";
import SettingsLayout from "@/layouts/settings/layout";
import { type BreadcrumbItem } from "@/types";

interface SettingsData {
  has_token: boolean;
  token_preview: string | null;
  chat_id: string;
  bot_username: string;
  activo: boolean;
  webhook_url: string;
  app_url: string;
}

interface Props {
  settings: SettingsData;
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Configuración", href: "/settings/profile" },
  { title: "Bot de Telegram", href: "" },
];

export default function TelegramSettings({ settings }: Props) {
  const { errors, flash } = usePage().props as {
    errors: Record<string, string>;
    flash?: { success?: string; error?: string };
  };

  const [token, setToken] = useState("");
  const [chatId, setChatId] = useState(settings.chat_id || "");
  const [activo, setActivo] = useState<boolean>(settings.activo);
  const [showToken, setShowToken] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [testProcessing, setTestProcessing] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    setProcessing(true);

    router.post(
      "/settings/telegram",
      {
        telegram_bot_token: token,
        telegram_chat_id: chatId,
        telegram_activo: activo,
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          setProcessing(false);
          setToken("");
        },
        onError: () => setProcessing(false),
      },
    );
  };

  const handleTestMessage = () => {
    setTestProcessing(true);
    router.post(
      "/settings/telegram/test",
      {
        chat_id: chatId,
      },
      {
        preserveScroll: true,
        onFinish: () => setTestProcessing(false),
      },
    );
  };

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(settings.webhook_url);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Configuración de Telegram" />
      <SettingsLayout>
        <div className="space-y-6">
          {/* Alertas Flash de Éxito o Error */}
          {flash?.success && (
            <div className="flex items-start gap-3 rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200">
              <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <div className="text-sm font-medium">{flash.success}</div>
            </div>
          )}

          {flash?.error && (
            <div className="flex items-start gap-3 rounded-lg border border-rose-300 bg-rose-50 p-4 text-rose-900 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-200">
              <ShieldAlert className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
              <div className="text-sm font-medium">{flash.error}</div>
            </div>
          )}

          {/* Tarjeta de Estado Actual */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Bot className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    Estado de la Integración
                  </CardTitle>
                  <CardDescription>
                    Vinculación directa entre el servidor y la API de Telegram
                  </CardDescription>
                </div>
                <div>
                  {settings.activo && settings.has_token ? (
                    <Badge variant="success" className="gap-1.5 py-1 px-3">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      Activo y Vinculado
                    </Badge>
                  ) : !settings.activo ? (
                    <Badge variant="secondary" className="gap-1.5 py-1 px-3">
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      Desactivado
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="gap-1.5 py-1 px-3">
                      <span className="h-2 w-2 rounded-full bg-rose-500" />
                      Sin Configurar
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-0 text-sm">
              {settings.bot_username && (
                <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
                  <span className="font-semibold text-neutral-900 dark:text-white">
                    Bot detectado:
                  </span>
                  <a
                    href={`https://t.me/${settings.bot_username}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    @{settings.bot_username}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              )}

              <div className="flex flex-col gap-1 sm:flex-row sm:items-center text-xs text-neutral-600 dark:text-neutral-400">
                <span className="font-semibold text-neutral-800 dark:text-neutral-300">
                  URL del Webhook:
                </span>
                <div className="flex items-center gap-1 font-mono bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">
                  <span>{settings.webhook_url}</span>
                  <button
                    type="button"
                    onClick={copyWebhookUrl}
                    className="ml-1 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                    title="Copiar URL"
                  >
                    {copiedWebhook ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Formulario de Configuración */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Key className="h-4 w-4" />
                Credenciales del Bot
              </CardTitle>
              <CardDescription>
                Al guardar, el sistema verificará automáticamente el token y
                registrará el Webhook con Telegram.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Palanca de Activación */}
                <div className="flex items-center justify-between rounded-lg border p-4 bg-neutral-50/50 dark:bg-neutral-900/50">
                  <div className="space-y-0.5">
                    <Label
                      htmlFor="telegram_activo"
                      className="font-medium cursor-pointer"
                    >
                      Habilitar notificaciones y comandos de Telegram
                    </Label>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Si se desactiva, los estudiantes y docentes no recibirán
                      mensajes en Telegram.
                    </p>
                  </div>
                  <input
                    id="telegram_activo"
                    type="checkbox"
                    checked={activo}
                    onChange={(e) => setActivo(e.target.checked)}
                    className="h-4 w-4 rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                </div>

                {/* Token del Bot */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="telegram_bot_token">
                      Token del Bot de Telegram
                    </Label>
                    <a
                      href="https://t.me/BotFather"
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-indigo-600 hover:underline dark:text-indigo-400 flex items-center gap-1"
                    >
                      Abrir @BotFather <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <div className="relative">
                    <Input
                      id="telegram_bot_token"
                      type={showToken ? "text" : "password"}
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder={
                        settings.has_token
                          ? "•••••••••••• (Deja en blanco para conservar el token actual)"
                          : "123456789:ABCdefGHIjklMNOpqrsTUVwxyz..."
                      }
                      className="pr-16 font-mono text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowToken(!showToken)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                    >
                      {showToken ? "Ocultar" : "Mostrar"}
                    </button>
                  </div>
                  {settings.has_token && settings.token_preview && !token && (
                    <p className="text-xs text-neutral-500">
                      Token en uso:{" "}
                      <span className="font-mono text-neutral-700 dark:text-neutral-300">
                        {settings.token_preview}
                      </span>
                    </p>
                  )}
                  <InputError message={errors.telegram_bot_token} />
                </div>

                {/* Chat ID del Responsable */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="telegram_chat_id">
                      Chat ID del Responsable / Administrador
                    </Label>
                    <a
                      href="https://t.me/userinfobot"
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-indigo-600 hover:underline dark:text-indigo-400 flex items-center gap-1"
                    >
                      Consultar mi ID con @userinfobot{" "}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <Input
                    id="telegram_chat_id"
                    type="text"
                    value={chatId}
                    onChange={(e) => setChatId(e.target.value)}
                    placeholder="Ej: 123456789 o -1001234567890 (si es grupo o canal)"
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Chat ID numérico del responsable institucional donde se
                    enviarán reportes administrativos y alertas del sistema.
                  </p>
                  <InputError message={errors.telegram_chat_id} />
                </div>

                {/* Botón Guardar */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button
                    type="submit"
                    disabled={processing}
                    className="min-w-40"
                  >
                    {processing ? (
                      <>
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        Validando y Guardando...
                      </>
                    ) : (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Guardar y Vincular
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Tarjeta para Mensaje de Prueba */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Send className="h-4 w-4" />
                Prueba de Conectividad
              </CardTitle>
              <CardDescription>
                Envía un mensaje instantáneo al Chat ID del responsable para
                certificar que el bot tiene permisos de envío.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border p-4 bg-neutral-50/50 dark:bg-neutral-900/50">
                <div className="space-y-1">
                  <div className="text-sm font-medium flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-indigo-600" />
                    Enviar ping de prueba
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Se enviará al Chat ID:{" "}
                    <span className="font-mono font-medium">
                      {chatId || "No asignado"}
                    </span>
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleTestMessage}
                  disabled={testProcessing || !settings.has_token || !chatId}
                  className="shrink-0"
                >
                  {testProcessing ? (
                    <>
                      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Enviar Mensaje de Prueba
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Nota informativa */}
          <div className="flex items-start gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-neutral-300 text-xs">
            <Info className="h-4 w-4 shrink-0 text-indigo-500 mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium text-neutral-900 dark:text-white">
                Importante para producción:
              </p>
              <p>
                Telegram exige que la dirección del Webhook comience con{" "}
                <span className="font-mono text-indigo-600 dark:text-indigo-400">
                  https://
                </span>{" "}
                y cuente con un certificado SSL válido. Las direcciones con IP
                directa o HTTP plano serán rechazadas por la API de Telegram.
              </p>
            </div>
          </div>
        </div>
      </SettingsLayout>
    </AppLayout>
  );
}
