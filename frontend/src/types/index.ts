export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  skills: Skill[];
  role: 'mentor' | 'student';
}

export type SkillCategory = 
  | 'Software Development'
  | 'Design'
  | 'Music'
  | 'Language'
  | 'Sports'
  | 'Arts'
  | 'Literature'
  | 'Mathematics'
  | 'Science'
  | 'Business'
  | 'Social Skills'
  | 'Other';

export const SKILL_CATEGORIES: SkillCategory[] = [
  'Software Development',
  'Design',
  'Music',
  'Language',
  'Sports',
  'Arts',
  'Literature',
  'Mathematics',
  'Science',
  'Business',
  'Social Skills',
  'Other'
];

export interface Skill {
  id: string;
  userId: string;
  title: string;
  description: string;
  rate: number;
  category: SkillCategory;
}

export interface Booking {
  id: string;
  skillId: string;
  learnerId: string;
  teacherId: string;
  date: string;
  status: 'pending' | 'ongoing' | 'completed' | 'cancelled';
  startTime?: string;
  endTime?: string;
}