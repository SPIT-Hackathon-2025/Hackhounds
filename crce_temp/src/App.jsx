// App.js
import React from 'react';
import StreamlitEmbed from './streamlit';
import RazorpayPayment from './component/Fund';
import Layout from './Layout';
import IndexPage from './IndexPage';
import SignUp from './SignUp';
import Login from './Login';
import Page1 from './Pages/Page1';
import Page2 from './Pages/Page2';
import Purchase from './Pages/Purchase';
import {Route, Routes} from "react-router-dom";
import Task from './Pages/Task';

function App() {
  return (
    <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<IndexPage />} />
          <Route path="/page1" element={<Page1/>}/>
          <Route path="/page2" element={<Page2/>}/>
          <Route path="/purchase" element={<Purchase/>}/>
           <Route path="/login" element={<Login/>} />
           <Route path="/signup" element={<SignUp/>} />
          <Route path="/streamlit" element={<StreamlitEmbed />} />
          <Route path="/pay" element={<RazorpayPayment />} />
          <Route path="/tasks" element={<Task />} />
        </Route>
    </Routes>





  );
}

export default App;
