<script setup lang="ts">
import { useEditor } from '@/stores/editor';
import '@m3e/web/dialog';
import '@m3e/web/list';
import '@m3e/web/button';
import '@m3e/web/icon-button';
import '@m3e/web/icon';
import '@m3e/web/expansion-panel';
import '@m3e/web/form-field';
import '@m3e/web/select';
import '@m3e/web/option';
import { M3eDialogElement } from '@m3e/web/dialog';
import { storeToRefs } from 'pinia';
import { onMounted, ref, useTemplateRef, watch } from 'vue';
import ActionStep from './ActionStep.vue';
import type { ActionEvent } from '@/interfaces/ActionEvent';
import { eventTypes } from '@/types/action';
import { toStartCase } from '@/utils/string';

const editorStore = useEditor();

const { activeElement, vector } = storeToRefs(editorStore);
const eventsDialog = useTemplateRef<M3eDialogElement>('eventsDialog');
const actions = ref<ActionEvent[]>([]);

function openEventsDialog() {
	if (!eventsDialog.value || !vector.value) return;
	actions.value = vector.value.events;
	eventsDialog.value.show();
}

function onActionChange(action: ActionEvent) {
	console.log('Action:', action);
	console.log('Actions:', actions.value);
	const foundIndex = actions.value.findIndex((a) => a.id === action.id);
	if (foundIndex === -1) {
		console.error('Index not found.');
		return;
	}

	console.log('Changing action:', foundIndex, action);

	actions.value[foundIndex] = action;
}

function createAction() {
	const actionEvent: ActionEvent = {
		id: window.crypto.randomUUID(),
		event: 'on_element_click',
		element: activeElement.value?.attr('mvct-id'),
		title: 'Set X to 100px',
		type: 'set',
		property: 'x',
		value: '100',
		unit: 'px',
	};

	actions.value.push(actionEvent);
}

watch(
	actions,
	(newActions) => {
		console.log('New actions:', newActions);
		if (vector.value) vector.value.events = newActions;
	},
	{ deep: true, immediate: true },
);

onMounted(() => {
	editorStore.openEventsFunction = openEventsDialog;
});
</script>

<template>
	<m3e-dialog ref="eventsDialog" dismissible>
		<span slot="header">Configure Events</span>
		<m3e-list>
			<m3e-list-item v-for="(action, index) in actions" :key="action.id">
				<m3e-expansion-panel class="action-expand">
					<span slot="header">{{ action.title }}</span>
					<m3e-form-field>
						<label slot="label" for="event-select">Event</label>
						<m3e-select id="event-select">
							<m3e-option
								v-for="event in eventTypes"
								:key="event"
								:selected="event === action.event"
								:value="event"
								>{{ toStartCase(event) }}</m3e-option
							>
						</m3e-select>
					</m3e-form-field>
					<p>Actions</p>
					<ActionStep :action="action" @change="onActionChange"></ActionStep>
				</m3e-expansion-panel>
				<m3e-icon-button slot="trailing" @click="actions.splice(index, 1)">
					<m3e-icon name="remove"></m3e-icon>
				</m3e-icon-button>
			</m3e-list-item>
			<m3e-list-item>
				Create action
				<m3e-icon-button slot="trailing" @click="createAction()">
					<m3e-icon name="add"></m3e-icon>
				</m3e-icon-button>
			</m3e-list-item>
		</m3e-list>
		<div slot="actions" end>
			<m3e-button variant="filled" @click="editorStore.saveFunction()">
				<m3e-dialog-action>Save</m3e-dialog-action>
			</m3e-button>
		</div>
	</m3e-dialog>
</template>

<style scoped>
.action-expand {
	--m3e-expansion-panel-shape: 25px;
	--m3e-expansion-panel-open-shape: 25px;
}
</style>
