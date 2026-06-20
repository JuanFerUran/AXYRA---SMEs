"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface TooltipProps {
  children: React.ReactElement
  content: string
  side?: "top" | "right" | "bottom" | "left"
  className?: string
}

const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  ({ content, side = "top", className, children }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false)

    const positionClasses = {
      top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
      right: "left-full top-1/2 -translate-y-1/2 ml-2",
      bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
      left: "right-full top-1/2 -translate-y-1/2 mr-2",
    }

    return (
      <div
        ref={ref}
        className="relative inline-block"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        {children}
        {isOpen && (
          <div
            className={cn(
              "absolute z-50 px-2 py-1 text-sm bg-foreground text-background rounded-md whitespace-nowrap pointer-events-none",
              positionClasses[side],
              className
            )}
          >
            {content}
          </div>
        )}
      </div>
    )
  }
)
Tooltip.displayName = "Tooltip"

function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export { Tooltip, TooltipProvider }
