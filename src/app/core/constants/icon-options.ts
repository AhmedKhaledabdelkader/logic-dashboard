export interface IconOption {
  label: string;
  class: string; // Bootstrap Icons class name, stored as-is in the DB
}

/**
 * Curated so editors pick from a sane, on-brand set rather than
 * typing an arbitrary Bootstrap Icons class name by hand. Add more
 * entries here as new sections need them — nothing else changes.
 */
export const VALUE_ICON_OPTIONS: IconOption[] = [
  { label: 'Lightbulb', class: 'bi-lightbulb' },
  { label: 'People', class: 'bi-people' },
  { label: 'Globe', class: 'bi-globe' },
  { label: 'Growth', class: 'bi-graph-up-arrow' },
  { label: 'Shield', class: 'bi-shield-check' },
  { label: 'Handshake', class: 'bi-hand-index-thumb' },
  { label: 'Target', class: 'bi-bullseye' },
  { label: 'Clock', class: 'bi-clock-history' },
  { label: 'Star', class: 'bi-star' },
  { label: 'Award', class: 'bi-award' },
  { label: 'Compass', class: 'bi-compass' },
  { label: 'Puzzle', class: 'bi-puzzle' },
];