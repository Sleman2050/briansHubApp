import React, { useEffect, useState, useContext } from 'react';
import { db } from '../firebase/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { AuthContext } from '../AppContext/AppContext';
import { useNavigate } from 'react-router-dom';

const ChatsList = () => {
  const { user } = useContext(AuthContext);
  const [chats, setChats] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChats = async () => {
        if (!user) return;
      
        try {
          let chatList = [];
      
          // Fetch all group chats
          const groupSnapshot = await getDocs(collection(db, 'groupMessages'));
          groupSnapshot.forEach(doc => {
            const chatData = doc.data();
            if (chatData.members.some(member => member.id === user.uid)) {
              chatList.push({ id: doc.id, name: 'Group Chat', type: 'group' });
            }
          });
      
          // Fetch one-on-one chats
          const messagesSnapshot = await getDocs(collection(db, 'messages'));
          messagesSnapshot.forEach(doc => {
            const chatData = doc.data();
            if (chatData.members.some(member => member === user.uid)) {
              chatList.push({ id: doc.id, name: `Chat with ${chatData.members.find(m => m !== user.uid)}`, type: 'private' });
            }
          });
      
          setChats(chatList);
        } catch (err) {
          console.error('Error fetching chats:', err);
        }
      };
      
      
    fetchChats();
  }, [user]);

  return (
    <div className="chats-list-container">
      <h2>Your Chats</h2>
      {chats.length > 0 ? (
        chats.map((chat) => (
          <div key={chat.id} className="chat-item" onClick={() => navigate(`/chat/${chat.type}/${chat.id}`)}>
            {chat.name}
          </div>
        ))
      ) : (
        <p>No chats available</p>
      )}
    </div>
  );
};

export default ChatsList;
