<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { usePeerConnection, peerError } from '@/hooks/PeerConnection'
import { resetBoard, gameType } from '@/hooks/BoardState'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  onClickState: Function,
  state: String
})

const emit = defineEmits(['changeState'])

const router = useRouter()
const { startPeer, closeConnection } = usePeerConnection()
const hostId = ref<string>('')
const errorMessage = ref<string>('') // New reactive state for error message

const changeState = (nextState: string) => {
  emit('changeState', nextState)
  if (nextState == 'local') gameType.value = 'local'
}

const startHost = async () => {
  emit('changeState', 'remote')
  gameType.value = 'remote'
  resetBoard()
  try {
    await startPeer(null, true) // Start host with a new random ID
    router.push('/game')
  } catch (error) {
    console.error(error)
    errorMessage.value = 'Error starting host: ' + error.message
  }
}

watch(peerError, (newVal) => {
  if (newVal) {
    errorMessage.value = 'An error occurred while connecting to the peer'
  }
})

const joinHost = () => {
  emit('changeState', 'remote')
  gameType.value = 'remote'
  resetBoard()

  if (!hostId.value) {
    peerError.value = true
    errorMessage.value = 'Please enter a host ID' // Set error message
    return
  }
  try {
    startPeer(hostId.value, false)
    setTimeout(() => {
      if (peerError.value) {
        throw new Error("This ID doesn't exist, cannot connect to this ID")
      } else {
        localStorage.setItem('hostId', hostId.value)
        router.push('/game')
      }

      //
    }, 800)
  } catch (error) {
    console.error(error)
    errorMessage.value = error.message // Set error message
  }
}

onMounted(() => {
  closeConnection()
})
</script>

<template>
  <div class="container">
    <div class="header">Chess</div>
    <div class="buttonContainer" v-if="props.state === 'players'">
      <button @click="changeState('1player')" class="button">1 player</button>
      <button @click="changeState('2players')" class="button">2 players</button>
    </div>
    <div class="buttonContainer" v-if="props.state === '2players'">
      <RouterLink to="/game" @click="changeState('local')" class="button">Local</RouterLink>
      <button @click="changeState('online')" class="button">Online</button>
    </div>
    <div class="buttonContainer" v-if="props.state === 'online'">
      <button class="button" @click="startHost">Start Host</button>
      <button class="button" @click="changeState('join')">Join Host</button>
    </div>
    <div v-if="props.state === 'join'" class="flex w-full max-w-sm items-center space-x-2">
      <Input v-model="hostId" type="text" placeholder="Enter Host ID to Join" />
      <Button @click="joinHost" type="submit">Join</Button>
    </div>
    <div v-if="errorMessage" class="text-red-500">
      {{ errorMessage }}
    </div>
  </div>
</template>

<style scoped>
.container {
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

.button {
  width: 400px;
  height: 400px;
  border-radius: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 32px;
  font-weight: bold;
  background-color: #ffffff;
  border: 0;
  box-sizing: border-box;
  color: #111827;
  font-family:
    'Inter var',
    ui-sans-serif,
    system-ui,
    -apple-system,
    system-ui,
    'Segoe UI',
    Roboto,
    'Helvetica Neue',
    Arial,
    'Noto Sans',
    sans-serif,
    'Apple Color Emoji',
    'Segoe UI Emoji',
    'Segoe UI Symbol',
    'Noto Color Emoji';
  line-height: 1.25rem;
  padding: 0.75rem 1rem;
  text-align: center;
  text-decoration: none #d1d5db solid;
  text-decoration-thickness: auto;
  box-shadow:
    0 1px 3px 0 rgba(0, 0, 0, 0.1),
    0 1px 2px 0 rgba(0, 0, 0, 0.06);
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  min-width: 150px;
}

.button:hover {
  background-color: rgb(249, 250, 251);
}

.button:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
}

.button:focus-visible {
  box-shadow: none;
}

.peer-actions {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 10px;
  width: 50%;
}

.input {
  padding-inline: 1rem;
  padding-block: 0.5rem;
  border-radius: 4px;
}
</style>
