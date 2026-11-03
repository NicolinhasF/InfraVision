
import Login from "./components/paginas/Login/Login";
import Dashboard from "./components/paginas/Dashboard/Dashboard";
import Perfil from "./components/paginas/Perfil/Perfil";
import Servidores from "./components/paginas/Servidores/Servidores";
import DetalhesServidor from "./components/paginas/DetalhesServidor/DetalhesServidor";
<<<<<<< HEAD:Front-End/src/App.js
import Infraestrutura from "./components/paginas/Infraestrutura/Infraestrutura";
=======
import Analises from "./components/paginas/Analises/Analises";
import Previsoes from "./components/paginas/Previsoes/Previsoes";
>>>>>>> 4ba1c5763bd39e4d64a9ff5bb3b6743abc15ca49:Front-End-Infravision/Front-End/src/App.js

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
          <Route path="/analises" element={<Analises />} />
          <Route path="/previsoes" element={<Previsoes />} />

          <Route path="/infraestrutura" element={<Infraestrutura />} />


        </Routes>
   

    </>
  );
}

export default App;
