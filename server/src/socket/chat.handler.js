import { Message } from '../models/Message.js';
import { WebSocket } from 'ws';

export const handleChat = (ws, wss, message) => {
  const { type, payload } = message;

  switch (type) {
    case 'JOIN_ROOM':
      handleJoin(ws, payload);
      break;
    case 'SEND_MESSAGE':
      handleSendMessage(ws, wss, payload);
      break;
    case 'DELETE_MESSAGE':
      handleDeleteMessage(ws, wss, payload);
    default:
      break;
  }
};

async function handleJoin(ws, { roomId, userName }) {
  ws.roomId = roomId;
  ws.userName = userName;

  const history = await Message.findAll({
    where: { roomId },
    order: [['createdAt', 'ASC']],
    limit: 50,
  });

  ws.send(JSON.stringify({ type: 'LOAD_HISTORY', payload: history }));
}

async function handleSendMessage(ws, wss, { roomId, text, author }) {
  const newMessage = await Message.create({ roomId, author, text });
  const message = JSON.stringify({ type: 'NEW_MESSAGE', payload: newMessage });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && client.roomId === roomId) {
      client.send(message);
    }
  });
}

async function handleDeleteMessage(ws, wss, { id, roomId }) {
  try {
    const mes = await Message.findOne({
      where: { id, roomId },
    });

    if (!mes) {
      ws.send(
        JSON.stringify({
          type: 'ERROR',
          payload: { message: 'Message not found' },
        }),
      );
      return;
    }

    if (mes.author !== ws.userName) {
      ws.send(
        JSON.stringify({
          type: 'ERROR',
          payload: {
            message: 'You do not have permission to delete this message.',
          },
        }),
      );
      return;
    }

    await Message.destroy({ where: { id, roomId } });

    const deleteNotify = JSON.stringify({
      type: 'DELETE_MESSAGE',
      payload: { id, roomId },
    });

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN && client.roomId === roomId) {
        client.send(deleteNotify);
      }
    });
  } catch (error) {
    console.error('Delete error:', error);
    ws.send(
      JSON.stringify({
        type: 'ERROR',
        payload: { message: 'Server error while deleting' },
      }),
    );
  }
}
