"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

function Sheet({
  open,
  onOpenChange,
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
}) {
  if (!open) {
    return null
  }

  return (
    <div className={cn("fixed inset-0 z-50 flex items-center justify-center p-4", className)} {...props}>
      {children}
    </div>
  )
}

function SheetTrigger({ children, onClick, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" onClick={onClick} className={cn("inline-flex items-center justify-center rounded-md px-3 py-2 text-sm transition hover:bg-muted", className)} {...props}>
      {children}
    </button>
  )
}

function SheetClose({ children, onClick, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" onClick={onClick} className={cn("inline-flex items-center justify-center rounded-full p-2 text-foreground hover:bg-muted", className)} {...props}>
      {children}
    </button>
  )
}

function SheetPortal({ children }: { children?: React.ReactNode }) {
  return <>{children}</>
}

function SheetOverlay({ className, onClick, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("fixed inset-0 bg-black/40", className)} onClick={onClick} {...props} />
}

function SheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
  onClose,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  side?: "top" | "right" | "bottom" | "left"
  showCloseButton?: boolean
  onClose?: () => void
  children?: React.ReactNode
}) {
  return (
    <div className={cn("fixed inset-0 z-50 flex items-center justify-center p-4", className)} {...props}>
      <div className="relative w-full max-w-lg rounded-xl bg-background p-6 shadow-2xl">
        {showCloseButton && (
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-2 text-foreground hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {children}
      </div>
    </div>
  )
}

function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-1", className)} {...props} />
}

function SheetFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mt-4 flex justify-end gap-2", className)} {...props} />
}

function SheetTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-lg font-semibold", className)} {...props} />
}

function SheetDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetPortal,
  SheetOverlay,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
