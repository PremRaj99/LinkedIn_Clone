import React, { useState, useEffect, useRef } from 'react';
import {
  PaperAirplaneIcon,
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
  UserPlusIcon,
  VideoCameraIcon,
  PhoneIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { messageService } from '../services/messageService';
import { socketService } from '../services/socketService';

const MessagesPage = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const setupSocketListeners = () => {
      socketService.connect();

      socketService.on('newMessage', (message) => {
        if (selectedConversation && message.conversation === selectedConversation._id) {
          setMessages(prev => [...prev, message]);
        }

        // Update conversation list with latest message
        setConversations(prev =>
          prev.map(conv =>
            conv._id === message.conversation
              ? { ...conv, lastMessage: message, updatedAt: message.createdAt }
              : conv
          )
        );
      });

      socketService.on('messageRead', ({ conversationId, messageIds }) => {
        if (selectedConversation && selectedConversation._id === conversationId) {
          setMessages(prev =>
            prev.map(msg =>
              messageIds.includes(msg._id) ? { ...msg, readBy: [...(msg.readBy || []), user._id] } : msg
            )
          );
        }
      });
    };

    fetchConversations();
    setupSocketListeners();

    return () => {
      socketService.disconnect();
    };
  }, [selectedConversation, user._id]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation._id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const response = await messageService.getConversations();
      setConversations(response.conversations || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await messageService.getMessages(conversationId);
      setMessages(response.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const setupSocketListeners = () => {
    socketService.connect();

    socketService.on('newMessage', (message) => {
      if (selectedConversation && message.conversation === selectedConversation._id) {
        setMessages(prev => [...prev, message]);
      }

      // Update conversation list with latest message
      setConversations(prev =>
        prev.map(conv =>
          conv._id === message.conversation
            ? { ...conv, lastMessage: message, updatedAt: message.createdAt }
            : conv
        )
      );
    });

    socketService.on('messageRead', ({ conversationId, messageIds }) => {
      if (selectedConversation && selectedConversation._id === conversationId) {
        setMessages(prev =>
          prev.map(msg =>
            messageIds.includes(msg._id) ? { ...msg, readBy: [...(msg.readBy || []), user._id] } : msg
          )
        );
      }
    });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || sending) return;

    setSending(true);
    try {
      const messageData = {
        content: newMessage.trim(),
        type: 'text'
      };

      const response = await messageService.sendMessage(selectedConversation._id, messageData);
      setNewMessage('');

      // Add message to local state immediately for better UX
      setMessages(prev => [...prev, response.message]);

      // Update conversation list
      setConversations(prev =>
        prev.map(conv =>
          conv._id === selectedConversation._id
            ? { ...conv, lastMessage: response.message, updatedAt: response.message.createdAt }
            : conv
        )
      );
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleStartConversation = async (participantId) => {
    try {
      const response = await messageService.createConversation({ participants: [participantId] });
      setConversations(prev => [response.conversation, ...prev]);
      setSelectedConversation(response.conversation);
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString();
    }
  };

  const getOtherParticipant = (conversation) => {
    return conversation.participants?.find(p => p._id !== user._id);
  };

  const filteredConversations = conversations.filter(conv => {
    const otherParticipant = getOtherParticipant(conv);
    return otherParticipant?.name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="h-screen bg-white flex">
      {/* Conversations Sidebar */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
              <UserPlusIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-9 pr-4 py-2 bg-gray-100 border-0 rounded-full text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center space-x-3 animate-pulse">
                  <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 mb-2">No conversations found</div>
              <button className="text-blue-600 hover:text-blue-700 text-sm">
                Start a new conversation
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredConversations.map((conversation) => {
                const otherParticipant = getOtherParticipant(conversation);
                const isSelected = selectedConversation?._id === conversation._id;

                return (
                  <div
                    key={conversation._id}
                    onClick={() => setSelectedConversation(conversation)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${isSelected ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                      }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <img
                          src={otherParticipant?.avatar || '/images/default-avatar.png'}
                          alt={otherParticipant?.name}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                        <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-400 border-2 border-white rounded-full"></div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {otherParticipant?.name}
                          </h3>
                          <span className="text-xs text-gray-500">
                            {conversation.lastMessage && formatTime(conversation.lastMessage.createdAt)}
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 truncate">
                          {conversation.lastMessage?.content || 'No messages yet'}
                        </p>
                      </div>

                      {conversation.unreadCount > 0 && (
                        <div className="h-5 w-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                          {conversation.unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={getOtherParticipant(selectedConversation)?.avatar || '/images/default-avatar.png'}
                    alt={getOtherParticipant(selectedConversation)?.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">
                      {getOtherParticipant(selectedConversation)?.name}
                    </h2>
                    <p className="text-sm text-green-600">Online</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                    <PhoneIcon className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                    <VideoCameraIcon className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                    <InformationCircleIcon className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                    <EllipsisVerticalIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => {
                const isOwnMessage = message.sender._id === user._id;
                const showDate = index === 0 ||
                  formatDate(message.createdAt) !== formatDate(messages[index - 1].createdAt);

                return (
                  <div key={message._id}>
                    {showDate && (
                      <div className="text-center py-2">
                        <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                          {formatDate(message.createdAt)}
                        </span>
                      </div>
                    )}

                    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-2' : ''}`}>
                        <div
                          className={`px-4 py-2 rounded-lg ${isOwnMessage
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                            }`}
                        >
                          <p className="text-sm">{message.content}</p>
                        </div>
                        <div className={`text-xs text-gray-500 mt-1 ${isOwnMessage ? 'text-right' : ''}`}>
                          {formatTime(message.createdAt)}
                          {isOwnMessage && message.readBy?.length > 1 && (
                            <span className="ml-1">✓✓</span>
                          )}
                        </div>
                      </div>

                      {!isOwnMessage && (
                        <img
                          src={message.sender.avatar || '/images/default-avatar.png'}
                          alt={message.sender.name}
                          className="h-8 w-8 rounded-full object-cover ml-2 order-1"
                        />
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
                <div className="flex-1">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                    placeholder="Type a message..."
                    rows={1}
                    className="w-full px-4 py-2 border border-gray-300 rounded-full resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <PaperAirplaneIcon className="h-5 w-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          /* No Conversation Selected */
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="h-24 w-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No conversation selected</h3>
              <p className="text-gray-600">Choose a conversation from the sidebar to start messaging.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
