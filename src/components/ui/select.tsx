"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => (
    <div className="relative">
      <select
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none pr-8",
          className
        )}
        ref={ref}
        {...props}
      />
      <ChevronDown className="absolute right-2 top-3 h-4 w-4 opacity-50 pointer-events-none" />
    </div>
  )
)
Select.displayName = "Select"

function SelectGroup({ ...props }: React.HTMLAttributes<HTMLOptGroupElement>) {
  return <optgroup {...props} />
}

function SelectOption({ ...props }: React.OptionHTMLAttributes<HTMLOptionElement>) {
  return <option {...props} />
}

function SelectSeparator({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("pointer-events-none -mx-1 my-1 h-px bg-border", className)} {...props} />
}

export {
  Select,
  SelectGroup,
  SelectOption,
  SelectSeparator,
}
