// StreamlitEmbed.js
import React from 'react';

const StreamlitEmbed = () => {
  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
      <iframe
        src="http://localhost:8501"
        width="100%"
        height="100%"
        style={{ border: 'none' }}
        title="Streamlit App"
      />
    </div>
  );
};

export default StreamlitEmbed;
