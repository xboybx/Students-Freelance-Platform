import { User, Skill, Booking } from '../types';

export const getUsers = (): User[] => {
  return JSON.parse(localStorage.getItem('users') || '[]');
};

export const saveUser = (user: User) => {
  const users = getUsers();
  users.push(user);
  localStorage.setItem('users', JSON.stringify(users));
};

export const getSkills = (): Skill[] => {
  return JSON.parse(localStorage.getItem('skills') || '[]');
};

export const saveSkill = (skill: Skill) => {
  const skills = getSkills();
  skills.push(skill);
  localStorage.setItem('skills', JSON.stringify(skills));
};

export const updateSkill = (skillId: string, updates: Partial<Skill>) => {
  const skills = getSkills();
  const updatedSkills = skills.map(skill =>
    skill.id === skillId ? { ...skill, ...updates } : skill
  );
  localStorage.setItem('skills', JSON.stringify(updatedSkills));
};

export const getBookings = (): Booking[] => {
  return JSON.parse(localStorage.getItem('bookings') || '[]');
};

export const saveBooking = (booking: Booking) => {
  const bookings = getBookings();
  bookings.push(booking);
  localStorage.setItem('bookings', JSON.stringify(bookings));
};

export const updateBooking = (bookingId: string, updates: Partial<Booking>) => {
  const bookings = getBookings();
  const updatedBookings = bookings.map(booking =>
    booking.id === bookingId ? { ...booking, ...updates } : booking
  );
  localStorage.setItem('bookings', JSON.stringify(updatedBookings));
};