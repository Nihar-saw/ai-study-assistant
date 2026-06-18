import { useEffect, useState, useRef } from "react";
import API from "../../api/axios";
import toast from "react-hot-toast";

const MindMapBox = ({ pdfId }) => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [loading, setLoading] = useState(true);

  // Custom canvas transform
  const [transform, setTransform] = useState({ x: 50, y: 30, scale: 0.85 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [activeDragNode, setActiveDragNode] = useState(null);
  const [nodeOffsets, setNodeOffsets] = useState({});

  const containerRef = useRef(null);

  useEffect(() => {
    const fetchMindMap = async () => {
      setLoading(true);
      try {
        const { data } = await API.get(`/mindmap/${pdfId}`);
        const mm = data.mindmap || data;
        setNodes(mm.nodes || []);
        setEdges(mm.edges || []);
        setNodeOffsets({}); // reset offsets
        if (data.gamification) {
          toast.success("AI Mind Map generated! +40 XP");
        }
      } catch (error) {
        toast.error("Failed to load or generate concept mind map");
      } finally {
        setLoading(false);
      }
    };

    if (pdfId) fetchMindMap();
  }, [pdfId]);

  // Auto-center map when nodes load
  useEffect(() => {
    if (containerRef.current && nodes.length > 0) {
      const rect = containerRef.current.getBoundingClientRect();
      // Center based on coordinate x=470
      setTransform({
        x: Math.round(rect.width / 2 - 470),
        y: 40,
        scale: 0.9
      });
    }
  }, [nodes]);

  const handleMouseDown = (e) => {
    // If we click on a node or button, don't pan canvas
    if (e.target.closest('.mindmap-node')) return;
    setIsDraggingCanvas(true);
    setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
  };

  const handleMouseMove = (e) => {
    if (activeDragNode) {
      // Node dragging
      const dx = (e.clientX - dragStart.x) / transform.scale;
      const dy = (e.clientY - dragStart.y) / transform.scale;
      setNodeOffsets(prev => ({
        ...prev,
        [activeDragNode]: { x: dx, y: dy }
      }));
      return;
    }

    if (isDraggingCanvas) {
      // Canvas panning
      setTransform(prev => ({
        ...prev,
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      }));
    }
  };

  const handleMouseUp = () => {
    setIsDraggingCanvas(false);
    setActiveDragNode(null);
  };

  const handleWheel = (e) => {
    // Zoom canvas
    const zoomFactor = 0.05;
    const nextScale = e.deltaY < 0 
      ? Math.min(transform.scale + zoomFactor, 1.8) 
      : Math.max(transform.scale - zoomFactor, 0.4);
    
    // Zoom towards center of container
    setTransform(prev => ({
      ...prev,
      scale: nextScale
    }));
  };

  const handleNodeMouseDown = (e, nodeId) => {
    e.stopPropagation();
    setActiveDragNode(nodeId);
    const offset = nodeOffsets[nodeId] || { x: 0, y: 0 };
    setDragStart({
      x: e.clientX - offset.x * transform.scale,
      y: e.clientY - offset.y * transform.scale
    });
  };

  const getNodeCoords = (nodeId) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };
    const offset = nodeOffsets[nodeId] || { x: 0, y: 0 };
    return {
      x: node.position.x + offset.x,
      y: node.position.y + offset.y
    };
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[300px]">
        <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-bold text-gray-400 animate-pulse uppercase tracking-widest">
          Structuring Concept Nodes...
        </p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      className="flex-grow w-full h-[500px] border border-gray-100 rounded-2xl overflow-hidden bg-gray-50/30 relative select-none cursor-grab active:cursor-grabbing"
    >
      <style>{`
        @keyframes mindmap-dash {
          to {
            stroke-dashoffset: -40;
          }
        }
        .mindmap-node {
          position: absolute;
          user-select: none;
          cursor: grab;
          transition: box-shadow 0.15s ease;
        }
        .mindmap-node:active {
          cursor: grabbing;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.15) !important;
        }
      `}</style>

      {/* Grid Pattern Background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(#000 1.5px, transparent 1.5px)',
          backgroundSize: '16px 16px',
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          transformOrigin: '0 0'
        }}
      />

      {/* Transform Group */}
      <div
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          transformOrigin: "0 0",
          width: "100%",
          height: "100%",
          position: "absolute"
        }}
      >
        {/* SVG Edges Overlay */}
        <svg 
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: "2000px",
            height: "2000px",
            overflow: "visible",
            pointerEvents: "none"
          }}
        >
          {edges.map((edge) => {
            const src = getNodeCoords(edge.source);
            const tgt = getNodeCoords(edge.target);
            if (!src || !tgt) return null;

            const startX = src.x + 70;
            const startY = src.y + 20;
            const endX = tgt.x + 70;
            const endY = tgt.y + 20;

            // Draw a smooth bezier curve vertical hierarchy path
            const midY = (startY + endY) / 2;
            const pathData = `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`;

            return (
              <path
                key={edge.id}
                d={pathData}
                fill="none"
                stroke={edge.style?.stroke || "#94a3b8"}
                strokeWidth={edge.style?.strokeWidth || 2}
                strokeDasharray={edge.animated ? "6,6" : "none"}
                style={{
                  animation: edge.animated ? "mindmap-dash 1.5s linear infinite" : "none"
                }}
              />
            );
          })}
        </svg>

        {/* HTML Nodes */}
        {nodes.map((node) => {
          const coords = getNodeCoords(node.id);
          const style = node.style || {};

          return (
            <div
              key={node.id}
              className="mindmap-node px-3 py-2 text-center rounded-xl font-medium shadow-md transition-shadow select-none"
              onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
              style={{
                left: coords.x,
                top: coords.y,
                width: style.width || 140,
                background: style.background || "#ffffff",
                color: style.color || "#1f2937",
                border: style.border || "1px solid #e2e8f0",
                borderRadius: style.borderRadius || "12px",
                fontWeight: style.fontWeight || "500",
                fontSize: style.fontSize || "12px",
                boxShadow: style.boxShadow || "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                textAlign: style.textAlign || "center",
                zIndex: activeDragNode === node.id ? 50 : 10
              }}
            >
              {node.data?.label}
            </div>
          );
        })}
      </div>

      {/* Tip & Controls */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-gray-100 text-[10px] font-semibold text-gray-500 shadow-sm pointer-events-none flex items-center gap-2">
        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping" />
        Tip: Drag nodes to rearrange or scroll to zoom/drag canvas to pan
      </div>

      {/* Reset Zoom Control */}
      <button 
        onClick={() => {
          if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setTransform({
              x: Math.round(rect.width / 2 - 470),
              y: 40,
              scale: 0.9
            });
            setNodeOffsets({});
          }
        }}
        className="absolute bottom-4 right-4 bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition-all"
      >
        Reset View
      </button>
    </div>
  );
};

export default MindMapBox;
