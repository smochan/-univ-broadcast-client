/* eslint-disable @next/next/no-img-element */
import type { NextPage } from "next";
import React, { useState, useEffect} from "react";
import Head from "next/head";
import styles from '../../styles/Auth.module.css';
import Cookies from 'js-cookie';
import axios from 'axios'

const Signup: NextPage = () => {

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const signup = async() => {
    try{

      const regex = /^[\w-\.]+@iiitm\.ac\.in$/;
      const pattern = regex.test(email);

      if(name === '' || email === '' || password === '') {
        setError('Please fill all the fields');
        return;
      }
      if(!pattern) {
        setError('Please enter a valid institute email');
        return;
      }
      const res = await axios.post(`${process.env.API_URL}/auth/register`, {
        name, email, password
      })
      // console.log(res.data);
      if(res.data.success) {
        window.location.href = '/auth/login';
      }
      // console.log(process.env.API_URL)
    }
    catch(err:any) {
      console.log("err from err: ", err.response.data, err.response.data.error);

      if(err.response.data.error) {
        console.log("err from err: ", err.response.data.error);
        setError(err.response.data.message);
      }
    }
  }    
  const verify = async () => {
    const token = Cookies.get("token");
    const res = await axios.get(`${process.env.API_URL}/auth/verifyToken`, { headers: { Authorization: `Bearer ${token}` } });
    // console.log(res.data.success);
    if(res.data.success) {
      window.location.href = "/message";
    }
  }

  const handleKeyPress = (e:any) => {
    if(e.key === "Enter" ) {
      signup();
    }
  }

 useEffect(() => {      
    verify();
  }, []);

  return (
    <div>
      <Head>
        <title>Signup page</title>
      </Head>
      <div className={styles.container}>
      </div>
      <main className={styles.main} onKeyPress={handleKeyPress}>
        {/* <div className={styles.header}>
            <img src="https://www.iiitm.ac.in/templates/shaper_educon/images/presets/preset1/logo.png" alt="logo" />
            <img src="https://www.iiitm.ac.in/images/logo-hindi.png" alt="logo-hindi" />
        </div> */}
        <div className={styles.body1}>
          <h2>Signup</h2>
          <div className={styles.form}>
            <div className="form-floating mb-1">
              <input type="text" className={`${styles.input} form-control`} id="name" placeholder="Name" onChange={(e) => setName(e.target.value)}></input>
              <label htmlFor="name">Name</label>
            </div>
            <div className="form-floating mb-1">
              <input type="email" className="form-control" id="email" placeholder="id@iiitm.ac.in" onChange={(e) => setEmail(e.target.value)}></input>
              <label htmlFor="email" >Email address</label>
            </div>
            <div className="form-floating mb-1">
              <input type="password" className="form-control" id="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)}></input>
              <label htmlFor="password">Password</label>
            </div>
          </div>
          <div className={styles.btnContainer}>
            <p className={styles.error}>{error}</p>
            <button type="button" className={`${styles.bgPri} btn`} onClick={signup}>Signup</button>
          </div>
          <p>Already registered? <a href="/auth/login" className={styles.pri}> Login</a></p>
        </div>
      </main>
    </div>
  );
};

export default Signup;
