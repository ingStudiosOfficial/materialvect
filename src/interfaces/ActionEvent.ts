import type { ActionType, EventTypes, PropertyChange } from '@/types/action';

export interface ActionEvent {
	id: string;
	event: EventTypes;
	element: string;
	title: string;
	type: ActionType;
	property: PropertyChange;
	value: string;
	unit: string;
}
