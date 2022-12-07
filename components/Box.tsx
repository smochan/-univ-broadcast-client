import React, {useState} from "react";
import axios from "axios";
import Cookies from "js-cookie";
import styles from '../styles/Box.module.scss'
import Like from '../public/like.svg'
import Dislike from '../public/dislike.svg'
import Kebab from '../public/kebabMenu.svg'
import Image from 'next/image'

interface IBox {
   msgId: string;
   msg: string;
   author: string;
   time: string;
   like: string;
   likeCount: number;
   dislikeCount: number;
   replies: number;
   setReplies: any;
}

const Box = (props: IBox) => {

   const { msgId, msg, author, time, like, likeCount, dislikeCount, replies, setReplies } = props;

   const [likeState, setLikeState] = useState(like);
   const [boxClass, setBoxClass] = useState(`${styles.box}`);
   const [LikeCount, setLikeCount] = useState(likeCount);
   const [DislikeCount, setDislikeCount] = useState(dislikeCount);

   const handleReply = () => {
      setReplies({state: true, id: msgId});
   }

   const likeHandler = async (target: string) => {
      const token = Cookies.get("token");
      let payload = {
         messageId: msgId,
         reaction: "none"
      }      
      let url = "";
      if(likeState === "like") {
         if(target === "like" || target === "Like") url = "/delete";
         else {
            url = "/update";
            payload.reaction = "dislike";
         }
      }
      else if(likeState === "dislike") {
         if(target === "like" || target === "Like") {
            url = "/update";
            payload.reaction = "like";
         }
         else url = "/delete";
      }
      else{
         if(target === "like" || target === "Like") payload.reaction = "like";
         else payload.reaction = "dislike";
         url = "/add";
      }

      const res = await axios.post(`${process.env.API_URL}/reactions${url}`, payload, { headers: {
         Authorization: `Bearer ${token}` }
      });
      console.log(res);
   }

   const expand = () => {
      if(boxClass === `${styles.box}`) setBoxClass(`${styles.box} ${styles.expand}`);
      else setBoxClass(`${boxClass} ${styles.expandReply}`);
      console.log("expanded");
   }

   const react = async (e: any) => {
      const target = e.target.id;
      await likeHandler(target);

      if( likeState === "like") {
         if(target === "like" || target === "Like") {
            setLikeState("none");
            setLikeCount(LikeCount - 1);
         }
         else {
            setLikeState("dislike");
            setDislikeCount(DislikeCount + 1);
            setLikeCount(LikeCount - 1);
         }
      }

      if( likeState === "dislike") {
         if(target === "Like" || target === "like") {
            setLikeState("like");
            setLikeCount(LikeCount + 1);
            setDislikeCount(DislikeCount - 1);
         }
         else {
            setLikeState("none");
            setDislikeCount(DislikeCount - 1);
         }
      }
      if( likeState === "none" || likeState === "") {
         if(target === "like" || target === "Like") {
            setLikeState("like");
            setLikeCount(LikeCount + 1);
         }
         else {
            setLikeState("dislike");
            setDislikeCount(DislikeCount + 1);
         }
      }
   }

   return (
      <div className={boxClass}>
         <div className={styles.kebab}>
            <Image src={Kebab} alt="kebab" width={20} height={20} />
         </div>
         <p className={styles.author} onClick={expand}><strong>{author}</strong></p>
         <p className={styles.msg} onClick={expand}>{msg}</p>
         <div>
            {replies ? <p className={styles.replyCount} onClick={handleReply}>{replies} replies</p> : "" }
            <p className={styles.time} onClick={expand}><strong>{time.substring(15, 21)}, {time.substring(4, 10)}</strong></p>
         </div>

         <div onClick={ (e) =>react(e)}>
            <div className={styles.like}>
               <Image src={likeState === 'like' ? Like: Dislike} alt="like" width={30} height={30} id="Like"></Image>
               <p id="like">{LikeCount}</p>
            </div>
            <div className={styles.dislike}>
               <Image src={likeState === 'dislike' ? Like : Dislike } alt="dislike" width={30} height={30} className={styles.iconDislike} ></Image>
               <p>{DislikeCount}</p>
            </div>
         </div>
      </div>
   )
}

export default Box;