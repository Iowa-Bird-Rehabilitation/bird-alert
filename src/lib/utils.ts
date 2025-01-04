import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-us', { year:"2-digit",day:"2-digit", month:"2-digit"})
}

export function formatTime(time: string) {
  return new Date(time).toLocaleTimeString('en-us', {hour:"numeric", minute:"2-digit"})
}

export function renderSecondVolunteerElements(rescue : BirdAlert, twoPersonRescue: Boolean) {
  if (!twoPersonRescue) return

  if (rescue.secondVolunteer !== "None") {
      return `, ${rescue.secondVolunteer}`
  }else if (rescue.secondVolunteer === "None" && rescue.currentVolunteer !== "None") {
      return `, SECOND VOLUNTEER NEEDED`
  }
}

export function getCurrentDateAndTime() {
  const currentDateAndTime = new Date().toLocaleString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    year: '2-digit',
    month: 'numeric',
    day: 'numeric'
  });
  return currentDateAndTime
}


