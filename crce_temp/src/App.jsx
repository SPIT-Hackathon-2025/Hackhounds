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
import Profiles from './Pages/Profiles';
import WorkFlowMaker from './Pages/WorkFlowMaker';
import {Route, Routes} from "react-router-dom";
import FileUpload from './Pages/Drive';
import EmailForm from './Pages/Email';
import Task from './Pages/Task';
import TemplateDashboard from './Pages/Template';
import NotesApp from './Pages/Notes';
import Query from './Pages/Query';
function App() {
  return (
    <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<IndexPage />} />
          <Route path="/page1" element={<Page1/>}/>
          <Route path="/page2" element={<Page2/>}/>
          <Route path="/purchase" element={<Purchase/>}/>
          <Route path="/profile" element={<Profiles/>}/>
          <Route path="/workflow/:id" element={<WorkFlowMaker />} />
           <Route path="/login" element={<Login/>} />
           <Route path="/notes" element={<NotesApp/>} />

           <Route path="/template" element={<TemplateDashboard/>} />
           <Route path="/signup" element={<SignUp/>} />
          <Route path="/streamlit" element={<StreamlitEmbed />} />
          <Route path="/pay" element={<RazorpayPayment />} />
          <Route path="/test" element={<FileUpload/>} />
          <Route path="/email" element={<EmailForm/>} />
          <Route path="*" element={<h1>Not Found</h1>} />
          <Route path="/tasks" element={<Task />} />
          <Route path="/ai-prompt" element={<Query />} />
        </Route>
    </Routes>





  );
}

export default App;
