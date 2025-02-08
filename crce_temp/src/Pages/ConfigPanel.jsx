import React, { useState } from "react";

export const ConfigPanel = ({ node, updateNode }) => {
  const [config, setConfig] = useState(node.data.config || {});

  const handleChange = (e) => {
    setConfig({ ...config, [e.target.name]: e.target.value });
  };

  const saveConfig = () => {
    updateNode({ ...node, data: { ...node.data, config } });
  };

  return (
    <div className="config-panel">
      <h3>Configure: {node.data.label}</h3>

      {node.data.type === "store-db" && (
        <>
          <label>Collection Name</label>
          <input name="collection" onChange={handleChange} value={config.collection || ""} />
        </>
      )}

      {node.data.type === "send-mail" && (
        <>
          <label>Recipients</label>
          <input name="recipients" onChange={handleChange} value={config.recipients || ""} />
          <label>Subject</label>
          <input name="subject" onChange={handleChange} value={config.subject || ""} />
        </>
      )}

      {node.data.type === "upload-drive" && (
        <>
          <label>Folder ID</label>
          <input name="folderId" onChange={handleChange} value={config.folderId || ""} />
        </>
      )}

      <button onClick={saveConfig}>Save</button>
    </div>
  );
};
