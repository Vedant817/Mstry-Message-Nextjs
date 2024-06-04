import mongoose from "mongoose";

type ConnectionObject = {
    isConnected?: number
}

const connection: ConnectionObject = {}

async function dbConnect(): Promise<void>{
    if(connection.isConnected){
        console.log('Database already Connected');
        return
    }

    try {
        const db = await mongoose.connect(process.env.MONGODB_URI || '', {})
        connection.isConnected = db.connections[0].readyState
        console.log("Database Connected Successfully");
        
    } catch (error) {
        console.log('Database Connection failed', error);
        process.exit()
    }
}

export default dbConnect;