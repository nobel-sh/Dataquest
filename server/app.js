const express = require('express');
require('dotenv').config();

const errorHandler = require('./middleware/mapError');
const connectDB = require('./db/connectDB');
const surveyRouter = require('./routes/survey')
const userRouter = require('./routes/user')

const app = express();
app.use(express.json());

const cors = require('cors');
app.use(cors());

const port = process.env.PORT || 5000; 


//routes
app.use('/api/v1/survey', surveyRouter);
app.use('/api/v1/user', userRouter);

app.use(errorHandler);

app.get('*',(req,res)=>{
    res.send("sup");
})

const start = async () => {
    try{
        await connectDB(process.env.MONGO_URI);
        app.listen(port,() => console.log(`Server is listening on port ${port}.`));
    }catch(e){
        console.log(e);
    }
}


start()
