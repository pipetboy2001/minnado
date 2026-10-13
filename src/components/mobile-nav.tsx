"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Dialog } from "@base-ui/react/dialog";
import {
  GraduationCap,
  Library,
  Menu,
  RotateCcw,
  Settings,
  TrendingUp,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/actividades/repaso", label: "Repaso", icon: RotateCcw },
  { href: "/actividades/diccionario", label: "Diccionario", icon: Library },
  { href: "/actividades/examen", label: "Examen", icon: GraduationCap },
  { href: "/actividades/cuenta", label: "Configuración", icon: Settings },
  { href: "/actividades/progreso", label: "Mi progreso", icon: TrendingUp },
];

/** Hamburger menu shown only below sm: the icon row doesn't have room there. */
export function MobileNav({ logoutForm }: { logoutForm: ReactNode }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger
        render={<Button variant="outline" size="icon" className="sm:hidden" />}
        aria-label="Abrir menú"
      >
        <Menu />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40 transition-opacity duration-200 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <Dialog.Popup className="fixed inset-y-0 right-0 z-50 flex h-full w-72 max-w-[80vw] flex-col border-l border-border bg-background p-4 shadow-lg transition-transform duration-200 data-[ending-style]:translate-x-full data-[starting-style]:translate-x-full">
          <div className="mb-4 flex items-center justify-end gap-2">
            <Dialog.Title className="sr-only">Menú</Dialog.Title>
            <Dialog.Close
              render={<Button variant="ghost" size="icon" />}
              aria-label="Cerrar menú"
            >
              <X />
            </Dialog.Close>
          </div>

          <nav className="flex flex-col gap-1">
            {links.map(({ href, label, icon: Icon }) => (
              <Dialog.Close
                key={href}
                render={<Link href={href} />}
                className="flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm hover:bg-muted"
              >
                <Icon className="size-4" />
                {label}
              </Dialog.Close>
            ))}
          </nav>

          <div className="mt-auto border-t border-border pt-3">
            {logoutForm}
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
