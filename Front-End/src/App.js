
import Login from "./components/paginas/Login/Login";
import Dashboard from "./components/paginas/Dashboard/Dashboard";

import { Route, Routes } from "react-router-dom";


function App() {
  return (
    <>

  
        <Routes>
         
          <Route path="/" element={<Login />} />
      
          <Route path="/home" element={<Dashboard />} />


        </Routes>
   

    </>
  );
}

export default App;

