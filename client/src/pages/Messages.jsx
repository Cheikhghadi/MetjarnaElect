import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Send, 
  Plus, 
  X, 
  Smile, 
  Image as ImageIcon, 
  FileText, 
  MapPin, 
  User as UserIcon, 
  Mic, 
  MessageSquare,
  Search,
  MoreVertical,
  Paperclip,
  Trash2,
  CheckCircle2,
  Play,
  Pause,
  AlertCircle
} from 'lucide-react';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';

const Messages = () => {
  const [inbox, setInbox] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [threadId, setThreadId] = useState('');
  const [showAttachments, setShowAttachments] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const { addToast } = useToast();
  const { t } = useLanguage();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const fileInputRef = useRef();
  const recordingInterval = useRef();
  
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const location = useLocation();
  const navigate = useNavigate();
  const scrollRef = useRef();

  const query = new URLSearchParams(location.search);
  const targetId = query.get('user');
  const productName = query.get('product');

  const socketRef = useRef(null);
  const threadIdRef = useRef('');

  const fetchInbox = useCallback(async () => {
    try {
      const { data } = await api.get('/messages/inbox/all');
      setInbox(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    threadIdRef.current = threadId;
  }, [threadId]);

  useEffect(() => {
    const handleUserChange = () => {
      setUser(JSON.parse(localStorage.getItem('user')));
    };
    window.addEventListener('userStateChange', handleUserChange);
    return () => window.removeEventListener('userStateChange', handleUserChange);
  }, []);

  const startConversation = useCallback(async (otherUserId) => {
    try {
      const { data } = await api.get(`/messages/${otherUserId}`);
      setMessages(data);

      const current = user || JSON.parse(localStorage.getItem('user') || 'null');
      if (!current?._id) return;
      const tId = [current._id, otherUserId].sort().join('_');
      setThreadId(tId);

      let otherUser;
      try {
        const res = await api.get(`/auth/profile/${otherUserId}`);
        otherUser = res.data.user;
      } catch (e) {
        otherUser = { _id: otherUserId, name: 'Utilisateur' };
      }
      setSelectedUser(otherUser);
    } catch (err) {
      console.error(err);
    }
  }, [user]);

  useEffect(() => {
    fetchInbox();
    if (targetId) {
      startConversation(targetId);
      if (productName) {
        setNewMessage(t('messages.interest_prefill', { product: productName }) || `Salam, je suis intéressé par votre article: ${productName}. Est-il toujours disponible ?`);
      }
    }
  }, [targetId, fetchInbox, startConversation, productName, t]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !user?._id) {
      return undefined;
    }

    const s = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });
    socketRef.current = s;

    const onReceive = (data) => {
      if (data.threadId === threadIdRef.current) {
        setMessages((prev) => [...prev, data]);
      }
      fetchInbox();
    };
    s.on('receive_message', onReceive);
    s.on('connect', () => {
      if (threadIdRef.current) {
        s.emit('join_thread', threadIdRef.current);
      }
    });
    s.on('connect_error', (err) => {
      console.error('Socket:', err.message);
    });

    return () => {
      s.off('receive_message', onReceive);
      s.disconnect();
      socketRef.current = null;
    };
  }, [user?._id, fetchInbox]);

  useEffect(() => {
    const s = socketRef.current;
    if (!s || !threadId) return undefined;
    s.emit('join_thread', threadId);
    return () => {
      s.emit('leave_thread', threadId);
    };
  }, [threadId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    try {
      const { data } = await api.post(`/messages/${selectedUser._id}`, { content: newMessage });
      const msgData = {
        threadId,
        sender: user._id,
        senderName: user.name,
        content: newMessage,
        createdAt: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, msgData]);
      socketRef.current?.emit('send_message', msgData);
      setNewMessage('');
      fetchInbox();
    } catch (err) {
      addToast(t('messages.error_send') || "Erreur d'envoi", 'error');
    }
  };

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_SIZE = 1000;
          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.6));
        };
      };
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const isImage = file.type.startsWith('image/');
      let content;
      
      if (isImage) {
        const compressed = await compressImage(file);
        content = `[IMAGE]${compressed}`;
      } else {
        const reader = new FileReader();
        const readPromise = new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result);
        });
        reader.readAsDataURL(file);
        const result = await readPromise;
        content = `[FILE:${file.name}]${result}`;
      }

      await api.post(`/messages/${selectedUser._id}`, { content });
      const msgData = {
        threadId,
        sender: user._id,
        senderName: user.name,
        content,
        createdAt: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, msgData]);
      socketRef.current?.emit('send_message', msgData);
      fetchInbox();
    } catch (err) {
      addToast("Erreur lors de l'envoi du fichier", 'error');
    }
  };

  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      setRecordingTime(0);
      recordingInterval.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(recordingInterval.current);
      setIsRecording(false);
      const voiceMsg = `[AUDIO:Note vocale ${new Date().toLocaleTimeString()}]`;
      setNewMessage(voiceMsg);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const attachmentOptions = [
    { label: 'Photo/Vidéo', icon: <ImageIcon size={18} />, type: 'image' },
    { label: 'Fichier', icon: <FileText size={18} />, type: 'file' },
    { label: 'Localisation', icon: <MapPin size={18} />, type: 'location' },
    { label: 'Contact', icon: <UserIcon size={18} />, type: 'contact' }
  ];

  const emojis = ['😊', '😂', '😍', '🤔', '👍', '🔥', '✨', '🙌', '💯', '🙏', '😎', '🎉', '❤️', '💙', '✅'];

  const isMobile = windowWidth <= 768;

  return (
    <div className="container" style={{ 
      display: 'grid', 
      gridTemplateColumns: isMobile ? '1fr' : 'minmax(300px, 400px) 1fr', 
      height: 'calc(100vh - 120px)', 
      paddingTop: '120px', 
      gap: isMobile ? '0' : '1.5rem', 
      paddingBottom: '2rem' 
    }}>
      {/* Sidebar - Inbox */}
      <div className="glass" style={{ 
        display: isMobile && selectedUser ? 'none' : 'flex', 
        flexDirection: 'column', 
        overflow: 'hidden' 
      }}>
        <div style={{ padding: isMobile ? '1.5rem 1rem' : '2rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: isMobile ? '1.25rem' : '1.5rem', fontWeight: '800' }}>{t('messages.inbox')}</h2>
        </div>
        <div className="inbox-scroll" style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
          {inbox.map(item => (
            <div 
              key={item.user._id} 
              onClick={() => {
                navigate(`/messages?user=${item.user._id}`);
                startConversation(item.user._id);
              }}
              style={{
                padding: '1.25rem 1.5rem',
                cursor: 'pointer',
                borderRadius: '20px',
                marginBottom: '0.75rem',
                border: '1px solid',
                borderColor: selectedUser?._id === item.user._id ? 'var(--border-hover)' : 'transparent',
                background: selectedUser?._id === item.user._id ? 'rgba(139, 92, 246, 0.08)' : 'rgba(255,255,255,0.01)',
                transition: 'var(--transition)',
                display: 'flex',
                gap: '1.25rem',
                alignItems: 'center',
                boxShadow: selectedUser?._id === item.user._id ? 'var(--shadow-md)' : 'none'
              }}
            >
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: 'var(--primary)' }}>
                {item.user.avatar ? <img src={item.user.avatar} style={{width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover'}} onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x100/8b5cf6/ffffff?text=U'; }} /> : <UserIcon size={24} />}
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <p style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--text-main)' }}>{item.user.name}</p>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: '600' }}>
                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.lastMessage}
                </p>
              </div>
            </div>
          ))}
          {inbox.length === 0 && <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)' }}>{t('messages.no_messages')}</p>}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="glass" style={{ 
        display: isMobile && !selectedUser ? 'none' : 'flex', 
        flexDirection: 'column', 
        overflow: 'hidden' 
      }}>
        {selectedUser ? (
          <>
            {/* Header */}
            <div 
              style={{ padding: '1.25rem 2rem', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {isMobile && (
                <button 
                  onClick={() => {
                    setSelectedUser(null);
                    navigate('/messages');
                  }}
                  style={{ background: 'transparent', color: 'var(--text-main)', padding: '0.5rem', marginLeft: '-1rem' }}
                >
                  <X size={24} />
                </button>
              )}
              <div 
                onClick={() => navigate(`/profile/${selectedUser._id}`)}
                style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', flex: 1 }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', color: 'var(--primary)' }}>
                  {selectedUser.avatar ? <img src={selectedUser.avatar} style={{width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover'}} onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/100x100/8b5cf6/ffffff?text=U'; }} /> : <UserIcon size={20} />}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>{selectedUser.name}</h3>
                  <p style={{ fontSize: '0.7rem', color: 'var(--success)', fontWeight: '700' }}>• {t('messages.online') || 'En ligne'}</p>
                </div>
              </div>
            </div>
            
            {/* Messages List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {messages.map((msg, i) => (
                <div 
                  key={i} 
                  style={{
                    alignSelf: (msg.sender?._id || msg.sender) === user?._id ? 'flex-end' : 'flex-start',
                    maxWidth: '80%',
                    padding: '1rem 1.5rem',
                    borderRadius: (msg.sender?._id || msg.sender) === user?._id ? '24px 24px 4px 24px' : '24px 24px 24px 4px',
                    background: (msg.sender?._id || msg.sender) === user?._id ? 'var(--gradient)' : 'var(--card-bg)',
                    border: '1px solid',
                    borderColor: (msg.sender?._id || msg.sender) === user?._id ? 'transparent' : 'var(--border)',
                    color: 'white',
                    fontSize: '1rem',
                    boxShadow: 'var(--shadow-md)',
                    position: 'relative',
                    transition: 'var(--transition)'
                  }}
                >
                  {msg.content.startsWith('[IMAGE]') ? (
                    <img src={msg.content.replace('[IMAGE]', '')} alt="Attachement" onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x300/1e1b4b/8b5cf6?text=Image+Cassée'; }} style={{ maxWidth: '100%', borderRadius: '12px', marginTop: '0.5rem' }} />
                  ) : msg.content.startsWith('[FILE:') ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.1)', padding: '0.75rem', borderRadius: '10px', cursor: 'pointer' }}>
                      <FileText size={20} />
                      <span style={{ fontSize: '0.85rem' }}>{msg.content.split(']')[0].replace('[FILE:', '')}</span>
                    </div>
                  ) : msg.content.startsWith('[AUDIO:') ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: '150px' }}>
                      <button type="button" style={{ background: 'var(--primary)', color: 'white', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Play size={14} fill="white" />
                      </button>
                      <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px' }}>
                        <div style={{ width: '30%', height: '100%', background: 'white', borderRadius: '2px' }}></div>
                      </div>
                      <span style={{ fontSize: '0.7rem' }}>0:12</span>
                    </div>
                  ) : (
                    <p>{msg.content}</p>
                  )}
                  <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.4rem', textAlign: 'right' }}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <div ref={scrollRef}></div>
                </div>
              ))}
            </div>

            {/* Input Section */}
            <div style={{ position: 'relative' }}>
              {showAttachments && (
                <div className="glass" style={{ position: 'absolute', bottom: '100%', left: '2rem', padding: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem', boxShadow: 'var(--shadow-lg)', minWidth: '220px', zIndex: 10 }}>
                  {attachmentOptions.map(opt => (
                    <button 
                      key={opt.label}
                      className="btn-secondary" 
                      style={{ padding: '0.75rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}
                      onClick={() => {
                        if (opt.type === 'image' || opt.type === 'file') {
                          fileInputRef.current?.click();
                        } else {
                          addToast(`Fonctionnalité "${opt.label}" bientôt disponible !`, 'info');
                        }
                        setShowAttachments(false);
                      }}
                    >
                      <span>{opt.icon}</span>
                      <span>{opt.label}</span>
                    </button>
                  ))}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    style={{ display: 'none' }} 
                    onChange={handleFileUpload} 
                  />
                </div>
              )}

              <form onSubmit={handleSendMessage} style={{ padding: '1.5rem 2rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.75rem', alignItems: 'center', background: 'rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    type="button" 
                    onClick={() => setShowAttachments(!showAttachments)}
                    style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-main)', width: '44px', height: '44px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'var(--transition)' }}>
                    {showAttachments ? <X size={20} /> : <Plus size={20} />}
                  </button>
                  <div style={{ position: 'relative' }}>
                    <button 
                      type="button" 
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-main)', width: '44px', height: '44px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Smile size={20} />
                    </button>
                    {showEmojiPicker && (
                      <div className="glass" style={{ position: 'absolute', bottom: '100%', left: 0, padding: '0.75rem', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem', marginBottom: '1rem', boxShadow: 'var(--shadow-lg)' }}>
                        {emojis.map(emoji => (
                          <span 
                            key={emoji} 
                            onClick={() => {
                              setNewMessage(prev => prev + emoji);
                              setShowEmojiPicker(false);
                            }}
                            style={{ cursor: 'pointer', fontSize: '1.25rem', padding: '0.25rem' }}
                          >
                            {emoji}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div style={{ flex: 1, position: 'relative' }}>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder={isRecording ? t('messages.recording') : t('messages.msg_placeholder')} 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={isRecording}
                    style={{ borderRadius: '25px', paddingLeft: '1.25rem', background: isRecording ? 'rgba(244, 63, 94, 0.1)' : 'rgba(255,255,255,0.03)', color: isRecording ? 'var(--error)' : 'var(--text-main)' }}
                  />
                  {isRecording && (
                    <div style={{ position: 'absolute', right: '1.5rem', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '0.5rem', pointerEvents: 'none' }}>
                      <span style={{ width: '8px', height: '8px', background: 'var(--error)', borderRadius: '50%', animation: 'pulse 1s infinite' }}></span>
                      <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--error)' }}>{formatTime(recordingTime)}</span>
                    </div>
                  )}
                </div>
 
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    type="button" 
                    onClick={toggleRecording}
                    style={{ background: isRecording ? 'var(--error)' : 'rgba(255,255,255,0.05)', color: isRecording ? 'white' : 'var(--text-main)', width: '44px', height: '44px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Mic size={20} />
                  </button>
                  <button type="submit" className="btn-primary" style={{ width: '44px', height: '44px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                    <Send size={18} />
                  </button>
                </div>
              </form>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', gap: '1.5rem', textAlign: 'center', padding: '2rem' }}>
            <div style={{ 
              width: '120px', 
              height: '120px', 
              borderRadius: '50%', 
              background: 'rgba(139, 92, 246, 0.05)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: 'var(--primary)',
              boxShadow: '0 0 40px rgba(139, 92, 246, 0.1) inset'
            }}>
              <MessageSquare size={48} strokeWidth={1.5} />
            </div>
            <div>
              <p style={{ fontWeight: '800', fontSize: '1.5rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>{t('messages.title_empty')}</p>
              <p style={{ color: 'var(--text-dim)', maxWidth: '300px', lineHeight: '1.6' }}>{t('messages.select_conv')}</p>
            </div>
            <button 
              onClick={() => navigate('/dashboard')}
              className="btn-primary" 
              style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', fontSize: '0.9rem' }}
            >
              {t('messages.discover_btn') || 'Découvrir des pépites'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
