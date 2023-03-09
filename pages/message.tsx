/* eslint-disable @next/next/no-img-element */
import type { NextPage } from "next";
import React, {useEffect, useState, useMemo} from "react";
import Head from "next/head";
import axios from 'axios';
import Cookies from 'js-cookie';
import { io } from "socket.io-client";
import styles from '../styles/Message.module.scss'
import Box from "../components/Box";
import Modal from 'react-modal';


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
const customStyles = {
   content: {
     top: '8%',
     left: '30%',
     right: 'auto',
   //   bottom: 'auto',
     width: '40%',
     padding: '0',
   //   marginRight: '-50%',
   //   transform: 'translate(-50%, -50%)',
   },
 };
 

const Message: NextPage = () => {

   // const broadcast = () => {
   //     console.log("Broadcasting");
   // }
   const [user, setUser] = useState<IUser>();
   const [msg, setMsg] = useState<IBox[]>([]);
   const [broadcastMsg, setBroadcastMsg] = useState("");
   const [replyMsg, setReplyMsg] = useState("");
   const [replies, setReplies] = useState({state: false, id: "", message: "", sender: "", createdAt: "", reply: []});
   // const [modalClass, setModalClass] = useState(styles.modal + " " + styles.hide);
   const [modalIsOpen, setIsOpen] = useState(false);
   // let reply: any;
   
   const openModal = () => {
      setIsOpen(true);
   }
   const closeModal = () => {
      setIsOpen(false);
   }  
   function afterOpenModal() {
      // references are now sync'd and can be accessed.
      // subtitle?.style.color = '#f00';
    }
  


   const emitMessage = () => {
      socket.emit("chat message", broadcastMsg, user?._id, user?.name);
      setBroadcastMsg("");
   }
   const emitReply = (msg: any) => {
      socket.emit("reply message", msg);
   }
   const handleKeyPress = (e:any) => {
      if(e.key === "Enter" ) {
         emitMessage();
         setBroadcastMsg("");
      }
   }
   const handleReplyKeyPress = async(e:any) => {
      try{
         if(e.key === "Enter" ) {
            // console.log("Reply: ", replyMsg);
            // emitReply();
            await axios.post(`${process.env.API_URL}/reply/add`, {message: replyMsg, messageId: replies.id}, { headers: { Authorization: `Bearer ${Cookies.get("token")}` } });
            setReplyMsg("");

            // let newReplies = replies;
            // console.log(user);

            // newReplies.reply.push({message: replyMsg, sender:{ name: user?.name}, createdAt: new Date()});
            // console.log(newReplies.reply[newReplies.reply.length - 1]);
            // emitReply(newReplies.reply[newReplies.reply.length - 1]);
            // console.log(newReplies.reply);
            // setReplies(newReplies);
            emitReply({message: replyMsg, sender:{ name: user?.name}, createdAt: new Date() });
         }
      }
      catch(err){
         console.log(err);
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
      // console.log(data);
      setMsg(data);
      setUser(res.data.data.user);
   }
   
   // const fetchReply = async () => {      
   //    const token = Cookies.get("token");
   //    if (!token) {
   //       window.location.href = "auth/login";
   //    }
   //    const res = await axios.get(`${process.env.API_URL}/reply/${replies.id}`, { headers: {
   //       Authorization: `Bearer ${token}`
   //       } });

   //    console.log(res.data.data.reply);
   // }

   const handleNewReply = async(reply: any) => {
      let newRep = replies;
      await newRep.reply.push(reply);
      setReplies(newRep);
   }

   const handleLogout = () => {
      Cookies.remove("token");
      window.location.href = "auth/login";
   }
   useEffect( ()  => {
      // console.log("Replies: ", replies);
      if( replies.state) {
         // setModalClass(styles.modal);
         openModal();
      }
      console.log("Replies just got changed: ", replies);
      // fetchReply();
   },[replies]);

   useEffect(() => {
      fetchMsg();
      socket.on("chat message", function(mess){
         // console.log("Message: ", mess?.newBroadcast);
         setMsg(msg => [mess?.newBroadcast, ...msg]);

         console.log(msg);
         // fetchMsg();
      });
      socket.on("reply message", function(mess){
         // console.log("MessageIs: ", mess.reply);
         // console.log("Replies: ", replies);
         // let newReplies = replies;
         // console.log("before: ", newReplies);
         // newReplies.reply.push(mess?.reply);
         // console.log("after: ", newReplies);


         // console.log(newReplies.reply[newReplies.reply.length - 1]);
         // emitReply(newReplies.reply[newReplies.reply.length - 1]);
         // console.log(newReplies.reply);
         // setReplies(newReplies);

         // setMsg(msg => [mess?.newBroadcast, ...msg]);

         handleNewReply(mess?.reply);
      });
      return () => {
         socket.off("chat message");
         socket.off("reply message");
      }
   });
   
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
               <p className={styles.logout} onClick={handleLogout}>Logout</p>
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
            {/* <div className={modalClass}> */}

               {/* <button onClick={openModal}>Open Modal</button> */}
               <Modal isOpen={modalIsOpen} onAfterOpen={afterOpenModal} onRequestClose={closeModal} style={customStyles} contentLabel="Example Modal">
                  <div className={styles.modalBody}>
                     <div className={styles.modalHead}>
                        <h5 className={styles.modalMsg}>{replies.message}</h5>
                        <p className={styles.modalReplySender}>{replies.sender}</p>
                        <h5 className={styles.cross} onClick={closeModal}><strong>X</strong></h5>
                     </div>
                     <div className={styles.modalReply}>
                        {replies.reply ? replies.reply.map((rep, index) => {
                           const createdAt = new Date(rep?.createdAt);
                           const time = createdAt.toString('YYYY-MM-dd');
                           return (
                           <div className={styles.modalReplyBox} key={index}>
                              <p className={styles.modalReplyTime}>{time.substring(15, 21)}, {time.substring(4, 10)}</p>
                              <p className={styles.modalReplySender}>{rep?.sender?.name}</p>
                              <h6 className={styles.modalMsg}>{rep?.message}</h6>
                           </div>
                           )
                        }) : <p>No replies</p>}
                     </div>
                     <div className={styles.modalNewReply}>
                        <div className="form-floating mb-1">
                           <input type="text" className="form-control" id="replyMsg" placeholder="Add new reply" value={replyMsg} onKeyPress={handleReplyKeyPress} onChange={(e) => setReplyMsg(e.target.value)}></input>
                           <label htmlFor="replyMsg">Add new reply</label>
                        </div>
                     </div>

                     
                  </div>
               </Modal>

               {/* <Box msgId={mess._id} msg={mess.message} author={mess.sender.name} time={createdAt.toString'YYYY-MM-dd')} key={mess._id} like={msgLike} likeCount={like} dislikeCount={dislike} replies={mess.replies} setReplies={setReplies}/> */}
            {/* </div> */}
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