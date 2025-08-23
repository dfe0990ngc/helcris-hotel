import { User, Room, Booking, Report } from '../types';
import { dummyUsers, dummyRooms, dummyBookings, dummyReport } from '../data/dummyData';

// Simulate API delays
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// In a real application, these would be actual API calls to Laravel backend
export const api = {
  // Authentication
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    await delay(1000);
    const user = dummyUsers.find(u => u.email === email);
    if (user && (password === 'admin123' || password === 'guest123')) {
      return { user, token: 'dummy-jwt-token' };
    }
    throw new Error('Invalid credentials');
  },

  async register(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    await delay(1000);
    const newUser: User = {
      ...userData,
      id: Math.max(...dummyUsers.map(u => u.id)) + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    dummyUsers.push(newUser);
    return newUser;
  },

  // Rooms
  async getRooms(): Promise<Room[]> {
    await delay(500);
    return dummyRooms;
  },

  async getRoom(id: number): Promise<Room> {
    await delay(500);
    const room = dummyRooms.find(r => r.id === id);
    if (!room) throw new Error('Room not found');
    return room;
  },

  async createRoom(roomData: Omit<Room, 'id' | 'created_at' | 'updated_at'>): Promise<Room> {
    await delay(1000);
    const newRoom: Room = {
      ...roomData,
      id: Math.max(...dummyRooms.map(r => r.id)) + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    dummyRooms.push(newRoom);
    return newRoom;
  },

  async updateRoom(id: number, roomData: Partial<Room>): Promise<Room> {
    await delay(1000);
    const index = dummyRooms.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Room not found');
    
    dummyRooms[index] = {
      ...dummyRooms[index],
      ...roomData,
      updated_at: new Date().toISOString(),
    };
    return dummyRooms[index];
  },

  async deleteRoom(id: number): Promise<void> {
    await delay(500);
    const index = dummyRooms.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Room not found');
    dummyRooms.splice(index, 1);
  },

  // Bookings
  async getBookings(): Promise<Booking[]> {
    await delay(500);
    return dummyBookings.map(booking => ({
      ...booking,
      user: dummyUsers.find(u => u.id === booking.user_id),
      room: dummyRooms.find(r => r.id === booking.room_id),
    }));
  },

  async getUserBookings(userId: number): Promise<Booking[]> {
    await delay(500);
    return dummyBookings
      .filter(b => b.user_id === userId)
      .map(booking => ({
        ...booking,
        room: dummyRooms.find(r => r.id === booking.room_id),
      }));
  },

  async createBooking(bookingData: Omit<Booking, 'id' | 'created_at' | 'updated_at' | 'user' | 'room'>): Promise<Booking> {
    await delay(1000);
    const newBooking: Booking = {
      ...bookingData,
      id: Math.max(...dummyBookings.map(b => b.id)) + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    dummyBookings.push(newBooking);
    return {
      ...newBooking,
      user: dummyUsers.find(u => u.id === newBooking.user_id),
      room: dummyRooms.find(r => r.id === newBooking.room_id),
    };
  },

  async updateBooking(id: number, bookingData: Partial<Booking>): Promise<Booking> {
    await delay(1000);
    const index = dummyBookings.findIndex(b => b.id === id);
    if (index === -1) throw new Error('Booking not found');
    
    dummyBookings[index] = {
      ...dummyBookings[index],
      ...bookingData,
      updated_at: new Date().toISOString(),
    };
    
    return {
      ...dummyBookings[index],
      user: dummyUsers.find(u => u.id === dummyBookings[index].user_id),
      room: dummyRooms.find(r => r.id === dummyBookings[index].room_id),
    };
  },

  // Reports
  async getReports(): Promise<Report> {
    await delay(1000);
    return dummyReport;
  },

  // Users
  async getUsers(): Promise<User[]> {
    await delay(500);
    return dummyUsers;
  },
};