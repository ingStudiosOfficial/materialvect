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
import { onMounted, useTemplateRef } from 'vue';
import ActionStep from './ActionStep.vue';

const editorStore = useEditor();

//const { activeElement } = storeToRefs(editorStore);
const eventsDialog = useTemplateRef<M3eDialogElement>('eventsDialog');

function openEventsDialog() {
	if (!eventsDialog.value) return;
	eventsDialog.value.show();
}

onMounted(() => {
	editorStore.openEventsFunction = openEventsDialog;
});
</script>

<template>
	<m3e-dialog ref="eventsDialog" dismissible>
		<span slot="header">Configure Events</span>
		<m3e-list>
			<m3e-list-item>
				<m3e-expansion-panel class="action-expand">
					<span slot="header">Fill var(--md-sys-color-surface-container)</span>
					<m3e-form-field>
						<label slot="label" for="event-select">Event</label>
						<m3e-select id="event-select">
							<m3e-option>On vector load</m3e-option>
							<m3e-option>On element hover</m3e-option>
							<m3e-option>On element click</m3e-option>
						</m3e-select>
					</m3e-form-field>
					<p>Actions</p>
					<ActionStep></ActionStep>
				</m3e-expansion-panel>
				<m3e-icon-button slot="trailing">
					<m3e-icon name="remove"></m3e-icon>
				</m3e-icon-button>
			</m3e-list-item>
			<m3e-list-item>
				Create action
				<m3e-icon-button slot="trailing">
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
