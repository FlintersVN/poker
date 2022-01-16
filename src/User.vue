
<template>
    <div class="inline-block text-center">
        <div v-if="namePosition === 'top'" class="mb-2 font-bold text-gray-700">{{user.name}}</div>
        <div class="max-w-[32pt] min-w-[32pt] rounded-md min-h-[72px] m-auto pt-6 font-bold text-blue-500" v-bind:class="userStateClasses">
        <template v-if="cardsUp">{{user.point}}</template>
        </div>
        <div v-if="namePosition === 'bottom'" class="mt-2 font-bold text-gray-700">{{user.name}}</div>
    </div>
</template>

<script>
    export default {
        props: {
            user: Object,
            cardsUp: false,
            namePosition: {
                type: String,
                default: "bottom"
            }
        },
        computed: {
            userStateClasses() {
                if (this.user.point !== null && this.cardsUp) {
                    return [
                    'ring-2',
                    'ring-blue-500'
                    ];
                } else if (this.user.point !== null) {
                    return [
                    'bg-purple-400'
                    ];
                }

                return [
                    'bg-gray-200'
                ];
            }
        }
    }
</script>
