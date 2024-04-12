
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
import Random from './Random';
import { ComputedRef, reactive, ref,  } from '@vue/reactivity';
import { computed, onMounted, watch } from '@vue/runtime-core';

import { createClient, RealtimeChannel } from '@supabase/supabase-js'
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey)

let channel: RealtimeChannel;

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
  channel.send({type: "broadcast", event: "client-request-flipping-cards"})
  // channel.trigger('client-request-flipping-cards', {});
}

function rename(username: string) {
  if (username) {
      const id = state.userid;
      state.username = username;
      renameUser(id!, username);
      // channel.trigger('client-ChangeName', {id, name: username});
      channel.send({type: "broadcast", event: "client-ChangeName", payload: {id, name: username}})
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
  channel.send({type: "broadcast", event: "client-new-vote"})
  // channel.trigger('client-new-vote', {});
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
  channel.send({type: "broadcast", event: "client-select-point", payload: {id: state.userid, point: state.selected}})
  // channel.trigger('client-select-point', {id: state.userid, point: state.selected});
}

onMounted(() => {
    // Leaving table
    window.addEventListener('beforeunload', async (e) => {
      // channel.trigger('client-users-leave', {id: me.value.id});
      // pusher.unsubscribe(channel.name);

      await channel.untrack();
    });

    // Close change name input when user press escape
    const predefinedPoints = ['1', '2', '3', '5', '8'];
    document.addEventListener('keydown', (event) => {
      if (event.code === 'Escape' && state.changingName) {
        state.changingName = false;
      }

      const isPointAction = predefinedPoints.includes(event.key);
      if (isPointAction && !state.modeViewOnly && !state.cardsUp) {
        toggleSelection(parseInt(event.key));
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

    state.modeViewOnly = localStorage.getItem('viewOnly') == "true";
    const user = <Player>{id: localStorage.getItem('userid')!, name: state.username, point: null, viewOnly: state.modeViewOnly};
    state.userid = localStorage.getItem('userid');
    state.users.push(user);

    channel = supabase.channel(`desk-${state.deskId}`, {
      config: {
        presence: {
          key: user.id
        }
      }
    });
    channel
    // .on('presence', { event: 'sync' }, () => {

    
    //   const newState = table.presenceState()

    //   state.users = Object.values(newState).map((item) => {

    //     const user: Player = item[0] as unknown as Player;

    //     return user;
    //   })

    //   // state.users = newState.map(() => {

    //   // });
    //   console.log('sync', newState)
    // })
    .on('presence', { event: 'join' }, ({ key, newPresences }) => {
      const data = newPresences[0];
      if (! state.users.find(u => u.id === data.id)) {
        state.users.push({id: data.id, name: data.name, point: null, viewOnly: data.viewOnly || false});
      }
      console.log('join', key, newPresences)
    })
    .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      // console.log('leave', key, leftPresences)
      // check with current user to prevent a same user close at another tab.
      if (state.users.find(u => u.id === key && u.id != state.userid)) {
        state.users = state.users.filter(u => u.id !== key);
      }
    })

    channel.on('broadcast', { event: "client-users-view-only" }, event => {
      const changeUser = event.payload;
      const user = state.users.find(u => u.id === changeUser.id)!;
      user.viewOnly = changeUser.viewOnly;
      user.point = null;
    })

    channel.on("broadcast", { event: "client-ChangeName" }, (event) => {
      const user = event.payload;
      renameUser(user.id, user.name);
    })

    channel.on('broadcast', {event: 'client-select-point'}, (event) => {
      const data = event.payload;
      state.users.find(u => u.id === data.id)!.point = data.point;
    });

    channel.on('broadcast', { event: "client-new-vote" }, () => {
      desk.value.createNewVote();
      onNewVoteCreated();
    })

    channel.on('broadcast', { event: "client-request-flipping-cards" }, () => {
      desk.value.flipsCards();
    })

    channel.subscribe(async (status) => {
      if (status !== 'SUBSCRIBED') { return }

      const presenceTrackStatus = await channel.track(user)
      console.log(presenceTrackStatus)
    })
})

watch(
  () => state.modeViewOnly,
  (viewOnly) => {
    me.value.viewOnly = viewOnly;
    me.value.point = null;
    state.selected = null;
    localStorage.setItem("viewOnly", viewOnly ? "true" : "false");
    channel.send({ type: "broadcast", event: "client-users-view-only", payload: {id: state.userid, viewOnly}})
    // channel.trigger('client-users-view-only', {id: state.userid, viewOnly});
  }
)

if (import.meta.hot) {
  const hot = import.meta.hot

  // Untrack on vite HMR
  hot.on('vite:beforeUpdate', async () => {
    await channel.untrack();
  })
}

</script>

