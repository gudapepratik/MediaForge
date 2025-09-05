import { Router } from "express";
import passport from "passport";
import { checkAuth } from "../middlewares/auth.middleware.js";
import {ApiResponse} from "../utils/ApiResponse.js"
import { ApiError } from "../utils/ApiError.js";

const router = Router()

router.get('/', (req,res) => {
    return res.json({message: "Welcome to MEDIAFORGE API"})
})

router.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}))

router.get('/auth/google/callback', (req, res, next) => {
    passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/login?login_failed=true` }, (err, user, info, status) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.redirect(`${process.env.FRONTEND_URL}/login?login_status=false`);
        }

        // need to manually login user and eastablish session
        // because we have overritted the this callback
        req.login(user, (loginErr) => {
            if (loginErr) {
                return next(loginErr);
            }

            if (user.isNewUser) {
                return res.redirect(`${process.env.FRONTEND_URL}/login?login_status=true&is_new_user=true`);
            } else {
                return res.redirect(`${process.env.FRONTEND_URL}/login?login_status=true&is_new_user=false`);
            }
        });
    })(req, res, next);
});

router.get('/auth/current', checkAuth, (req, res) => {
    return res.status(200).json(new ApiResponse(200, {user: req?.user}, "User is logged in"))
})

router.post('/auth/logout', checkAuth, (req,res,next) => {
    req.logout((err) => {
        if(err) {
            next(new ApiError(500, "Unexpected Error occurred: Logout Failed", err))
        }

        // clear the session and cookie
        req.session.destroy((err) => {
            if(err)
                next(new ApiError(500, "Unexpected Error occurred: Logout Succeded with Errors", err))
        })

        res.clearCookie('connect.sid')

        return res.status(200).json(new ApiResponse(200, null, "Logout successfull"))
    })
})
export default router