import multer from 'multer'
import path from 'path'
import fs from 'fs'

const tempDir = path.join(process.cwd(), 'public', 'temp')

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.random(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix)
  }
})

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png"]
  if(allowedTypes.includes(file.mimetype)) cb(null, true)
  else cb(new Error("Only jpeg/png images are allowed"))
}

const upload = multer({
  fileFilter,
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
})

export default upload;