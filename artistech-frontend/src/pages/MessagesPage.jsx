import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, MessageSquare, Image, X } from 'lucide-react';
import { toast } from 'sonner';
import ArtworkImage from '../components/ui/artwork-image';
import ProtectedAvatar from '../components/ui/ProtectedAvatar';

const MessagesPage = () => {
  const { user, token } = useContext(AuthContext);
  const socket = useSocket();
  const { artistId: paramArtistId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const queryParams = new URLSearchParams(location.search);
  const projectId = queryParams.get('projectId');

  const scrollToBottom = (smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: smooth ? "smooth" : "auto",
        block: "end" 
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Scroll to bottom immediately when conversation changes
  useEffect(() => {
    if (selectedConversation && messages.length > 0) {
      setTimeout(() => scrollToBottom(false), 100);
    }
  }, [selectedConversation]);

  // Fetch all conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await fetch('/api/messages', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setConversations(data);
        }
      } catch (error) {
        toast.error("Failed to fetch conversations.");
      }
    };

    if (token) {
      fetchConversations();
    }
  }, [token]);
  
  // Handle selecting a conversation or starting a new one from URL
  useEffect(() => {
    if (!paramArtistId || !token) return;

    // Look for existing conversation with this artist
    const existingConversation = conversations.find(c => {
      // Check if conversation includes the artist (conversations from backend use 'id' as the other user's ID)
      return c.id === parseInt(paramArtistId);
    });
    
    if (existingConversation) {
      setSelectedConversation(existingConversation);
    } else {
      // This is a new chat, fetch artist details to create a new conversation
      const fetchArtistDetails = async () => {
          try {
              const res = await fetch(`http://localhost:3000/api/user/${paramArtistId}/basic-info`);
              
              if (res.ok) {
                  const userData = await res.json();
                  const newChat = {
                      id: `new_${paramArtistId}`, // Use string ID to distinguish from existing conversations
                      other_user_id: parseInt(paramArtistId),
                      name: userData.name,
                      profile_image: userData.profile_image,
                      user_type: userData.user_type,
                      last_message: null,
                      isNewChat: true
                  };
                  setSelectedConversation(newChat);
              } else {
                  toast.error("User not found.");
              }
          } catch (error) {
              console.error("Failed to fetch user details:", error);
              toast.error("Could not fetch user details for new chat.");
          }
      };
      fetchArtistDetails();
    }
  }, [paramArtistId, conversations, token]);

  // Fetch messages for the selected conversation
  useEffect(() => {
    const fetchMessages = async () => {
      if (selectedConversation) {
        try {
          // For new chats, use other_user_id; for existing conversations, use id
          const otherUserId = selectedConversation.isNewChat 
            ? selectedConversation.other_user_id 
            : selectedConversation.id;
          
          const response = await fetch(`/api/messages/${otherUserId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok) {
            const data = await response.json();
            setMessages(data);
          } else {
            // For new chats, it's normal to get empty messages
            if (selectedConversation.isNewChat) {
              setMessages([]);
            }
          }
        } catch (error) {
          console.error('Error fetching messages:', error);
          // For new chats, it's normal to have no messages initially
          if (selectedConversation.isNewChat) {
            setMessages([]);
          } else {
            toast.error("Failed to fetch messages.");
          }
        }
      }
    };
    if (token && selectedConversation) {
      fetchMessages();
    }
  }, [selectedConversation, token]);

  // Socket listener for new messages
  useEffect(() => {
    if (socket && user) {
      // Set up socket listeners for real-time messaging
      const handleNewMessage = (newMessage) => {
        // Handle incoming real-time message
        
        if (selectedConversation) {
          const currentUserId = user.id;
          const otherUserId = selectedConversation.isNewChat 
            ? selectedConversation.other_user_id 
            : selectedConversation.id;
          
          // Check if this message is part of the current conversation
          const isPartOfCurrentConversation = 
            (newMessage.sender_id === currentUserId && newMessage.receiver_id === otherUserId) ||
            (newMessage.sender_id === otherUserId && newMessage.receiver_id === currentUserId);
          
          // Add message to current conversation if it matches
          
          if (isPartOfCurrentConversation) {
            setMessages(prevMessages => {
              // Check if message already exists to prevent duplicates
              const messageExists = prevMessages.some(msg => msg.id === newMessage.id);
              if (messageExists) {
                return prevMessages;
              }
              return [...prevMessages, newMessage];
            });
          }
        }
        
        // TODO: Update conversation list with latest message
      };

      socket.on('newMessage', handleNewMessage);
      socket.on('messageError', (error) => toast.error(error.message));

      return () => {
        socket.off('newMessage', handleNewMessage);
        socket.off('messageError');
      };
    }
  }, [socket, user, selectedConversation]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !selectedConversation) return;

    // Handle new chats vs existing conversations
    const receiverId = selectedConversation.isNewChat 
      ? selectedConversation.other_user_id 
      : selectedConversation.other_user_id || selectedConversation.id;

    // Send message via Socket.IO

    socket.emit('sendMessage', {
      senderId: user.id,
      receiverId: receiverId,
      messageText: newMessage,
      projectId: projectId, // Pass projectId if it exists
    });
    setNewMessage('');

    // If this was a new chat, we should update it to a real conversation after first message
    if (selectedConversation.isNewChat) {
      const updatedConversation = {
        ...selectedConversation,
        id: receiverId,
        isNewChat: false,
        last_message: newMessage
      };
      setSelectedConversation(updatedConversation);
      setConversations(prev => [updatedConversation, ...prev.filter(c => c.id !== selectedConversation.id)]);
      // Update URL to reflect the real conversation
      navigate(`/messages/${receiverId}`, { replace: true });
    }
  };

  const handleSelectConversation = (conv) => {
    navigate(`/messages/${conv.id}`);
    setSelectedConversation(conv);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size must be less than 5MB');
        return;
      }
      
      setSelectedImage(file);
      const preview = URL.createObjectURL(file);
      setImagePreview(preview);
    }
  };

  const clearImageSelection = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadImage = async () => {
    if (!selectedImage || !selectedConversation) return;

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', selectedImage);
      
      const receiverId = selectedConversation.isNewChat 
        ? selectedConversation.other_user_id 
        : selectedConversation.other_user_id || selectedConversation.id;
      
      formData.append('receiverId', receiverId);
      if (projectId) {
        formData.append('projectId', projectId);
      }

      const response = await fetch('/api/messages/upload-image', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        // Add the new image message to the messages list
        setMessages(prev => [...prev, data.message]);
        clearImageSelection();
        toast.success('Image sent successfully!');
        
        // If this was a new chat, update it to a real conversation
        if (selectedConversation.isNewChat) {
          const updatedConversation = {
            ...selectedConversation,
            id: receiverId,
            isNewChat: false,
            last_message: 'Image'
          };
          setSelectedConversation(updatedConversation);
          setConversations(prev => [updatedConversation, ...prev.filter(c => c.id !== selectedConversation.id)]);
          navigate(`/messages/${receiverId}`, { replace: true });
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to send image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to send image');
    } finally {
      setIsUploadingImage(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold">Messages</h1>
          {socket && (
            <div className={`text-xs sm:text-sm px-2 py-1 rounded ${socket.connected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {socket.connected ? '🟢 Connected' : '🔴 Disconnected'}
            </div>
          )}
        </div>
        <div className="flex flex-col lg:flex-row border rounded-lg bg-white shadow-lg overflow-hidden" 
             style={{ height: 'calc(100vh - 140px)', maxHeight: '700px', minHeight: '500px' }}>
        {/* Sidebar for conversations */}
        <div className={`flex w-full lg:w-1/3 lg:border-r flex-col lg:min-w-0 ${selectedConversation ? 'hidden lg:flex' : ''}`}>
          <div className="p-3 sm:p-4 border-b bg-white">
            <h2 className="text-lg sm:text-xl font-semibold">Conversations</h2>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {conversations.length > 0 ? (
              conversations.map(conv => (
                <div key={conv.id} 
                     className={`p-3 sm:p-4 cursor-pointer hover:bg-gray-100 transition-colors ${selectedConversation?.id === conv.id ? 'bg-purple-50 border-r-2 border-purple-500' : ''}`}
                     onClick={() => handleSelectConversation(conv)}>
                  <div className="flex items-center space-x-3">
                    <ProtectedAvatar 
                      src={conv.profile_image} 
                      alt={conv.name} 
                      fallbackText={conv.name.charAt(0)}
                      className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm sm:text-base truncate">{conv.name}</p>
                        <p className="text-xs sm:text-sm text-gray-500 truncate">{conv.last_message || 'No messages yet'}</p>
                        {conv.last_message_date && (
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(conv.last_message_date).toLocaleDateString()}
                          </p>
                        )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-gray-500 text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Your conversations will appear here.</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat window */}
        <div className={`${selectedConversation ? 'flex' : 'hidden lg:flex'} w-full lg:w-2/3 flex-col`}>
          {selectedConversation ? (
            <>
              <div className="p-3 sm:p-4 border-b flex items-center bg-white">
                <button 
                  className="lg:hidden mr-3 p-1 hover:bg-gray-100 rounded"
                  onClick={() => setSelectedConversation(null)}
                >
                  ←
                </button>
                <ProtectedAvatar 
                  src={selectedConversation.profile_image} 
                  alt={selectedConversation.name} 
                  fallbackText={selectedConversation.name.charAt(0)}
                  className="mr-3 h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0"
                />
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-xl font-semibold truncate">{selectedConversation.name}</h2>
                  {selectedConversation.user_type && (
                    <p className="text-xs sm:text-sm text-gray-500 capitalize">{selectedConversation.user_type}</p>
                  )}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50 scrollbar-thin" style={{ maxHeight: 'calc(100% - 120px)' }}>
                {selectedConversation.isNewChat && messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 min-h-[300px]">
                    <MessageSquare className="w-16 h-16 mb-4 text-gray-300" />
                    <h3 className="text-lg font-semibold mb-2">Start a new conversation</h3>
                    <p className="text-sm">Send a message to {selectedConversation.name} to begin your conversation.</p>
                    {projectId && (
                      <p className="text-sm mt-2 text-purple-600">This conversation will be linked to your project.</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2 sm:space-y-3">
                    {messages.map((msg, index) => (
                      <div key={index} className={`flex ${msg.sender_id === user.id ? 'justify-end' : 'justify-start'}`}>
                        <div className={`p-2 sm:p-3 rounded-lg max-w-[85%] sm:max-w-lg break-words ${msg.sender_id === user.id ? 'bg-purple-600 text-white' : 'bg-white text-black border shadow-sm'}`}>
                          {msg.message_type === 'image' ? (
                            <div>
                              <ArtworkImage 
                                src={msg.file_url} 
                                alt="Shared image" 
                                className="max-w-full h-auto rounded-lg mb-2"
                                style={{ maxHeight: '200px', minWidth: '150px' }}
                                showWatermark={false}
                                protectionLevel="medium"
                              />
                              {msg.message_text && (
                                <p className="text-sm">{msg.message_text}</p>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm sm:text-base">{msg.message_text}</p>
                          )}
                          <div className={`text-xs mt-1 ${msg.sender_id === user.id ? 'text-purple-200' : 'text-gray-500'}`}>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
                            <div className="p-3 sm:p-4 border-t bg-white">
                {/* Image Preview */}
                {imagePreview && (
                  <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <ArtworkImage
                          src={imagePreview}
                          alt="Preview"
                          className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded"
                          showWatermark={false}
                          protectionLevel="low"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">Ready to send image</p>
                          <p className="text-xs text-gray-500 truncate">{selectedImage?.name}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2 flex-shrink-0">
                        <Button
                          onClick={uploadImage}
                          disabled={isUploadingImage}
                          size="sm"
                          className="text-xs"
                        >
                          {isUploadingImage ? 'Sending...' : 'Send'}
                        </Button>
                        <Button
                          onClick={clearImageSelection}
                          variant="outline"
                          size="sm"
                          className="p-1"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Message Input */}
                <div className="flex items-end space-x-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    size="icon"
                    className="h-10 w-10 flex-shrink-0"
                  >
                    <Image className="h-4 w-4" />
                  </Button>
                  <form onSubmit={handleSendMessage} className="flex items-end space-x-2 flex-1">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 resize-none"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                    />
                    <Button 
                      type="submit" 
                      disabled={!newMessage.trim()}
                      className="h-10 w-10 p-0"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </div>
            </>
                    ) : (
             <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
                <MessageSquare className="w-16 h-16 mb-4 text-gray-300" />
                <h2 className="text-lg sm:text-xl font-semibold mb-2">Select a conversation</h2>
                <p className="text-center text-sm sm:text-base">Choose a conversation from the list to start chatting.</p>
             </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
