// A nice vibrant palette
const PALETTE = [
  "#3369E8", // Blue
  "#D50F25", // Red
  "#EEB211", // Yellow
  "#009925", // Green
  "#FF6D00", // Orange
  "#A142F4", // Purple
  "#00BCD4", // Cyan
  "#EC407A", // Pink
  "#8BC34A", // Light Green
  "#795548", // Brown
  "#607D8B", // Blue Grey
];

export const getSegmentColor = (index: number, total: number) => {
  return PALETTE[index % PALETTE.length];
};