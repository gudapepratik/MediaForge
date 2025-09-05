import pg from 'pg'
import session from 'express-session'
// import {PGStore} from 'connect-pg-simple'
import connectPgSimple from 'connect-pg-simple'
import express from 'express'
import passport from 'passport'
import cors from 'cors'
import router from './routes/auth.routes.js'
import './config/dotenv.js'
import './config/passport.js'

const app = express();
const pgPool = new pg.Pool({connectionString: process.env.DATABASE_URL})
const pgSession = connectPgSimple(session)

app.use(cors({
    credentials: true,
    origin: (origin, callback) => {
        if(!origin || origin === 'http://localhost:5173') {
            callback(null, true)
        } else{
            callback(new Error("Not allowed by CORS"))
        }
    }
}))

app.use(express.json({
    limit: "8kb"
}))

app.use(express.urlencoded({
    extended: true,
    limit: "16kb"
}))

app.use(express.static('public'));

app.use(session({
    store: new pgSession({
        pool: pgPool,
        tableName: 'session',
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 30 * 24 * 60 * 60 * 1000} // 30days
}))

app.use(passport.initialize())
app.use(passport.session())
app.use('/api', router)

// error handler
app.use((err, req, res, next) => {
    if (err instanceof ApiError) {
        const { statusCode, message, errors} = err;

        res.status(statusCode).json({
            success: false,
            message,
            errors,
            stack: undefined,
        });
    } else {
        const { statusCode, message, errors} = err;
        res.status(500).json({
            success: false,
            errors,
            message
        });
    }
});

export default app;
