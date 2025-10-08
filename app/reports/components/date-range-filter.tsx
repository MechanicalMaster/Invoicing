"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarIcon } from "lucide-react"
import { format, subDays, startOfMonth, startOfYear, endOfDay } from "date-fns"
import { cn } from "@/lib/utils"

interface DateRangeFilterProps {
  startDate: Date | undefined
  endDate: Date | undefined
  onStartDateChange: (date: Date | undefined) => void
  onEndDateChange: (date: Date | undefined) => void
}

export function DateRangeFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: DateRangeFilterProps) {
  const [isStartOpen, setIsStartOpen] = useState(false)
  const [isEndOpen, setIsEndOpen] = useState(false)

  const presetRanges = [
    {
      label: "Today",
      getValue: () => ({
        start: new Date(),
        end: endOfDay(new Date()),
      }),
    },
    {
      label: "Last 7 Days",
      getValue: () => ({
        start: subDays(new Date(), 7),
        end: endOfDay(new Date()),
      }),
    },
    {
      label: "Last 30 Days",
      getValue: () => ({
        start: subDays(new Date(), 30),
        end: endOfDay(new Date()),
      }),
    },
    {
      label: "This Month",
      getValue: () => ({
        start: startOfMonth(new Date()),
        end: endOfDay(new Date()),
      }),
    },
    {
      label: "This Year",
      getValue: () => ({
        start: startOfYear(new Date()),
        end: endOfDay(new Date()),
      }),
    },
  ]

  const handlePresetClick = (preset: typeof presetRanges[0]) => {
    const { start, end } = preset.getValue()
    onStartDateChange(start)
    onEndDateChange(end)
  }

  const handleClearDates = () => {
    onStartDateChange(undefined)
    onEndDateChange(undefined)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {presetRanges.map((preset) => (
          <Button
            key={preset.label}
            variant="outline"
            size="sm"
            onClick={() => handlePresetClick(preset)}
            className="text-xs"
          >
            {preset.label}
          </Button>
        ))}
        {(startDate || endDate) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearDates}
            className="text-xs text-muted-foreground"
          >
            Clear
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Start Date</label>
          <Popover open={isStartOpen} onOpenChange={setIsStartOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={(date) => {
                  onStartDateChange(date)
                  setIsStartOpen(false)
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">End Date</label>
          <Popover open={isEndOpen} onOpenChange={setIsEndOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={(date) => {
                  onEndDateChange(date)
                  setIsEndOpen(false)
                }}
                initialFocus
                disabled={(date) => startDate ? date < startDate : false}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  )
}
