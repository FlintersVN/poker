<template>
    <div class="col-start-2 col-span-4 justify-self-center place-self-stretch">
        <div
        class="bg-sky-200 block lg:min-w-[18vw] lg:min-h-[9vw] md:min-w-[40vw] md:min-h-[20vw] min-w-[50vw] min-h-[25vw] rounded-3xl flex"
        >
        <div class="self-center m-auto">
            <button
            v-show="showRevealCards && !cardsUp && !state.flippingCards"
            class="
                bg-blue-500
                hover:bg-blue-400
                py-2
                px-8
                rounded-lg
                font-bold
                text-white
            "
            @click="onFlipsCardsClicked"
            >Lật bài</button>

            <span v-show="!showRevealCards" class="text-gray-700">Pick your cards!</span>

            <span v-if="state.flippingCards" class="font-bold text-blue-500">{{state.counter}}</span>

            <button
            v-show="state.showStartVote"
            @click="onNewVoteClicked"
            class="
                font-bold
                bg-slate-700
                hover:bg-slate-500
                rounded-md
                p-2
                text-white
            "
            >Start a new vote</button>
        </div>
        </div>
    </div>
</template>

<script setup lang="ts">

import { defineEmits, provide, reactive } from 'vue';

const $emit = defineEmits(['card-flipped', 'card-flipping', 'vote-created', 'vote-creating'])

const defaultCountdown = 3

interface Props {
  cardsUp: Boolean
  showRevealCards: Boolean
  countdown?: number
}

const props = defineProps<Props>()

const state = reactive({
  flippingCards: false,
  showStartVote: false,
  counter: 0
})

function onNewVoteClicked() {
  $emit('vote-creating');
  createNewVote();
  $emit('vote-created');
}

function createNewVote() {
  state.showStartVote = false;
}

function onFlipsCardsClicked() {
  $emit('card-flipping');
  flipsCards();
}

function flipsCards() {
  state.flippingCards = true;
  state.counter = props.countdown || defaultCountdown;

  let handler = setInterval(() => {
    state.counter--;
    if (!state.counter) {
      clearInterval(handler);
      state.flippingCards = false;
      state.showStartVote = true;
      $emit('card-flipped');
    }
  }, 1000);
}

provide('table', {flipsCards});

// export default {
//   // emits: ['card-flipped', 'card-flipping', 'vote-created', 'vote-creating'],
//     // props: {
//     //   cardsUp: {
//     //     type: Boolean,
//     //     default: false
//     //   },
//     //   showRevealCards: {
//     //     type: Boolean,
//     //     default: false
//     //   },
//     //   countdown: {
//     //     type: Number,
//     //     default: 3
//     //   }
//     // },
//     // data() {
//     //   return {
//     //     flippingCards: false,
//     //     showStartVote: false,
//     //     counter: 0
//     //   }
//     // },
//     methods: {
//       // onNewVoteClicked() {
//       //   this.$emit('vote-creating');
//       //   this.createNewVote();
//       //   this.$emit('vote-created');
//       // },
//       // createNewVote() {
//       //   this.showStartVote = false;
//       // },
//       // onFlipsCardsClicked() {
//       //   this.$emit('card-flipping');
//       //   this.flipsCards();
//       // },
//       // flipsCards() {
//       //   this.flippingCards = true;
//       //   this.counter = this.countdown || 3;

//       //   let handler = setInterval(() => {
//       //     this.counter--;
//       //     if (!this.counter) {
//       //       clearInterval(handler);
//       //       this.flippingCards = false;
//       //       this.showStartVote = true;
//       //       this.$emit('card-flipped');
//       //     }
//       //   }, 1000);
//       // }
//     }
// }
</script>
