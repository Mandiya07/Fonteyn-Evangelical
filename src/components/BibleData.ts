export interface Verse {
  ref: string;
  text: string;
  theme: string;
}

export interface Devotional {
  id: string;
  title: string;
  scripture: string;
  passage: string;
  content: string;
  reflection: string;
  prayerStarter: string;
}

export interface ReadingDay {
  day: number;
  ref: string;
  thought: string;
  passage: string;
}

export interface ReadingPlan {
  id: string;
  title: string;
  duration: string;
  tag: string;
  description: string;
  days: ReadingDay[];
}

export interface PrayerStep {
  title: string;
  scripture: string;
  guidance: string;
  prompt: string;
}

export interface PrayerGuide {
  id: string;
  title: string;
  tag: string;
  description: string;
  steps: PrayerStep[];
}

export const dailyVerses: Verse[] = [];
export const preseededScriptures: any[] = [];
export const devotionalList: Devotional[] = [];
export const readingPlans: ReadingPlan[] = [];
export const prayerGuides: PrayerGuide[] = [];
export const miniBible: Record<string, Array<{ v: number; t: string }>> = {};
