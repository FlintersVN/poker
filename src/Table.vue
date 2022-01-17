<template>
    <div class="col-start-2 col-span-4 justify-self-center place-self-stretch">
        <div
        class="bg-sky-200 block lg:min-w-[18vw] lg:min-h-[9vw] md:min-w-[40vw] md:min-h-[20vw] min-w-[50vw] min-h-[25vw] rounded-3xl flex"
        >
        <div class="self-center m-auto">
            <button
            v-show="showRevealCards && !cardsUp && !flippingCards"
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

            <span v-if="flippingCards" class="font-bold text-blue-500">{{countdown}}</span>

            <button
            v-show="showStartVote"
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

<script>

export default {
    props: {
      cardsUp: {
        type: Boolean,
        default: false
      },
      showRevealCards: {
        type: Boolean,
        default: false
      },
      onCardsFlipped: {
        type: Function
      },
      onFlippingCardsRequested: {
        type: Function
      },
      onNewVote: {
        type: Function
      },
      onNewVoteRequested: {
        type: Function
      }
    },
    data() {
        return {
            flippingCards: false,
            showStartVote: false,
            countdown: 0
        }
    },
    methods: {
      onNewVoteClicked() {
        this.onNewVoteRequested();
        this.createNewVote();
      },
      createNewVote() {
        this.showStartVote = false;
        this.onNewVote();
      },
      onFlipsCardsClicked() {
        this.onFlippingCardsRequested();
        this.flipsCards();
      },
      flipsCards() {
        this.flippingCards = true;
        this.countdown = 3;

        let handler = setInterval(() => {
          this.countdown--;
          if (!this.countdown) {
            clearInterval(handler);
            this.flippingCards = false;
            this.showStartVote = true;
            this.onCardsFlipped()
          }
        }, 1000);
      }
    }
}
</script>
