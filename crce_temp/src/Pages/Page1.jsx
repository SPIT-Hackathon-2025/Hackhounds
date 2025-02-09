import React, { useState, useCallback } from "react";
import ReactFlow, {
  addEdge,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Handle, Position } from "reactflow";
import {
  Webhook, Database, Mail, HardDrive, MessageCircle,
  Calendar, Trello, X, Trash2, Save
} from 'lucide-react';
import axios from 'axios';

// Icon mapping for different node types
const nodeIcons = {
  "Webhook Input": Webhook,
  "Store in DB": Database,
  "Mail to Participants": Mail,
  "Upload File to Drive": HardDrive,
  "Send Message on Slack": MessageCircle,
  "Add Meeting on Calendar": Calendar,
  "Trello Node": Trello,
};

const CustomNode = ({ data, id }) => {
  const IconComponent = nodeIcons[data.label] || MessageCircle;

  const handleDelete = () => {
    data.onDelete(id);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 relative w-72 transition-all duration-200 hover:shadow-xl">
      <div className="absolute -top-3 -right-3 z-10">
        <button
          onClick={handleDelete}
          className="p-1 bg-red-500 hover:bg-red-600 rounded-full text-white shadow-lg transition-all duration-200 hover:scale-110"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-violet-500 -top-1.5" />

      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-violet-100 rounded-lg">
          <IconComponent className="text-violet-600" size={24} />
        </div>
        <div className="font-bold text-lg text-gray-800">{data.label}</div>
      </div>

      {data.inputs?.map((input, index) => (
        <div key={index} className="mb-4 group">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {input.label}
          </label>
          <div className="relative">
            <input
              type={input.type || "text"}
              placeholder={input.placeholder}
              className="w-full p-2 pl-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition-all duration-200 bg-gray-50 hover:bg-white"
              value={data.values[input.name] || ""}
              onChange={(e) => data.onInputChange(input.name, e.target.value)}
            />
          </div>
        </div>
      ))}

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-violet-500 -bottom-1.5" />
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

const SidebarItem = ({ label, type, inputs }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "node",
    item: { label, type, inputs },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const IconComponent = nodeIcons[label] || MessageCircle;

  return (
    <div
      ref={drag}
      className={`p-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg mb-3 cursor-move shadow-md transition-all duration-200 hover:shadow-lg hover:translate-x-1 ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
    >
      <div className="flex items-center gap-3">
        <IconComponent size={20} />
        <span>{label}</span>
      </div>
    </div>
  );
};

const Sidebar = () => (
  <div className="w-80 bg-gray-50 p-6 border-r border-gray-200">
    <div className="sticky top-0 bg-gray-50 pt-2 pb-4">
      <h1 className="text-2xl font-bold text-violet-800 mb-2">Flow Builder</h1>
      <p className="text-gray-600 text-sm mb-6">Drag and drop nodes to create your workflow</p>

      <h2 className="font-bold text-xl mb-6 text-gray-800 flex items-center gap-2">
        <div className="p-1 bg-violet-100 rounded">
          <Webhook size={18} className="text-violet-600" />
        </div>
        Triggers
      </h2>
    </div>

    <SidebarItem
      label="Webhook Input"
      type="custom"
      inputs={[{ label: "Webhook URL", placeholder: "https://webhook.site/...", name: "webhookUrl" }]}
    />

    <h2 className="font-bold text-xl mt-8 mb-6 text-gray-800 flex items-center gap-2">
      <div className="p-1 bg-violet-100 rounded">
        <MessageCircle size={18} className="text-violet-600" />
      </div>
      Actions
    </h2>

    <SidebarItem
      label="Store in DB"
      type="custom"
      inputs={[
        { label: "DB Connection", placeholder: "Enter connection string", name: "dbConnection" },
        { label: "Table Name", placeholder: "Enter table name", name: "tableName" },
      ]}
    />
    <SidebarItem
      label="Mail to Participants"
      type="custom"
      inputs={[]} // Remove input fields
    />
    <SidebarItem
      label="Upload File to Drive"
      type="custom"
      inputs={[]} // Remove input fields
    />
    <SidebarItem
      label="Send Message on Slack"
      type="custom"
      inputs={[
        { label: "Channel", placeholder: "Enter channel", name: "channel" },
        { label: "Message", placeholder: "Enter message", name: "slackMessage" },
      ]}
    />
    <SidebarItem
      label="Add Meeting on Calendar"
      type="custom"
      inputs={[
        { label: "Buffer Day", placeholder: "Enter buffer day", name: "bufferDay" },
        { label: "Buffer Time", placeholder: "Enter buffer time", name: "bufferTime" },
      ]}
    />
    <SidebarItem
      label="Trello Node"
      type="custom"
      inputs={[
        { label: "Board Name", placeholder: "Enter board name", name: "boardName" },
        { label: "List Name", placeholder: "Enter list name", name: "listName" },
        { label: "Card Description", placeholder: "Enter card description", name: "cardDescription" },
      ]}
    />
  </div>
);

const Flowchart = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onInputChange = useCallback((nodeId, inputName, value) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              data: {
                ...node.data,
                values: { ...node.data.values, [inputName]: value },
              },
            }
          : node
      )
    );
  }, []);

  const onDeleteNode = useCallback((nodeId) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) =>
      edge.source !== nodeId && edge.target !== nodeId
    ));
  }, [setNodes, setEdges]);

  const onDrop = useCallback(
    (item, monitor) => {
      const position = monitor.getClientOffset();
      const dropTarget = document.querySelector(".react-flow");
      const boundingRect = dropTarget.getBoundingClientRect();

      setNodes((nds) => [
        ...nds,
        {
          id: `${nds.length + 1}`,
          type: "custom",
          position: {
            x: position.x - boundingRect.left - 144,
            y: position.y - boundingRect.top - 50,
          },
          data: {
            label: item.label,
            inputs: item.inputs,
            values: {},
            onInputChange: (inputName, value) => onInputChange(`${nds.length + 1}`, inputName, value),
            onDelete: onDeleteNode,
          },
        },
      ]);
    },
    [setNodes, onInputChange, onDeleteNode]
  );

  const [{ isOver }, drop] = useDrop(() => ({
    accept: "node",
    drop: onDrop,
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const onConnect = useCallback(
    (params) => {
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: "smoothstep",
            animated: true,
            style: { stroke: "#8b5cf6", strokeWidth: 2 },
          },
          eds
        )
      );
    },
    [setEdges]
  );

  const handleSave = async () => {
    const orderedNodes = nodes.map((node, index) => ({
      ...node,
      order: index + 1,
    }));

    const workflowData = {
      trigger: orderedNodes.find(node => node.type === 'custom' && node.data.label === 'Webhook Input')?.data.values.webhookUrl || '',
      calendar: orderedNodes.filter(node => node.data.label === 'Add Meeting on Calendar').map(node => ({
        eventName: node.data.values.eventName || '',
        bufferdate: node.data.values.bufferdate || '',
        buffertime: node.data.values.buffertime || 0,
        description: node.data.values.description || '',
        order: node.order,
      })),
      mail: orderedNodes.filter(node => node.data.label === 'Mail to Participants').map(node => ({
        subject: 'Default Subject',
        message: 'Default Message',
        description: 'Default Description',
        attachment: 'default.pdf',
        csvFile: 'default.csv',
        order: node.order,
      })),
      slack: orderedNodes.filter(node => node.data.label === 'Send Message on Slack').map(node => ({
        channel: node.data.values.channel || '',
        text: node.data.values.slackMessage || '',
        order: node.order,
      })),
      createdBy: 'user-id-placeholder', // Replace with actual user ID
      createdAt: new Date(),
    };

    console.log('Saving file', workflowData);
    try {
      await axios.post('http://localhost:3000/api/save', workflowData);
      console.log('File was saved');
    } catch (error) {
      console.error('Failed to save file', error);
    }
  };

  return (
    <div className="flex-1 h-screen" ref={drop}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <MiniMap
          style={{
            backgroundColor: "#f9fafb",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
          }}
          nodeColor="#8b5cf6"
        />
        <Controls className="bg-white shadow-lg rounded-lg border border-gray-200" />
        <Background color="#8b5cf6" gap={24} size={1} variant="dots" />
      </ReactFlow>
      <button
        onClick={handleSave}
        className="fixed bottom-4 right-4 bg-violet-600 text-white p-4 rounded-full shadow-lg hover:bg-violet-700 transition-all duration-200"
      >
        <Save size={24} />
      </button>
    </div>
  );
};

const Page1 = () => (
  <DndProvider backend={HTML5Backend}>
    <div className="flex h-screen bg-white">
      <Sidebar />
      <Flowchart />
    </div>
  </DndProvider>
);

export default Page1;