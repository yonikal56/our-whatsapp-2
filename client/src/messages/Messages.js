import { useState, useEffect, createContext } from 'react';
import ChatSection from "../chatSection/ChatSection.js";
import NewChatModal from "../conversations/NewChatModal.js";
import ThemeModal from './ThemeModal.js';
import "./Messages.css"
import { useNavigate } from "react-router-dom";
import Conversations from '../conversations/Conversations.js';

export const RefreshContext = createContext();
export const CurrentConversationContext = createContext();  

function Messages() {
    const [refreshMessages, setRefreshMessages] = useState(true);
    const [refresh, setRefresh] = useState(false);
    const [currConversation, setCurrConversation] = useState(JSON.parse(localStorage.getItem('currConversation')) || {});
    let navigate = useNavigate();

    useEffect(() => {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            navigate('/login');
        }
    }, [navigate]);
    
    function logout() {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('currConversation');
        navigate('/login');
    }
    

    return (
        <CurrentConversationContext.Provider value={{ currConversation, setCurrConversation }}> 
            <button type="submit" className="btn btn-primary logout-btn" onClick={logout}>Logout</button>
            <RefreshContext.Provider value={{ refresh, setRefresh }}>
                <NewChatModal />
                <ThemeModal />
                <div className="messages-container">
                    <Conversations refreshMessages={refreshMessages} setRefreshMessages={setRefreshMessages}/>
                    <ChatSection refreshMessages={refreshMessages} setRefreshMessages={setRefreshMessages}/>
                </div>
            </RefreshContext.Provider>
        </CurrentConversationContext.Provider>
    );
}

export default Messages;
