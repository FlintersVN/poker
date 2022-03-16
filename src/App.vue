
<template>
  <div class="flex flex-col min-h-[90vh]">
    <div class="min-h-[15vh] m-auto pt-5">
      <div v-if="state.username">
        <h3 class="text-lg"><span class="text-gray-600">Hi, </span><b>{{state.username}}</b> 😊
        
        <button class="text-blue-400 pointer" @click="state.changingName = true">Change name</button> | 
        <button class="text-blue-400 pointer" @click="createNewTable">Create new table</button> |
        <input type="checkbox" v-model="state.modeViewOnly" id="view-mode"> <label for="view-mode">ViewOnly</label>
        </h3>
      </div>

      <ChangeName
        class="mt-5"
        v-if="state.changingName"
        :current="state.username"
        @discard="state.changingName = false"
        @changed="rename"
      >
      </ChangeName>
    </div>

    <div class="lg:w-1/3 md:w-10/12 m-auto min-h-[60vh]">
      <div class="grid grid-cols-6 gap-6">
        <!-- Top players -->
        <div class="col-start-2 col-span-4">
          <div class="flex justify-around">
            <Seat v-for="(user, index) in topUsers" v-bind:key="index" :user="user" :cards-up="state.cardsUp" name-position="top"></Seat>
          </div>
        </div>

        <!-- Left players -->
        <div class="col-start-1 self-center justify-self-end">
          <Seat v-for="(user, index) in leftUsers" v-bind:key="index" :user="user" :cards-up="state.cardsUp"></Seat>
        </div>

        <!-- Table -->
        <Table ref="desk" 
          :cardsUp="state.cardsUp"
          :showRevealCards="showRevealCards"
          @card-flipped="onCardsUp"
          @card-flipping="onCardFlipping"
          @vote-created="onNewVoteCreated"
          @vote-creating="onNewVoteCreating"
          ></Table>

        <!-- Right players -->
        <div class="col-end-7 self-center">
          <Seat v-for="(user, index) in rightUsers" v-bind:key="index" :user="user" :cards-up="state.cardsUp"></Seat>
        </div>

        <!-- Bottom players -->
        <div class="col-start-2 col-span-4">
          <div class="flex justify-around">
            <Seat v-for="(user, index) in bottomUsers" v-bind:key="index" :user="user" :cards-up="state.cardsUp"></Seat>
          </div>
        </div>
      </div>
    </div>

    <!-- Cards -->
    <div class="mt-10 m-auto text-center min-h-[12vh]">
      <div v-if="state.cardsUp">
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
      <div v-if="!state.modeViewOnly && !state.cardsUp">
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

<script setup lang="ts">

import Seat from './components/Seat.vue';
import Table from './components/Table.vue';
import ChangeName from './components/ChangeName.vue';
import {Player} from './Player'
import names from './names';
import Random from './random';
import Pusher, { Channel } from 'pusher-js';
import { ComputedRef, reactive, ref,  } from '@vue/reactivity';
import { computed, defineComponent, onMounted, watch, inject } from '@vue/runtime-core';

const pusher = new Pusher('bad08686bd5e2c919a55', {
  cluster: 'ap1',
  authEndpoint: 'https://pockersv.herokuapp.com/pusher/auth',
});

let channel: Channel;

const points = [1, 2, 3, 5, 8, 13]

interface AppData {
  modeViewOnly: boolean,
  points: number[],
  cardsUp: boolean,
  username: string,
  userid: null | string,
  changingName: boolean,
  users: Player[],
  selected: null | number,
  deskId: null | string
}

const state = reactive(<AppData>{
  modeViewOnly: false,
  points: [1, 2, 3, 5, 8, 13],
  cardsUp: false,
  username: '',
  userid: null,
  changingName: false,
  users: [],
  selected: null,
  deskId: null
});


type VotedCount = {[key: number]: number}

const votedPoints = computed(() => {
  return state.users.reduce((points, user) => {
    if (user.point) {
      points[user.point] = 1 + (points[user.point] || 0);
    }

    return points;
  }, <VotedCount>{})
})

const me: ComputedRef<Player> = computed(() => state.users.find(u => u.id===state.userid)!)

const desk = ref()

const showRevealCards = computed(() => {
  return state.users.filter(u => u.point != null).length > 0
})

const topUsers = computed(() => {
  return state.users.filter((u, index) => index % 2 == 1 && index != 3);
})

const rightUsers = computed(() => {
  return state.users.length >= 3 ? state.users.slice(2, 3) : [];
})

const bottomUsers = computed(() => {
 return state.users.filter((u, index) => index % 2 == 0 && index != 2);
})

const leftUsers = computed(() => {
  return state.users.length >= 4 ? state.users.slice(3, 4) : [];
})

function onCardsUp() {
  state.cardsUp = true
}

function createNewTable() {
  window.location.href= window.location.origin + window.location.pathname + "?table_id=" + Random.string();
}

function onCardFlipping() {
  channel.trigger('client-request-flipping-cards', {});
}

function rename(username: string) {
  if (username) {
      const id = state.userid;
      state.username = username;
      renameUser(id!, username);
      channel.trigger('client-ChangeName', {id, name: username});
      localStorage.setItem('username', state.username);
  }
  state.changingName = false;
}

function renameUser(id: string, name: string) {
  state.users.find(u => u.id === id)!.name = name
}

function onNewVoteCreated() {
  state.cardsUp = false;
  state.selected = null;
  state.users.forEach((u) => (u.point = null));
}

function onNewVoteCreating() {
  channel.trigger('client-new-vote', {});
}

function pointStateClasses(point: number) {
  if (state.selected === point) {
    return ["bg-blue-500", "text-white", "relative", "top-[-4px]"];
  }

  return ["text-blue-500", "hover:bg-blue-200"];
}


function toggleSelection(point: number) {
  if (state.selected === point) {
    state.selected = null;
  } else {
    state.selected = point;
  }

  state.users.find(u => u.id == me.value.id)!.point = state.selected;
  channel.trigger('client-select-point', {id: state.userid, point: state.selected});
}

onMounted(() => {

    const predefinedPoints = ['1', '2', '3', '5', '8'];

    document.addEventListener('keydown', (e) => {
      const isPointAction = predefinedPoints.includes(e.key);
      if (isPointAction && !state.modeViewOnly && !state.cardsUp) {
        toggleSelection(parseInt(e.key));
      }
    })

    // Leaving table
    window.addEventListener('beforeunload', (e) => {
      channel.trigger('client-users-leave', {id: me.value.id});
      pusher.unsubscribe(channel.name);
    });

    // Close change name input when user press escape
    document.addEventListener('keydown', (event) => {
      if (event.code === 'Escape' && state.changingName) {
        state.changingName = false;
      }
    });

    // Grab table id from url
    state.deskId = (new URLSearchParams(window.location.search)).get('table_id');

    if (! state.deskId) {
      return createNewTable();
    }

    state.username = localStorage.getItem("username") || '';

    if (! state.username) {
      state.username = names.random();
      localStorage.setItem("username", state.username);
    }

    if (! localStorage.getItem('userid')) {
      localStorage.setItem('userid', Date.now().toString());
    }

    const user = <Player>{id: localStorage.getItem('userid')!, name: state.username, point: null};
    state.userid = localStorage.getItem('userid');
    state.users.push(user);

    channel = pusher.subscribe(`private-${state.deskId}`);

    channel.bind('pusher:subscription_succeeded', () => {
      channel.trigger('client-users-join', user);
    });

    channel.bind('client-users-join', (data: Player) => {
      if (! state.users.find(u => u.id === data.id)) {
        // {id: data.id, name: data.name, point: null}
        state.users.push(data);
      }

      // Send users on local state
      channel.trigger('client-sync-users', state.users);
    });

    channel.bind('client-users-leave', (data: Player) => {
      // check with current user to prevent a same user close at another tab.
      if (state.users.find(u => u.id === data.id && u.id != state.userid)) {
        state.users = state.users.filter(u => u.id !== data.id);
      }
    });

    channel.bind('client-users-view-only', (player: Player) => {
      const user = state.users.find(u => u.id === player.id)!;
      user.viewOnly = player.viewOnly;
      user.point = null;
    });

    channel.bind('client-ChangeName', (data: Player) => {
      renameUser(data.id, data.name);
    });

    channel.bind('client-select-point', (data: Player) => {
      state.users.find(u => u.id === data.id)!.point = data.point;
    });

    channel.bind('client-sync-users', (users: Player[]) => {
      state.users = users;

      if (me.value.viewOnly) {
        state.modeViewOnly = true;
      }
    });

    channel.bind('client-new-vote', () => {
      desk.value.createNewVote();
      onNewVoteCreated();
    });

    channel.bind('client-request-flipping-cards', () => {
      desk.value.flipsCards();
    });
})

watch(
  () => state.modeViewOnly,
  (viewOnly) => {
    me.value.viewOnly = viewOnly;
    me.value.point = null;
    state.selected = null;
    channel.trigger('client-users-view-only', {id: state.userid, viewOnly});
  }
)
</script>
