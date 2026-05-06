<script setup lang="ts">
import { computed, nextTick, ref, useTemplateRef } from 'vue';
import '@m3e/web/form-field';
import '@m3e/web/select';
import '@m3e/web/option';
import { M3eSelectElement } from '@m3e/web/select';
import { type PropertyChange, type ActionType, properties, actionTypes } from '@/types/action';
import type { ActionEvent } from '@/interfaces/ActionEvent';

interface ComponentProps {
	action: ActionEvent;
}

interface ComponentEmits {
	(e: 'change', action: ActionEvent): void;
}

const props = defineProps<ComponentProps>();

const emit = defineEmits<ComponentEmits>();

const propertyId = ref<string>(props.action.id || window.crypto.randomUUID());
const propertyAction = ref<PropertyChange>(props.action.property || 'X');
const actionType = ref<ActionType>(props.action.type || 'Set');
const propertyValue = ref<string>(props.action.value || '100');
const propertyUnit = ref<string>(props.action.unit || 'px');
const componentId = ref<string>(props.action.id || window.crypto.randomUUID());
const typeSelect = useTemplateRef<M3eSelectElement>('typeSelect');
const propertySelect = useTemplateRef<M3eSelectElement>('propertySelect');
const unitSelect = useTemplateRef<M3eSelectElement>('unitSelect');

const changeVerb = computed(() => {
	switch (actionType.value) {
		case 'Set': {
			return 'to';
		}

		case 'Move': {
			return 'by';
		}

		default: {
			return 'to';
		}
	}
});

const validUnits = computed<string[]>(() => {
	if (propertyAction.value === 'X' || propertyAction.value === 'Y') {
		return ['px'];
	} else {
		return ['px'];
	}
});

const actionTitle = computed(() => {
	return `${actionType.value} ${propertyAction.value} ${changeVerb.value} ${propertyValue.value}${propertyUnit.value}`;
});

const actionEvent = computed<ActionEvent>(() => {
	return {
		id: propertyId.value,
		title: actionTitle.value,
		type: actionType.value,
		property: propertyAction.value,
		value: propertyValue.value,
		unit: propertyUnit.value,
	};
});

async function onTypeSelect() {
	if (!typeSelect.value) return;
	await nextTick();
	actionType.value = typeSelect.value.value as ActionType;
	emit('change', actionEvent.value);
}

async function onPropertySelect() {
	if (!propertySelect.value) return;
	await nextTick();
	propertyAction.value = propertySelect.value.value as PropertyChange;
	emit('change', actionEvent.value);
}

async function onUnitSelect() {
	if (!unitSelect.value) return;
	await nextTick();
	propertyUnit.value = unitSelect.value.value as string;
	emit('change', actionEvent.value);
}
</script>

<template>
	<div class="actions-wrapper">
		<div class="property-setter">
			<m3e-form-field class="type">
				<label slot="label" :for="`${componentId}-type`">Action type</label>
				<m3e-select ref="typeSelect" :id="`${componentId}-type`" @change="onTypeSelect()">
					<m3e-option
						v-for="type in actionTypes"
						:key="type"
						:selected="type === actionType"
						>{{ type }}</m3e-option
					>
				</m3e-select>
			</m3e-form-field>
			<m3e-form-field class="property">
				<label slot="label" :for="`${componentId}-property`">Property</label>
				<m3e-select
					ref="propertySelect"
					:id="`${componentId}-property`"
					@change="onPropertySelect()"
				>
					<m3e-option
						v-for="property in properties"
						:key="property"
						:selected="property === propertyAction"
						>{{ property }}</m3e-option
					>
				</m3e-select>
			</m3e-form-field>
		</div>
		<p>{{ changeVerb }}</p>
		<div class="value-setter">
			<m3e-form-field class="value">
				<label slot="label" :for="`${componentId}-value`">Value</label>
				<input
					:id="`${componentId}-value`"
					v-model="propertyValue"
					@input="emit('change', actionEvent)"
				/>
			</m3e-form-field>
			<m3e-form-field class="unit">
				<label slot="label" :for="`${componentId}-unit`">Unit</label>
				<m3e-select ref="unitSelect" :id="`${componentId}-unit`" @change="onUnitSelect()">
					<m3e-option
						v-for="unit in validUnits"
						:key="unit"
						:selected="unit === propertyUnit"
						>{{ unit }}</m3e-option
					>
				</m3e-select>
			</m3e-form-field>
		</div>
	</div>
</template>

<style scoped>
.actions-wrapper {
	width: 100%;
	box-sizing: border-box;
}

.property-setter,
.value-setter {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: flex-start;
	gap: 10px;
	width: 100%;
}

.type {
	width: 50%;
}

.property {
	width: 50%;
}

.value {
	width: 70%;
}

.unit {
	width: 30%;
}
</style>
