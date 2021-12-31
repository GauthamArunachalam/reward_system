const {db} = require("./db")
const {getBasicQueryObject} = require("../utils/util");

/**
 * Field list for search critiera in reward entity
 */
const fieldsList = [
    {
        "name" : "emp_id",
        "type" : "int"
    },
    {
        "name" : "activity_id",
        "type" : "int"
    },
    {
        "name" : "rewaredDate",
        "type" : "date"
    }
]

/**
 * To get list of rewards
 */
const getRewardList = async (req, res) => {
    var basicQuery = getBasicQueryObject(req);
    var searchString = getSearchCriteria(req);

    var isCondition = true;
    if(searchString.length == 0){
        isCondition = false;
    }else if(searchString === "InvalidCri"){
        res.send({"message" : "invalid search criteria"});
        return;
    }

    var startVal = basicQuery.start_index;
    var limt = basicQuery.records_per_page;
    
    var queryString = "Select Reward.id, Reward.rewardReceived, Reward.emp_id, Reward.activity_id, Reward.rewaredDate, Employee.name AS emp_name, Employee.emp_code, Activity.name AS activity_name from Reward JOIN Employee ON Reward.emp_id=Employee.id JOIN  Activity ON Reward.activity_id=Activity.id";
    var limtString = " LIMIT " + db.escape(startVal) +", " + db.escape(limt) + ";";

    if(isCondition){
        queryString += " WHERE " + searchString;
    }

    queryString += limtString;

    db.query(queryString, (err, result) => {
        if(err){
            res.send({"message" : "internal error"}, 500);
            return;
        }
        res.send(result);
    });
}

/**
 * To create a new reward
 */
const createReward = (req, res) => {
    var body = req.body;

    if(body.emp_id == undefined || body.activity_id == undefined){
        res.send({"message" : "mandatory field values missing"});
        return;
    }

    var rewaredDate = body.rewaredDate;
    if(rewaredDate == undefined){
        rewaredDate = new Date()
    }

    var queryString = "Insert into Reward (rewardReceived, emp_id, activity_id, rewaredDate) values ((Select rewardPoints from Activity where id="+ db.escape(body.activity_id) +"), ?, ?, ?);";

    var valueAr = [body.emp_id, body.activity_id, rewaredDate];
    db.query(queryString, valueAr, (err, result)=> {
        if(err){
            if(err.code == "ER_NO_REFERENCED_ROW_2"){
                res.send({"message" : "invalid value for emp or activity"});
                return;
            }
            res.send({"message" : "internal error"}, 400);
            return;
        }
        
        var getQuery = "Select Reward.id, Reward.rewardReceived, Reward.emp_id, Reward.activity_id, Reward.rewaredDate, Employee.name AS emp_name, Employee.emp_code, Activity.name AS activity_name from Reward JOIN Employee ON Reward.emp_id=Employee.id JOIN  Activity ON Reward.activity_id=Activity.id where Reward.id=" + result.insertId + ";";
        db.query(getQuery, (err, getRes)=>{
            if(err){
                res.send({"message" : "internal error"}, 400);
                return;
            }
            res.send(getRes[0]);
        });
    });
}

/**
 * To get a single record
 */
const getSingleReward = (req, res) => {
    var rewardId = req.params.id;
    if(rewardId == undefined || isNaN(rewardId)){
        res.send({"message" : "invalid id"}, 404);
        return;
    }

    var queryString = "Select Reward.id, Reward.rewardReceived, Reward.emp_id, Reward.activity_id, Reward.rewaredDate, Employee.name AS emp_name, Employee.emp_code, Activity.name AS activity_name from Reward JOIN Employee ON Reward.emp_id=Employee.id JOIN  Activity ON Reward.activity_id=Activity.id where Reward.id=" + db.escape(rewardId) +";";
    db.query(queryString, (err, result)=> {
        if(err){
            res.send({"message" : "internal error"}, 500);
            return;
        }
        
        if(result.length == 1){
            res.send(result[0]);
        }else{
            res.send({"message" : "invalid id"}, 400);
        }
    });
}

/**
 * To constrcut search criteria based on request object for reward get list
 */
const getSearchCriteria = function(req){
    var whereCriteria = "";
    var query = req.query;
    if(query.search_criteria != undefined){
        try{
            var searchCrit = JSON.parse(query.search_criteria);
            for(let i=0; i<fieldsList.length; i++){
                let fieldObj = fieldsList[i];
                if(searchCrit[fieldObj.name] != undefined){
                     if(fieldObj.type == "int"){
                        if(whereCriteria.length == 0){
                            whereCriteria += "Reward." + fieldObj.name + "=" + searchCrit[fieldObj.name];
                        }else{
                            whereCriteria += " and Reward." + fieldObj.name + "=" + searchCrit[fieldObj.name];
                        }
                    }
                }
            }
            return whereCriteria;
        }catch(err){
            return "InvalidCri";
        }
    }
    
    return whereCriteria;
}

module.exports = {
    getRewardList,
    createReward,
    getSingleReward
}