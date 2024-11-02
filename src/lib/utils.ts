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

