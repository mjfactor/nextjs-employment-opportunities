import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPageTitle(path: string): string {
  // Extract folder name from path
  const folderName = path.split('/').filter(Boolean).pop() || '';

  // Convert kebab-case or snake_case to Title Case with spaces
  const formattedName = folderName
    .replace(/-|_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());

  return `${formattedName} | ForestAI`;
}

