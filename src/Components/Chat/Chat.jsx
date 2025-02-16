import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { AuthContext } from '../AppContext/AppContext';

const Chat = () => {
  const { chatId, chatType } = useParams();
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const messagesCollection = chatType === 'group' ? 'groupMessages' : 'messages';
    const chatRef = collection(db, messagesCollection, chatId, 'chats');

    const createChatIfNotExists = async () => {
      const chatDocRef = doc(db, messagesCollection, chatId);
      const docSnap = await getDoc(chatDocRef);
      if (!docSnap.exists()) {
        const members = chatType === 'group' 
          ? (await getDoc(doc(db, 'groups', chatId))).data().members 
          : [user.uid, chatId];

        await setDoc(chatDocRef, {
          createdAt: serverTimestamp(),
          members
        });
      }
    };
    createChatIfNotExists();

    const q = query(chatRef, orderBy('timestamp'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [chatId, chatType, user.uid]);

  const sendMessage = async () => {
    if (newMessage.trim()) {
      const messagesCollection = chatType === 'group' ? 'groupMessages' : 'messages';
      await addDoc(collection(db, messagesCollection, chatId, 'chats'), {
        text: newMessage,
        uid: user.uid,
        displayName: user.displayName,
        photoURL: user.photoURL,
        timestamp: serverTimestamp(),
      });
      setNewMessage('');
    }
  };

  return (
    <div className="chat-container">
      <h2>{chatType === 'group' ? 'Group Chat' : 'Private Chat'}</h2>
      <div className="messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.uid === user.uid ? 'self' : ''}`}>
            <img src={msg.photoURL || 'https://via.placeholder.com/40'} alt={msg.displayName} />
            <span>{msg.text}</span>
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chat;
