import React from "react";
import { useDrag } from "react-dnd";

const actions = [
  { name: "Store in DB", type: "store-db" },
  { name: "Mail to Participants", type: "send-mail" },
  { name: "Upload File to Drive", type: "upload-drive" },
  { name: "Send Message on Slack", type: "send-slack" },
  { name: "Add Meeting on Calendar", type: "add-meeting" },
];

export const Sidebar = () => {
  return (
    <div className="sidebar">
      <h3>Actions</h3>
      {actions.map((action) => (
        <DraggableAction key={action.type} action={action} />
      ))}
    </div>
  );
};

const DraggableAction = ({ action }) => {
  const [{ isDragging }, drag] = useDrag({
    type: "action",
    item: action,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div ref={drag} className={`action-item ${isDragging ? "dragging" : ""}`}>
      {action.name}
    </div>
  );
};

