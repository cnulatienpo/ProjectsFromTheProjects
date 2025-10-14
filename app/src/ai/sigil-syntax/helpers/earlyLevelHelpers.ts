export function generateRandomQuote(): string {
  const quotes = [
    'To be or not to be, that is the question.',
    'All that glitters is not gold.',
    'The only thing we have to fear is fear itself.',
    'In the end, we will remember not the words of our enemies, but the silence of our friends.',
    'The pen is mightier than the sword.',
  ]
  const randomIndex = Math.floor(Math.random() * quotes.length)
  return quotes[randomIndex]
}

export function formatQuote(quote: string, author: string): string {
  return `"${quote}" - ${author}`
}

export function getQuoteOfTheDay(): { quote: string; author: string } {
  const quote = generateRandomQuote()
  const author = 'Unknown'
  return { quote, author }
}
