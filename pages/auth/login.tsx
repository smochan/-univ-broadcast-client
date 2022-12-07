/* eslint-disable @next/next/no-img-element */
import type { NextPage } from "next";
import React, { useState, useEffect} from "react";
import Head from "next/head";
import styles from '../../styles/Auth.module.css'
import axios from 'axios'
import Cookies from 'js-cookie'

const Login: NextPage = () => {

   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [error, setError] = useState('');

   const login = async () => {
    try{

      const regex = /^[\w-\.]+@iiitm\.ac\.in$/;
      const pattern = regex.test(email);

      if(email === '' || password === '') {
        setError('Please fill all the fields');
        return;
      }
      if(!pattern) {
        setError('Please enter a valid institute email');
        return;
      }

      const res = await axios.post(`${process.env.API_URL}/auth/login`, {
         email, password
      })
      await Cookies.set('token', res.data.data.token);

      if(res.data.success) {
        window.location.href = '/message';
      }
    }
    catch(err:any) {

      if(err.response.data?.error) {
        setError(err.response.data.message);
      }
    }
   }

  return (
    <div>
      <Head>
        <title>Login page</title>
      </Head>
      <div className={styles.container}>
      </div>
      <main className={styles.main}>
        {/* <div className={styles.header}>
            <img src="https://www.iiitm.ac.in/templates/shaper_educon/images/presets/preset1/logo.png" alt="logo" />
            <img src="https://www.iiitm.ac.in/images/logo-hindi.png" alt="logo-hindi" />
        </div> */}
        <div className={styles.body1}>
          <h2>Login</h2>
          <div className={styles.form}>
            <div className="form-floating mb-1">
              <input type="email" className="form-control" id="email" placeholder="id@iiitm.ac.in" onChange={(e) => setEmail(e.target.value)}></input>
              <label htmlFor="email">Email address</label>
            </div>
            <div className="form-floating mb-1">
              <input type="password" className="form-control" id="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)}></input>
              <label htmlFor="password">Password</label>
            </div>
          </div>
          
          <div className={styles.btnContainer}>
            <p className={styles.error}>{error}</p>
            <button type="button" className={`${styles.bgPri} btn`} onClick={login}>Login</button>
          </div>
          <p>New here? <a href="/auth/signup" className={styles.pri}> Register</a></p>
        </div>
      </main>
    </div>
  );
};

export default Login;