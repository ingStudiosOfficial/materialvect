import type { ActionType, PropertyChange } from '@/types/action';

export interface ActionEvent {
	id: string;
	title: string;
	type: ActionType;
	property: PropertyChange;
	value: string;
	unit: string;
}
