// App.js
import React from 'react';
import StreamlitEmbed from './streamlit';
import SignUp from './SignUp';
import Login from './Login';


function App() {
  return (
    <div className="App">
      <h1>My React App </h1>
      <SignUp/>
      <Login/>
    </div>
  );
}

export default App;
