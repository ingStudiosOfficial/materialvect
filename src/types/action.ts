export const properties = ['X', 'Y', 'Width', 'Height'] as const;
export const actionTypes = ['Set', 'Move'] as const;

export type PropertyChange = (typeof properties)[number];
export type ActionType = (typeof actionTypes)[number];
