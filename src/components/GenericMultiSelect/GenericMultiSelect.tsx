import * as React from "react"
import { useEffect, useRef, useState } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import {
  CheckIcon,
  ChevronDown,
  Loader2,
  WandSparkles,
  XCircle,
  XIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { useDebounce } from "../../utils/index"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"

import { Input } from "@/components/ui/input"

const multiSelectVariants = cva(
  "m-1 transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110",
  {
    variants: {
      variant: {
        default:
          "border-foreground/10 text-foreground bg-card hover:bg-card/80",
        secondary:
          "border-foreground/10 bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/80 border-transparent",
        inverted: "inverted",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface GenericMultiSelectProps<T extends Record<string, any>>
  extends Omit<
      React.ButtonHTMLAttributes<HTMLButtonElement>,
      "onChange" | "defaultValue"
    >,
    VariantProps<typeof multiSelectVariants> {
  options: T[]
  valueKey: keyof T
  getOptionLabel: (option: T) => string
  placeholder?: string
  onValueChange: (value: T[keyof T][]) => void
  setAlternativeValue?: (value?: T[]) => void
  defaultValue?: T[]
  animation?: number
  maxCount?: number
  modalPopover?: boolean
  asChild?: boolean
  className?: string
  onLoadMore?: () => void
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
  onSearchChange?: (searchTerm: string) => void
  isLoading?: boolean
}

export const GenericMultiSelect = React.forwardRef(
  <T extends Record<string, any>>(
    {
      options,
      valueKey,
      getOptionLabel,
      placeholder = "Select options",
      onValueChange,
      setAlternativeValue,
      defaultValue = [],
      animation = 0,
      maxCount = 3,
      modalPopover = false,
      asChild = false,
      className,
      variant = "secondary",
      onLoadMore,
      hasNextPage,
      isFetchingNextPage,
      onSearchChange,
      isLoading,
      ...props
    }: GenericMultiSelectProps<T>,
    ref: React.Ref<HTMLButtonElement>
  ) => {
    const [selectedOptions, setSelectedOptions] = useState<T[]>(defaultValue)

    
    const [isPopoverOpen, setIsPopoverOpen] = useState(false)
    const [isAnimating, setIsAnimating] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const [localSearch, setLocalSearch] = useState("")
    const debouncedSearch = useDebounce(localSearch, 300)
    const isFetchingNextPageRef = useRef<boolean | undefined>(isFetchingNextPage)

    useEffect(() => {
      isFetchingNextPageRef.current = isFetchingNextPage
    }, [isFetchingNextPage])

    // Change 2: Separate derived selected values
    const selectedValues = selectedOptions.map((option) => option[valueKey])

    useEffect(() => {
      if (!isPopoverOpen) {
        setLocalSearch("")
      }
    }, [isPopoverOpen])

    useEffect(() => {
      if (onSearchChange) {
        onSearchChange(debouncedSearch)
      }
    }, [debouncedSearch, onSearchChange])

    // const [searchParams, setSearchParams] = useSearchParams()

    // Change 3: Update toggle functions to manage selectedOptions
    const toggleOption = (option: T) => {
      const newSelected = selectedOptions.some(
        (o) => o[valueKey] === option[valueKey]
      )
        ? selectedOptions.filter((o) => o[valueKey] !== option[valueKey])
        : [...selectedOptions, option]
      setSelectedOptions(newSelected)
      onValueChange(newSelected.map((o) => o[valueKey]))
      setAlternativeValue?.(newSelected)
    }

    const handleClear = () => {
      setSelectedOptions([])
      onValueChange([])
      setAlternativeValue?.([])
    }

    const clearExtraOptions = () => {
      const newSelected = selectedOptions.slice(0, maxCount)
      setSelectedOptions(newSelected)
      onValueChange(newSelected.map((o) => o[valueKey]))
      setAlternativeValue?.(newSelected)
    }

    // Change 4: Update toggleAll to use selectedOptions
    const toggleAll = () => {
      if (selectedOptions.length === options.length) {
        handleClear()
      } else {
        setSelectedOptions(options)
        onValueChange(options.map((o) => o[valueKey]))
        setAlternativeValue?.(options)
      }
    }

    // Infinite scroll effect
    useEffect(() => {
      const timeout = setTimeout(() => {
        const container = scrollRef.current
        if (!container || !hasNextPage || !onLoadMore) return

        const handleScroll = () => {
          // Guard: do nothing if there is no next page or a next-page fetch is already in flight
          if (!hasNextPage || isFetchingNextPageRef.current) return

          const { scrollTop, scrollHeight, clientHeight } = container
          const atBottom = scrollTop + clientHeight >= scrollHeight - 5

          if (atBottom && !isLoading && !isFetchingNextPageRef.current) {
            onLoadMore()
          }
        }

        // Add wheel event listener
        const handleWheel = (e: WheelEvent) => {
          // Prevent default to avoid double scrolling in parent containers when inside popover
          e.preventDefault()

          // Calculate new scroll position
          const newScrollTop = container.scrollTop + e.deltaY

          // Apply scroll
          container.scrollTop = newScrollTop

          // Use the same guarded logic as handleScroll
          if (!isLoading) handleScroll()
        }

        container.addEventListener("scroll", handleScroll)
        container.addEventListener("wheel", handleWheel, { passive: false })

        return () => {
          container.removeEventListener("scroll", handleScroll)
          container.removeEventListener("wheel", handleWheel)
        }
      }, 10) // short delay to ensure popover is visible

      return () => clearTimeout(timeout)
    }, [isPopoverOpen, hasNextPage, isFetchingNextPage, onLoadMore, isLoading])

    return (
      <Popover
        open={isPopoverOpen}
        onOpenChange={(open:boolean) => {
          setIsPopoverOpen(open)
          if (!open && onSearchChange) {
            onSearchChange("")
          }
        }}
        modal={modalPopover}
      >
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            {...props}
            onClick={() => setIsPopoverOpen(!isPopoverOpen)}
            className={cn(
              "flex h-auto min-h-10 w-full items-center justify-between rounded-md border bg-inherit p-1 hover:bg-inherit [&_svg]:pointer-events-auto",
              className
            )}
          >
            {/* Change 5: Render from selectedOptions */}
            {selectedOptions.length > 0 ? (
              <div className="flex w-full items-center justify-between">
                <div className="flex flex-wrap items-center">
                  {selectedOptions.slice(0, maxCount).map((option, index) => (
                    <Badge
                      key={index}
                      className={cn(
                        isAnimating ? "animate-bounce" : "",
                        multiSelectVariants({ variant })
                      )}
                      style={{ animationDuration: `${animation}s` }}
                    >
                      {getOptionLabel(option)}
                      <div>
                        <XCircle
                          className="ml-2 h-4 w-4 cursor-pointer"
                          onClick={(e:any) => {
                            e.stopPropagation()
                            toggleOption(option)
                          }}
                        />
                      </div>
                    </Badge>
                  ))}
                  {selectedOptions.length > maxCount && (
                    <Badge
                      className={cn(
                        "text-foreground border-foreground/1 bg-transparent hover:bg-transparent",
                        isAnimating ? "animate-bounce" : "",
                        multiSelectVariants({ variant })
                      )}
                      style={{ animationDuration: `${animation}s` }}
                    >
                      {`+ ${selectedOptions.length - maxCount} more`}
                      <XCircle
                        className="ml-2 h-4 w-4 cursor-pointer"
                        onClick={(e:any) => {
                          e.stopPropagation()
                          clearExtraOptions()
                        }}
                      />
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <XIcon
                    className="text-muted-foreground mx-2 h-4 cursor-pointer"
                    onClick={(e:any) => {
                      e.stopPropagation()
                      handleClear()
                    }}
                  />
                  <Separator
                    orientation="vertical"
                    className="flex h-full min-h-6"
                  />
                  <ChevronDown className="text-muted-foreground mx-2 h-4 cursor-pointer" />
                </div>
              </div>
            ) : (
              <div className="mx-auto flex w-full items-center justify-between">
                <span className="text-muted-foreground mx-3">
                  {placeholder}
                </span>
                <ChevronDown className="text-muted-foreground mx-2 h-4 cursor-pointer" />
              </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command>
            {onSearchChange ? (
              <Input
                type="text"
                ref={inputRef}
                placeholder="Search..."
                value={localSearch}
                onChange={(e:any) => setLocalSearch(e.target.value)}
              />
            ) : (
              <CommandInput placeholder="Search ..." />
            )}
            <CommandList
              ref={scrollRef}
              className="max-h-[300px] overflow-y-auto"
            >
              <CommandGroup>
                <CommandItem
                  key="all"
                  onSelect={toggleAll}
                  className="cursor-pointer"
                >
                  <div
                    className={cn(
                      "border-primary mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                      selectedOptions.length === options.length
                        ? "bg-primary text-primary-foreground"
                        : "opacity-50 [&_svg]:invisible"
                    )}
                  >
                    <CheckIcon className="h-4 w-4" />
                  </div>
                  <span>(Select All)</span>
                </CommandItem>
                {options.map((option, idx) => {
                  const isSelected = selectedOptions.some(
                    (o) => o[valueKey] === option[valueKey]
                  )
                  return (
                    <CommandItem
                      key={idx}
                      onSelect={() => toggleOption(option)}
                      className="cursor-pointer"
                    >
                      <div
                        className={cn(
                          "border-primary mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "opacity-50 [&_svg]:invisible"
                        )}
                      >
                        <CheckIcon className="h-4 w-4" />
                      </div>
                      <span>{getOptionLabel(option)}</span>
                    </CommandItem>
                  )
                })}
                {/* Infinite scroll indicators */}
                {isFetchingNextPage ? (
                  <div className="text-muted-foreground flex items-center justify-center gap-2 p-2 text-center text-xs">
                    <Loader2 className="text-primary h-4 w-4 animate-spin" />
                    Loading more...
                  </div>
                ) : hasNextPage ? (
                  <div className="text-muted-foreground p-2 text-center text-xs">
                    Scroll to load more
                  </div>
                ) : options.length > 0 ? (
                  <div className="text-muted-foreground p-2 text-center text-xs">
                    No more results
                  </div>
                ) : null}
              </CommandGroup>
              <CommandSeparator />
            </CommandList>
          </Command>
        </PopoverContent>
        {/* ... animation sparkle ... */}
        {animation > 0 && selectedValues.length > 0 && (
          <WandSparkles
            className={cn(
              "text-foreground bg-background my-2 h-3 w-3 cursor-pointer",
              isAnimating ? "" : "text-muted-foreground"
            )}
            onClick={() => setIsAnimating(!isAnimating)}
          />
        )}
      </Popover>
    )
  }
)

GenericMultiSelect.displayName = "GenericMultiSelect"
