const express = require("express");
const multer = require("multer");
const fs = require("fs").promises;
const path=require("path");
const UPLOAD_PATH= "./uploads/";

fs.mkdir(UPLOAD_PATH);

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, (UPLOAD_PATH) );  // ->("./uploads")  this is the destination where files will save in the HArdDisk Storage 
    },
    filename: (req, file, callback) => {
      callback(null, file.originalname);
    },
});


const upload = multer({storage: storage})
// const upload = multer({dest: UPLOAD_PATH})

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;


app.get('/',  async(req, res) => {
  let data = {}
  const files =  await fs.readdir(UPLOAD_PATH);
  files.forEach(async (file,idx,files) => {
    // fileContent.push(await fs.readFile(path.join(UPLOAD_PATH,file)))
    data[file]=await fs.readFile(path.join(UPLOAD_PATH,file),'base64');
    if (idx + 1 == files.length){
      res.json(data)
    }
  });
})

app.post('/',upload.single('foto'), (req,res)=>{
    // console.log(JSON.stringify(req.body));
    res.json({message:'OK'})
})

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`)
})