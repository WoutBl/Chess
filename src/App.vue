<script setup lang="ts">
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useColorMode } from '@vueuse/core'
import { Icon } from '@iconify/vue'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { ChevronLeft, Info, Copy } from 'lucide-vue-next'
import { ref } from 'vue';
import { hostID } from './hooks/PeerConnection'
import { Input } from '@/components/ui/input';


const route = useRouter()
const state = ref('players');

const onClickState = (nextState: string) => {
  state.value = nextState;
};
const mode = useColorMode()

const backClick = () => {
  if(state.value == '2players'){ 
    state.value = 'players' 
    return
  }
  if(state.value == 'online') {
    state.value = '2players'
  }
  if(state.value == 'join'){
    state.value = 'online'
  }
  if(route.currentRoute.value.fullPath == '/game') {
    route.push("/")

  }
  console.log(state.value)
}

const copy = () => {
  console.log(hostID.value)
  if (hostID.value !== null) {
    navigator.clipboard.writeText(hostID.value);
  }
}
</script>

<template>
  <div class="flex w-full  justify-between mt-5  absolute">
    <div>
      <Button class="ml-5" @click="backClick" variant="outline" size="icon">
        <ChevronLeft class="w-4 h-4" />
      </Button>
      
      <AlertDialog>
        <AlertDialogTrigger as-child>
          <Button v-if="route.currentRoute.value.fullPath == '/game' && hostID" class="ml-5" variant="outline" size="icon">
            <Info class="w-4 h-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>How to let another player join your session</AlertDialogTitle>
            <AlertDialogDescription>
              Use this ID to join on a different computer <br>
              <div class="relative w-full max-w-sm items-center">
                <Input id="Copy" type="text" disable :placeholder="hostID" class="pl-10" />
                <span class="absolute start-0 inset-y-0 flex items-center justify-center px-2">
                  <Copy @click="copy" class="size-6 text-muted-foreground"/>
                </span>
              </div>
              
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    
    
    <DropdownMenu >
      <DropdownMenuTrigger class="mr-5" as-child>
        <Button variant="outline">
          <Icon icon="radix-icons:moon" class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Icon icon="radix-icons:sun" class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span class="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem @click="mode = 'light'">
          Light
        </DropdownMenuItem>
        <DropdownMenuItem @click="mode = 'dark'">
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem @click="mode = 'auto'">
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    

  </div>
    

  <RouterView :state="state" @changeState="onClickState"/>
</template>

<style scoped>

</style>
