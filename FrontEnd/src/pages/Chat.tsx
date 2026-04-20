import React, { useState } from 'react';
import Header from '../components/layout/Header';
import { Phone, Send } from 'lucide-react';

const Chat = () => {
  const [messages, setMessages] = useState([
    { text: "Is it still available?", sender: 'me' },
    { text: "Yes, it is! Where are you located?", sender: 'them' }
  ]);
  const [input, setInput] = useState('');

  const send = (t: string) => {
    if(!t) return;
    setMessages([...messages, { text: t, sender: 'me' }]);
    setInput('');
  };

  return (
    <div className="home-page" style={{paddingBottom: 0, marginTop: 0}}>
      <Header />
      <div className="chat-page">
        <div className="chat-list">
           <div className="chat-item active">
             <div className="chat-avatar">E</div>
             <div className="chat-details">
                <h4>Eric N.</h4>
                <p>iPhone 11 Pro Max</p>
             </div>
           </div>
        </div>

        <div className="chat-room">
          <div className="chat-header">
            <span style={{display: 'flex', alignItems: 'center', gap: 12}}>
              <div className="chat-avatar" style={{width: 36, height: 36, fontSize: 16}}>E</div>
              Eric N.
            </span>
            <button style={{background: 'none', border: 'none', cursor: 'pointer', color: '#002f34'}} title="Call Seller">
              <Phone size={20} />
            </button>
          </div>

          <div className="chat-messages">
             {messages.map((m, i) => (
                <div key={i} className={`msg-bubble ${m.sender === 'me' ? 'msg-me' : 'msg-them'}`}>
                  {m.text}
                </div>
             ))}
          </div>

          <div className="chat-quick-replies">
            <button className="quick-reply-btn" onClick={() => send("Is the price negotiable?")}>Is the price negotiable?</button>
            <button className="quick-reply-btn" onClick={() => send("Can we meet today?")}>Can we meet today?</button>
            <button className="quick-reply-btn" onClick={() => send("Call me at 078XXXXX")}>Share Number</button>
          </div>

          <div className="chat-input-area">
             <input 
               type="text" 
               style={{flex: 1, padding: 12, border: '1px solid #ccc', borderRadius: 24, outline: 'none', fontFamily: 'Inter'}}
               placeholder="Type a message..."
               value={input}
               onChange={(e) => setInput(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && send(input)}
             />
             <button style={{background: '#002f34', color: '#fff', border: 'none', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'}} onClick={() => send(input)}>
                <Send size={18} style={{marginLeft: -2}}/>
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
