import React, { useState, useEffect } from 'react'
import io from 'socket.io-client'

// eslint-disable-next-line no-undef
const WEBSOCKET_URL = process.env.REACT_APP_WEBSOCKET_SERVER_URI

const WebsocketListener = () => {
	const [channel, setChannel] = useState('')
	const [messages, setMessages] = useState([])
	const [socket, setSocket] = useState(null)
	const [isConnected, setIsConnected] = useState(false)

	useEffect(() => {
		// Cleanup logic
		return () => {
			if (socket) {
				socket.disconnect()
			}
		}
	}, [socket])

	const handleSubscribe = () => {
		// If already connected, disconnect
		if (socket) {
			socket.removeAllListeners()
			socket.disconnect()
		}

		// Wait for the disconnection to complete
		setTimeout(() => {
			// Establish a new WebSocket connection and setup event handlers
			const newSocket = io(WEBSOCKET_URL, {
				transports: ['polling', 'websocket'], // use both transports
			})

			newSocket.on('connect', () => {
				newSocket.emit('join', { room: channel })
				const connectionMessage = `[${new Date().toLocaleTimeString()}] Connected to channel ${channel}`
				console.log(connectionMessage)
				setMessages((prevMessages) => [connectionMessage, ...prevMessages])
				setIsConnected(true)
			})

			newSocket.on('message', (message) => {
				console.log(message)
				const jsonMessage =
					`[${new Date().toLocaleTimeString()}] ` + JSON.stringify(message)
				setMessages((prevMessages) => [jsonMessage, ...prevMessages])
			})

			newSocket.on('disconnect', () => {
				console.log(`Disconnected from WebSocket server`)
				setIsConnected(false)
			})

			// Update the socket in the state
			setSocket(newSocket)
		}, 1000) // Wait 1 second before reconnecting
	}

	// Connection status indicator color
	const connectionStatusColor = isConnected ? 'green' : 'red'
	return (
		<div className="page">
			<section>
				<h2>WebSocket Listener</h2>
				<div style={{ color: connectionStatusColor }}>
					{/* Connection status indicator */}
					{isConnected ? 'Connected' : 'Disconnected'}
				</div>
				<hr />
				<form
					onSubmit={(e) => e.preventDefault()}
					className="mb-4 flex items-baseline gap-4"
				>
					<div className="grow">
						<input
							type="text"
							placeholder="Enter channel name"
							value={channel}
							onChange={(e) => setChannel(e.target.value)}
							className="theme-background text-white border border-gray-600 block w-full py-2 px-3 leading-tight focus:outline-none"
						/>
					</div>
					<div>
						<button
							type="button"
							onClick={handleSubscribe}
							className="theme px-4 py-2 bg-blue-500 text-white font-bold rounded hover:bg-blue-700 disabled:opacity-50"
							disabled={!channel} // Disable the button if no channel is provided
						>
							Subscribe
						</button>
					</div>
				</form>

				<textarea
					value={messages.join('\n')}
					readOnly={true}
					rows={10}
					className="theme-background text-white border border-gray-600 block w-full py-2 px-3 leading-tight focus:outline-none"
					style={{ resize: 'none' }} // Disable resize if desired
				/>
			</section>
		</div>
	)
}

export default WebsocketListener
