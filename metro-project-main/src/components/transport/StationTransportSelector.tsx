import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface Station {
  id: string;
  name: string;
  line?: string;
}

interface StationTransportSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

const STATIONS: Station[] = [
  { id: "miyapur", name: "Miyapur", line: "Red Line" },
  { id: "ameerpet", name: "Ameerpet", line: "Blue Line" },
  { id: "tarnaka", name: "Tarnaka", line: "Blue Line" },
  { id: "lb-nagar", name: "LB Nagar", line: "Red Line" },
  { id: "raidurg", name: "Raidurg", line: "Red Line" }
];

export function StationTransportSelector({ value, onValueChange }: StationTransportSelectorProps) {
  const [open, setOpen] = useState(false);
  
  const selectedStation = STATIONS.find(station => station.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-card hover:bg-accent/10"
        >
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            {selectedStation ? (
              <span>{selectedStation.name}</span>
            ) : (
              <span className="text-muted-foreground">Select destination station...</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Search station..." />
          <CommandList>
            <CommandEmpty>No station found.</CommandEmpty>
            <CommandGroup>
              {STATIONS.map((station) => (
                <CommandItem
                  key={station.id}
                  value={station.id}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === station.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{station.name}</span>
                    {station.line && (
                      <span className="text-xs text-muted-foreground">{station.line}</span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
