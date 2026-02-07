import { useState, useMemo } from "react";
import { Check, ChevronsUpDown, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

interface Station {
  id: string;
  name: string;
  line?: string;
}

interface StationSelectorProps {
  stations?: Station[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
}

const METRO_STATIONS: Station[] = [
  // Red Line (Miyapur to LB Nagar)
  { id: "miyapur", name: "Miyapur", line: "Red" },
  { id: "jntu-college", name: "JNTU College", line: "Red" },
  { id: "kphb-colony", name: "KPHB Colony", line: "Red" },
  { id: "kukatpally", name: "Kukatpally", line: "Red" },
  { id: "balanagar", name: "Balanagar", line: "Red" },
  { id: "moosapet", name: "Moosapet", line: "Red" },
  { id: "bharat-nagar", name: "Bharat Nagar", line: "Red" },
  { id: "erragadda", name: "Erragadda", line: "Red" },
  { id: "esi-hospital", name: "ESI Hospital", line: "Red" },
  { id: "sr-nagar", name: "SR Nagar", line: "Red" },
  { id: "ameerpet", name: "Ameerpet", line: "Red" },
  { id: "panjagutta", name: "Panjagutta", line: "Red" },
  { id: "irrum-manzil", name: "Irrum Manzil", line: "Red" },
  { id: "khairatabad", name: "Khairatabad", line: "Red" },
  { id: "lakdi-ka-pul", name: "Lakdi-ka-pul", line: "Red" },
  { id: "assembly", name: "Assembly", line: "Red" },
  { id: "nampally", name: "Nampally", line: "Red" },
  { id: "gandhi-bhavan", name: "Gandhi Bhavan", line: "Red" },
  { id: "osmania-medical", name: "Osmania Medical College", line: "Red" },
  { id: "mg-bus-station", name: "MG Bus Station", line: "Red" },
  { id: "malakpet", name: "Malakpet", line: "Red" },
  { id: "new-market", name: "New Market", line: "Red" },
  { id: "moosarambagh", name: "Moosarambagh", line: "Red" },
  { id: "dilsukhnagar", name: "Dilsukhnagar", line: "Red" },
  { id: "chaitanyapuri", name: "Chaitanyapuri", line: "Red" },
  { id: "victoria-memorial", name: "Victoria Memorial", line: "Red" },
  { id: "lb-nagar", name: "LB Nagar", line: "Red" },
  
  // Blue Line (Nagole to Raidurg)
  { id: "nagole", name: "Nagole", line: "Blue" },
  { id: "uppal", name: "Uppal", line: "Blue" },
  { id: "stadium", name: "Stadium", line: "Blue" },
  { id: "ngri", name: "NGRI", line: "Blue" },
  { id: "habsiguda", name: "Habsiguda", line: "Blue" },
  { id: "tarnaka", name: "Tarnaka", line: "Blue" },
  { id: "mettuguda", name: "Mettuguda", line: "Blue" },
  { id: "secunderabad-east", name: "Secunderabad East", line: "Blue" },
  { id: "parade-ground", name: "Parade Ground", line: "Blue" },
  { id: "paradise", name: "Paradise", line: "Blue" },
  { id: "rasoolpura", name: "Rasoolpura", line: "Blue" },
  { id: "prakash-nagar", name: "Prakash Nagar", line: "Blue" },
  { id: "begumpet", name: "Begumpet", line: "Blue" },
  { id: "madhura-nagar", name: "Madhura Nagar", line: "Blue" },
  { id: "yousufguda", name: "Yousufguda", line: "Blue" },
  { id: "jubilee-hills-road", name: "Jubilee Hills Road No. 5", line: "Blue" },
  { id: "jubilee-hills-checkpost", name: "Jubilee Hills Checkpost", line: "Blue" },
  { id: "peddamma-gudi", name: "Peddamma Gudi", line: "Blue" },
  { id: "madhapur", name: "Madhapur", line: "Blue" },
  { id: "durgam-cheruvu", name: "Durgam Cheruvu", line: "Blue" },
  { id: "hitech-city", name: "Hitech City", line: "Blue" },
  { id: "raidurg", name: "Raidurg", line: "Blue" },
  
  // Green Line (JBS Parade Ground to MG Bus Station)
  { id: "jbs-parade-ground", name: "JBS Parade Ground", line: "Green" },
  { id: "secunderabad-west-green", name: "Secunderabad West", line: "Green" },
  { id: "gandhi-hospital-green", name: "Gandhi Hospital", line: "Green" },
  { id: "musheerabad-green", name: "Musheerabad", line: "Green" },
  { id: "rtc-cross-roads", name: "RTC Cross Roads", line: "Green" },
  { id: "chikkadpally-green", name: "Chikkadpally", line: "Green" },
  { id: "narayanguda-green", name: "Narayanguda", line: "Green" },
  { id: "sultan-bazaar", name: "Sultan Bazaar", line: "Green" },
  { id: "mg-bus-station-green", name: "MG Bus Station", line: "Green" },
];

const getLineColor = (line: string) => {
  switch (line) {
    case "Red": return "bg-metro-red text-white";
    case "Blue": return "bg-metro-blue text-white";
    case "Green": return "bg-metro-green text-white";
    default: return "bg-secondary text-secondary-foreground";
  }
};

export default function StationSelector({
  stations = METRO_STATIONS,
  value,
  onValueChange,
  placeholder = "Search stations...",
  label,
  disabled = false
}: StationSelectorProps) {
  const [open, setOpen] = useState(false);

  const selectedStation = useMemo(
    () => stations.find((station) => station.id === value),
    [stations, value]
  );

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              "w-full justify-between h-auto min-h-[40px] px-3 py-2",
              !selectedStation && "text-muted-foreground"
            )}
          >
            <div className="flex items-center gap-2 flex-1 text-left">
              <MapPin className="h-4 w-4 shrink-0" />
              {selectedStation ? (
                <div className="flex items-center gap-2 flex-1">
                  {selectedStation.line && (
                    <Badge 
                      variant="secondary" 
                      className={cn("text-xs", getLineColor(selectedStation.line))}
                    >
                      {selectedStation.line}
                    </Badge>
                  )}
                  <span className="truncate">{selectedStation.name}</span>
                </div>
              ) : (
                <span>{placeholder}</span>
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder={placeholder} />
            <CommandList>
              <CommandEmpty>No station found.</CommandEmpty>
              <CommandGroup>
                {stations.map((station) => (
                  <CommandItem
                    key={station.id}
                    value={station.name}
                    onSelect={() => {
                      onValueChange(station.id === value ? "" : station.id);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === station.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex items-center gap-2 flex-1">
                      {station.line && (
                        <Badge 
                          variant="secondary" 
                          className={cn("text-xs", getLineColor(station.line))}
                        >
                          {station.line}
                        </Badge>
                      )}
                      <span>{station.name}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export { METRO_STATIONS };
export type { Station };