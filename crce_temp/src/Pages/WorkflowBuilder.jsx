import React, { useState, useCallback } from "react";
import ReactFlow, {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
} from "react-flow-renderer";
import { useDrop, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Sidebar } from "./Sidebar";
import { ConfigPanel } from "./ConfigPanel";

const initialNodes = [];
const initialEdges = [];

const WorkflowBuilder = () => {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [selectedNode, setSelectedNode] = useState(null);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    []
  );

  // Drop Handler for new node addition
  const [, dropRef] = useDrop({
    accept: "action",
    drop: (item, monitor) => {
      const offset = monitor.getSourceClientOffset();
      if (!offset) return;

      const newNode = {
        id: `${nodes.length + 1}`,
        type: "default",
        position: { x: offset.x - 200, y: offset.y - 100 },
        data: { label: item.name, type: item.type, config: {} },
      };

      setNodes((nds) => [...nds, newNode]);
    },
  });

  // Node Selection
  const onNodeClick = (event, node) => {
    setSelectedNode(node);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="workflow-container">
        {/* Sidebar */}
        <Sidebar />

        {/* Drag-and-Drop Canvas */}
        <div className="canvas" ref={dropRef}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            fitView
          />
        </div>

        {/* Configuration Panel */}
        {selectedNode && (
          <ConfigPanel
            node={selectedNode}
            updateNode={(updatedNode) =>
              setNodes((nds) =>
                nds.map((n) => (n.id === updatedNode.id ? updatedNode : n))
              )
            }
          />
        )}
      </div>
    </DndProvider>
  );
};

export default WorkflowBuilder;