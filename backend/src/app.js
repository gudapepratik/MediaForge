import pg from 'pg'
import session from 'express-session'
// import {PGStore} from 'connect-pg-simple'
import connectPgSimple from 'connect-pg-simple'
import express from 'express'
import passport from 'passport'
import router from './routes/auth.routes.js'
import './config/dotenv.js'
import './config/passport.js'

const app = express();
const pgPool = new pg.Pool({connectionString: process.env.DATABASE_URL})
const pgSession = connectPgSimple(session)

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

// auth endpoints
app.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}))

app.get('/auth/google/callback', passport.authenticate('google', {
    failureRedirect: '/login', // Passport handles redirection on failure
    successRedirect: '/api' // Passport handles redirection on success
}));

app.use('/api', router)


export default app;
