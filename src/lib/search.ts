// lib/search.ts
/**
 * Simple fuzzy search implementation
 */
export function fuzzySearch<T>(
  items: T[],
  query: string,
  keys: (keyof T)[]
): T[] {
  if (!query) return items;

  const normalizedQuery = query.toLowerCase().trim();

  return items
    .map((item) => {
      let score = 0;

      for (const key of keys) {
        const value = String(item[key] || "").toLowerCase();

        // Exact match gets highest score
        if (value === normalizedQuery) {
          score += 100;
          continue;
        }

        // Starts with query gets high score
        if (value.startsWith(normalizedQuery)) {
          score += 50;
          continue;
        }

        // Contains query gets medium score
        if (value.includes(normalizedQuery)) {
          score += 25;
          continue;
        }

        // Fuzzy match (all characters in order)
        if (fuzzyMatch(value, normalizedQuery)) {
          score += 10;
        }
      }

      return { item, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item);
}

/**
 * Check if all characters in query appear in text in order
 */
function fuzzyMatch(text: string, query: string): boolean {
  let queryIndex = 0;

  for (let i = 0; i < text.length && queryIndex < query.length; i++) {
    if (text[i] === query[queryIndex]) {
      queryIndex++;
    }
  }

  return queryIndex === query.length;
}

/**
 * Highlight matching text in a string
 */
export function highlightText(text: string, query: string): string {
  if (!query) return text;

  const regex = new RegExp(`(${escapeRegExp(query)})`, "gi");
  return text.replace(regex, "<mark>$1</mark>");
}

/**
 * Escape special regex characters
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
