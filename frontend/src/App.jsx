import { useState } from 'react'
import './App.css'
import { useEffect } from 'react';

function App() {
const [status,setStatus]=useState("");

useEffect(()=>{
  fetch(import.meta.env.VITE_API_URL+"/api/health")
    .then(response => response.json())
    .then(data => setStatus(data))
    .catch(error => setStatus("Error fetching status"));
},[])
  return (
    <>
      <div>
        <h1>Bus Pass Management System</h1>
        <p>Welcome to the Bus Pass Management System frontend!</p>
        <p>{status.status}</p>
        <p>{status.message}</p>
      </div>
    </>
  )
}

export default App
