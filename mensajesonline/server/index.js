
import express from 'express';
import logger from 'morgan'
import dotenv from 'dotenv'
import {createClient} from '@libsql/client'
import {Server} from 'socket.io'
import {createServer} from 'node:http';

dotenv.config()

const os = require('os')
const puert = process.env.PORT ?? 3000;
const hostname = 

const app = express();
const server = createServer(app);
const io = new Server(server,{
    connectionStateRecovery:{}
})

const db = createClient({
    url:"libsql://equal-blade-yhordic.turso.io",
    authToken: process.env.DB_TOKEN,
})

await db.execute(`
 CREATE TABLE IF NOT EXISTS messages (
    ID INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT,
    user TEXT
 )
`)
io.on('connection', async (socket)=>{
    console.log('a uses has connected!');

    socket.on('disconnect' , ()=>{
        console.log('an user has disconnected!');
    })

    socket.on('chat message', async (sms)=>{
       let result ;
       let username =  socket.handshake.auth.username ?? 'anonymous';
       console.log(username + 'user')
        try{
           
            result = await db.execute({
                sql: 'INSERT INTO messages (content, user) VALUES (:sms, :username)',
                args:{sms,username}
            })
        }catch(e){
            console.error(e +' Error en db mensaje');
            return
        }
       
        io.emit('chat message',sms,result.lastInsertRowid.toString(), username)
    })

    if(!socket.recovered){
        try{
            const results = await db.execute({
                sql: 'SELECT id, content, user FROM messages WHERE id > ?',
                args:[socket.handshake.auth.serverOffset ?? 0]
            })

            results.rows.forEach(row =>{
                socket.emit('chat message', row.content,row.id,row.user)
            })
        }catch(error){
            console.error(error +' Error recuperar sms m');
        }
        


    }
})
app.use(logger('dev'))
app.get('/',(req,res) =>{
    res.sendFile(process.cwd() + '/client/index.html');
})

server.listen(puert,hostname,()=>{
    console.log(`Server running on port ${hostname}:${puert}`)
})