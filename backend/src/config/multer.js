import multer from 'multer'

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '/public/temp')
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