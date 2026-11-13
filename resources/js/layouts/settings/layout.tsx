import Heading from "@/components/heading";
import { PageHeaderBanner } from "@/components/page-header-banner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { type NavItem } from "@/types";
import { Link, usePage } from "@inertiajs/react";
import { Sliders } from "lucide-react";

const sidebarNavItems: NavItem[] = [
  {
    title: "Perfil Del usuario",
    url: "/settings/profile",
    icon: null,
  },
  {
    title: "Contraseña",
    url: "/settings/password",
    icon: null,
  },
  {
    title: "Tema y Apariencia",
    url: "/settings/appearance",
    icon: null,
  },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentPath = window.location.pathname;
  const { auth, rol } = usePage().props as {
    auth?: {
      user?: {
        roles?: (string | { name: string })[];
      };
      roles?: string[];
    };
    rol?: string;
  };
  const isAdmin =
    auth?.roles?.includes("admin") ||
    auth?.user?.roles?.some((r) =>
      typeof r === "string" ? r === "admin" : r?.name === "admin"
    ) ||
    rol === "admin";

  const menuItems = [...sidebarNavItems];

  if (isAdmin) {
    menuItems.push({
      title: "Diseño Institucional",
      url: "/settings/apariencia",
      icon: null,
    });
    menuItems.push({
      title: "Bot de Telegram",
      url: "/settings/telegram",
      icon: null,
    });
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <PageHeaderBanner
        title="Configuración del Sistema y Cuenta"
        subtitle="Administra tu perfil, credenciales de acceso, colores institucionales y vinculación del bot de Telegram."
        icon={Sliders}
        badgeText="AJUSTES Y PREFERENCIAS"
      />

      <div className="flex flex-col space-y-6 lg:flex-row lg:space-y-0 lg:space-x-10">
        <aside className="w-full lg:w-56 shrink-0">
          <nav className="flex flex-row overflow-x-auto gap-1.5 pb-2 lg:flex-col lg:space-y-1 lg:gap-0 lg:overflow-visible">
            {menuItems.map((item) => (
              <Button
                key={item.url}
                size="sm"
                variant="ghost"
                asChild
                className={cn("justify-start shrink-0 text-xs sm:text-sm rounded-xl whitespace-nowrap", {
                  "bg-muted font-semibold text-primary": currentPath === item.url,
                })}
              >
                <Link href={item.url} prefetch>
                  {item.title}
                </Link>
              </Button>
            ))}
          </nav>
        </aside>

        <Separator className="lg:hidden" />

        <div className="flex-1 md:max-w-2xl">
          <section className="max-w-xl space-y-12">{children}</section>
        </div>
      </div>
    </div>
  );
}
