export interface Sermon {
  id: string;
  title: string;
  speaker: string;
  date: string;
  topic: string;
  scripture: string;
  videoUrl?: string;
  audioUrl?: string;
  notes: string;
  summary?: string;
  bibleReferences?: string[];
  discussionQuestions?: string[];
  socialPosts?: string[];
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  time: string;
  location: string;
  image: string;
  category: 'Worship' | 'Youth' | 'Conference' | 'Outreach' | 'Study' | 'General';
  registeredUsers: string[];
  maxCapacity: number;
  volunteerSpots: string[];
  volunteers: string[];
}

export interface Ministry {
  id: string;
  name: string;
  description: string;
  leader: {
    name: string;
    role: string;
    photo: string;
    contact: string;
    bio: string;
  };
  schedule: string;
  activities: string[];
  gallery: string[];
}

export interface Comment {
  id: string;
  author: string;
  text: string;
  date: string;
  approved?: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  author: string;
  date: string;
  category: string;
  tags: string[];
  content: string;
  comments: Comment[];
  likes: number;
}

export interface Donation {
  id: string;
  donorName: string;
  donorEmail: string;
  amount: number;
  purpose: 'Tithes' | 'Offerings' | 'Building Fund' | 'Missions Fund';
  paymentMethod: 'Mobile Money' | 'Bank Transfer' | 'Debit Card' | 'Credit Card';
  date: string;
  receiptNumber: string;
}

export interface PrayerRequest {
  id: string;
  name: string;
  email?: string;
  isPrivate: boolean;
  isAnonymous: boolean;
  requestText: string;
  date: string;
  isAnswered: boolean;
  answersCount: number;
}

export interface CounselingBooking {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateTime: string;
  type: 'Counseling' | 'Home Visit' | 'Hospital Visit';
  reason: string;
  status: 'Pending' | 'Confirmed' | 'Completed';
  pastor: string;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  district: string;
  familyGroup: string;
  familyRelation?: string; // e.g. "Father / Head", "Mother", "Son", "Daughter"
  servingDepartment: string;
  role: 'Member' | 'Leader' | 'Admin';
  photo: string;
  bio: string;
  givingHistory: Array<{
    date: string;
    purpose: string;
    amount: number;
    txId: string;
  }>;
  serviceRegistry?: Array<{
    role: string;
    title: string;
    date: string;
    time: string;
  }>;
  privacySettings: {
    hideContact: boolean;
    hideEmail?: boolean;
    hideDistrict?: boolean;
    hideEntireProfile?: boolean;
  };
}

export interface PhotoAlbum {
  id: string;
  title: string;
  date: string;
  category: 'Worship Services' | 'Conferences' | 'Youth Events' | 'Outreach Programs' | 'Special Events';
  photos: string[];
}

export interface Video {
  id: string;
  title: string;
  date: string;
  category: 'Worship Services' | 'Conferences' | 'Youth Events' | 'Outreach Programs' | 'Special Events';
  platform: 'YouTube' | 'Facebook' | 'Vimeo';
  videoId: string;
  url: string;
}

export interface Livestream {
  id: string;
  title: string;
  platform: 'YouTube' | 'Facebook';
  videoId: string;
  url: string;
  status: 'upcoming' | 'live' | 'ended';
  startTime: string; // ISO format or string
}

export interface DonationReceipt {
  id: string;
  donorName: string;
  amount: number;
  purpose: string;
  paymentMethod: string;
  date: string;
  txId: string;
}

export interface PastorContact {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  pastor: string;
  date: string;
}


