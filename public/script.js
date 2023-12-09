let socket = io()
let gameField = document.querySelector('.field')
let rows = document.querySelectorAll('.row')    
let boxes = document.querySelectorAll('.box')
let getName = document.querySelector('.acquireName')
let stratBtn = document.querySelector('.start')

// let coloring = {
//     0: 'white',
//     1: 'red',
//     2: 'black'
// }


let coloring = {
    0: 'images/white.png',
    1: 'images/cross.png',
    2: 'images/zero.png'
}


let fillingNumber;
let myId;
let nick;
let myNickName = {}

let colorTheField = (field) => {
    for (let i = 0; i < field.length; i++) {
        for(let j = 0; j < field[i].length; j++){  
            rows[i].children[j].style.background = `white url(${coloring[field[i][j]]}) 0 0/cover no-repeat`
        }
    }
}

let displayPlayers = (users) => {
    if(document.querySelector('.players-tab')) document.querySelector('.players-tab').remove()    
    let playersTab = document.createElement('div')
    playersTab.classList.add('players-tab')
    users.forEach(user => {
        // console.log(user)
        let userLine = document.createElement('p')
        userLine.classList.add('user')
        userLine.textContent = Object.keys(user)[2]
        playersTab.append(userLine)
    })

    gameField.append(playersTab)
}

socket.on('sendId', (data) => {
    myId = data.id
    myNickName.filling = data.filling
    myNickName.flag = data.flag
    fillingNumber = data.filling
    
})

stratBtn.addEventListener('click', (e) => {
    if(getName.value){
        nick = getName.value    
        myNickName[nick] = myId
        socket.emit('sendUsersData', myNickName)    
        document.querySelector('.choose-name').remove()
    }
})

getName.addEventListener('keydown', (e) => {
    if(e.code == 'Enter'){
        nick = e.target.value    
        myNickName[nick] = myId
        socket.emit('sendUsersData', myNickName)    
        document.querySelector('.choose-name').remove()
    }
})

getName.addEventListener('input', (e) => {
    if(e.target.value.length > 0){
        stratBtn.style.background = 'rgb(46, 225, 46)'
    } else {
        stratBtn.style.background = 'grey'
    }
})

socket.on('giveData', (data) => {
    console.log(data)
    colorTheField(data.field)
    makeMove(data)
    displayPlayers(data.users)
})

socket.on('sendToUser', (data) => {
    colorTheField(data.field)
    makeMove(data)   
})

socket.on('getWinner', (winner) => {
    createNotifiction(winner)
})


let createNotifiction = (name) => {
    let blurContainer = document.createElement('div')
    blurContainer.classList.add('blur-container')

    let notifictaion = document.createElement('div')
    notifictaion.classList.add('notifictaion')
    let winner = document.createElement('p')
    winner.classList.add('winner')
    winner.textContent = '⭐⭐⭐' + name + '⭐⭐⭐'

    let restartBtn = document.createElement('bitton')
    restartBtn.classList.add('restartBtn')
    restartBtn.textContent = 'Restart'

    blurContainer.append(notifictaion)
    notifictaion.append(winner, restartBtn)
    document.body.append(blurContainer)

    restartBtn.addEventListener('click', (e) => {
        let field = [[0, 0, 0],
                    [0, 0, 0],
                    [0, 0, 0]] 
        let flag = true;
        socket.emit('refresh', 'do it')        
    })

}

socket.on('kill', () => {
    location.reload()
})



// let makeMove = (data) => {
//     let array = data.field
//     let flag = data.flag
//     for (let i = 0; i < array.length; i++) {
//         boxes[i].addEventListener('click', (e) => {
//             if (flag && array[i] == 0) {
//                 array[i] = fillingNumber
//                 boxes[i].style.background = coloring[fillingNumber]
//                 flag = false;
//                 socket.emit('sendData', { field: array, flag: true})
//             }
//         })
//     }
// }

let makeMove = (data) => {
    let array = data.field
    let flag = data.flag   
    for (let i = 0; i < array.length; i++) {        
        for(let j = 0; j < array[i].length; j++){            
            rows[i].children[j].addEventListener('click', (e) => {
                if (flag && array[i][j] == 0) {
                    array[i][j] = fillingNumber
                    rows[i].children[j].style.background = `white url(${coloring[array[i][j]]}) 0 0/cover no-repeat`
                    flag = false;
                    socket.emit('sendData', { field: array, flag: true})
                }
            })
        }
       
    }
}

// let restart = (field) => {
//     if(!field.find(x => x ==0)) socket.emit('Restart', 'need to restart')
// }


