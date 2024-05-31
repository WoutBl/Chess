<template>
  <div class="container">
    <div class="header">
      Chess
    </div>
    <div class="buttonContainer" v-if="state == 'players'">
      <button @click="onClickState('1player')" class="button">1 player</button>
      <button @click="onClickState('2players')" class="button">2 players</button>
    </div>
    <div class="buttonContainer" v-if="state == '2players'">
      <RouterLink to="/game" class="button">Local</RouterLink>
      <button class="button">Online</button>
    </div>
  </div>

</template>

<script setup lang="ts">
import { ref } from 'vue'
import {useRouter} from 'vue-router'

const state = ref('players')
const router = useRouter()

const onClickState = (nextState: string) =>{
  state.value = nextState
}

const onClickRouter = (nextState: string) => {
  if(nextState === 'local'){
    router.push('/game')
  }

}
</script>

<style scoped>
.container{
  height: 100vh;
  overflow: hidden;
  display: flex;
  gap: 100px;
  flex-direction: column;
  align-items: center;
  font-size: 48px;
  font-weight: bold;
}

.buttonContainer {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 50px;
}

.button{
  width: 400px;
  height: 400px;
  border-radius: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 32px;
  font-weight: bold;
  background-color: #FFFFFF;
  border: 0;
  box-sizing: border-box;
  color: #111827;
  font-family: "Inter var",ui-sans-serif,system-ui,-apple-system,system-ui,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji";
  line-height: 1.25rem;
  padding: .75rem 1rem;
  text-align: center;
  text-decoration: none #D1D5DB solid;
  text-decoration-thickness: auto;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  min-width: 150px;
}

.button:hover {
  background-color: rgb(249,250,251);
}

.button:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
}

.button:focus-visible {
  box-shadow: none;
}
</style>