import axios from 'axios';

export interface Notification {
  id: string;
  userId: string;
  role: 'citizen' | 'admin' | 'worker';
  message: string;
  isRead: boolean;
  createdAt: string;
}

const notificationService = {
  getNotifications: async (): Promise<Notification[]> => {
    const response = await axios.get('/api/notifications');
    return response.data;
  },

  markAsRead: async (id: string): Promise<Notification> => {
    const response = await axios.patch(`/api/notifications/${id}`);
    return response.data;
  },

  markAllAsRead: async (): Promise<void> => {
    await axios.patch('/api/notifications/read-all');
  },

  subscribeToNotifications: (token: string, onNotification: (notification: Notification) => void) => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}?token=${token}`);

    ws.onmessage = (event) => {
      const notification = JSON.parse(event.data);
      onNotification(notification);
    };

    return () => ws.close();
  }
};

export default notificationService;
