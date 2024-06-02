
<template>
  <div class="flex flex-col min-h-[90vh]">
    <div class="min-h-[15vh] m-auto pt-5">
      <div v-if="appState.username">
        <h3 class="text-lg"><span class="text-gray-600">Hi, </span><b>{{appState.username}}</b> 😊
        
        <button class="text-blue-400 pointer" @click="appState.changingName = true">Change name</button> | 
        <button class="text-blue-400 pointer" @click="createNewTable(me)">Create new table</button> |
        <input type="checkbox" v-model="appState.viewOnly" id="view-mode"> <label for="view-mode">ViewOnly</label>
        </h3>
      </div>

      <ChangeName
        class="mt-5"
        v-if="appState.changingName"
        :current="appState.username"
        @discard="appState.changingName = false"
        @changed="rename"
      >
      </ChangeName>
    </div>

    <div class="lg:w-1/3 md:w-10/12 m-auto min-h-[60vh]">
      <div class="grid grid-cols-6 gap-6">
        <!-- Top players -->
        <div class="col-start-2 col-span-4">
          <div class="flex justify-around">
            <Seat v-for="(user, index) in topUsers" v-bind:key="index" :user="user" :cards-up="appState.state == 'revealing'" name-position="top"></Seat>
          </div>
        </div>

        <!-- Left players -->
        <div class="col-start-1 self-center justify-self-end">
          <Seat v-for="(user, index) in leftUsers" v-bind:key="index" :user="user" :cards-up="appState.state == 'revealing'"></Seat>
        </div>

        <!-- Table -->
        <Table ref="desk" 
          :cardsUp="appState.state == 'revealing'"
          :countdown="3"
          :showRevealCards="showRevealCards"
          @card-flipped="onCardsUp"
          @card-flipping="onCardFlipping"
          @vote-created="onNewVoteCreated"
          @vote-creating="createNewVote"
          ></Table>

        <!-- Right players -->
        <div class="col-end-7 self-center">
          <Seat v-for="(user, index) in rightUsers" v-bind:key="index" :user="user" :cards-up="appState.state == 'revealing'"></Seat>
        </div>

        <!-- Bottom players -->
        <div class="col-start-2 col-span-4">
          <div class="flex justify-around">
            <Seat v-for="(user, index) in bottomUsers" v-bind:key="index" :user="user" :cards-up="appState.state == 'revealing'"></Seat>
          </div>
        </div>
      </div>
    </div>

    <!-- Cards -->
    <div class="mt-10 m-auto text-center min-h-[12vh]">
      <div v-if="appState.state == 'revealing'">
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
      <div v-if="!appState.viewOnly && appState.state == 'voting'">
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
import { ComputedRef, reactive, ref} from '@vue/reactivity';
import { computed, onMounted, watch } from '@vue/runtime-core';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, updateDoc, onSnapshot, DocumentReference, deleteDoc, writeBatch } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAEgGi4fMD14iVcqxl535SLLg--f4vJ5t8",
  authDomain: "poker-39334.firebaseapp.com",
  databaseURL: "https://poker-39334-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "poker-39334",
  storageBucket: "poker-39334.appspot.com",
  messagingSenderId: "709394997706",
  appId: "1:709394997706:web:b099fecf3096710d2b2f33",
  measurementId: "G-STJ1GE9L64"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);
// connectFirestoreEmulator(db, '127.0.0.1', 5679);

let deskRef: DocumentReference;

const points = [1, 2, 3, 5, 8, 13]

interface LocalState {
  changingName: boolean,
  selected: null | number,
  viewOnly: boolean,
  userid: null | string,
  username: string,
}

interface AppData {
  // modeViewOnly: boolean,
  points: number[],
  // cardsUp: boolean,
  // username: string,
  // userid: null | string,
  // changingName: boolean,
  users: Player[],
  // selected: null | number,
  deskId: null | string,
  state: "voting" | "revealing",
  revealedAt: null | number
}

const appState = reactive(<AppData & LocalState>{
  viewOnly: false,
  points: [1, 2, 3, 5, 8, 13],
  cardsUp: false,
  username: '',
  userid: null,
  changingName: false,
  users: [],
  selected: null,
  deskId: null,
  state: "voting",
  revealedAt: null
});

type VotedCount = {[key: number]: number}

const votedPoints = computed(() => {
  return appState.users.reduce((points, user) => {
    if (user.point) {
      points[user.point] = 1 + (points[user.point] || 0);
    }

    return points;
  }, <VotedCount>{})
})

const me: ComputedRef<Player> = computed(() => appState.users.find(u => u.id === appState.userid)!)

const desk = ref()

const showRevealCards = computed(() => {
  return appState.users.filter(u => u.point != null).length > 0
})

const topUsers = computed(() => {
  return appState.users.filter((u, index) => index % 2 == 1 && index != 3);
})

const rightUsers = computed(() => {
  return appState.users.length >= 3 ? appState.users.slice(2, 3) : [];
})

const bottomUsers = computed(() => {
 return appState.users.filter((u, index) => index % 2 == 0 && index != 2);
})

const leftUsers = computed(() => {
  return appState.users.length >= 4 ? appState.users.slice(3, 4) : [];
})

function onCardsUp() {
  appState.state = "revealing";
}

async function createNewTable(user: Player) {
  const tableId = Random.string();
  deskRef = doc(db, "desks", tableId)
  await setDoc(doc(deskRef, "users", user.id as string), {
      ...user,
      isAdmin: true
    });

  window.location.href= window.location.origin + window.location.pathname + "?table_id=" + tableId;
}

function onCardFlipping() {
  setDoc(deskRef, {
    state: "revealing",
    revealedAt: Date.now() + 3000
  })
}

function rename(username: string) {
  if (username) {
      const id = appState.userid;
      appState.username = username;
      renameUser(id!, username);
      localStorage.setItem('username', appState.username);
  }
  appState.changingName = false;
}

function renameUser(id: string, name: string) {
  updateDoc(doc(deskRef, "users", id as string), { name })
}

async function createNewVote() {

  const usersRef = collection(deskRef, "users")

  const batch = writeBatch(db)

  appState.users.forEach((user) => {
    batch.update(doc(usersRef, user.id), {
      point: null
    })
  })

  await batch.commit()
    await setDoc(deskRef, {
      state: 'voting',
    })

    // Reset user's point
}

function onNewVoteCreated() {
  desk.value.createNewVote();
  // appState.cardsUp = false;
  appState.state = "voting";
  appState.selected = null;
}

function pointStateClasses(point: number) {
  if (appState.selected === point) {
    return ["bg-blue-500", "text-white", "relative", "top-[-4px]"];
  }

  return ["text-blue-500", "hover:bg-blue-200"];
}

function toggleSelection(point: number) {
  if (appState.selected === point) {
    appState.selected = null;
  } else {
    appState.selected = point;
  }

  appState.users.find(u => u.id == me.value.id)!.point = appState.selected;

  updateDoc(doc(deskRef, "users", appState.userid as string), {
    point: appState.selected
  })
}

function joinToDesk(player: Player) {
  const usersRef = doc(deskRef, "users", appState.userid as string)

  return setDoc(usersRef, player)
}

function leaveDesk(player: Player) {
  const usersRef = doc(deskRef, "users", player.id)
  return deleteDoc(usersRef)
}

onMounted(async () => {
    // Leaving table
    window.addEventListener('beforeunload', (e) => {
      leaveDesk(me.value);
    });

    // Close change name input when user press escape
    const predefinedPoints = ['1', '2', '3', '5', '8'];
    document.addEventListener('keydown', (event) => {
      if (event.code === 'Escape' && appState.changingName) {
        appState.changingName = false;
      }

      const isPointAction = predefinedPoints.includes(event.key);
      if (isPointAction && !appState.viewOnly && !(appState.state === "revealing")) {
        toggleSelection(parseInt(event.key));
      }
    });

    appState.username = localStorage.getItem("username") || '';

    if (! appState.username) {
      appState.username = names.random();
      localStorage.setItem("username", appState.username);
    }

    if (! localStorage.getItem('userid')) {
      localStorage.setItem('userid', Date.now().toString());
    }

    const user = <Player>{id: localStorage.getItem('userid')!, name: appState.username, point: null, viewOnly: appState.viewOnly};
    appState.userid = localStorage.getItem('userid');
    // state.users.push(user);

    // Grab table id from url
    appState.deskId = (new URLSearchParams(window.location.search)).get('table_id');

    if (! appState.deskId) {
      return await createNewTable(user);
    } else {
      deskRef = doc(db, "desks", appState.deskId as string)
      await joinToDesk(user);
    }

    onSnapshot(deskRef, (snapshot) => {
      if (snapshot.get("state") === "revealing") {
        const countdown = Math.trunc((snapshot.get("revealedAt") - Date.now()) / 1000);
        desk.value.flipsCards(countdown);
      } else if (snapshot.get("state") === "voting") {
        onNewVoteCreated();
      }
    })

    onSnapshot(collection(db, "desks", appState.deskId, "users"), (snapshot) => {

      snapshot.docChanges().forEach((change) => {

        const user = change.doc.data() as Player;

        if (change.type == "added") {
          appState.users.push(user)
        }

        if (change.type == "removed") {
          appState.users = appState.users.filter((u) => u.id !== user.id)
        }

        if (change.type == "modified") {
          const candidate = appState.users.find((u) => u.id === user.id)

          if (candidate) {
            Object.assign(candidate, user)
          }
        }
      })
    })
})

watch(
  () => appState.viewOnly,
  (viewOnly) => {
    me.value.viewOnly = viewOnly;
    me.value.point = null;
    appState.selected = null;

    updateDoc(doc(deskRef, "users", appState.userid as string), {
      viewOnly,
      point: null
    })
  }
)
</script>

