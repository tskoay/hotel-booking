"use client";

import { CalendarIcon, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type AvailabilitySearch, formatDateValue } from "@/lib/schemas/availability";
import { cn } from "@/lib/utils";

type Props = {
  defaultValues?: AvailabilitySearch;
  className?: string;
};

const dateLabel = (d: Date | undefined) =>
  d
    ? d.toLocaleDateString("en-AU", { weekday: "short", month: "short", day: "numeric" })
    : "Pick date";

export function AvailabilitySearch({ defaultValues, className }: Props) {
  const router = useRouter();

  const [checkIn, setCheckIn] = useState<Date | undefined>(
    defaultValues?.check_in ? new Date(defaultValues.check_in) : undefined,
  );
  const [checkOut, setCheckOut] = useState<Date | undefined>(
    defaultValues?.check_out ? new Date(defaultValues.check_out) : undefined,
  );
  const [guests, setGuests] = useState<string>(String(defaultValues?.guests ?? "2"));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dateError =
    checkIn && checkOut && checkOut <= checkIn ? "Check-out must be after check-in" : null;

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (dateError) return;

    const params = new URLSearchParams();
    if (checkIn) params.set("check_in", formatDateValue(checkIn));
    if (checkOut) params.set("check_out", formatDateValue(checkOut));
    if (guests) params.set("guests", guests);

    const qs = params.toString();
    router.push(qs ? `/rooms?${qs}` : "/rooms");
  }

  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        "bg-background border-border/40 flex flex-col gap-2 rounded-xl border p-3 shadow-sm sm:flex-row sm:items-stretch sm:gap-2 sm:p-2",
        className,
      )}
    >
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="hover:bg-muted/50 flex flex-1 items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors"
          >
            <CalendarIcon className="text-muted-foreground h-4 w-4 shrink-0" />
            <div className="flex flex-col">
              <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Check-in
              </span>
              <span className="text-foreground text-sm font-medium">{dateLabel(checkIn)}</span>
            </div>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={checkIn}
            onSelect={(d) => setCheckIn(d)}
            disabled={(d) => d < today}
            autoFocus
          />
        </PopoverContent>
      </Popover>

      <div className="bg-border/60 hidden w-px sm:block" />

      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="hover:bg-muted/50 flex flex-1 items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors"
          >
            <CalendarIcon className="text-muted-foreground h-4 w-4 shrink-0" />
            <div className="flex flex-col">
              <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Check-out
              </span>
              <span className="text-foreground text-sm font-medium">{dateLabel(checkOut)}</span>
            </div>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={checkOut}
            onSelect={(d) => setCheckOut(d)}
            disabled={(d) => d < today || (checkIn ? d <= checkIn : false)}
            autoFocus
          />
        </PopoverContent>
      </Popover>

      <div className="bg-border/60 hidden w-px sm:block" />

      <div className="flex flex-1 items-center gap-3 rounded-lg px-4 py-3">
        <Users className="text-muted-foreground h-4 w-4 shrink-0" />
        <div className="flex flex-1 flex-col">
          <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Guests
          </span>
          <Select value={guests} onValueChange={setGuests}>
            <SelectTrigger className="h-auto border-0 p-0 text-sm font-medium shadow-none focus:ring-0 [&>svg]:hidden">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n} {n === 1 ? "guest" : "guests"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="submit" size="lg" className="sm:px-8" disabled={!!dateError}>
        Search
      </Button>
      {dateError ? (
        <p className="text-destructive text-xs sm:hidden" role="alert">
          {dateError}
        </p>
      ) : null}
    </form>
  );
}
