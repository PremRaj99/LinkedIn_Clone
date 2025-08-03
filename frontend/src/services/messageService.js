import api from './api';

class MessageService {
  // Conversations
  async getConversations(page = 1, limit = 20) {
    const response = await api.get('/messages/conversations', {
      params: { page, limit }
    });
    return response;
  }

  async getOrCreateConversation(participantIds) {
    const response = await api.post('/messages/conversations', {
      participants: participantIds
    });
    return response;
  }

  async deleteConversation(conversationId) {
    const response = await api.delete(`/messages/conversations/${conversationId}`);
    return response;
  }

  async archiveConversation(conversationId) {
    const response = await api.put(`/messages/conversations/${conversationId}/archive`);
    return response;
  }

  // Messages
  async getMessages(conversationId, page = 1, limit = 50) {
    const response = await api.get(`/messages/conversations/${conversationId}/messages`, {
      params: { page, limit }
    });
    return response;
  }

  async sendMessage(conversationId, messageData) {
    const formData = new FormData();

    formData.append('content', messageData.content);
    formData.append('messageType', messageData.messageType || 'text');

    if (messageData.replyTo) {
      formData.append('replyTo', messageData.replyTo);
    }

    if (messageData.attachments && messageData.attachments.length > 0) {
      messageData.attachments.forEach((file) => {
        formData.append('attachments', file);
      });
    }

    const response = await api.post(`/messages/conversations/${conversationId}/messages`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response;
  }

  async updateMessage(messageId, content) {
    const response = await api.put(`/messages/messages/${messageId}`, { content });
    return response;
  }

  async deleteMessage(messageId) {
    const response = await api.delete(`/messages/messages/${messageId}`);
    return response;
  }

  async markAsRead(conversationId) {
    const response = await api.put(`/messages/conversations/${conversationId}/read`);
    return response;
  }

  // Search messages
  async searchMessages(query, conversationId = null) {
    const response = await api.get('/messages/search', {
      params: { q: query, conversationId }
    });
    return response;
  }

  // Typing indicators
  async setTypingStatus(conversationId, isTyping) {
    const response = await api.post(`/messages/conversations/${conversationId}/typing`, {
      isTyping
    });
    return response;
  }

  // Message reactions
  async reactToMessage(messageId, reaction) {
    const response = await api.post(`/messages/messages/${messageId}/react`, {
      reaction
    });
    return response;
  }
}

export const messageService = new MessageService();
export default messageService;
