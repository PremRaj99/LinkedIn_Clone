import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect(userId) {
    if (this.socket) {
      this.disconnect();
    }

    const serverURL = process.env.REACT_APP_SOCKET_URL || 'https://linkedin-clone-sj2q.onrender.com/';

    this.socket = io(serverURL, {
      auth: {
        token: localStorage.getItem('token'),
        userId: userId
      },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
      console.log('Socket connected:', this.socket.id);
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      console.log('Socket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Message events
  emit(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  // Specific event handlers
  joinRoom(roomId) {
    this.emit('join_room', { roomId });
  }

  leaveRoom(roomId) {
    this.emit('leave_room', { roomId });
  }

  sendMessage(conversationId, message) {
    this.emit('send_message', {
      conversationId,
      ...message
    });
  }

  setTyping(conversationId, isTyping) {
    this.emit('typing', {
      conversationId,
      isTyping
    });
  }

  updateUserStatus(status) {
    this.emit('user_status', { status });
  }

  // Real-time notifications
  sendNotification(userId, notification) {
    this.emit('notification', {
      userId,
      ...notification
    });
  }

  // Video call events
  initiateCall(userId, callType = 'video') {
    this.emit('call_initiate', {
      userId,
      callType
    });
  }

  acceptCall(callId) {
    this.emit('call_accept', { callId });
  }

  rejectCall(callId) {
    this.emit('call_reject', { callId });
  }

  endCall(callId) {
    this.emit('call_end', { callId });
  }

  // Group events
  joinGroup(groupId) {
    this.emit('join_group', { groupId });
  }

  leaveGroup(groupId) {
    this.emit('leave_group', { groupId });
  }

  // Post real-time updates
  subscribeToPost(postId) {
    this.emit('subscribe_post', { postId });
  }

  unsubscribeFromPost(postId) {
    this.emit('unsubscribe_post', { postId });
  }

  // Live activity feed
  subscribeToActivityFeed() {
    this.emit('subscribe_activity_feed');
  }

  unsubscribeFromActivityFeed() {
    this.emit('unsubscribe_activity_feed');
  }

  isSocketConnected() {
    return this.isConnected && this.socket && this.socket.connected;
  }
}

export const socketService = new SocketService();
export default socketService;
