const {db} = require("./db")
const {getBasicQueryObject} = require("../utils/util");

/**
 * List of fields supported in search of get list
 */
const fieldsList = [{"name" : "name", "type" : "string"}, {"name" : "rewardPoints", "type" : "int"}];

/**
 * Get list of activity list
 */
const getActivityList = (req, res) => {
    var basicQuery = getBasicQueryObject(req);
    var searchString = getSearchCriteria(req);

    var isCondition = true;
    if(searchString.length == 0){
        isCondition = false;
    }else if(searchString === "InvalidCri"){
        res.send({"message" : "invalid search criteria"});
        returnl
    }

    var startVal = basicQuery.start_index;
    var limt = basicQuery.records_per_page;
    
    var queryString = "Select id, name, rewardPoints from Activity"
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
 * To get a single activity
 */
const getSingleActivity = (req, res) => {
    var activityId = req.params.id;
    if(activityId == undefined || isNaN(activityId)){
        res.send({"message" : "invalid id"}, 404);
        return;
    }

    var queryString = "Select id, name, rewardPoints from Activity where id=" + db.escape(activityId) +";";
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
 * To create a new activity
 */
const createActivity = (req, res) => {
    var body = req.body;

    if(body.name == undefined || body.rewardPoints == undefined){
        res.send({"message" : "mandatory field values missing"});
        return;
    }

    var valueAr = [body.name, body.rewardPoints];
    var queryString = "Insert into Activity (name, rewardPoints) values (?, ?);";
    db.query(queryString, valueAr, (err, result)=> {
        if(err){
            res.send({"message" : "internal error"}, 400);
            return;
        }
        
        var getQuery = "Select id, name, rewardPoints from Activity where id=" + result.insertId + ";";
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
 * To update a activity 
 */
const updateActivity = (req, res) => {
    var activityId = req.params.id;
    if(activityId == undefined || isNaN(activityId)){
        res.send({"message" : "invalid id"}, 404);
        return;
    }

    var body = req.body;
    var setString = "";
    for(let i=0; i<fieldsList.length; i++){
        var fieldObj = fieldsList[i];
        if(body[fieldObj.name] != undefined){
            setString += fieldObj.name + "="+ db.escape(body[fieldObj.name]) +",";
        }
    }

    if(setString.length ==0){
        res.send({"message" : "no valid field"}, 400);
        return;
    }

    setString = setString.substr(0, setString.length -1);
    var updateQuery = "Update Activity set " + setString + "where id=" + db.escape(activityId) +";";
    db.query(updateQuery, (err, result)=>{
        if(err){
            res.send({"message" : "internal id"}, 404);
            return;
        }

        if(result.changedRows == 0){
            res.send({"message" : "invalid id"});
        }else{
            var getQuery = "Select id, name, rewardPoints from Activity where id=" + db.escape(activityId) + ";";
        db.query(getQuery, (err, getRes)=>{
            if(err){
                res.send({"message" : "internal error"}, 500);
                return;
            }
            res.send(getRes[0]);
        });
        }
    });
}

/**
 * To delete a activity 
 */
const deleteActivity = (req, res) => {
    var activityId = req.params.id;
    if(activityId == undefined || isNaN(activityId)){
        res.send({"message" : "invalid id"}, 404);
        return;
    }

    var deleteQuery = "Delete from Activity where id="+ db.escape(activityId) +";";
    db.query(deleteQuery, (err, result)=>{
        if(err){
            res.send({"message" : "internal error"}, 500);
            return;
        }

        if(result.affectedRows == 0){
            res.send({"message" : "invalid id"}, 404);
        }else{
            res.send({"message" : "Activity deleted successfully"});
        }
    })
}

/**
 * To construct the query search critiera based on criteria sent in req object
 */
const getSearchCriteria = function(req){
    var whereCriteria = "";
    var query = req.query;
    if(query.search_criteria != undefined){
        try{
            var searchCrit = JSON.parse(req.query.search_criteria);
            for(let i=0; i<fieldsList.length; i++){
                let fieldObj = fieldsList[i];
                if(searchCrit[fieldObj.name] != undefined){
                    if(fieldObj.type == "string"){
                        if(whereCriteria.length == 0){
                            whereCriteria += fieldObj.name + " like '%"+ searchCrit[fieldObj.name] +"%'";
                        }else{
                            whereCriteria += " and " + fieldObj.name + " like '%"+ searchCrit[fieldObj.name] +"%'";
                        }
                    }else if(fieldObj.type == "int"){
                        if(whereCriteria.length == 0){
                            whereCriteria += fieldObj.name + "=" + searchCrit[fieldObj.name];
                        }else{
                            whereCriteria += " and " + fieldObj.name + "=" + searchCrit[fieldObj.name];
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
    getActivityList,
    getSingleActivity,
    createActivity,
    updateActivity,
    deleteActivity
}