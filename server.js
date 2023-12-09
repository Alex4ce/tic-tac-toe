let express = require('express')
let app = express()
let http = require('http')
const { connected } = require('process')
let server = http.createServer(app)
let { Server } = require('socket.io')
let io = new Server(server)

app.use(express.static('public'))

let field = [[0, 0, 0],
[0, 0, 0],
[0, 0, 0]]

let turn = 0;
let flag;
let filling;
let users = []


app.get('/', (req, res) => {
    // res.sendFile(__dirname, '/public/index.html')
})

io.on('connection', (socket) => {
    // users.push(socket.id)
    if(turn > 1) turn = 0
    if (!turn) {
        flag = true
        filling = 1;
    } else {
        flag = false
        filling = 2;
    }
    turn++
    socket.on('disconnect', () => {
        for(let i = 0; i < users.length; i++){
            for(let j = Object.keys(users[i]).length; j >= 0; j--){
                if(users[i][Object.keys(users[i])[j]] == socket.id){
                    users.splice(i, 1)
                    break
                } 
            }
        }
    })
    socket.emit('sendId', {id: socket.id, flag, filling})
    socket.on('refresh', () => {
        io.emit('kill', 'bye')
    })
    socket.on('sendUsersData', (data) => {
        users.push(data)
        io.emit('giveData', { field, users, filling: data.filling, flag: data.flag })
    })
    socket.on('sendData', (field) => {
        checkTie(field.field)
        socket.broadcast.emit('sendToUser', field)
        if (checkWin(field)) {
            let name = getNameById(users, socket.id)
            io.emit('getWinner', name)
        }
    })


})



let checkTie = (field) => {
    let unfolded = []
    field.forEach(field => {
        unfolded.push(...field)
    })
    if(!unfolded.filter(x => x == 0).length) return io.emit('getWinner', 'TIE')
}


let getNameById = (user, id) => {
    let nickName = ""
    user.forEach(data => {
        Object.keys(data).forEach(names => {            
            if(data[names] == id){
                nickName =  names
            } 
        })
    })
    return nickName
    
}

let checkWin = (field) => {
    let diagonale = 0;
    let reverseDiagonale = 2;
    let array = []

    /* X X X */
    for (let i = 0; i < field.field.length; i++) {
        if (field.field[i].filter(x => x == 1).length == 3 || field.field[i].filter(x => x == 2).length == 3) {
            return true
        }
    }

    /*X
        X
          X */
    for (let i = 0; i < field.field.length; i++) {
        array.push(field.field[i][diagonale])
        diagonale++
        if (array.filter(x => x == 1).length == 3 || array.filter(x => x == 2).length == 3) {
            return true
        }
    }

    array = []

    /*    X
        X
      X     */
    for (let i = 0; i < field.field.length; i++) {
        array.push(field.field[i][reverseDiagonale])
        reverseDiagonale--
        if (array.filter(x => x == 1).length == 3 || array.filter(x => x == 2).length == 3) {
            return true
        }
    }

    array = []

    /* X
       X
       X */


    for(let i = 0; i < field.field.length; i++){
        array.push(field.field[0][i], field.field[1][i],field.field[2][i])  
        // console.log(array)      
        if(array.filter(x => x == 1).length == 3 || array.filter(x => x == 2).length == 3){
            console.log('VERTICAL')
            return true
        } 

        array = []
    }

    reverseDiagonale = 2
    diagonale = 0;
}

server.listen(3030,'172.28.0.66')

