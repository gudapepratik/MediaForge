import dotenv from 'dotenv'

if(process.env.ENVIRONMENT !== "PROD") {
  dotenv.config({
      path: ".env"
  })
}