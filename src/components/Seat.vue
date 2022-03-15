
<template>
  <div class="inline-block text-center">
    <div v-if="namePosition === 'top'" class="mb-2 font-bold text-gray-700">
      {{ user.name }}
    </div>
    <div
      class="
        max-w-[32pt]
        min-w-[32pt]
        rounded-md
        min-h-[72px]
        m-auto
        pt-6
        text-center
        font-bold
        text-blue-500
      "
      v-bind:class="userStateClasses"
    >
      <template v-if="user.viewOnly">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 inline-block fill-gray-400"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
          <path
            fill-rule="evenodd"
            d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
            clip-rule="evenodd"
          />
        </svg>
      </template>
      <template v-else-if="!user.viewOnly && cardsUp">{{ user.point }}</template>
    </div>
    <div v-if="namePosition === 'bottom'" class="mt-2 font-bold text-gray-700">
      {{ user.name }}
    </div>
  </div>
</template>

<script>
export default {
  props: {
    user: Object,
    cardsUp: false,
    namePosition: {
      type: String,
      default: "bottom",
    },
  },
  computed: {
    userStateClasses() {
      if (this.user.viewOnly) {
        return ['border-[3px]', 'border-dashed', 'bg-gray-100'];
      }

      if (this.user.point !== null && this.cardsUp) {
        return ["ring-2", "ring-blue-500"];
      } else if (this.user.point !== null) {
        return ["bg-purple-400"];
      }

      return ["bg-gray-200"];
    },
  },
};
</script>
