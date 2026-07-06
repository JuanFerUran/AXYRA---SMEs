"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

function DropdownMenu({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("relative inline-block", className)} {...props}>
      {children}
    </div>
  )
}

function DropdownMenuPortal({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn(className)} {...props}>
      {children}
    </div>
  )
}

function DropdownMenuTrigger({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center rounded-md px-3 py-2 text-sm transition hover:bg-muted",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

function DropdownMenuContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "absolute z-50 mt-2 min-w-40 overflow-hidden rounded-lg border border-border bg-popover shadow-lg",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function DropdownMenuGroup({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("py-1", className)} {...props}>
      {children}
    </div>
  )
}

function DropdownMenuLabel({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-1.5 py-1 text-xs font-medium text-muted-foreground", className)} {...props}>
      {children}
    </div>
  )
}

function DropdownMenuItem({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center gap-1.5 rounded-md px-3 py-2 text-sm text-foreground hover:bg-muted", className)}
      {...props}
    >
      {children}
    </div>
  )
}

function DropdownMenuSub({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("py-1", className)} {...props}>
      {children}
    </div>
  )
}

function DropdownMenuSubTrigger({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn("flex w-full items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-muted", className)}
      {...props}
    >
      {children}
    </button>
  )
}

function DropdownMenuSubContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "absolute left-full top-0 z-50 mt-0 min-w-40 rounded-lg border border-border bg-popover shadow-lg",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function DropdownMenuCheckboxItem({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center gap-1.5 rounded-md px-3 py-2 text-sm hover:bg-muted", className)}
      {...props}
    >
      {children}
    </div>
  )
}

function DropdownMenuRadioGroup({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn(className)} {...props}>
      {children}
    </div>
  )
}

function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center gap-1.5 rounded-md px-3 py-2 text-sm hover:bg-muted", className)}
      {...props}
    >
      {children}
    </div>
  )
}

function DropdownMenuSeparator({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("my-1 h-px bg-border", className)} {...props} />
}

function DropdownMenuShortcut({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn("ml-auto text-xs text-muted-foreground", className)} {...props}>
      {children}
    </span>
  )
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
}
