"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

function Separator({
  className,
  orientation = "horizontal",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  orientation?: "horizontal" | "vertical"
}) {
  return (
    <div
      data-slot="separator"
      className={cn(
        orientation === "vertical"
          ? "inline-block h-full w-px"
          : "block h-px w-full",
        "bg-border",
        className
      )}
      {...props}
    />
  )
}

export { Separator }
