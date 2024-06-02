import { Peer } from 'peerjs'
import { ref } from 'vue'
import { currentPlayer, type Piece, inverted } from '@/hooks/BoardState'
import { Player, type vector2 } from './MovePiece'
import { useMovePiece } from './MovePiece'

const peer = ref<Peer | null>(null)
const conn = ref<any>(null)
const isHost = ref<boolean>(false)
export const hostID = ref<string | null>(null)

const startPeer = (connectionId: string | null = null, host: boolean) => {
  isHost.value = host

  if (host) {
    createPeer()
  } else {
    if (connectionId) {
      createPeer()
      peer.value?.on('open', () => {
        startReceiverConnection(connectionId)
      })
    } else {
      console.error('Host ID is required to join a host')
    }
  }

  peer.value?.on('open', (peerId) => {
    console.log('My peer ID is: ' + peerId)
    hostID.value = peerId
    localStorage.setItem('hostId', peerId)
    if (host) {
      startHostConnection()
    }
  })

  peer.value?.on('error', (err) => {
    console.error('Peer error:', err)
    if (err.type === 'unavailable-id' && isHost.value) {
      console.log('ID is taken, generating a new ID')
      createPeer()
      startHostConnection()
    }
  })
}

const createPeer = (connectionId: string | null = null) => {
  if (peer.value) {
    peer.value.destroy()
  }

  peer.value = connectionId == null ? new Peer() : new Peer(connectionId)
}

const startHostConnection = () => {
  console.log('Waiting for connection...')
  peer.value?.on('connection', (connection) => {
    console.log("connected")
    inverted.value = false
    conn.value = connection
    setupConnectionHandlers()
  })
}

const startReceiverConnection = (hostId: string | null) => {
  if (!hostId) {
    console.error('Host ID is required to connect as receiver')
    return
  }

  console.log('Connecting to host:', hostId)
  conn.value = peer.value?.connect(hostId)
  conn.value?.on('open', () => {
    console.log('Connected to host')
    inverted.value = true
    setupConnectionHandlers()
  })

  conn.value?.on('error', (err: any) => {
    console.error('Connection error:', err)
  })
}

const setupConnectionHandlers = () => {
  conn.value.on('data', (data: any) => {
    console.log('Received data:', data)
    if (data.type === 'move') {
      const { from, to, piece } = data.payload
      executeMove(from, to, piece)
    }
    if (data.type === 'turn') {
      const { player } = data.payload
      changeTurn(player)
    }
  })

  conn.value.on('close', () => {
    console.log('Connection closed')
  })

  conn.value.on('error', (err: any) => {
    console.error('Connection error:', err)
  })
}

const sendMove = (from: vector2, to: vector2, piece: Piece) => {
  console.log("sendMove")
  if (conn.value && conn.value.open) {
    conn.value.send({ type: 'move', payload: { from, to, piece } })
  }
}

const sendTurn = (player: Player) => {
  console.log("sendTurn")
  if (conn.value && conn.value.open) {
    conn.value.send({ type: 'turn', payload: { player } })
  }
}

const executeMove = (from: vector2, to: vector2, piece: Piece) => {
  const { movePiece } = useMovePiece()
  console.log(from, to, piece)
  if(inverted) {
    from.row = 7 - from.row
    to.row = 7 - to.row
  }
  console.log(from, to, piece)
  movePiece(from, to, piece, true)

}


const changeTurn = (player: Player) => {
  currentPlayer.value = player
}

export const usePeerConnection = () => {
  return {
    startPeer,
    sendMove,
    sendTurn,
    isHost
  }
}
