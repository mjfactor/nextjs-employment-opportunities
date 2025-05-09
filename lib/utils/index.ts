import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combines multiple class values into a single className string,
 * merging Tailwind CSS classes appropriately.
 * 
 * @param inputs - Array of class values to be combined
 * @returns Combined className string with proper Tailwind merging
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
