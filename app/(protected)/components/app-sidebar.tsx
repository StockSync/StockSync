"use client";

import { Boxes, LayoutDashboard, LogOut, Package } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { DropdownMenu } from "@radix-ui/react-dropdown-menu";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname } from "next/navigation";
import api from "@/lib/api";

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Produtos",
    url: "/produtos",
    icon: Package,
  },
  {
    title: "Estoque",
    url: "/estoque",
    icon: Boxes,
  },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userInitial, setUserInitial] = useState(""); // ✅ Começa vazio
  const [mounted, setMounted] = useState(false); // ✅ Controla se já carregou

  // ✅ Pega a inicial apenas no cliente
  useEffect(() => {
    setMounted(true); // Marca que o componente montou no cliente

    const token = localStorage.getItem("token");
    if (!token) {
      setUserInitial("F");
      return;
    }

    try {
      const payload = token.split(".")[1];
      const decoded = JSON.parse(atob(payload));
      const email = decoded.sub || decoded.email || decoded.username;

      if (email) {
        setUserInitial(email.charAt(0).toUpperCase());
      } else {
        setUserInitial("F");
      }
    } catch (error) {
      console.error("Erro ao decodificar token:", error);
      setUserInitial("F");
    }
  }, []);

  const handleLogout = () => {
    console.log("🚪 Logout iniciado");
    api.logout();
    router.push("/authentication");
    console.log("✅ Logout concluído");
  };

  // ✅ Não renderiza até carregar no cliente
  if (!mounted) {
    return null;
  }

  return (
    <Sidebar>
      <SidebarHeader className="flex justify-center items-center py-0 border-b">
        <Image src="/logo.svg" alt="StockSync" width={130} height={30} />
      </SidebarHeader>
      <SidebarContent className="border-b">
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    size="lg"
                    isActive={pathname === item.url}
                  >
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-lg font-bold text-purple-600">
                    {userInitial}
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
