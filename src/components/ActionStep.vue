<script setup lang="ts">
import { computed, ref } from 'vue';
import '@m3e/web/form-field';
import '@m3e/web/select';
import '@m3e/web/option';

const properties = ['X', 'Y', 'Width', 'Height'] as const;
const changeTypes = ['Set', 'Move'] as const;

type PropertyChange = (typeof properties)[number];
type ChangeType = (typeof changeTypes)[number];

const propertyChange = ref<PropertyChange>('X');
const changeType = ref<ChangeType>('Set');
const propertyValue = ref<string>('');
const propertyUnit = ref<string>('');
const componentId = ref<string>(window.crypto.randomUUID());

const changeVerb = computed(() => {
	switch (changeType.value) {
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
	if (propertyChange.value === 'X' || propertyChange.value === 'Y') {
		return ['px'];
	} else {
		return ['px'];
	}
});
</script>

<template>
	<div class="actions-wrapper">
		<div class="property-setter">
			<m3e-form-field class="type">
				<label slot="label" :for="`${componentId}-type`">Change type</label>
				<m3e-select :id="`${componentId}-type`">
					<m3e-option v-for="type in changeTypes" :key="type">{{ type }}</m3e-option>
				</m3e-select>
			</m3e-form-field>
			<m3e-form-field class="property">
				<label slot="label" :for="`${componentId}-property`">Property</label>
				<m3e-select :id="`${componentId}-property`">
					<m3e-option v-for="property in properties" :key="property">{{
						property
					}}</m3e-option>
				</m3e-select>
			</m3e-form-field>
		</div>
		<p>{{ changeVerb }}</p>
		<div class="value-setter">
			<m3e-form-field class="value">
				<label slot="label" :for="`${componentId}-value`">Value</label>
				<input :id="`${componentId}-value`" v-model="propertyValue" />
			</m3e-form-field>
			<m3e-form-field class="unit">
				<label slot="label" :for="`${componentId}-unit`">Unit</label>
				<m3e-select :id="`${componentId}-unit`">
					<m3e-option v-for="unit in validUnits" :key="unit">{{ unit }}</m3e-option>
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
