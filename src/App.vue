<template>
  <div class="flex flex-col min-h-[90vh]">
    <div class="min-h-[15vh] m-auto pt-5">
      <div v-if="username">
        <h3 class="text-lg"><span class="text-gray-600">Hi, </span><b>{{username}}</b> 😊
        
        <button class="text-blue-400 pointer" @click="changingName = true">Change name</button> | 
        <button class="text-blue-400 pointer" @click="createNewTable">Create new table</button> |
        <input type="checkbox" v-model="modeViewOnly"> ViewOnly
        </h3>
      </div>

      <div v-if="!username || changingName" class="mt-5">
        <div>How I call you?</div>
        <div class="relative inline-block">
          <input ref="username" type="text" :value="username" class="border-2 p-2 rounded">
          <button class="absolute bottom-[2px] right-[-44px]" type="button" @click="setUsername">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 stroke-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <div class="lg:w-1/3 md:w-10/12 m-auto min-h-[60vh]">
      <div class="grid grid-cols-6 gap-6">
        <!-- Top players -->
        <div class="col-start-2 col-span-4">
          <div class="flex justify-around">
            <user v-for="(user, index) in topUsers" v-bind:key="index" :user="user" :cards-up="cardsUp" :name-position="'top'"></user>
          </div>
        </div>

        <!-- Left players -->
        <div class="col-start-1 self-center justify-self-end">
          <user v-for="(user, index) in leftUsers" v-bind:key="index" :user="user" :cards-up="cardsUp"></user>
        </div>

        <!-- Table -->
        <Table ref="desk" 
          :cardsUp="cardsUp"
          :showRevealCards="showRevealCards"
          :onNewVoteRequested="onNewVoteRequested"
          :onCardsFlipped="onCardsUp"
          :onNewVote="onNewVote"
          :onFlippingCardsRequested="onFlippingCardsRequested"></Table>

        <!-- Right players -->
        <div class="col-end-7 self-center">
          <user v-for="(user, index) in rightUsers" v-bind:key="index" :user="user" :cards-up="cardsUp"></user>
        </div>

        <!-- Bottom players -->
        <div class="col-start-2 col-span-4">
          <div class="flex justify-around">
            <user v-for="(user, index) in bottomUsers" v-bind:key="index" :user="user" :cards-up="cardsUp"></user>
          </div>
        </div>
      </div>
    </div>

    <!-- Cards -->
    <div class="mt-10 m-auto text-center min-h-[12vh]">
      <div v-if="cardsUp">
        <div 
        class="inline-block ml-3"
        v-for="(voteCount, point) in votedPoints"
        v-bind:key="point"
        >
          <button class="font-bold min-w-[32pt] py-6 rounded-md ring-slate-700 ring-2">
            {{point}}
          </button>
          <div class="text-gray-700 mt-2">{{voteCount}} votes</div>
        </div>
      </div>
      <div v-if="!this.modeViewOnly && !this.cardsUp">
        <h3 class="mb-5">Choose your card 👇</h3>
        <button
          class="font-bold ml-3 min-w-[32pt] py-6 rounded-md ring-blue-500 ring-2"
          v-for="(point, index) in points"
          v-bind:key="index"
          v-bind:class="pointStateClasses(point)"
          @click="toggleSelection(point)"
        >
          {{ point }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import User from './User.vue';
import Table from './Table.vue';

const pusher = new Pusher('bad08686bd5e2c919a55', {
  cluster: 'ap1',
  authEndpoint: 'https://pockersv.herokuapp.com/pusher/auth',
});

let channel;

export default {
  components: {User, Table},
  data() {
    return {
      deskId: null,
      modeViewOnly: false,
      points: [1, 2, 3, 5, 8, 13],
      cardsUp: false,
      username: null,
      userid: null,
      changingName: false,
      users: [],
      selected: null,
    };
  },
  computed: {
    votedPoints() {
      return this.users.reduce((points, user) => {
        if (user.point) {
          points[user.point] = 1 + (points[user.point] || 0);
        }

        return points;
      }, {});
    },
    me() {
      return this.users.find(u => u.id === this.userid);
    },
    showRevealCards() {
      return this.users.filter(u => u.point != null).length > 0;
    },
    topUsers() {
      return this.users.filter((u, index) => index % 2 == 1 && index != 3);
    },
    rightUsers() {
      return this.users.length >= 3 ? this.users.slice(2, 3) : [];
    },
    bottomUsers() {
      return this.users.filter((u, index) => index % 2 == 0 && index != 2);
    },
    leftUsers() {
      return this.users.length >= 4 ? this.users.slice(3, 4) : [];
    }
  },
  methods: {
    onCardsUp() {
      this.cardsUp = true;
    },
    createNewTable() {
      const securesGenerate = () => {
        const bytes = new Uint8Array(16);
        crypto.getRandomValues(bytes);
        return btoa(String.fromCharCode(...bytes)).replace(/\W+/, '').substr(0, 16);
      }

      const weakGenerate = () => btoa(Math.random().toString(36).substring(2)).replace(/\W+/, '')

      const tableId = window.crypto ? securesGenerate() : weakGenerate();
      window.location.href= window.location.origin + window.location.pathname + "?table_id=" + tableId;
    },
    onFlippingCardsRequested() {
      channel.trigger('client-request-flipping-cards', {});
    },
    setUsername() {
      let username = this.$refs['username'].value;
      if (username) {
        this.username = username;
        const userid = localStorage.getItem('userid')
        channel.trigger('client-change-name', {id: userid, name: username});
        this.renameUser(userid, username);
        this.changingName = false;
        localStorage.setItem('username', this.username);
      }
    },
    renameUser(id, name) {
      this.users.find(u => u.id === id).name = name
    },
    onNewVote() {
      this.cardsUp = false;
      this.selected = false;
      this.users.forEach((u) => (u.point = null));
    },
    onNewVoteRequested() {
      channel.trigger('client-new-vote', {});
    },
    pointStateClasses(point) {
      if (this.selected === point) {
        return ["bg-blue-500", "text-white", "relative", "top-[-4px]"];
      }

      return ["text-blue-500", "hover:bg-blue-200"];
    },

    toggleSelection(point) {
      if (this.selected === point) {
        this.selected = null;
      } else {
        this.selected = point;
      }

      this.me.point = this.selected;
      channel.trigger('client-select-point', {id: this.userid, point: this.selected});
    },
  },
  watch: {
    modeViewOnly(viewOnly) {
      this.me.viewOnly = viewOnly;
      this.me.point = null;
      this.selected = false;
      channel.trigger('client-users-view-only', {id: this.userid, viewOnly});
    }
  },

  mounted() {

    this.deskId = (new URLSearchParams(window.location.search)).get('table_id');
    console.log({desk: this.deskId});

    this.username = localStorage.getItem("username");
    if (! localStorage.getItem('userid')) {
      localStorage.setItem('userid', Date.now());
    }

    const user = {id: localStorage.getItem('userid'), name: this.username, point: null};
    this.userid = localStorage.getItem('userid');
    this.users.push(user);

    channel = pusher.subscribe(`private-${this.deskId}`);

    channel.bind('pusher:subscription_succeeded', () => {
      channel.trigger('client-users-join', user);
    });

    channel.bind('client-users-join', (data) => {
      if (this.users.filter(u => u.id === data.id).length === 0) {
        this.users.push({id: data.id, name: data.name, point: null});
      }
      channel.trigger('client-sync-users', this.users);
    });

    channel.bind('client-users-leave', (data) => {
      if (this.users.filter(u => u.id === data.id).length === 0) {
        this.users = this.users.filter(u => u.id !== data.id);
      }
      channel.trigger('client-sync-users', this.users);
    });

    channel.bind('client-users-view-only', (state) => {
      const user = this.users.find(u => u.id === state.id);
      user.viewOnly = state.viewOnly;
      user.point = null;
    });

    channel.bind('client-change-name', (data) => {
      this.renameUser(data.id, data.name);
    });

    channel.bind('client-select-point', (data) => {
      this.users.find(u => u.id === data.id).point = data.point;
    });

    channel.bind('client-sync-users', (users) => {
      this.users = users;

      if (this.me.viewOnly) {
        this.modeViewOnly = true;
      }
    });

    channel.bind('client-new-vote', () => {
      this.$refs.desk.createNewVote();
      this.onNewVote();
    });

    channel.bind('client-request-flipping-cards', () => {
      this.$refs.desk.flipsCards();
    });
  }
};
</script>