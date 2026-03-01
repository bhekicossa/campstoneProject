// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";               // default export ✅
import Register from "./pages/Register";         // default export ✅
import ListingDetails from "./pages/ListingDetails"; // default export ✅
import Dashboard from "./pages/Dashboard";       // default export ✅
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AuthProvider from "./context/AuthContext"; // ✅ no curly braces

import "./App.css";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="App">
          <Navbar />
          <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/listing/:id" element={<ListingDetails />} />
          <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;