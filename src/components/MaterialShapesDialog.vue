<script setup lang="ts">
import { useEditor } from '@/stores/editor';
import { onMounted, useTemplateRef } from 'vue';
import '@m3e/web/dialog';
import { M3eDialogElement } from '@m3e/web/dialog';
import { fetchMaterialShapes } from '@/utils/shapes';
import { ref } from 'vue';
import '@m3e/web/card';
import '@m3e/web/tooltip';

const editorStore = useEditor();

const materialShapesDialog = useTemplateRef<M3eDialogElement>('materialShapesDialog');
const shapes = ref<Record<string, string>[]>([]);

function openMaterialShapesDialog() {
	materialShapesDialog.value?.show();
}

function onShapeSelect(shapeString?: string) {
	if (!shapeString) return;
	editorStore.createMaterialShape(shapeString);
	materialShapesDialog.value?.hide();
}

onMounted(() => {
	editorStore.openMaterialShapesFunction = openMaterialShapesDialog;
	shapes.value = fetchMaterialShapes();
	console.log('Shapes:', shapes.value);
});
</script>

<template>
	<m3e-dialog ref="materialShapesDialog" dismissible>
		<span slot="header">Insert Material Shape</span>
		<p>Select a Material shape from the gallery of pre-created shapes.</p>
		<div class="shapes">
			<m3e-card
				v-for="(shapeObj, index) in shapes"
				:key="index"
				:id="`mvct-material-shape-${index}`"
				class="shape-card"
				actionable
				@click="onShapeSelect(Object.values(shapeObj)[0])"
			>
				<div v-for="(content, name) in shapeObj" :key="name">
					<div class="shape-wrapper" v-html="content"></div>
					<m3e-tooltip :for="`mvct-material-shape-${index}`">{{
						name.replace(/^.*[\\/]/, '').replace(/\.svg$/, '')
					}}</m3e-tooltip>
				</div>
			</m3e-card>
		</div>
		<p>
			Shapes sourced from the
			<a href="https://m3.material.io/styles/shape" target="_blank">Material Design website</a
			>.
		</p>
	</m3e-dialog>
</template>

<style scoped>
.shapes {
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	grid-template-rows: auto;
	gap: 10px;
}

.shape-wrapper {
	width: 10svh;
	height: 10svh;
	align-self: center;
	justify-self: center;
}

.shape-wrapper:deep(svg) {
	width: 100%;
	height: 100%;
}
</style>
