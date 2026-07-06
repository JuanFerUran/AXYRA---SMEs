import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

const navigationMenuTriggerStyle = "inline-flex h-9 w-max items-center justify-center rounded-lg px-2.5 py-1.5 text-sm font-medium transition-all outline-none hover:bg-muted focus:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50"

function NavigationMenu({
  align = "start",
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  align?: "start" | "center" | "end"
}) {
  return (
    <div className={cn("relative flex items-center justify-center", className)} {...props}>
      {children}
    </div>
  )
}

function NavigationMenuList({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) {
  return <ul className={cn("flex items-center gap-2", className)} {...props} />
}

function NavigationMenuItem({ className, ...props }: React.LiHTMLAttributes<HTMLLIElement>) {
  return <li className={cn("relative", className)} {...props} />
}

function NavigationMenuTrigger({
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className={cn(navigationMenuTriggerStyle, "group", className)} {...props}>
      {children} <ChevronDown className="relative top-px ml-1 h-3.5 w-3.5 transition duration-300" aria-hidden="true" />
    </button>
  )
}

function NavigationMenuContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="navigation-menu-content"
      className={cn(
        "absolute left-0 top-full z-50 mt-2 min-w-48 rounded-lg border border-border bg-popover shadow-lg",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function NavigationMenuPositioner({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("relative", className)} {...props}>
      {children}
    </div>
  )
}

function NavigationMenuLink({ className, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      className={cn("block rounded-lg px-3 py-2 text-sm text-foreground hover:bg-muted", className)}
      {...props}
    >
      {children}
    </a>
  )
}

function NavigationMenuIndicator({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("hidden", className)} {...props} />
}

export {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuPositioner,
  navigationMenuTriggerStyle,
}
