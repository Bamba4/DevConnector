import mongoose from "mongoose";

const uri = 'mongodb://localhost:27017/DEV';

const db = mongoose.connect(uri, {useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true }).
then(() => console.log("successfully connected to the db"))
    .catch((error: any) => console.error({error}));

export default db;
