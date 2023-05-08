import Navbar from "./Components/Navbar/Navbar";
import Sidebar from "./Components/Sidebar/Sidebar";
import Dashboard from "./Components/Dashboard/Dashboard";
import './app.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Notfound from "./Components/NotFound/Notfound";
import CreateForm from "./Pages/CreateForm/CreateForm";
import ViewSurvey from "./Pages/ViewSurvey/ViewSurvey";

function App() {
  return (
    <div className="App">
      <Router>

        <Navbar/>

         <div style={{display:"flex"}}>
          <Sidebar/>
              <Routes>
                <Route path="/" element={<Dashboard/>} />
                <Route path="/dashboard" element={<Dashboard/>} />
                <Route path="/forms" element={<CreateForm/>} />
                <Route path="/forms/:id" element={<ViewSurvey/>} />
                <Route path="/*" element={<Notfound/>}/>
              </Routes>
          </div>
      </ Router>
      
      
    </div>
  );
}

export default App;
