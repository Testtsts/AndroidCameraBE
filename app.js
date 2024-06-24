const axios = require("axios");
const express = require("express");
const multer = require("multer");
const fs = require("fs").promises;
const path=require("path");
const UPLOAD_PATH= "./uploads/";
const TAGGED_PATH="./tagged/";

fs.access(UPLOAD_PATH)
.then(()=>undefined)
.catch(()=>{
  fs.mkdir(UPLOAD_PATH)
})

fs.access(TAGGED_PATH)
.then(()=>undefined)
.catch(()=>{
  fs.mkdir(TAGGED_PATH)
})


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
  const files =  await fs.readdir(TAGGED_PATH);
  files.forEach(async (file,idx,files) => {
    // fileContent.push(await fs.readFile(path.join(UPLOAD_PATH,file)))
    data[file]=await fs.readFile(path.join(TAGGED_PATH,file),'base64');
    if (idx + 1 == files.length){
      res.json(data)
    }
  });
})

app.post('/tagged',  async(req,res)=>{
  let data = {}
  const files =  await fs.readdir(UPLOAD_PATH);

  files.forEach(async (file,idx,files) => {
    // fileContent.push(await fs.readFile(path.join(UPLOAD_PATH,file)))
    const encodedFile =await fs.readFile(path.join(UPLOAD_PATH,file),'base64');
    await axios({
      method: "POST",
      url: "https://detect.roboflow.com/dog-breed-e2c2i/1",
      params: {
          api_key: "2sLc4ws7AZxcEflD1rDj"
      },
      data: encodedFile,
      headers: {
          "Content-Type": "application/x-www-form-urlencoded"
      }
    })
    .then(function(response) {
      data[file] = {
        'base64':encodedFile,
        'image':response.data.image,
        'predictions':response.data.predictions
      }
      var fileExtension = file.split(".");
      var predictionString= ""

      for (const predictionIdx in data[file].predictions){
        // console.log(data[file].predictions[predictionIdx].class)
        predictionString+= data[file].predictions[predictionIdx].class
      }
      console.log(response.data);
      console.log(TAGGED_PATH,predictionString,".",fileExtension[1])
      fs.rename(path.join(UPLOAD_PATH,file),path.join(TAGGED_PATH,`${predictionString}.${fileExtension[1]}`))
      
    })
    .catch(function(error) {
      console.log(error.message);
    });

    if (idx + 1 == files.length){

      res.json(data)
    }
  });
})

app.post('/',upload.single('foto'), (req,res)=>{
    // console.log(JSON.stringify(req.body));
    res.json({message:'OK'})
})






const server = app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`)
})

server.timeout= 5*60*1000

