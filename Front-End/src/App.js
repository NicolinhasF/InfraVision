
import Login from "./components/paginas/Login/Login";
import Dashboard from "./components/paginas/Dashboard/Dashboard";
import Perfil from "./components/paginas/Perfil/Perfil";
import Servidores from "./components/paginas/Servidores/Servidores";
import DetalhesServidor from "./components/paginas/DetalhesServidor/DetalhesServidor";

import { Route, Routes } from "react-router-dom";


function App() {
  return (
    <>

  
        <Routes>
         
          <Route path="/" element={<Login />} />
      
          <Route path="/home" element={<Dashboard />} />
          <Route path="/perfil" element={<Perfil />} />

          <Route path="/servidores" element={<Servidores />} />

          <Route path="/servidores/:id" element={<DetalhesServidor />} />


        </Routes>
   

    </>
  );
}

export default App;
