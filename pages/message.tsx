/* eslint-disable @next/next/no-img-element */
import type { NextPage } from "next";
import React, {useEffect, useState} from "react";
import Head from "next/head";
import axios from 'axios';
import Cookies from 'js-cookie';
import { io } from "socket.io-client";
import styles from '../styles/Message.module.scss'
import Box from "../components/Box";

const socket = io("http://localhost:8000");

interface IBox {
   _id: string;
   message: string;
   createdAt: string;
   sender: {
      name: string;
   }
   reactions: [{
      userId: string;
      reaction: string;
   }]
}
interface IUser{
   _id: string;
   name: string;
   email: string;
   role: string;
   active: boolean;
}

const Message: NextPage = () => {

   // const broadcast = () => {
   //     console.log("Broadcasting");
   // }
   const [user, setUser] = useState<IUser>();
   const [mesg, setMsg] = useState<IBox[]>([]);
   const [broadcastMsg, setBroadcastMsg] = useState("");

   const emitMessage = () => {
      socket.emit("chat message", broadcastMsg, user?._id, user?.name);
      setBroadcastMsg("");
   }
   const handleKeyPress = (e:any) => {
      if(e.key === "Enter" ) {
         emitMessage();
         setBroadcastMsg("");
      }
   }
   const fetchMsg = async () => {
      const token = Cookies.get("token");
      if (!token) {
         window.location.href = "auth/login";
      }
      const res = await axios.get(`${process.env.API_URL}/messages`, { headers: {
      Authorization: `Bearer ${token}`
      } });
      const data = res.data.data.messages;
      console.log(data);
      setMsg(data);
      setUser(res.data.data.user);
   }
   
   // useEffect( () => {
   //    fetchMsg();
      
   // },[]);

   useEffect(() => {
      fetchMsg();
      socket.on("chat message", function(msg){
         // console.log("Message: ", msg);
         // setMsg(mesg => [...mesg, msg]);

         // console.log(mesg)
         fetchMsg();
      });
      return () => {
         socket.off("chat message");
         console.log(mesg);
      }
   }, []);
   
   return (
      <div className={`${styles.cont} d-flex justify-content-center`}>
         <Head>
            <title>Messages</title>
         </Head>
         <div className={styles.container}>
         </div>
         <main className={styles.main}>
            <div className={styles.header}>
               <img src="https://www.iiitm.ac.in//images/demo/login-logo.png" alt="logo" width={40}/>
               <a href="/dashboard">Dashboard</a>
            </div>
            <div className={styles.message}>
               {
                  mesg?
                  mesg.map((msg, index) => {
                     let like = 0;
                     let dislike = 0;
                     let msgLike = "";
                     for(let i=0; i<msg.reactions?.length; i++){
                        if(msg.reactions[i].userId === user?._id) msgLike = msg.reactions[i].reaction;
                        if(msg.reactions[i].reaction === "like"){
                           like++;
                        }
                        else{
                           dislike++;
                        }
                     }
                     return <Box msgId={msg._id} msg={msg.message} author={msg.sender.name} time={msg.createdAt} key={msg._id} like={msgLike} likeCount={like} dislikeCount={dislike}/>
                  })
                  : <p>Loading.......</p>
               }
            </div>
            <div className={styles.newMsg}>
               <div className="form-floating mb-1">
                  <input type="text" className="form-control" id="msg" placeholder="broadcast your message" value={broadcastMsg} onKeyPress={handleKeyPress} onChange={(e) => setBroadcastMsg(e.target.value)}></input>
                  <label htmlFor="msg">Type message to broadcast</label>
               </div>
               <button type="button" className={`${styles.bgPri} btn`} onClick={emitMessage} >Broadcast</button>
            </div>
         </main>
      </div>
   );
};

// export const getStaticProps = async () => {

//    const token = Cookies.get("token");
//    console.log(token, process.env.API_URL);
//    const res = await axios.get(`http://localhost:8080/messages`, { headers: {
//       Authorization: `Bearer ${token}`
//    } });
//    const data = res.data;
//    return {
//       props: {
//          BroadcastData: data
//       }
//    }
// }

export default Message;