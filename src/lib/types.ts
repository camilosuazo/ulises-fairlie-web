export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  classesPerMonth: number;
  features: string[];
  popular?: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  freeClassUsed: boolean;
  currentPlan?: string;
  classesRemaining: number;
  createdAt: Date;
}

export interface ScheduledClass {
  id: string;
  userId: string;
  date: Date;
  time: string;
  meetLink?: string;
  status: "scheduled" | "completed" | "cancelled";
  notes?: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}
