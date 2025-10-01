import app from './app.js'
import { connectDB } from './config/db.js'

connectDB()
.then(() => {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Server running on port ${port || 3000}`)
    })
})    
.catch((error) => {
    console.log("Error occurred while connecting to Postgres")
})  