import { useState } from "react";
import { Search, MapPin, X } from "lucide-react";
import { Node } from "@/utils/pathfinding";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FacilitySearchProps {
  nodes: Node[];
  onSelectNode: (nodeId: string) => void;
  selectedNodeId?: string;
}

const FACILITY_ICONS: Record<string, string> = {
  entry: "🚪",
  exit: "🚶",
  platform: "🚇",
  washroom: "🚻",
  ticket: "🎫",
  food: "🍽️",
  shop: "🛍️",
  parking: "🅿️",
  facility: "ℹ️"
};

const FACILITY_LABELS: Record<string, string> = {
  entry: "Entry",
  exit: "Exit",
  platform: "Platform",
  washroom: "Washroom",
  ticket: "Ticket",
  food: "Food",
  shop: "Shop",
  parking: "Parking",
  facility: "Facility"
};

export default function FacilitySearch({
  nodes,
  onSelectNode,
  selectedNodeId
}: FacilitySearchProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredNodes = nodes.filter(node =>
    node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    node.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedNodes = filteredNodes.reduce((acc, node) => {
    if (!acc[node.type]) acc[node.type] = [];
    acc[node.type].push(node);
    return acc;
  }, {} as Record<string, Node[]>);

  return (
    <div className="h-full flex flex-col bg-white rounded-lg shadow-lg border border-slate-200">
      <div className="p-4 border-b border-slate-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search facilities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        {Object.entries(groupedNodes).map(([type, typeNodes]) => (
          <div key={type} className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{FACILITY_ICONS[type]}</span>
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
                {FACILITY_LABELS[type] || type}
              </h3>
              <Badge variant="secondary" className="ml-auto text-xs">
                {typeNodes.length}
              </Badge>
            </div>
            <div className="space-y-2">
              {typeNodes.map(node => (
                <button
                  key={node.id}
                  onClick={() => onSelectNode(node.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                    selectedNodeId === node.id
                      ? "bg-metro-blue text-white shadow-md scale-[1.02]"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <MapPin className={`h-4 w-4 ${selectedNodeId === node.id ? "text-white" : "text-metro-blue"}`} />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{node.name}</div>
                      <div className={`text-xs ${selectedNodeId === node.id ? "text-white/80" : "text-slate-500"}`}>
                        {node.floor} Floor
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}

        {filteredNodes.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No facilities found</p>
            <p className="text-slate-400 text-sm mt-1">Try a different search term</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
