const axios = require("axios");
const express = require("express");
const multer = require("multer");
const fs = require("fs").promises;
const path=require("path");
const UPLOAD_PATH= "./uploads/";
const TAGGED_PATH="./tagged/";
const PREDICTION_PATH="./predictions/";

fs.access(PREDICTION_PATH)
.then(()=>undefined)
.catch(()=>{
  fs.mkdir(PREDICTION_PATH)
})




fs.access(TAGGED_PATH)
.then(()=>undefined)
.catch(()=>{
  fs.mkdir(TAGGED_PATH)
})

fs.access(UPLOAD_PATH)
.then(()=>undefined)
.catch(()=>{
  fs.mkdir(UPLOAD_PATH)
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
    data[file]= {
      'base64':null,
      'predictions':null
    }
    var fileNameArray = file.split(".");
    var filename= fileNameArray[0];
    data[file].base64=await fs.readFile(path.join(TAGGED_PATH,file),'base64');
    data[file].predictions = require(`${PREDICTION_PATH}${filename}.json`);
    // data[file].predictions = predictions;
    if (idx + 1 == files.length){
      res.json(data)
    }
  });
})

app.post('/tagged',  async(req,res)=>{
  let data = {}
  const files =  await fs.readdir(UPLOAD_PATH);
  if (files.length == 0){
    res.json({message:'OK'})
  }

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
1
      for (const predictionIdx in data[file].predictions){
        predictionString+= data[file].predictions[predictionIdx].class
      }
      console.log(response.data);
      console.log(TAGGED_PATH,predictionString,".",fileExtension[1])
      // fs.rename(path.join(UPLOAD_PATH,file),path.join(TAGGED_PATH,`${predictionString}${file}`))
      fs.rename(path.join(UPLOAD_PATH,file),path.join(TAGGED_PATH,`${file}`))
      fs.writeFile(path.join(PREDICTION_PATH,fileExtension[0]+".json"),JSON.stringify(data[file].predictions,null,"\t"))
      
    })
    .catch(function(error) {
      console.log(error.message);
    });

    if (idx + 1 == files.length){

      res.json({message:'OK'})
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

