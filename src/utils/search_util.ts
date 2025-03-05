import { picoSearch } from "@scmmishra/pico-search";
import { fuzzySearch } from "@abdurahman/fuzzy-search";

export class SearchUtil {
  /** Default fuzzy search threshold */
  private readonly fuzzyThreashold: number = 0.8;

  /**
   * Performs fuzzy search on an array of objects
   * @param things Array of objects to search through
   * @param searchTerm Term to search for
   * @param keys Object keys to search in
   * @returns The best matching object or undefined if none found
   */
  public fuzzyFind<T>(
    things: Array<T>,
    searchTerm: string,
    keys: Array<keyof T>,
  ): T | undefined {
    if (!things || things.length === 0) {
      console.warn(`No items to search through for term: "${searchTerm}"`);
      return undefined;
    }

    const attributes = keys.map((key) => key.toString().toLowerCase());
    const results = picoSearch(things, searchTerm, attributes, {
      threshold: this.fuzzyThreashold,
    });

    if (results.length === 0) {
      console.warn(`No matches found for search term: "${searchTerm}"`);
    }

    return results[0];
  }

  public fuzzyRank<T>(
    things: Array<T>,
    searchTerms: Array<string>,
    keys: Array<keyof T>,
  ): Array<{ thing: T; rating: number }> {
    if (!things || things.length === 0) {
      console.warn(`No items to rank for term: "${searchTerms}"`);
      return [];
    }

    return things
      .map((thing) => {
        const rating = keys
          .flatMap((key) => {
            return searchTerms.map((query) => {
              const haystack = String(thing[key]);
              const searchResult = fuzzySearch(query, haystack);
              return searchResult?.score || 0;
            });
          })
          .reduce((p, n) => p + n);

        return { thing, rating };
      })
      .toSorted((a, b) => b.rating - a.rating);
  }
}
