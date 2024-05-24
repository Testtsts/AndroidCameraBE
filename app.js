const express = require("express");
const multer = require("multer");
const upload = multer({dest: '  uploads/'})

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get('/helloworld', (req, res) => {
res.send('Hello World!')
})

app.post('/uploadImage', )

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`)
})