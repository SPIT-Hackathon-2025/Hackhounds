// App.js
import React from 'react';
import StreamlitEmbed from './streamlit';
import RazorpayPayment from './component/Fund';
import Layout from './Layout';
import IndexPage from './IndexPage';
import {Route, Routes} from "react-router-dom";

function App() {
  return (
    <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<IndexPage />} />
          <Route path="/streamlit" element={<StreamlitEmbed />} />
          <Route path="/pay" element={<RazorpayPayment />} />
        </Route>
    </Routes>
    
  );
}

export default App;
