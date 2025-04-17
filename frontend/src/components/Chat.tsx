import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { X, Send } from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  userType: 'mentor' | 'student';
}

interface ChatProps {
  bookingId: string;
  onClose: () => void;
}

export default function Chat({ bookingId, onClose }: ChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isSendingRef = useRef(false); // Track if we're sending a message

  // Initialize socket connection and load chat history
  useEffect(() => {
    if (!user) return;

    // Fetch previous messages from backend
    fetch(`http://localhost:3001/messages/${bookingId}`)
      .then((res) => res.json())
      .then((data: Message[]) => {
        setMessages(data);
      })
      .catch((err) => {
        console.error('Failed to load chat history:', err);
      });

    const socket = io('http://localhost:3001', {
      query: {
        bookingId,
        userId: user.id,
        userType: user?.role || 'student'
      },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socket.on('connect', () => {
      setConnectionStatus('connected');
    });

    socket.on('disconnect', () => {
      setConnectionStatus('disconnected');
    });

    socket.on('connect_error', () => {
      setConnectionStatus('failed');
    });

    socketRef.current = socket;

    // Set up event listeners
    socket.on('chat-message', (message: Message) => {
      // Only add message if we're not the ones sending it
      if (!isSendingRef.current) {
        setMessages((prev) => [...prev, message]);
      }
      isSendingRef.current = false; // Reset sending flag
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [bookingId, user]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !user || !socketRef.current) return;

    const newMessage: Message = {
      id: crypto.randomUUID(),
      senderId: user.id,
      content: messageInput.trim(),
      timestamp: new Date(),
      userType: user.role || 'student'
    };

    // Set sending flag and add message locally
    isSendingRef.current = true;
    setMessages((prev) => [...prev, newMessage]);
    setMessageInput('');
    
    // Emit the message
    socketRef.current.emit('chat-message', newMessage);
  };

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-xl flex flex-col z-50">
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h3 className="text-lg font-semibold">Chat</h3>
          {connectionStatus !== 'connected' && (
            <span className="text-xs text-red-500">Connecting...</span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-gray-100"
          aria-label="Close chat"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((message) => (
          <div key={message.id} className={`mb-4 ${message.senderId === user?.id ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block px-4 py-2 rounded-lg ${message.senderId === user?.id ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
              <p>{message.content}</p>
              <p className="text-xs opacity-75">{new Date(message.timestamp).toLocaleTimeString()}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border rounded-full"
            disabled={connectionStatus !== 'connected'}
          />
          <button
            type="submit"
            disabled={connectionStatus !== 'connected' || !messageInput.trim()}
            className="p-2 text-white bg-blue-500 rounded-full disabled:opacity-50"
            aria-label="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}


// import { useEffect, useRef, useState } from 'react';
// import { io, Socket } from 'socket.io-client';
// import { useAuth } from '../context/AuthContext';
// import { X, Send } from 'lucide-react';

// interface Message {
//   id: string;
//   senderId: string;
//   content: string;
//   timestamp: Date;
//   userType: 'mentor' | 'student';
// }

// interface ChatProps {
//   bookingId: string;
//   onClose: () => void;
// }

// export default function Chat({ bookingId, onClose }: ChatProps) {
//   const { user } = useAuth();
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [messageInput, setMessageInput] = useState('');
//   const [isTyping, setIsTyping] = useState(false);
//   const [otherUserTyping, setOtherUserTyping] = useState(false);
//   const [connectionStatus, setConnectionStatus] = useState('connecting');
//   const socketRef = useRef<Socket | null>(null);
//   const messagesEndRef = useRef<HTMLDivElement>(null);

//   // Initialize socket connection
//   useEffect(() => {
//     if (!user) return;

//     const socket = io('http://localhost:3001', {
//       query: {
//         bookingId,
//         userId: user.id,
//         userType: user?.role || 'student'
//       },
//       reconnectionAttempts: 5,
//       reconnectionDelay: 1000
//     });

//     socket.on('connect', () => {
//       setConnectionStatus('connected');
//     });

//     socket.on('disconnect', () => {
//       setConnectionStatus('disconnected');
//     });

//     socket.on('connect_error', () => {
//       setConnectionStatus('failed');
//     });

//     socketRef.current = socket;

//     // Set up event listeners
//     socket.on('chat-message', (message: Message) => {
//       setMessages((prev) => [...prev, message]);
//     });

//     return () => {
//       socketRef.current?.disconnect();
//     };
//   }, [bookingId, user]);

//   // Auto-scroll to bottom when new messages arrive
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages]);

//   const handleSendMessage = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!messageInput.trim() || !user || !socketRef.current) return;

//     const newMessage: Message = {
//       id: crypto.randomUUID(),
//       senderId: user.id,
//       content: messageInput.trim(),
//       timestamp: new Date(),
//       userType: user.role || 'student'
//     };

//     socketRef.current.emit('chat-message', newMessage);
//     setMessages((prev) => [...prev, newMessage]);
//     setMessageInput('');
//   };

//   return (
//     <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-xl flex flex-col z-50">
//       <div className="flex items-center justify-between p-4 border-b">
//         <div>
//           <h3 className="text-lg font-semibold">Chat</h3>
//           {connectionStatus !== 'connected' && (
//             <span className="text-xs text-red-500">Connecting...</span>
//           )}
//         </div>
//         <button
//           onClick={onClose}
//           className="p-2 rounded-full hover:bg-gray-100"
//           aria-label="Close chat"
//         >
//           <X className="w-5 h-5" />
//         </button>
//       </div>

//       <div className="flex-1 p-4 overflow-y-auto">
//         {messages.map((message) => (
//           <div key={message.id} className={`mb-4 ${message.senderId === user?.id ? 'text-right' : 'text-left'}`}>
//             <div className={`inline-block px-4 py-2 rounded-lg ${message.senderId === user?.id ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
//               <p>{message.content}</p>
//               <p className="text-xs opacity-75">{new Date(message.timestamp).toLocaleTimeString()}</p>
//             </div>
//           </div>
//         ))}
//         <div ref={messagesEndRef} />
//       </div>

//       <form onSubmit={handleSendMessage} className="p-4 border-t">
//         <div className="flex gap-2">
//           <input
//             type="text"
//             value={messageInput}
//             onChange={(e) => setMessageInput(e.target.value)}
//             placeholder="Type a message..."
//             className="flex-1 px-4 py-2 border rounded-full"
//             disabled={connectionStatus !== 'connected'}
//           />
//           <button
//             type="submit"
//             disabled={connectionStatus !== 'connected' || !messageInput.trim()}
//             className="p-2 text-white bg-blue-500 rounded-full disabled:opacity-50"
//             aria-label="Send message"
//           >
//             <Send className="w-5 h-5" />
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }
