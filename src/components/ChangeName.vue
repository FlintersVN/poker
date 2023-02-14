<template>
    <div>
        <div class="text-lg">
        How I call you?
        <div class="text-gray-600 text-sm inline">Too hard to think 🤔 <button class="ml-1 text-blue-500" @click="random">Pick a random</button></div>
        </div>
        
        <div class="inline-flex">
            <input v-model="state.name" type="text" class="border-2 p-2 rounded">
            <button type="button" @click="$emit('changed', state.name)" class="mx-1" title="Save changes">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 stroke-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            </button>
            <button @click="$emit('discard')" class="text-gray-500 hover:text-gray-700">Discard</button>
        </div>
    </div>
</template>

<script setup lang="ts">

import names from '../names'
import {reactive} from 'vue'

const $emit = defineEmits(['changed', 'discard'])

const props = defineProps({
    current: {
        type: String,
        required: true
    }
})

const state = reactive({name: props.current})

function random() {
    state.name = names.random()
}

</script>
