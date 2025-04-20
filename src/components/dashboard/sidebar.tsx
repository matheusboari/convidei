"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Users, Gift, Home, CheckSquare } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  const menuItems = [
    {
      href: "/dashboard",
      label: "Início",
      icon: <Home className="mr-2 h-5 w-5" />,
    },
    {
      href: "/dashboard/convidados",
      label: "Convidados",
      icon: <User className="mr-2 h-5 w-5" />,
    },
    {
      href: "/dashboard/grupos",
      label: "Grupos",
      icon: <Users className="mr-2 h-5 w-5" />,
    },
    {
      href: "/dashboard/confirmacoes",
      label: "Confirmações",
      icon: <CheckSquare className="mr-2 h-5 w-5" />,
    },
    {
      href: "/dashboard/presentes",
      label: "Presentes",
      icon: <Gift className="mr-2 h-5 w-5" />,
    },
  ];

  return (
    <aside className="hidden w-64 flex-shrink-0 flex-col bg-purple-50 border-r border-purple-100 md:flex">
      <div className="flex h-16 items-center justify-center border-b border-purple-100">
        <h2 className="text-xl font-bold text-purple-600">Chá da Antonella</h2>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {menuItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Button
              variant={isActive(item.href) ? "default" : "ghost"}
              className={`w-full justify-start ${
                isActive(item.href) 
                  ? "bg-purple-600 text-white hover:bg-purple-700" 
                  : "hover:bg-purple-100 hover:text-purple-700"
              }`}
            >
              {item.icon}
              {item.label}
            </Button>
          </Link>
        ))}
      </nav>
    </aside>
  );
} 