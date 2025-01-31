import './styles/App.css';
import {React} from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import 'firebase/compat/storage';
import AdminLogin from './admin/AdminLogin.js';
import AdminPage from './admin/AdminPage.js';
import HomePage from './homepage/HomePage.js';
import WatchPage from './watchpage/WatchPage.js';

const App = () => {
  return (
    <>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />}/>
            <Route path="/:id" element={<WatchPage />}/>
            <Route path="/admin" element={<AdminLogin />}/>
            <Route path="/myfilms" element={<AdminPage />}/>
          </Routes>
        </BrowserRouter>
    </>
  )
};

export default App;