import { Peer } from 'peerjs'
import { ref } from 'vue'
import { BoardState, type Piece } from '@/hooks/BoardState'
import type { vector2 } from './MovePiece'
import { useMovePiece } from './MovePiece'

const peer = ref<Peer | null>(null)
const conn = ref<any>(null)
const isHost = ref<boolean>(false)

const startPeer = (connectionId: string | null = null, host: boolean) => {
  if (connectionId == null) {
    peer.value = new Peer()
    peer.value.on('open', (peerId) => {
      console.log('My peer ID is: ' + peerId)
    })
  } else {
    peer.value = new Peer(connectionId)
    peer.value.on('open', (peerId) => {
      console.log('My peer ID is: ' + peerId)
    })
  }

  isHost.value = host

  if (host) {
    startHostConnection()
  } else {
    startReceiverConnection(connectionId)
  }
}

const startHostConnection = () => {
  console.log('Waiting for connection...')
  peer.value?.on('connection', (connection) => {
    conn.value = connection
    conn.value.on('data', (data: any) => {
      console.log('Received data:', data)
      if (data.type === 'move') {
        const { from, to, piece } = data.payload
        executeMove(from, to, piece)
      }
    })
  })
}

const startReceiverConnection = (hostId: string | null) => {
  if (!hostId) return

  console.log('Connecting to host:', hostId)
  conn.value = peer.value?.connect(hostId)
  conn.value.on('open', () => {
    console.log('Connected to host')
    conn.value.on('data', (data: any) => {
      console.log('Received data:', data)
      if (data.type === 'move') {
        const { from, to, piece } = data.payload
        executeMove(from, to, piece)
      }
    })
  })
}

const sendMove = (from: vector2, to: vector2, piece: Piece) => {
  if (conn.value && conn.value.open) {
    conn.value.send({ type: 'move', payload: { from, to, piece } })
  }
}

const executeMove = (from: vector2, to: vector2, piece: Piece) => {
  const { movePiece } = useMovePiece()
  movePiece(from, to, piece)
}

export const usePeerConnection = () => {
  return {
    startPeer,
    sendMove
  }
}
