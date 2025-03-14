const { WebSocketServer } = require("ws");

class NotificationSystem {
  constructor(server) {
    this.clients = new Map();
    this.wss = new WebSocketServer({ server });

    this.wss.on("connection", (ws, req) => {
      const urlParams = new URLSearchParams(req.url.split("?")[1]);
      const userId = urlParams.get("userId");

      if (userId) {
        this.clients.set(userId, ws);
        console.log(`Doctor ${userId} connected`);

        ws.on("close", () => {
          this.clients.delete(userId);
          console.log(`Doctor ${userId} disconnected`);
        });
      }
    });
  }

  notifyDoctor(doctorId, appointment) {
    const ws = this.clients.get(doctorId);
    if (ws) {
      ws.send(
        JSON.stringify({
          type: "new_appointment",
          appointment: appointment,
        })
      );
    } else {
      console.log(`No WebSocket connection found for doctor ${doctorId}`);
    }
  }
}

let notificationSystemInstance = null;

const initializeNotificationSystem = (server) => {
  if (!notificationSystemInstance) {
    notificationSystemInstance = new NotificationSystem(server);
  }
  return notificationSystemInstance;
};

const getNotificationSystem = () => {
  if (!notificationSystemInstance) {
    throw new Error("Notification system has not been initialized. Call initializeNotificationSystem first.");
  }
  return notificationSystemInstance;
};

module.exports = { initializeNotificationSystem, getNotificationSystem };