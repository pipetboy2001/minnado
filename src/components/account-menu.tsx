"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** "Mi cuenta" nav entry: a dropdown holding Configuración and Mi progreso. */
export function AccountMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(buttonVariants({ variant: "outline" }), "gap-1")}
      >
        Mi cuenta
        <ChevronDown className="size-3.5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem render={<Link href="/actividades/cuenta" />}>
          Configuración
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/actividades/progreso" />}>
          Mi progreso
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
