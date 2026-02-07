import { useEffect, useRef, useState } from "react";
import { Node, Edge } from "@/utils/pathfinding";
import { MapPin, Navigation, Flag } from "lucide-react";

interface StationMapProps {
  nodes: Node[];
  edges: Edge[];
  selectedPath?: string[];
  onNodeClick?: (nodeId: string) => void;
  highlightedNode?: string;
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

const FACILITY_COLORS: Record<string, string> = {
  entry: "#3E8E3E",
  exit: "#D92D2D",
  platform: "#1A72B8",
  washroom: "#9333EA",
  ticket: "#F59E0B",
  food: "#EC4899",
  shop: "#10B981",
  parking: "#6366F1",
  facility: "#8B5CF6"
};

export default function StationMap({
  nodes,
  edges,
  selectedPath = [],
  onNodeClick,
  highlightedNode
}: StationMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    drawMap();
  }, [nodes, edges, selectedPath, highlightedNode, scale, offset]);

  const drawMap = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    // Apply transformations
    ctx.translate(offset.x, offset.y);
    ctx.scale(scale, scale);

    // Draw edges
    ctx.strokeStyle = "#CBD5E1";
    ctx.lineWidth = 2;
    edges.forEach(edge => {
      const from = nodes.find(n => n.id === edge.from);
      const to = nodes.find(n => n.id === edge.to);
      if (!from || !to) return;

      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    });

    // Draw selected path
    if (selectedPath.length > 1) {
      ctx.strokeStyle = "#1A72B8";
      ctx.lineWidth = 4;
      ctx.setLineDash([]);
      
      for (let i = 0; i < selectedPath.length - 1; i++) {
        const from = nodes.find(n => n.id === selectedPath[i]);
        const to = nodes.find(n => n.id === selectedPath[i + 1]);
        if (!from || !to) continue;

        const gradient = ctx.createLinearGradient(from.x, from.y, to.x, to.y);
        gradient.addColorStop(0, "#1A72B8");
        gradient.addColorStop(1, "#3E8E3E");
        ctx.strokeStyle = gradient;

        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();

        // Draw arrow
        drawArrow(ctx, from.x, from.y, to.x, to.y);
      }
    }

    // Draw nodes
    nodes.forEach(node => {
      const isInPath = selectedPath.includes(node.id);
      const isHighlighted = node.id === highlightedNode;
      const isStart = selectedPath[0] === node.id;
      const isEnd = selectedPath[selectedPath.length - 1] === node.id;

      // Node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, isInPath || isHighlighted ? 18 : 14, 0, Math.PI * 2);
      
      if (isStart) {
        ctx.fillStyle = "#3E8E3E";
      } else if (isEnd) {
        ctx.fillStyle = "#D92D2D";
      } else if (isHighlighted) {
        ctx.fillStyle = "#F59E0B";
      } else {
        ctx.fillStyle = FACILITY_COLORS[node.type] || "#64748B";
      }
      
      ctx.fill();

      if (isInPath || isHighlighted) {
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Draw icon
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "16px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(FACILITY_ICONS[node.type] || "📍", node.x, node.y);

      // Draw label
      if (isInPath || isHighlighted) {
        ctx.fillStyle = "#1E293B";
        ctx.font = "bold 12px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(node.name, node.x, node.y - 28);
      }
    });

    ctx.restore();
  };

  const drawArrow = (ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number) => {
    const headLength = 10;
    const angle = Math.atan2(toY - fromY, toX - fromX);

    ctx.beginPath();
    ctx.moveTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX, toY);
    ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
    ctx.strokeStyle = "#1A72B8";
    ctx.lineWidth = 3;
    ctx.stroke();
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onNodeClick) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - offset.x) / scale;
    const y = (e.clientY - rect.top - offset.y) / scale;

    // Find clicked node
    const clickedNode = nodes.find(node => {
      const distance = Math.sqrt(Math.pow(node.x - x, 2) + Math.pow(node.y - y, 2));
      return distance < 20;
    });

    if (clickedNode) {
      onNodeClick(clickedNode.id);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prev => Math.max(0.5, Math.min(3, prev * delta)));
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg overflow-hidden border-2 border-slate-200">
      <canvas
        ref={canvasRef}
        width={600}
        height={450}
        className="w-full h-full cursor-move"
        onClick={handleCanvasClick}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      
      <div className="absolute bottom-4 right-4 flex gap-2 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
        <button
          onClick={() => setScale(prev => Math.min(3, prev * 1.2))}
          className="px-3 py-1 bg-metro-blue text-white rounded hover:bg-metro-blue/90 transition-colors text-sm font-medium"
        >
          +
        </button>
        <button
          onClick={() => setScale(prev => Math.max(0.5, prev / 1.2))}
          className="px-3 py-1 bg-metro-blue text-white rounded hover:bg-metro-blue/90 transition-colors text-sm font-medium"
        >
          −
        </button>
        <button
          onClick={() => { setScale(1); setOffset({ x: 0, y: 0 }); }}
          className="px-3 py-1 bg-metro-green text-white rounded hover:bg-metro-green/90 transition-colors text-sm font-medium"
        >
          Reset
        </button>
      </div>

      {selectedPath.length > 0 && (
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <Navigation className="h-4 w-4 text-metro-blue" />
            <span>Navigation Active</span>
          </div>
        </div>
      )}
    </div>
  );
}
