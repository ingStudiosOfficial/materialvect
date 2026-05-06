export const eventTypes = ['on_vector_load', 'on_element_hover', 'on_element_click'] as const;
export const properties = ['x', 'y', 'width', 'height'] as const;
export const actionTypes = ['set', 'move'] as const;

export type EventTypes = (typeof eventTypes)[number];
export type PropertyChange = (typeof properties)[number];
export type ActionType = (typeof actionTypes)[number];
