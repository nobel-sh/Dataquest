import Navbar from "./Components/Navbar/Navbar";
import Sidebar from "./Components/Sidebar/Sidebar";
import Dashboard from "./Components/Dashboard/Dashboard";
import './app.css'
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Notfound from "./Components/NotFound/Notfound";
import CreateForm from "./Pages/CreateForm/CreateForm";
import ViewSurvey from "./Pages/ViewSurvey/ViewSurvey";
import Results from "./Pages/Results/Results";
import Login from "./Pages/Login/Login";
import { Signup } from "./Pages/Signup/Signup";
import { RequireAuth } from "react-auth-kit";
import { useState } from "react";

function App() {
  const [showNav,setShowNav] = useState(false);


  return (
    <div className="App">
      <Router>
       {window.location.pathname!='/login'&& window.location.pathname!='/signup' && <Navbar/>}

         <div style={{display:"flex"}}>
         {window.location.pathname!='/login'&& window.location.pathname!='/signup' && <Sidebar/>}

              <Routes>
                <Route path="/" element={
                    <RequireAuth loginPath="/login">
                    <Dashboard/>
                    </RequireAuth>} 
                  />
                <Route path="/dashboard" element={
                  <RequireAuth loginPath="/login">
                  <Dashboard/>
                  </RequireAuth>}
                />
                <Route path="/forms" element={
                  <RequireAuth loginPath="/login">
                  <CreateForm/>
                  </RequireAuth>} 
                />
                <Route path="/forms/:id" element={
                  <RequireAuth loginPath="/login">
                  <ViewSurvey/>
                  </RequireAuth>} 
                />
                <Route path="/results/:id" element={
                  <RequireAuth loginPath="/login">
                  <Results/>
                  </RequireAuth>} 
                />
                <Route path='/login' element={<Login/>}/>
                <Route path='/signup' element={<Signup/>}/>
                <Route path="/*" element={<Notfound/>}/>
              </Routes>
          </div>
      </ Router>
      
      
    </div>
  );
}

export default App;
