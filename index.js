import msgpack from 'msgpack-js-browser';
export default class Socket {
	constructor(baseURL) {
		this.dataCbs = [];
		this.baseURL = baseURL;
		this.createSocket(baseURL);
		this.onConnection = () => {};
	}

	createSocket(baseURL) {
		this.socket = new WebSocket('ws://' + baseURL);
		this.socket.binaryType = 'arraybuffer';
		this.socket.onopen = () => this.onSocketOpen();
		this.socket.onmessage = evt => this.onSocketMessage(evt);
		this.socket.onclose = evt => this.onSocketClose(evt);
		this.socket.onerror = evt => this.onSocketError(evt);
	}
	on(event, func) {
		let found = this.dataCbs.find(e => e.event === event);
		if (!found) {
			this.dataCbs.push({ event, func });
		}
	}
	onSocketOpen() {
		this.onConnection();
	}
	emit(event, msg = '') {
		const data = msgpack.encode([event, msg]);
		try {
			this.socket.send(data);
		} catch (e) {
			console.error('error', e);
		}
	}
	onSocketClose(evt) {
		console.log('onSocketClose', evt);
		switch (evt.code) {
			case 1000: // CLOSE_NORMAL
				console.log('WebSocket: closed');
				break;
			default:
				this.reconnect(evt);
				break;
		}
	}
	reconnect(evt) {
		const delay = 1000;
		setTimeout(() => {
			if (this.socket.readyState === this.socket.CLOSED) {
				console.log('reconnect !');
				this.socket = null;
				this.createSocket(this.baseURL);
			}
		}, delay);
	}
	onSocketMessage(evt) {
		const data = msgpack.decode(evt.data);
		console.log(data);
	}
	onSocketError(err) {
		console.error(err);
	}
}
