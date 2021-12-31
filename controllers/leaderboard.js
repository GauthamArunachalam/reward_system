const {db} = require("./db");
const {getBasicQueryObject} = require("../utils/util")

/**
 * Search fields for leaderboard search criteria
 */
const fieldsList = [
    {
        "name" : "emp_name",
        "type" : "string",
        "searchKey" : "Employee.name"
    },
    {
        "name" : "emp_code",
        "type" : "string",
        "searchKey" : "Employee.emp_code"
    },
    {
        "name" : "emp_id",
        "type" : "int",
        "searcKey" : "Reward.emp_id"
    },
    {
        "name" : "rewaredDate",
        "type" : "Date",
        "searchKey" : "Activity.rewaredDate"
    },
    {
        "name" : "totalRewards",
        "type" : "minmax"
    }
]

/**
 * To get leaderboard list view
 */
const getLeaderboardList = function(req, res){
    var basicQuery = getBasicQueryObject(req);
    var searchString = getSearchCriteria(req);
    
    if(searchString == "InvalidCri"){
        res.send({"message" : "invalid search criteria"});
        return;
    }


    var startVal = basicQuery.start_index;
    var limt = basicQuery.records_per_page;

    var queryString = "select SUM(Reward.rewardReceived) as totalRewards, Reward.emp_id, Employee.name as emp_name from Reward JOIN Employee ON Reward.emp_id=Employee.id";

    var groupClause = " GROUP BY Reward.emp_id ORDER BY totalRewards DESC";

    var limtString = " LIMIT " + db.escape(startVal) +", " + db.escape(limt) + ";";

   if(searchString.length > 0){
       queryString += " Where " + searchString;
   }

   queryString += groupClause + limtString;

   queryString = getMinMaxCriteria(queryString, req);

   if(queryString == "InvalidCri"){
    res.send({"message" : "invalid search criteria"});
    return;
   }
    db.query(queryString, (err, result)=>{
        if(err){
            console.log(err);
            res.send({"message" : "internal error"});
            return;
        }

        res.send(result);
    });
}


/**
 * To create search critreia based on the request object for leaderboard get list
 */
const getSearchCriteria = function(req){
    var whereCriteria = "";
    var query = req.query;
    console.log(query);
    if(query.search_criteria != undefined){
        try{
            var searchCrit = JSON.parse(query.search_criteria);
            for(let i=0; i<fieldsList.length; i++){
                let fieldObj = fieldsList[i];
                if(searchCrit[fieldObj.name] != undefined){
                     if(fieldObj.type == "Date"){
                        var dateCri = searchCrit[fieldObj.name];
                        if(dateCri.forMonth != undefined){
                            var dateObj = new Date(dateCri.forMonth);
                            if(dateObj == "Invalid Date"){
                                return "InvalidCri";
                            }
                            if(whereCriteria.length == 0){
                                whereCriteria += "Month(rewaredDate)=" + (dateObj.getMonth() +1) + " and Year(rewaredDate)=" + dateObj.getFullYear();
                            }else{
                                whereCriteria += " and Month(rewaredDate)=" + (dateObj.getMonth() + 1) + " and Year(rewaredDate)=" + dateObj.getFullYear();
                            }
                        }else{
                            if(dateCri.fromDate == undefined || dateCri.toDate == undefined){
                                return "InvalidCri";
                            }
                            var fromDate = new Date(dateCri.fromDate);
                            var toDate = new Date(dateCri.toDate);
                            if(fromDate == "Invalid Date" || toDate == "Invalid Date"){
                                return "InvalidCri";
                            }
                            if(whereCriteria.length == 0){
                                whereCriteria += fieldObj.name + " Between '"+ dateCri.fromDate + "' and '" +  dateCri.toDate + "'";
                            }else{
                                whereCriteria += " and " + fieldObj.name + " Between '" + dateCri.fromDate + "' and '" + dateCri.toDate+ "'";
                            }
                        }  
                    }else if(fieldObj.type == "string"){
                        if(whereCriteria.length == 0){
                            whereCriteria += fieldObj.searchKey + " like '%"+ searchCrit[fieldObj.name] +"%'";
                        }else{
                            whereCriteria += " and " + fieldObj.searchKey + " like '%"+ searchCrit[fieldObj.name] +"%'";
                        }
                    }else if(fieldObj.type == "int"){
                        if(whereCriteria.length == 0){
                            whereCriteria += fieldObj.searcKey + "=" + searchCrit[fieldObj.name];
                        }else{
                            whereCriteria += " and " + fieldObj.searcKey + "=" + searchCrit[fieldObj.name];
                        }
                    }
                }
            }

            if(whereCriteria.length ==0 ){
                var dateObj = new Date();
                whereCriteria = "Month(rewaredDate)=" + (dateObj.getMonth() +1) + " and Year(rewaredDate)=" + dateObj.getFullYear();
            }else if(whereCriteria.indexOf("Between") == -1 && whereCriteria.indexOf("Month") ==-1){
                var dateObj = new Date();
                whereCriteria += " and Month(rewaredDate)=" + (dateObj.getMonth() +1) + " and Year(rewaredDate)=" + dateObj.getFullYear();
            }

            return whereCriteria;
        }catch(err){
            console.log(err);
            return "InvalidCri";
        }
    }
    
    if(whereCriteria.length ==0 ){
        var dateObj = new Date();
        whereCriteria = "Month(rewaredDate)=" + (dateObj.getMonth() +1) + " and Year(rewaredDate)=" + dateObj.getFullYear();
    }else if(whereCriteria.indexOf("Between") == -1 && whereCriteria.indexOf("Month") ==-1){
        var dateObj = new Date();
        whereCriteria += " and Month(rewaredDate)=" + (dateObj.getMonth() +1) + " and Year(rewaredDate)=" + dateObj.getFullYear();
    }

    return whereCriteria;
}

/**
 * To create search criteria based on min max values send in  the request object
 */
const getMinMaxCriteria = function(querString, req){
    var minMaxQuery = querString;
    var query = req.query;
    if(query.search_criteria != undefined){
        var searchCrit = JSON.parse(query.search_criteria);

        if(searchCrit["totalRewards"] != undefined){
            var minMaxCri = searchCrit["totalRewards"];

            if(minMaxCri.min == undefined || minMaxCri.max == undefined){
                return "InvalidCri";
            }

            var min = minMaxCri.min;
            var max = minMaxCri.max;

            if(isNaN(min) || isNaN(max)){
                return "InvalidCri";
            }

            return "Select totalRewards, emp_id, emp_name from (" + querString.substr(0, querString.length-1) + ") as View where totalRewards >" + min + " and totalRewards < " + max + ";"; 
        }
    }

    return minMaxQuery;
}


module.exports = {
    getLeaderboardList
}