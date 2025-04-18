'use client'

import { ReadableMemoizedMarkdown } from '../ui/memoized-markdown'

interface ReadableBotMessageProps {
  message: string
}

export function ReadableBotMessage({ message }: ReadableBotMessageProps) {
  return (
    <ReadableMemoizedMarkdown
      id={`readable-message-${Date.now()}`}
      content={message}
    />
  )
}
