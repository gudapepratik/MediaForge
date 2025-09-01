import passport from "passport";
import {Strategy as GoogleStrategy} from "passport-google-oauth20"
import {prisma} from "./db.js"

//serialize - add data in the store (keep it minimal)
passport.serializeUser((user, done) => {
    console.log(user.id)
    return done(null, user.id)
})

// deserialize - get the user data using the id from session and send the full user data
passport.deserializeUser(async (id, done) => {
    try {
        const user = await prisma.user.findUnique({
            where: {id: id}
        })
        return done(null, user)
    } catch (error) {
        return done(error,null)
    }
})

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_AUTH_CLIENTID,
    clientSecret: process.env.GOOGLE_AUTH_SECRET,
    callbackURL: "/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await prisma.user.findUnique({
            where: {googleId: profile.id}
        })

        if(user) {
            return done(null, user)
        }

        user = await prisma.user.create({
            data: {
                googleId: profile.id,
                email: profile.emails[0].value,
                name: profile.displayName
            }
        })
        return done(null, user)
    } catch (error) {
        return done(error,null)
    }
}))