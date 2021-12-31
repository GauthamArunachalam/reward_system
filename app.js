const exprerss = require("express");
const bodyParser = require("body-parser");
const employee = require("./routes/employee");
const activity = require("./routes/activity");
const reward = require("./routes/reward");
const leaderboard = require("./routes/leaderboard");

const app = exprerss();

app.use(bodyParser.json());

/**
 * To hanlde json parse errors in body parsers
 */
app.use((err, req, res, next)=>{
    if(err){
        res.send({"message" : "invalid input error"});
    }else{
        next();
    }
});

//To allow orign
app.use(function(req, res, next){
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST");

    next();
});

/**Base sample test route to test start of the app */
app.get("/", function(req, res, next){
    res.send({"Hello World!!!" : "welcome"});
});

/**Routes for the employee entity */
app.use("/api/employees", employee);

/**Routes for the activities entity */
app.use("/api/activities", activity);

/**Routes for the reward entity */
app.use("/api/rewards", reward);

/**Routes for the leaderboard entity */
app.use("/api/leaderboard", leaderboard);


app.listen(5000, () => {
    console.log("server listending to the port 5000");
});