const express = require('express');
const { join } = require('path');
const config = require("./config.js");
const fs = require('fs')
console.log(config)
// const { initializeApp } = require('firebase/app')
// const { getFirestore, getDoc, doc, updateDoc } = require('firebase/firestore')

const app = express();

const server = app.listen(process.env.PORT || 3000)
app.use(express.static('public'));

const ioServer = require('socket.io')(server)

app.get(`${config.p1Route}`, (req, res) => {
	res.sendFile(join(__dirname, '/public/pages/p1.html'))
})
app.get(`${config.p2Route}`, (req, res) => {
	res.sendFile(join(__dirname, '/public/pages/p2.html'))
})
app.get(`${config.p3Route}`, (req, res) => {
	res.sendFile(join(__dirname, '/public/pages/p3.html'))
})
app.get(`${config.controllerRoute}`, (req, res) => {
	res.sendFile(join(__dirname, '/public/pages/control.html'))
})
app.get(`${config.podiumsRoute}`, (req, res) => {
	res.sendFile(join(__dirname, '/public/pages/podiums.html'))
})
app.get(`${config.hostRoute}`, (req, res) => {
	res.sendFile(join(__dirname, '/public/pages/host.html'))
})
app.get(`${config.ballBoardRoute}`, (req, res) => {
	res.sendFile(join(__dirname, '/public/pages/ballBoard.html'))
})
app.get(`${config.overlayRoute}`, (req, res) => {
	res.sendFile(join(__dirname, '/public/pages/overlay.html'))
})
app.get('/systemBalls', (req, res) => {
	res.send(systemBalls)
})
app.get('/customSounds', (req, res) => {
	fs.readdir('./public/media/customSounds', (err, files) => {
		console.log(files)
		let fileNames = []
		files.forEach(file => fileNames.push(file))
		console.log(fileNames)
		res.send(fileNames)
	})
})

const p1ns = ioServer.of(`${config.p1Route}`)
const p2ns = ioServer.of(`${config.p2Route}`)
const p3ns = ioServer.of(`${config.p3Route}`)
const cns = ioServer.of(`${config.controllerRoute}`)
const pns = ioServer.of(`${config.podiumsRoute}`)
const hns = ioServer.of(`${config.hostRoute}`)
const bbns = ioServer.of(`${config.ballBoardRoute}`)
const ovlns = ioServer.of(`${config.overlayRoute}`)

console.log(`http://localhost:3000${config.p1Route}`)
console.log(`http://localhost:3000${config.p2Route}`)
console.log(`http://localhost:3000${config.p3Route}`)
console.log(`http://localhost:3000${config.controllerRoute}`)
console.log(`http://localhost:3000${config.podiumsRoute}`)
console.log(`http://localhost:3000${config.hostRoute}`)
console.log(`http://localhost:3000${config.ballBoardRoute}`)
console.log(`http://localhost:3000${config.overlayRoute}`)

//logics
let systemBalls = [];
for (let i = 1; i <= 50; i++) {
	systemBalls.push(i);
}
let p1Balls = []
let p2Balls = []
let p3Balls = []
let p1Jackpots = []
let p2Jackpots = []
let p3Jackpots = []
let p1Name = ''
let p2Name = ''
let p3Name = ''
let p1Score = 0
let p2Score = 0
let p3Score = 0
const BALLSCORE = 500;
function broadcastToAllPlayers(event, ...data) {
	p1ns.emit(event, ...data)
	p2ns.emit(event, ...data)
	p3ns.emit(event, ...data)
}

//read from file
fs.readFile('data.txt', 'utf8', (err, data) => {
	const lines = data.split(/\r?\n/); // Split by line break
	lines.forEach((line, index) => {
		if (index == 0 && line != '' && line != undefined) p1Name = line
		else if (index == 1 && line != '' && line != undefined) p2Name = line
		else if (index == 2 && line != '' && line != undefined) p3Name = line
		else if (index == 3 && line != '' && line != undefined) line.split(',').forEach(ball => {
			p1Balls.push(parseInt(ball))
			p1Score += BALLSCORE
			systemBalls = systemBalls.filter(b => b != ball)
		})
		else if (index == 4 && line != '' && line != undefined) line.split(',').forEach(ball => {
			p2Balls.push(parseInt(ball))
			p2Score += BALLSCORE
			systemBalls = systemBalls.filter(b => b != ball)
		})
		else if (index == 5 && line != '' && line != undefined) line.split(',').forEach(ball => {
			p3Balls.push(parseInt(ball))
			p3Score += BALLSCORE
			systemBalls = systemBalls.filter(b => b != ball)
		})
	});
})

// returns things in array 'a' that are not in array 'b'
// > ['a','b','c','1', '2', '3'].complement(['b', 'c', 'd', 'e']);
// ['a', '1', '2', '3'] 
function complement(a, b) {
	(b) || (b = a, a = this);
	return (Array.isArray(a) && Array.isArray(b)) ? a.filter(x => { return b.indexOf(x) === -1; }) : undefined;
}
Array.prototype.complement = complement;

//emits
p1ns.on('connection', socket => {
	console.log('p1 connected')
	//init
	socket.emit('resetBalls')
	p1Balls.forEach(ball => socket.emit('updateBall', 'add', 1, ball))
	p1Jackpots.forEach(ball => socket.emit('updateJackpot', 'add', 1, ball))
	p2Balls.forEach(ball => socket.emit('updateBall', 'add', 2, ball))
	p2Jackpots.forEach(ball => socket.emit('updateJackpot', 'add', 2, ball))
	p3Balls.forEach(ball => socket.emit('updateBall', 'add', 3, ball))
	p3Jackpots.forEach(ball => socket.emit('updateJackpot', 'add', 3, ball))
	systemBalls.forEach(ball => socket.emit('updateBall', 'add', 'system', ball))
	socket.emit('updateScore', 1, p1Score)
	socket.emit('updateScore', 2, p2Score)
	socket.emit('updateScore', 3, p3Score)
	socket.emit('updateName', 1, p1Name)
	socket.emit('updateName', 2, p2Name)
	socket.emit('updateName', 3, p3Name)

	socket.on('p1Buzzed', () => {
		cns.emit('p1Buzzed')
	})
})

p2ns.on('connection', socket => {
	console.log('p2 connected')
	//init
	socket.emit('resetBalls')
	p1Balls.forEach(ball => socket.emit('updateBall', 'add', 1, ball))
	p1Jackpots.forEach(ball => socket.emit('updateJackpot', 'add', 1, ball))
	p2Balls.forEach(ball => socket.emit('updateBall', 'add', 2, ball))
	p2Jackpots.forEach(ball => socket.emit('updateJackpot', 'add', 2, ball))
	p3Balls.forEach(ball => socket.emit('updateBall', 'add', 3, ball))
	p3Jackpots.forEach(ball => socket.emit('updateJackpot', 'add', 3, ball))
	systemBalls.forEach(ball => socket.emit('updateBall', 'add', 'system', ball))
	socket.emit('updateScore', 1, p1Score)
	socket.emit('updateScore', 2, p2Score)
	socket.emit('updateScore', 3, p3Score)
	socket.emit('updateName', 1, p1Name)
	socket.emit('updateName', 2, p2Name)
	socket.emit('updateName', 3, p3Name)

	socket.on('p2Buzzed', () => {
		cns.emit('p2Buzzed')
	})
})

p3ns.on('connection', socket => {
	console.log('p3 connected')
	//init
	socket.emit('resetBalls')
	p1Balls.forEach(ball => socket.emit('updateBall', 'add', 1, ball))
	p1Jackpots.forEach(ball => socket.emit('updateJackpot', 'add', 1, ball))
	p2Balls.forEach(ball => socket.emit('updateBall', 'add', 2, ball))
	p2Jackpots.forEach(ball => socket.emit('updateJackpot', 'add', 2, ball))
	p3Balls.forEach(ball => socket.emit('updateBall', 'add', 3, ball))
	p3Jackpots.forEach(ball => socket.emit('updateJackpot', 'add', 3, ball))
	systemBalls.forEach(ball => socket.emit('updateBall', 'add', 'system', ball))
	socket.emit('updateScore', 1, p1Score)
	socket.emit('updateScore', 2, p2Score)
	socket.emit('updateScore', 3, p3Score)
	socket.emit('updateName', 1, p1Name)
	socket.emit('updateName', 2, p2Name)
	socket.emit('updateName', 3, p3Name)

	socket.on('p3Buzzed', () => {
		cns.emit('p3Buzzed')
	})
})

let qnom = -1
cns.on('connection', socket => {
	console.log('controller connected')
	socket.emit('initNames', p1Name, p2Name, p3Name)
	socket.on('qna', (qnas, qno) => {
		qnom = qno
		console.log('qnom: ' + qnom)
		console.log(qnas, qno)
		hns.emit('qna', qnas, qno)
		broadcastToAllPlayers('qna', qnas, qno)
		if (qno >= 10 && qno <= 39) {
			ovlns.emit('showR2Question', qnas)
		}
		else if (qno >= 40 && qno <= 49) {
			bbns.emit('ballCol', qno % 10 + 1)
			ovlns.emit('qna', qnas, qno)
			pns.emit('playMusic', '../media/Hiện câu hỏi.mp3')
			hns.emit('playMusic', '../media/Hiện câu hỏi.mp3')
			broadcastToAllPlayers('playMusic', '../media/Hiện câu hỏi.mp3')
		}
		else ovlns.emit('qna', qnas, qno)
	})

	socket.on('resetData', () => {
		fs.writeFile('data.txt', `\n\n\n\n\n`, (err) => {
			if (err) {
				console.error('Error writing to file:', err);
			} else {
				console.log('Data written to file successfully!');
			}
		})
		p1Balls = []
		p2Balls = []
		p3Balls = []
		p1Jackpots = []
		p2Jackpots = []
		p3Jackpots = []
		systemBalls = []
		for (let i = 1; i <= 50; i++) {
			systemBalls.push(i);
		}
		p1Score = 0
		p2Score = 0
		p3Score = 0
		p1Name = ''
		p2Name = ''
		p3Name = ''
	})

	socket.on('getSystemBalls', () => {
		cns.emit('getSystemBalls', systemBalls)
	})

	socket.on('flyDownBalls', col => {
		bbns.emit('flyDownBalls', col)
	})
	socket.on('hideColGpx', () => {
		bbns.emit('hideColGpx')
	})

	socket.on('updateTime', (time) => {
		hns.emit('updateTime', time)
		broadcastToAllPlayers('updateTime', time)
		ovlns.emit('updateTime', time)
	})

	socket.on('hideQ', () => {
		hns.emit('hideQ')
		broadcastToAllPlayers('hideQ')
	})
	socket.on('showQ', () => {
		hns.emit('showQ')
		broadcastToAllPlayers('showQ')
	})

	socket.on('playMusic', url => {
		console.log(url)
		pns.emit('playMusic', url)
		hns.emit('playMusic', url)
		ovlns.emit('playMusic', url)
		broadcastToAllPlayers('playMusic', url)
	})
	socket.on('stopMusic', () => {
		pns.emit('stopMusic')
		hns.emit('stopMusic')
		ovlns.emit('stopMusic')
		broadcastToAllPlayers('stopMusic')
	})

	socket.on('changePlayerPodium', (p, state) => {
		console.log(p, state)
		pns.emit('changePlayerPodium', p, state)
	})

	socket.on('updateBalls', (mode, player, balls) => {
		if (mode == 'add') {
			if (player == 1) {
				balls.forEach(ball => {
					ball = Number(ball)
					console.log(ball, typeof ball)
					if (ball == '' || isNaN(ball) || ball < 1 || ball > 50 || p1Balls.includes(ball)) return
					else if (p2Balls.includes(ball)) {
						p2Balls = p2Balls.filter(b => b != ball)
						p2Score -= BALLSCORE
						hns.emit('updateBall', 'del', 2, ball)
						broadcastToAllPlayers('updateBall', 'del', 2, ball)
					}
					else if (p3Balls.includes(ball)) {
						p3Balls = p3Balls.filter(b => b != ball)
						p3Score -= BALLSCORE
						hns.emit('updateBall', 'del', 3, ball)
						broadcastToAllPlayers('updateBall', 'del', 3, ball)
					}
					if (qnom < 40 || qnom > 49) {
						bbns.emit('removeBall', ball)
					}
					p1Balls.push(ball)
					p1Score += BALLSCORE
					p1Balls.sort((a, b) => a - b)
					systemBalls = systemBalls.filter(b => b != ball)
					hns.emit('updateBall', 'add', 1, ball)
					hns.emit('updateBall', 'del', 'system', ball)
					pns.emit('updateBall', 'add', 1, ball)
					broadcastToAllPlayers('updateBall', 'add', 1, ball)
					broadcastToAllPlayers('updateBall', 'del', 'system', ball)
				})
				//for R2, after all balls has been added
				hns.emit('delAllGlowBall')
				broadcastToAllPlayers('delAllGlowBall')
			}
			else if (player == 2) {
				balls.forEach(ball => {
					ball = Number(ball)
					if (ball == '' || isNaN(ball) || ball < 1 || ball > 50 || p2Balls.includes(ball)) return
					else if (p1Balls.includes(ball)) {
						p1Balls = p1Balls.filter(b => b != ball)
						p1Score -= BALLSCORE
						hns.emit('updateBall', 'del', 1, ball)
						broadcastToAllPlayers('updateBall', 'del', 1, ball)
					}
					else if (p3Balls.includes(ball)) {
						p3Balls = p3Balls.filter(b => b != ball)
						p3Score -= BALLSCORE
						hns.emit('updateBall', 'del', 3, ball)
						broadcastToAllPlayers('updateBall', 'del', 3, ball)
					}
					if (qnom < 40 || qnom > 49) {
						bbns.emit('removeBall', ball)
					}
					p2Balls.push(ball)
					p2Score += BALLSCORE
					p2Balls.sort((a, b) => a - b)
					systemBalls = systemBalls.filter(b => b != ball)
					hns.emit('updateBall', 'add', 2, ball)
					hns.emit('updateBall', 'del', 'system', ball)
					pns.emit('updateBall', 'add', 2, ball)
					broadcastToAllPlayers('updateBall', 'add', 2, ball)
					broadcastToAllPlayers('updateBall', 'del', 'system', ball)
				})
			}
			else if (player == 3) {
				balls.forEach(ball => {
					ball = Number(ball)
					if (ball == '' || isNaN(ball) || ball < 1 || ball > 50 || p3Balls.includes(ball)) return
					else if (p2Balls.includes(ball)) {
						p2Balls = p2Balls.filter(b => b != ball)
						p2Score -= BALLSCORE
						hns.emit('updateBall', 'del', 2, ball)
						broadcastToAllPlayers('updateBall', 'del', 2, ball)
					}
					else if (p1Balls.includes(ball)) {
						p1Balls = p1Balls.filter(b => b != ball)
						p1Score -= BALLSCORE
						hns.emit('updateBall', 'del', 1, ball)
						broadcastToAllPlayers('updateBall', 'del', 1, ball)
					}
					if (qnom < 40 || qnom > 49) {
						bbns.emit('removeBall', ball)
					}
					p3Balls.push(ball)
					p3Score += BALLSCORE
					p3Balls.sort((a, b) => a - b)
					systemBalls = systemBalls.filter(b => b != ball)
					hns.emit('updateBall', 'add', 3, ball)
					hns.emit('updateBall', 'del', 'system', ball)
					pns.emit('updateBall', 'add', 3, ball)
					broadcastToAllPlayers('updateBall', 'add', 3, ball)
					broadcastToAllPlayers('updateBall', 'del', 'system', ball)
				})
			}
			hns.emit('delAllGlowBall')
			broadcastToAllPlayers('delAllGlowBall')
		}
		else if (mode == 'del') {
			if (player == '1') {
				balls.forEach(ball => {
					ball = Number(ball)
					if (!p1Balls.includes(ball)) return
					else {
						p1Balls = p1Balls.filter(b => b !== ball)
						systemBalls.push(parseInt(ball))
						p1Score -= BALLSCORE
						hns.emit('updateBall', 'del', 1, ball)
						hns.emit('updateBall', 'add', 'system', ball)
						pns.emit('updateBall', 'del', 1, ball)
						broadcastToAllPlayers('updateBall', 'del', 1, ball)
						broadcastToAllPlayers('updateBall', 'add', 'system', ball)
					}
				})
			}
			else if (player == '2') {
				balls.forEach(ball => {
					ball = Number(ball)
					if (!p2Balls.includes(ball)) return
					else {
						p2Balls = p2Balls.filter(b => b !== ball)
						systemBalls.push(parseInt(ball))
						p2Score -= BALLSCORE
						hns.emit('updateBall', 'del', 2, ball)
						hns.emit('updateBall', 'add', 'system', ball)
						pns.emit('updateBall', 'del', 2, ball)
						broadcastToAllPlayers('updateBall', 'del', 2, ball)
						broadcastToAllPlayers('updateBall', 'add', 'system', ball)
					}
				})
			}
			else if (player == '3') {
				balls.forEach(ball => {
					ball = Number(ball)
					if (!p3Balls.includes(ball)) return
					else {
						p3Balls = p3Balls.filter(b => b !== ball)
						systemBalls.push(parseInt(ball))
						p3Score -= BALLSCORE
						hns.emit('updateBall', 'del', 3, ball)
						hns.emit('updateBall', 'add', 'system', ball)
						pns.emit('updateBall', 'del', 3, ball)
						broadcastToAllPlayers('updateBall', 'del', 3, ball)
						broadcastToAllPlayers('updateBall', 'add', 'system', ball)
					}
				})
			}
		}
		else if (mode == 'jackpotAdd') {
			if (player == 1) {
				balls.forEach(ball => {
					ball = Number(ball)
					if (p1Balls.includes(ball)) {
						p1Jackpots.push(ball)
						hns.emit('updateJackpot', 'add', 1, ball)
						pns.emit('updateBall', 'jackpotAdd', 1, ball)
						broadcastToAllPlayers('updateJackpot', 'add', 1, ball)
					}
				})
			}
			else if (player == 2) {
				balls.forEach(ball => {
					ball = Number(ball)
					if (p2Balls.includes(ball)) {
						p2Jackpots.push(ball)
						hns.emit('updateJackpot', 'add', 2, ball)
						pns.emit('updateBall', 'jackpotAdd', 2, ball)
						broadcastToAllPlayers('updateJackpot', 'add', 2, ball)
					}
				})
			}
			else if (player == 3) {
				balls.forEach(ball => {
					ball = Number(ball)
					if (p3Balls.includes(ball)) {
						p3Jackpots.push(ball)
						hns.emit('updateJackpot', 'add', 3, ball)
						pns.emit('updateBall', 'jackpotAdd', 3, ball)
						broadcastToAllPlayers('updateJackpot', 'add', 3, ball)
					}
				})
			}
			console.log(p1Jackpots, p2Jackpots, p3Jackpots)
		}
		else if (mode == 'jackpotDel') {
			if (player == 1) {
				balls.forEach(ball => {
					ball = Number(ball)
					if (p1Balls.includes(ball)) {
						p1Jackpots = p1Jackpots.filter(b => b != ball)
						hns.emit('updateJackpot', 'del', 1, ball)
						pns.emit('updateBall', 'jackpotDel', 1, ball)
						broadcastToAllPlayers('updateJackpot', 'del', 1, ball)
					}
				})
			}
			else if (player == 2) {
				balls.forEach(ball => {
					ball = Number(ball)
					if (p2Balls.includes(ball)) {
						p2Jackpots = p2Jackpots.filter(b => b != ball)
						hns.emit('updateJackpot', 'del', 2, ball)
						pns.emit('updateBall', 'jackpotDel', 2, ball)
						broadcastToAllPlayers('updateJackpot', 'del', 2, ball)
					}
				})
			}
			else if (player == 3) {
				balls.forEach(ball => {
					ball = Number(ball)
					if (p3Balls.includes(ball)) {
						p3Jackpots = p3Jackpots.filter(b => b != ball)
						hns.emit('updateJackpot', 'del', 3, ball)
						pns.emit('updateBall', 'jackpotDel', 3, ball)
						broadcastToAllPlayers('updateJackpot', 'add', 3, ball)
					}
				})
			}
		}
		console.log(p1Balls, p2Balls, p3Balls, p1Jackpots, p2Jackpots, p3Jackpots)
		hns.emit('updateScore', 1, p1Score)
		pns.emit('updateScore', 1, p1Score)
		broadcastToAllPlayers('updateScore', 1, p1Score)
		hns.emit('updateScore', 2, p2Score)
		pns.emit('updateScore', 2, p2Score)
		broadcastToAllPlayers('updateScore', 2, p2Score)
		hns.emit('updateScore', 3, p3Score)
		pns.emit('updateScore', 3, p3Score)
		broadcastToAllPlayers('updateScore', 3, p3Score)
		fs.writeFile('data.txt', `${p1Name}\n${p2Name}\n${p3Name}\n${p1Balls.join(',')}\n${p2Balls.join(',')}\n${p3Balls.join(',')}`, (err) => {
			if (err) {
				console.error('Error writing to file:', err);
			} else {
				console.log('Data written to file successfully!');
			}
		})
	})

	socket.on('updateScore', (mode, p, score) => {
		if (mode == 'set') {
			if (p == 1) {
				p1Score = parseInt(score)
				hns.emit('updateScore', 1, p1Score)
			}
			else if (p == 2) {
				p2Score = parseInt(score)
				hns.emit('updateScore', 2, p2Score)
			}
			else if (p == 3) {
				p3Score = parseInt(score)
				hns.emit('updateScore', 3, p3Score)
			}
		}
	})

	socket.on('updateName', (p, name) => {
		if (p == 1) {
			p1Name = name
			hns.emit('updateName', 1, p1Name)
			broadcastToAllPlayers('updateName', 1, p1Name)
		}
		else if (p == 2) {
			p2Name = name
			hns.emit('updateName', 2, p2Name)
			broadcastToAllPlayers('updateName', 2, p2Name)
		}
		else if (p == 3) {
			p3Name = name
			hns.emit('updateName', 3, p3Name)
			broadcastToAllPlayers('updateName', 3, p3Name)
		}
		fs.writeFile('data.txt', `${p1Name}\n${p2Name}\n${p3Name}\n${p1Balls.join(',')}\n${p2Balls.join(',')}\n${p3Balls.join(',')}`, (err) => {
			if (err) {
				console.error('Error writing to file:', err);
			} else {
				console.log('Data written to file successfully!');
			}
		})
	})

	socket.on('buzzer', (mode) => {
		console.log('buzzer', mode)
		p1ns.emit('buzzer', mode)
		p2ns.emit('buzzer', mode)
		p3ns.emit('buzzer', mode)
		if (mode == 'reset') {
			pns.emit('changePlayerPodium', 1, 'normal')
			pns.emit('changePlayerPodium', 2, 'normal')
			pns.emit('changePlayerPodium', 3, 'normal')
			hns.emit('updateBuzzPositionToHost', 0)
			broadcastToAllPlayers('buzzerBtnText')
		}
	})
	socket.on('p1BuzzEarly', () => {
		p1ns.emit('buzzEarly')
		pns.emit('p1BuzzEarly')
		ovlns.emit('playMusic', '../media/chuông.mp3')
		hns.emit('playMusic', '../media/chuông.mp3')
	})
	socket.on('p1BuzzLate', () => {
		p1ns.emit('buzzLate')
	})
	socket.on('p2BuzzEarly', () => {
		p2ns.emit('buzzEarly')
		pns.emit('p2BuzzEarly')
		ovlns.emit('playMusic', '../media/chuông.mp3')
		hns.emit('playMusic', '../media/chuông.mp3')
	})
	socket.on('p2BuzzLate', () => {
		p2ns.emit('buzzLate')
	})
	socket.on('p3BuzzEarly', () => {
		p3ns.emit('buzzEarly')
		pns.emit('p3BuzzEarly')
		ovlns.emit('playMusic', '../media/chuông.mp3')
		hns.emit('playMusic', '../media/chuông.mp3')
	})
	socket.on('p3BuzzLate', () => {
		p3ns.emit('buzzLate')
	})
	socket.on('updateBuzzPositionToHost', buzzed => {
		hns.emit('updateBuzzPositionToHost', buzzed)
	})

	socket.on('showLogo', () => {
		bbns.emit('showLogo')
	})
	socket.on('hideLogo', () => {
		bbns.emit('hideLogo')
	})
	socket.on('introduceBalls', () => {
		bbns.emit('introduceBalls')
		setTimeout(() => {
			let balls = p1Balls.concat(p2Balls, p3Balls)
			balls.forEach(ball => bbns.emit('removeBall', ball))
		}, 1000 + 60 * 50)
	})
	socket.on('glowBall', ball => {
		bbns.emit('glowBall', ball)
		hns.emit('glowBall', ball)
		broadcastToAllPlayers('glowBall', ball)
	})
	socket.on('delGlowBall', ball => {
		bbns.emit('delGlowBall', ball)
		hns.emit('delGlowBall', ball)
		broadcastToAllPlayers('delGlowBall', ball)
	})
	socket.on('delAllGlowBall', ball => {
		bbns.emit('delAllGlowBall')
		hns.emit('delAllGlowBall')
		broadcastToAllPlayers('delAllGlowBall')
	})
	socket.on('color', color => {
		bbns.emit('color', color)
		hns.emit('color', color)
		broadcastToAllPlayers('color', color)
		pns.emit('color', color)
	})

	socket.on('showPInfo', (player) => {
		if (player == 1) {
			hns.emit('showPInfo', player, p1Name)
		}
		else if (player == 2) {
			hns.emit('showPInfo', player, p2Name)
		}
		else if (player == 3) {
			hns.emit('showPInfo', player, p3Name)
		}
		for (let i = 0; i < 10; i++) hns.emit('updateAnsStatus', 'normal', i)
	})

	socket.on('updateAnsStatus', (stat, i) => {
		hns.emit('updateAnsStatus', stat, i)
		ovlns.emit('updateAnsStatus', stat, i)
	})

	socket.on('showQGpx', (qnas, qno) => {
		ovlns.emit('qna', qnas, qno)
	})
	socket.on('hideQGpx', () => {
		ovlns.emit('hideQGpx')
	})
	socket.on('showR2Gpx', () => {
		ovlns.emit('showR2Gpx')
	})
	// socket.on('hideR2Gpx', () => {
	//   ovlns.emit('hideR2Gpx')
	// })
	socket.on('hideR2Question', () => {
		ovlns.emit('hideR2Question')
	})
	socket.on('showAnim', (pos) => {
		ovlns.emit('showAnim', pos)
	})
	socket.on('setWaitAnim', (anim) => {
		ovlns.emit('setWaitAnim', anim)
	})
	socket.on('showBalls', (ball, pos) => {
		ovlns.emit('showBalls', ball, pos)
	})

	socket.on('playJackpotGpx', () => {
		ovlns.emit('playJackpotGpx')
	})
	socket.on('showJackpotGpx', () => {
		ovlns.emit('showJackpotGpx')
	})
	socket.on('hideJackpotGpx', () => {
		ovlns.emit('hideJackpotGpx')
	})
	socket.on('resetJackpotGpx', () => {
		ovlns.emit('resetJackpotGpx')
	})

	socket.on('anim_3BallsJackpotted', () => {
		ovlns.emit('anim_3BallsJackpotted')
	})
	socket.on('anim_3BallsPrize', () => {
		ovlns.emit('anim_3BallsPrize')
	})
	socket.on('anim_5BallsJackpotted', () => {
		ovlns.emit('anim_5BallsJackpotted')
	})
	socket.on('anim_5BallsPrize', () => {
		ovlns.emit('anim_5BallsPrize')
	})
	socket.on('anim_QbvPrize', () => {
		ovlns.emit('anim_QbvPrize')
	})
	socket.on('anim_fadeOutJackpotRules', () => {
		ovlns.emit('anim_fadeOutJackpotRules')
	})
})

pns.on('connection', socket => {
	console.log('podiums connected')
	//init
	p1Balls.forEach(ball => socket.emit('updateBall', 'add', 1, ball))
	p1Jackpots.forEach(ball => socket.emit('updateBall', 'jackpotAdd', 1, ball))
	p2Balls.forEach(ball => socket.emit('updateBall', 'add', 2, ball))
	p2Jackpots.forEach(ball => socket.emit('updateBall', 'jackpotAdd', 2, ball))
	p3Balls.forEach(ball => socket.emit('updateBall', 'add', 3, ball))
	p3Jackpots.forEach(ball => socket.emit('updateBall', 'jackpotAdd', 3, ball))
	socket.emit('updateScore', 1, p1Score)
	socket.emit('updateScore', 2, p2Score)
	socket.emit('updateScore', 3, p3Score)
})

hns.on('connection', socket => {
	console.log('host connected')
	//init
	socket.emit('resetBalls')
	p1Balls.forEach(ball => socket.emit('updateBall', 'add', 1, ball))
	p1Jackpots.forEach(ball => socket.emit('updateBall', 'jackpotAdd', 1, ball))
	p2Balls.forEach(ball => socket.emit('updateBall', 'add', 2, ball))
	p2Jackpots.forEach(ball => socket.emit('updateBall', 'jackpotAdd', 2, ball))
	p3Balls.forEach(ball => socket.emit('updateBall', 'add', 3, ball))
	p3Jackpots.forEach(ball => socket.emit('updateBall', 'jackpotAdd', 3, ball))
	systemBalls.forEach(ball => socket.emit('updateBall', 'add', 'system', ball))
	socket.emit('updateScore', 1, p1Score)
	socket.emit('updateScore', 2, p2Score)
	socket.emit('updateScore', 3, p3Score)
	socket.emit('updateName', 1, p1Name)
	socket.emit('updateName', 2, p2Name)
	socket.emit('updateName', 3, p3Name)
	console.log(p1Balls, p2Balls, p3Balls, p1Jackpots, p2Jackpots, p3Jackpots)
})

bbns.on('connection', socket => {
	console.log('ballBoard connected')
	//init

})


