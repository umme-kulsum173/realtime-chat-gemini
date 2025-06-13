import React from 'react'
import {Route,BrowserRouter,Routes} from 'react-router-dom'
import Login from "../screens/Login";
import Register from "../screens/Register";
import Home from "../screens/Home";
import Proj from "../screens/Proj";
import UserAuth from '../auth/UserAuth';

 // Correct relative path

const AppRoutes = () => {
  return (
  <BrowserRouter> 
  
  <Routes>
    <Route path ="/" element ={<UserAuth><Home/></UserAuth>}/>
    <Route path ="/login" element ={<Login />}/>
    <Route path ="/register" element ={<Register/>}/>
    <Route path="/project/:id" element={<UserAuth><Proj /></UserAuth>} />
    </Routes>

  </BrowserRouter>
  )
}

export default AppRoutes