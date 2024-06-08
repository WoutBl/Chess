import { Peer } from 'peerjs'
import { ref } from 'vue'
import { currentPlayer, type Piece, inverted } from '@/hooks/BoardState'
import { Player, renderCastle, type vector2 } from './MovePiece'
import { useMovePiece } from './MovePiece'

const peer = ref<Peer | null>(null)
export const conn = ref<any>(null)
export const isHost = ref<boolean>(false)
export const hostID = ref<string | undefined>(undefined)
export const loading = ref<boolean>(true)
export const peerError = ref<boolean>(false)
export const errorMessage = ref<string>('')

const startPeer = (connectionId: string | null = null, host: boolean): Promise<void> => {
  return new Promise((resolve, reject) => {
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
        peerError.value = true
        errorMessage.value = 'Host ID is required to join a host'
        console.error('Host ID is required to join a host')
        reject(new Error('Host ID is required to join a host'))
        return
      }
    }

    peer.value?.on('open', (peerId) => {
      console.log('My peer ID is: ' + peerId)
      hostID.value = peerId
      localStorage.setItem('hostId', peerId)
      if (host) {
        startHostConnection()
      }
      resolve()
    })

    peer.value?.on('error', (err) => {
      peerError.value = true
      errorMessage.value = 'An error occurred: ' + err.message
      reject(err)
    })
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
    console.log('connected')
    inverted.value = false
    conn.value = connection
    loading.value = false
    peerError.value = false
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
    loading.value = false
    peerError.value = false
    setupConnectionHandlers()
  })

  conn.value?.on('error', (err: any) => {
    peerError.value = true
    errorMessage.value = 'Connection error: ' + err.message
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
    if (data.type === "castle") {
      const { from, to } = data.payload
      renderCastle(from, to)
    }

  })

  conn.value.on('close', () => {
    console.log('Connection closed')
    loading.value = true
    conn.value = null
  })

  conn.value.on('error', (err: any) => {
    peerError.value = true
    errorMessage.value = 'Connection error: ' + err.message
    console.error('Connection error:', err)
    loading.value = true
  })
}

const closeConnection = () => {
  if (conn.value) {
    conn.value.close()
    conn.value = null
  }
}

const sendMove = (from: vector2, to: vector2, piece: Piece) => {
  console.log("sendMove")
  if (conn.value && conn.value.open) {
    conn.value.send({ type: 'move', payload: { from, to, piece } })
  }
}


const sendCastleMove = (from: vector2, to: vector2, piece: Piece) =>  {
  if (conn.value && conn.value.open) {
    conn.value.send({
      type: 'castle',
      payload: {
        from, to, piece
      }
    })
  }
}

const sendTurn = (player: Player) => {
  console.log('sendTurn')
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
    closeConnection,
    sendCastleMove,
    isHost,
    peerError,
    errorMessage
  }
}
