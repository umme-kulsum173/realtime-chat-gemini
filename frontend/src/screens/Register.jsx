import React,{ useState} from "react";
import { motion } from "framer-motion";
import {Link,useNavigate} from 'react-router-dom';
import axios from "../config/axios";

const Register = () => {


      const [email,setEmail] = useState('')
      const [password,setPassword] = useState('')


      const navigate = useNavigate()

    function submitHandler(e){

      e.preventDefault ()

      axios.post('/users/register',{
            email,
            password
        }).then((res) => {
            console.log(res.data)
            navigate('/')
        }).catch((err) => {
           console.log(err.response.data)
        })
    }



  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <motion.div
        className="bg-white text-gray-900 p-6 rounded-2xl shadow-2xl w-96"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Title with cursive and glow effect */}
        <h2
          className="text-3xl font-bold mb-4 text-center italic"
          style={{
            fontFamily: "'Pacifico', cursive",
            color: "blue",
            textShadow: "2px 2px 10px #4c00ff",
          }}
        >
         Register
        </h2>

        <form
        onSubmit={submitHandler}
        className="space-y-4">
          <input
          onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Email"
            className="w-full p-3 bg-gray-100 text-gray-800 rounded-lg border border-blue-500 focus:ring-2 focus:ring-purple-400 outline-none"
          />
          <input
           onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            className="w-full p-3 bg-gray-100 text-gray-800 rounded-lg border border-blue-500 focus:ring-2 focus:ring-purple-400 outline-none"
          />
          <button
            type="submit"
            className="w-full bg-blue-800 hover:bg-blue-500 p-3 rounded-lg text-white font-semibold transition"
          >
            Submit
          </button>
        </form>

        {/* Don't have an account section */}
        <p className="text-center mt-4 text-gray-600">
          Already have an account?{" "}
          <a href="/login" className="text-blue-500 hover:underline">
           Login
          </a>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;