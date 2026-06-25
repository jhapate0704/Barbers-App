import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

const API_BASE = import.meta.env.VITE_API_URL;
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

export const useBooking = (selectedSalon) => {
  const [allSalonBookings, setAllSalonBookings] = useState([]);

  const fetchBookings = useCallback(() => {
    if (selectedSalon) {
      axios.get(`${API_BASE}/bookings/salon/${selectedSalon._id}`).then(res => {
        if (Array.isArray(res.data)) {
          setAllSalonBookings(res.data);
        }
      }).catch(() => {});
    }
  }, [selectedSalon]);

  useEffect(() => {
    if (!SOCKET_URL) return;
    const socket = io(SOCKET_URL);
    fetchBookings();
    socket.on('queue_updated', fetchBookings);
    return () => {
      socket.off('queue_updated', fetchBookings);
      socket.disconnect();
    };
  }, [selectedSalon, fetchBookings]);

  return { allSalonBookings, fetchBookings };
};
