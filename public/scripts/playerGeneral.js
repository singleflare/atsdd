function qna(qnas, qno) {
  console.log(qnas, qno);
  $('#question').text(qnas.q);
  $('#answer').text(qnas.a);
  console.log(qno)
  qno++;
  if (qno >= 1 && qno <= 10) {
    $('#qno').text('Vòng 1 Câu ' + qno)
  }
  else if (qno >= 11 && qno <= 20) {
    $('#qno').text('Vòng 2 Luợt 1 Câu ' + (qno - 10))
  }
  else if (qno >= 21 && qno <= 30) {
    $('#qno').text('Vòng 2 Luợt 2 Câu ' + (qno - 20))
  }
  else if (qno >= 31 && qno <= 40) {
    $('#qno').text('Vòng 2 Luợt 3 Câu ' + (qno - 30))
  }
  else if (qno >= 41 && qno <= 50) {
    $('#qno').text('Vòng 3 Câu ' + (qno - 40))
  }
  else if (qno >= 51 && qno <= 60) {
    $('#qno').text('Vòng 4 Câu ' + (qno - 50))
  }
}

function resetBalls() {
  $('#systemBallGrid img').css('opacity', 0)
  $('#p1Jackpots').empty()
  $('#p2Jackpots').empty()
  $('#p3Jackpots').empty()
  $('#p1Balls').empty()
  $('#p2Balls').empty()
  $('#p3Balls').empty()
}
function resetData() {
  
}

function updateBall(mode, p, ball) {
  console.log('updateBall', mode, p, ball)
  if (p == 'system') {
    if (mode == 'add') $(`#systemBallGrid #ball${ball}`).css('opacity', 1)
    else if (mode == 'del') $(`#systemBallGrid #ball${ball}`).css('opacity', 0)
  }
  else if (p == 1) {
    if (mode == 'add') $('#p1Balls').append(`<img src='../media/${ball}.png' class='ball' id='ball${ball}'>`)
    else if (mode == 'del') $('#p1Balls #ball' + ball).remove()
  }
  else if (p == 2) {
    if (mode == 'add') $('#p2Balls').append(`<img src='../media/${ball}.png' class='ball' id='ball${ball}'>`)
    else if (mode == 'del') $('#p2Balls #ball' + ball).remove()
  }
  else if (p == 3) {
    if (mode == 'add') $('#p3Balls').append(`<img src='../media/${ball}.png' class='ball' id='ball${ball}'>`)
    else if (mode == 'del') $('#p3Balls #ball' + ball).remove()
  }
}

function updateJackpot(mode, p, ball) {
  if (p == 1) {
    if (mode == 'add') $('#p1Jackpots').append(`<img src='../media/${ball}.png' class='ball' id='ball${ball}'>`)
    else if (mode == 'del') $('#p1Jackpots #ball' + ball).remove()
  }
  else if (p == 2) {
    if (mode == 'add') $('#p2Jackpots').append(`<img src='../media/${ball}.png' class='ball' id='ball${ball}'>`)
    else if (mode == 'del') $('#p2Jackpots #ball' + ball).remove()
  }
  else if (p == 3) {
    if (mode == 'add') $('#p3Jackpots').append(`<img src='../media/${ball}.png' class='ball' id='ball${ball}'>`)
    else if (mode == 'del') $('#p3Jackpots #ball' + ball).remove()
  }
}

function updateScore(p, score) {
  if (p == 1) {
    $('#p1Score').text(score)
  }
  else if (p == 2) {
    $('#p2Score').text(score)
  }
  else if (p == 3) {
    $('#p3Score').text(score)
  }
}

function updateName(p, name) {
  if (p == 1) {
    $('#p1Name').text(name)
  }
  else if (p == 2) {
    $('#p2Name').text(name)
  }
  else if (p == 3) {
    $('#p3Name').text(name)
  }
}

function armBuzzer() {
  console.log('armBuzzer')
  $('button').text('Buzzer')
  $('button').removeClass()
  $('button').addClass('ready')
  $('button').prop('disabled', false)
}
function buzzEarly() {
  $('button').removeClass()
  $('button').addClass('buzzed')
  let sound = new Howl({src: ['../media/chuông.mp3']})
  sound.play()
}
function buzzLate() {
  $('button').removeClass()
  $('button').addClass('slowBuzzed')
}
function resetBuzzer() {
  $('button').removeClass()
  $('button').addClass('idle')
  $('button').prop('disabled', true)
}

let countdownInterval
function countdown(time) {
  $('#countdown').text(time)
  countdownInterval = setInterval(() => {
    time--
    $('#countdown').text(time)
    if (time == 0) {
      clearInterval(countdownInterval)
    }
  }, 1000)
}
function stopCountdown() {
  clearInterval(countdownInterval)
  $('#countdown').text('')
}

function changeBallColor(color) {
  if (color == 'all') {
    document.querySelectorAll('.ball').forEach(ball => {
      ball.style.filter = 'grayscale(0)'
    })
  }
  else if (color == 'none') {
    document.querySelectorAll('.ball').forEach(ball => {
      ball.style.filter = 'grayscale(1)'
    })
  }
  else if (color == 'red') {
    for (let i = 1; i <= 50; i++) {
      document.querySelector(`#ball${i}`).style.filter = 'grayscale(1)'
      try { document.querySelector(`.pBallsGrid #ball${i}`).style.filter = 'grayscale(1)' }
      catch (e) { }
    }
    for (let i = 1; i <= 10; i++) {
      document.querySelector(`#ball${i}`).style.filter = 'grayscale(0)'
      try { document.querySelector(`.pBallsGrid #ball${i}`).style.filter = 'grayscale(0)' }
      catch (e) { }
    }
  }
  else if (color == 'blue') {
    for (let i = 1; i <= 50; i++) {
      document.querySelector(`#ball${i}`).style.filter = 'grayscale(1)'
      try { document.querySelector(`.pBallsGrid #ball${i}`).style.filter = 'grayscale(1)' }
      catch (e) { }
    }
    for (let i = 11; i <= 20; i++) {
      document.querySelector(`#ball${i}`).style.filter = 'grayscale(0)'
      try { document.querySelector(`.pBallsGrid #ball${i}`).style.filter = 'grayscale(0)' }
      catch (e) { }
    }
  }
  else if (color == 'green') {
    for (let i = 1; i <= 50; i++) {
      document.querySelector(`#ball${i}`).style.filter = 'grayscale(1)'
      try { document.querySelector(`.pBallsGrid #ball${i}`).style.filter = 'grayscale(1)' }
      catch (e) { }
    }
    for (let i = 21; i <= 30; i++) {
      document.querySelector(`#ball${i}`).style.filter = 'grayscale(0)'
      try { document.querySelector(`.pBallsGrid #ball${i}`).style.filter = 'grayscale(0)' }
      catch (e) { }
    }
  }
  else if (color == 'pink') {
    for (let i = 1; i <= 50; i++) {
      document.querySelector(`#ball${i}`).style.filter = 'grayscale(1)'
      try { document.querySelector(`.pBallsGrid #ball${i}`).style.filter = 'grayscale(1)' }
      catch (e) { }
    }
    for (let i = 31; i <= 40; i++) {
      document.querySelector(`#ball${i}`).style.filter = 'grayscale(0)'
      try { document.querySelector(`.pBallsGrid #ball${i}`).style.filter = 'grayscale(0)' }
      catch (e) { }
    }
  }
  else if (color == 'yellow') {
    for (let i = 1; i <= 50; i++) {
      document.querySelector(`#ball${i}`).style.filter = 'grayscale(1)'
      try { document.querySelector(`.pBallsGrid #ball${i}`).style.filter = 'grayscale(1)' }
      catch (e) { }
    }
    for (let i = 41; i <= 50; i++) {
      document.querySelector(`#ball${i}`).style.filter = 'grayscale(0)'
      try { document.querySelector(`.pBallsGrid #ball${i}`).style.filter = 'grayscale(0)' }
      catch (e) { }
    }
  }
}