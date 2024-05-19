import express from 'express';
import logger from 'morgan'
import dotenv from 'dotenv'
import {createClient} from '@libsql/client'
import {Server} from 'socket.io'
import {createServer} from 'node:http';

dotenv.config()
const puert = process.env.PORT ?? 3000;

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
    content TEXT
 )
`)
io.on('connection', (socket)=>{
    console.log('a uses has connected!');

    socket.on('disconnect' , ()=>{
        console.log('an user has disconnected!');
    })

    socket.on('chat message', async (sms)=>{
       let result 
        try{
            result = await db.execute({
                sql: 'INSERT INTO messages (content) VALUES (:sms)',
                args:{sms}
            })
        }catch(e){
            console.error(e +' Error en db mensaje');
            return
        }
       
        io.emit('chat message',sms,result.lastInsertRowid.toString())
    })
})
app.use(logger('dev'))
app.get('/',(req,res) =>{
    res.sendFile(process.cwd() + '/client/index.html');
})

server.listen(puert,()=>{
    console.log(`Server running on port ${puert}`)
})