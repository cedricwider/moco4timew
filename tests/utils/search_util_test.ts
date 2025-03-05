import { assertEquals } from '@std/assert';
import { SearchUtil } from '../../src/mod.ts';

Deno.test('fuzzyRank - empty array', () => {
  const searcher = new SearchUtil();
  const result = searcher.fuzzyRank([], ['test'], ['name' as keyof never]);
  assertEquals(result, []);
});

Deno.test('fuzzyRank - single item exact match', () => {
  const searcher = new SearchUtil();
  const items = [{ name: 'apple', category: 'fruit' }];

  const result = searcher.fuzzyRank(items, ['apple'], [
    'name',
    'category',
  ] as Array<keyof (typeof items)[0]>);

  assertEquals(result.length, 1);
  assertEquals(result[0].thing, items[0]);
  assertEquals(result[0].rating, 1.0); // Exact match on "name"
});

Deno.test('fuzzyRank - multiple items with different scores', () => {
  const searcher = new SearchUtil();
  const items = [
    { name: 'apple', category: 'fruit' },
    { name: 'banana', category: 'fruit' },
    { name: 'apple pie', category: 'dessert' },
  ];

  const result = searcher.fuzzyRank(items, ['apple'], [
    'name',
    'category',
  ] as Array<keyof (typeof items)[0]>);

  // Expected ranking:
  // - "apple" (exact match on name)
  // - "apple pie" (partial match on name)
  // - "banana" (no match)

  assertEquals(result.length, 3);
  assertEquals(result[0].thing, items[0]);
  assertEquals(result[1].thing, items[2]);
  assertEquals(result[2].thing, items[1]);
});

Deno.test('fuzzyRank - multiple search terms', () => {
  const searcher = new SearchUtil();
  const items = [
    { name: 'apple', category: 'fruit' },
    { name: 'banana', category: 'tropical fruit' },
    { name: 'apple pie', category: 'dessert' },
  ];

  const result = searcher.fuzzyRank(items, ['apple', 'tropical'], [
    'name',
    'category',
  ] as Array<keyof (typeof items)[0]>);

  assertEquals(result.length, 3);
  assertEquals(result[0].thing, items[0]);
  assertEquals(result[1].thing, items[1]);
  assertEquals(result[2].thing, items[2]);
});

Deno.test('fuzzyRank - no matches', () => {
  const searcher = new SearchUtil();
  const items = [
    { name: 'apple', category: 'fruit' },
    { name: 'banana', category: 'fruit' },
  ];

  const result = searcher.fuzzyRank(items, ['orange'], [
    'name',
    'category',
  ] as Array<keyof (typeof items)[0]>);

  assertEquals(result.length, 2);
  assertEquals(
    result.every((item) => item.rating === 0),
    true,
  );
});
