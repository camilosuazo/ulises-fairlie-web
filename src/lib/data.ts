import { Plan, TimeSlot } from "./types";

export const plans: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    description: "Ideal para comenzar tu viaje en el inglés",
    price: 45000,
    currency: "CLP",
    classesPerMonth: 4,
    features: [
      "4 clases de 60 minutos al mes",
      "Conversación básica",
      "Vocabulario cotidiano",
      "Material de apoyo digital",
      "Seguimiento de progreso",
    ],
  },
  {
    id: "progress",
    name: "Progress",
    description: "Para quienes buscan avanzar más rápido",
    price: 80000,
    currency: "CLP",
    classesPerMonth: 8,
    features: [
      "8 clases de 60 minutos al mes",
      "Gramática + conversación",
      "Preparación para entrevistas",
      "Corrección de pronunciación",
      "Material personalizado",
      "Soporte por WhatsApp",
    ],
    popular: true,
  },
  {
    id: "intensive",
    name: "Intensive",
    description: "Inmersión total para resultados rápidos",
    price: 110000,
    currency: "CLP",
    classesPerMonth: 12,
    features: [
      "12 clases de 60 minutos al mes",
      "Inmersión total",
      "Business English",
      "Preparación certificaciones",
      "Clases de emergencia",
      "Soporte prioritario 24/7",
      "Recursos premium ilimitados",
    ],
  },
];

export const availableTimeSlots: TimeSlot[] = [
  { time: "09:00", available: true },
  { time: "10:00", available: true },
  { time: "11:00", available: false },
  { time: "12:00", available: true },
  { time: "14:00", available: true },
  { time: "15:00", available: true },
  { time: "16:00", available: false },
  { time: "17:00", available: true },
  { time: "18:00", available: true },
  { time: "19:00", available: true },
];

export function formatPrice(price: number, currency: string): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
  }).format(price);
}
