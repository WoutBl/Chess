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
    // @ts-ignore
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
    // @ts-ignore
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
    <div class="flex flex-col lg:flex-row w-3/4 lg:w-2/3 lg:h-1/2   justify-center items-center gap-12" v-if="props.state === 'players'">
      <Button @click="changeState('1player')" class="flex w-full lg:text-3xl h-1/2 rounded-lg p-5">1 player</Button>
      <Button @click="changeState('2players')" class="flex w-full lg:text-3xl h-1/2 rounded-lg p-5 ">2 players</Button>
    </div>
    <div class="flex flex-col lg:flex-row w-3/4 lg:w-2/3 lg:h-1/2   justify-center items-center gap-12" v-if="props.state === '2players'">
      <Button @click="changeState('local')" class="flex w-full lg:text-3xl h-1/2 rounded-lg p-5 ">Local</Button>
      <Button @click="changeState('online')" class="flex w-full lg:text-3xl h-1/2 rounded-lg p-5">Online</Button>
    </div>
    <div class="flex flex-col lg:flex-row w-3/4 lg:w-2/3 lg:h-1/2   justify-center items-center gap-12" v-if="props.state === 'online'">
      <Button class="flex w-full lg:text-3xl h-1/2 rounded-lg p-5" @click="startHost">Start Host</Button>
      <Button class="flex w-full lg:text-3xl h-1/2 rounded-lg p-5" @click="changeState('join')">Join Host</Button>
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
</style>
