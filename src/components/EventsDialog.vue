<script setup lang="ts">
import { useEditor } from '@/stores/editor';
import '@m3e/web/dialog';
import '@m3e/web/list';
import '@m3e/web/icon-button';
import '@m3e/web/icon';
import '@m3e/web/expansion-panel';
import '@m3e/web/form-field';
import '@m3e/web/select';
import '@m3e/web/option';
import { M3eDialogElement } from '@m3e/web/dialog';
import { storeToRefs } from 'pinia';
import { onMounted, ref, useTemplateRef } from 'vue';
import ActionStep from './ActionStep.vue';
import type { ActionEvent } from '@/interfaces/ActionEvent';

const editorStore = useEditor();

const { activeElement } = storeToRefs(editorStore);
const eventsDialog = useTemplateRef<M3eDialogElement>('eventsDialog');
const actions = ref<ActionEvent[]>([]);

function openEventsDialog() {
	if (!eventsDialog.value) return;
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
		title: 'Set X to 100px',
		type: 'Set',
		property: 'X',
		value: '100',
		unit: 'px',
	};

	actions.value.push(actionEvent);
}

onMounted(() => {
	editorStore.openEventsFunction = openEventsDialog;
});
</script>

<template>
	<m3e-dialog ref="eventsDialog" dismissible>
		<span slot="header">Configure Events</span>
		<m3e-list>
			<m3e-list-item v-for="action in actions" :key="action.id">
				<m3e-expansion-panel class="action-expand">
					<span slot="header">{{ action.title }}</span>
					<m3e-form-field>
						<label slot="label" for="event-select">Event</label>
						<m3e-select id="event-select">
							<m3e-option>On vector load</m3e-option>
							<m3e-option>On element hover</m3e-option>
							<m3e-option>On element click</m3e-option>
						</m3e-select>
					</m3e-form-field>
					<p>Actions</p>
					<ActionStep :action="action" @change="onActionChange"></ActionStep>
				</m3e-expansion-panel>
				<m3e-icon-button slot="trailing">
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
	</m3e-dialog>
</template>

<style scoped>
.action-expand {
	--m3e-expansion-panel-shape: 25px;
	--m3e-expansion-panel-open-shape: 25px;
}
</style>
