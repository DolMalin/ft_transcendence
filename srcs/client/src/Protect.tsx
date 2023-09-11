import axios from "axios"
import { useState, useEffect } from "react"

function Protect() {
	const [message, setMessage] = useState("Couldn't access endpoint");
  
	useEffect(() => {
	  const fetchData = async () => {
		const API = axios.create({
		  baseURL: "http://127.0.0.1:4545",
		  withCredentials: true,
		});
		try {
		  const res: any = await API.get("/auth/protected");
		  console.log(res.data);
		  setMessage(res?.data);
		} catch (err: any) {
		  if (!err?.response) {
			setMessage("no server response");
		  } else {
			setMessage("token not found or invalid");
		  }
		}
		

		
		// axios.get('http://127.0.0.1:4545/auth/protected', {
		// 	withCredentials:true,
		// 	headers: {
        //         'Content-Type': 'application/json',
        //       }
		// })


	  };


	  fetchData();
	}, []);
  
	return (
	  <div className='App'>
		<h1>Protected Route </h1>
		<p>{message}</p>
	  </div>
	);
  }

export default Protect