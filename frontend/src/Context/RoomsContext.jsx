import React from 'react';
import { useRef } from 'react';
import { useState } from 'react';
import { roomsService } from '../services/roomsService';
import { useEffect } from 'react';

export const RoomsContext = React.createContext();

export const RoomsProvider = ({ children }) => {
  const [rooms, setRooms] = useState([]);
  const socketRef = useRef(null);

  const getRooms = async () => {
    const data = await roomsService.getAll();
    setRooms(data);
  };

  const sendMessage = (type, payload) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type, payload }));
    } else {
      console.warn('Error');
    }
  };

  useEffect(() => {
    getRooms();

    socketRef.current = new WebSocket(import.meta.env.VITE_WS_URL);

    socketRef.current.onopen = () => console.log('WS connected');

    socketRef.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      const { type, data } = message;

      switch (type) {
        case 'ROOM_CREATED':
          setRooms((prev) => [...prev, data]);
          break;
        case 'ROOM_DELETED':
          setRooms((prev) => prev.filter((room) => room.id !== data.id));
          break;
        case 'ROOM_UPDATED':
          setRooms((prev) =>
            prev.map((room) => (room.id === data.id ? data : room)),
          );
          break;
        default:
          break;
      }
    };

    socketRef.current.onclose = () => console.log('WS disconnected');

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  const value = {
    rooms,
    socket: socketRef.current,
    sendMessage,
  };

  return (
    <RoomsContext.Provider value={value}>{children}</RoomsContext.Provider>
  );
};
