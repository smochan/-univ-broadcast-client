/* eslint-disable @next/next/no-img-element */
import type { NextPage } from "next";
import React, {useEffect, useState, useMemo} from "react";
import Head from "next/head";
import axios from 'axios';
import Cookies from 'js-cookie';
import { io } from "socket.io-client";
import styles from '../styles/Message.module.scss'
import Box from "../components/Box";

const socket = io("http://localhost:8080");

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
   replies: number;
   setReplies: any;
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
   const [msg, setMsg] = useState<IBox[]>([]);
   const [broadcastMsg, setBroadcastMsg] = useState("");
   const [replies, setReplies] = useState({state: false, id: ""});
   const [modalClass, setModalClass] = useState(styles.modal + " " + styles.hide);

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
   
   const fetchReply = async () => {      
      const token = Cookies.get("token");
      if (!token) {
         window.location.href = "auth/login";
      }
      const res = await axios.get(`${process.env.API_URL}/reply/${replies.id}`, { headers: {
         Authorization: `Bearer ${token}`
         } });

      console.log(res.data.data.reply);
   }

   useEffect( ()  => {
      // console.log("Replies: ", replies);
      if( replies.state) {
         setModalClass(styles.modal);
      }
      fetchReply();
   },[replies]);

   useEffect(() => {
      fetchMsg();
      socket.on("chat message", function(mess){
         // console.log("Message: ", mess?.newBroadcast);
         setMsg(msg => [mess?.newBroadcast, ...msg]);

         console.log(msg);
         // fetchMsg();
      });
      return () => {
         socket.off("chat message");
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
                  msg?
                  msg.map((mess, index) => {
                     let like = 0;
                     let dislike = 0;
                     let msgLike = "";
                     for(let i=0; i<mess.reactions?.length; i++){
                        if(mess.reactions[i].userId === user?._id) msgLike = mess.reactions[i].reaction;
                        if(mess.reactions[i].reaction === "like"){
                           like++;
                        }
                        else{
                           dislike++;
                        }
                     }

                     const createdAt = new Date(mess.createdAt);
                     return <Box msgId={mess._id} msg={mess.message} author={mess.sender.name} time={createdAt.toString('YYYY-MM-dd')} key={mess._id} like={msgLike} likeCount={like} dislikeCount={dislike} replies={mess.replies} setReplies={setReplies}/>
                  })
                  : <p>Loading.......</p>
               }
            </div>
            <div className={modalClass}>
               {/* <Box msgId={mess._id} msg={mess.message} author={mess.sender.name} time={createdAt.toString('YYYY-MM-dd')} key={mess._id} like={msgLike} likeCount={like} dislikeCount={dislike} replies={mess.replies} setReplies={setReplies}/> */}
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

export default Message;