import { useEffect, useRef, useState } from "react"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"

import { cn } from "../../utils/cn"
import { useDebounce } from "../../utils/index"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface GenericSingleSelectProps<T extends Record<string, any>> {
  options: T[]
  valueKey: keyof T
  labelKey: keyof T
  value?: T[keyof T] | null
  defaultValue?: Partial<T>
  placeholder?: string
  onValueChange: (value: T[keyof T] | null) => void
  onSearchChange?: (searchTerm: string) => void
  onLoadMore?: () => void
  displayClassName?: string
  hasNextPage?: boolean
  isFetchingNextPage?: boolean
  isLoading?: boolean
  className?: string
}

export function GenericSingleSelect<T extends Record<string, any>>({
  options,
  valueKey,   
  labelKey,
  value,
  defaultValue,
  placeholder = "Select an option",
  onValueChange,
  onSearchChange,
  onLoadMore,
  hasNextPage,
  isFetchingNextPage,
  isLoading,
  className,
  displayClassName,
}: GenericSingleSelectProps<T>) {
  const [localSearch, setLocalSearch] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const debouncedSearch = useDebounce(localSearch, 300)
  const isFetchingNextPageRef = useRef<boolean | undefined>(isFetchingNextPage)

  useEffect(() => {
    isFetchingNextPageRef.current = isFetchingNextPage
  }, [isFetchingNextPage])

  useEffect(() => {
    if (onSearchChange && isOpen) {
      onSearchChange(debouncedSearch)
    }
  }, [debouncedSearch, onSearchChange, isOpen])

  useEffect(() => {
    if (!isOpen) {
      setLocalSearch("")
    }
  }, [isOpen])

  // Infinite scroll effect
  useEffect(() => {
    const timeout = setTimeout(() => {
      const container = scrollRef.current
      if (!container || !onLoadMore) return

      const handleScroll = () => {
        // Guard: do nothing if there is no next page or a next-page fetch is already in flight
        if (!hasNextPage || isFetchingNextPageRef.current) return

        const { scrollTop, scrollHeight, clientHeight } = container
        const atBottom = scrollTop + clientHeight >= scrollHeight - 5

        if (atBottom && !isLoading && !isFetchingNextPageRef.current) {
          onLoadMore()
        }
      }

      const handleWheel = (e: WheelEvent) => {
        const { scrollTop, scrollHeight, clientHeight } = container
        const atBottom = scrollTop + clientHeight >= scrollHeight - 5
        const atTop = scrollTop <= 5

        if (
          (atBottom && e.deltaY > 0 && !hasNextPage) ||
          (atTop && e.deltaY < 0)
        ) {
          return // Let event bubble for parent scrolling
        }

        e.preventDefault()
        container.scrollTop += e.deltaY
        if (!isLoading) {
          handleScroll()
        }
      }

      container.addEventListener("scroll", handleScroll)
      container.addEventListener("wheel", handleWheel, { passive: false })

      return () => {
        container.removeEventListener("scroll", handleScroll)
        container.removeEventListener("wheel", handleWheel)
      }
    }, 10)

    return () => clearTimeout(timeout)
  }, [isOpen, hasNextPage, isFetchingNextPage, onLoadMore, isLoading])

  const selectedOption = options.find((option) => option[valueKey] === value)

  // When onSearchChange is not provided, fall back to local client-side filtering
  const filteredOptions =
    onSearchChange || !debouncedSearch.trim()
      ? options
      : options.filter((option) => {
          const label = String(option[labelKey] ?? "")
          const optionValue = String(option[valueKey] ?? "")
          const term = debouncedSearch.toLowerCase().trim()
          return (
            label.toLowerCase().includes(term) ||
            optionValue.toLowerCase().includes(term)
          )
        })

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          className={cn("w-full justify-between", className)}
        >
          {selectedOption ? (
            <span className="truncate">{String(selectedOption[labelKey])}</span>
          ) : defaultValue ? (
            <span className="truncate">{defaultValue[labelKey]}</span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search..."
            value={localSearch}
            onValueChange={setLocalSearch}
            className="pl-8"
          />
          <CommandList
            ref={scrollRef}
            className={cn(
              `max-h-[300px] max-w-72 overflow-y-auto`,
              displayClassName
            )}
          >
            {filteredOptions.length === 0 ? (
              <CommandEmpty>No results found</CommandEmpty>
            ) : (
              <CommandGroup>
                {filteredOptions.map((option) => {
                  const isSelected = option[valueKey] === value
                  return (
                    <CommandItem
                      key={String(option[valueKey])}
                      value={String(option[valueKey])}
                      onSelect={() => {
                        onValueChange(isSelected ? null : option[valueKey])
                        setIsOpen(false)
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          isSelected ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span className="text-wrap">
                        {String(option[labelKey])}
                      </span>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            )}

            {/* Infinite scroll indicators */}
            {isLoading ? (
              <div className="text-muted-foreground flex items-center justify-center gap-2 p-2 text-center text-xs">
                <Loader2 className="text-primary h-4 w-4 animate-spin" />
                Loading more...
              </div>
            ) : hasNextPage ? (
              <div className="text-muted-foreground p-2 text-center text-xs">
                Scroll to load more
              </div>
            ) : filteredOptions.length > 0 ? (
              <div className="text-muted-foreground p-2 text-center text-xs">
                No more results
              </div>
            ) : null}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}