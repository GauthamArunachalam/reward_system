const {db} = require("./db");
const {getBasicQueryObject} = require("../utils/util");

/**
 * Field list for search criteria for employee entity
 */
const fieldsList = ["name", "emp_code"];

/**
 * Field list for search criteria for reward entity
 */
const reward_search_fields = [
    {
        "name" : "activity_name",
        "type" : "string",
        "searchKey" : "Activity.name"
    },
    {
        "name" : "activity_id",
        "type" : "int",
        "searchKey" : "Reward.activity_id"
    },
    {
        "name" : "rewaredDate",
        "type" : "Date",
        "searchKey" : "Reward.rewaredDate"
    }
]

/**
 * To get a list of employees
 */
const getEmployeeList = (req, res) =>{
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
    
    var queryString = "Select id, name, emp_code from Employee"
    var limtString = " LIMIT " + db.escape(startVal) +", " + db.escape(limt) + ";";

    if(isCondition){
        queryString += " WHERE " + searchString;
    }

    queryString += limtString;
    //console.log(queryString);
    db.query(queryString, (err, result) => {
        if(err){
            res.send({"message" : "internal error"}, 500);
            return;
        }
        res.send(result);
    });
}

/**
 * To get a single employee by id
 */
const getEmployeeById = async (req, res) => {
    var empId = req.params.id;
    if(empId == undefined || isNaN(empId)){
        res.send({"message" : "invalid id"}, 404);
        return;
    }

    var queryString = "Select id, name, emp_code from Employee where id=" + db.escape(empId) +";";
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
 * To create a single employee record
 */
const createEmployee = async (req, res) => {
    var body = req.body;

    if(body.name == undefined || body.emp_code == undefined){
        res.send({"message" : "mandatory field values missing"});
        return;
    }

    var valueAr = [body.name, body.emp_code];
    var queryString = "Insert into Employee (name, emp_code) values (?, ?);";
    db.query(queryString, valueAr, (err, result)=> {
        if(err){
            if(err.code == "ER_DUP_ENTRY"){
                res.send({"message" : "EMP ID unique constrain fails"}, 400);
                return;
            }

            res.send({"message" : "internal error"}, 400);
            return;
        }
        
        var getQuery = "Select id, name, emp_code from Employee where id=" + result.insertId + ";";
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
 * To update a single employee record
 */
const updateEmployee = (req, res) => {
    var empId = req.params.id;
    if(empId == undefined || isNaN(empId)){
        res.send({"message" : "invalid id"}, 404);
        return;
    }

    var body = req.body;
    var setString = "";
    for(let i=0; i<fieldsList.length; i++){
        var fieldName = fieldsList[i];
        if(body[fieldName] != undefined){
            setString += fieldName + "="+ db.escape(body[fieldName]) +",";
        }
    }
    setString = setString.substr(0, setString.length -1);

    if(setString.length ==0){
        res.send({"message" : "no valid field"}, 400);
        return;
    }

    var updateQuery = "Update Employee set " + setString + "where id=" + db.escape(empId) +";";
    db.query(updateQuery, (err, result)=>{
        if(err){
            res.send({"message" : "internal id"}, 404);
            return;
        }

        if(result.changedRows == 0){
            res.send({"message" : "invalid id"});
        }else{
            var getQuery = "Select id, name, emp_code from Employee where id=" + db.escape(empId) + ";";
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
 * To delete a single employee record
 */
const deleteEmployee = (req, res) => {
    var empId = req.params.id;
    if(empId == undefined || isNaN(empId)){
        res.send({"message" : "invalid id"}, 404);
        return;
    }

    var deleteQuery = "Delete from Employee where id="+ db.escape(empId) +";";
    db.query(deleteQuery, (err, result)=>{
        if(err){
            res.send({"message" : "internal error"}, 500);
            return;
        }

        if(result.affectedRows == 0){
            res.send({"message" : "invalid id"}, 404);
        }else{
            res.send({"message" : "employee deleted successfully"});
        }
    })
}

/**
 * To get reward history for a user
 */
const getRewardsHistory = (req, res) => {

    var empId = req.params.id;
    if(empId == undefined || isNaN(empId)){
        res.send({"message" : "invalid id"}, 404);
        return;
    }

    var basicQuery = getBasicQueryObject(req);
    var rewardSearchCri = getRewardSearchCri(req);

    if(rewardSearchCri == "InvalidCri"){
        res.send({"message" : "invalid search criteria"});
        return;
    }

    var startVal = basicQuery.start_index;
    var limt = basicQuery.records_per_page;


    var rewardHistory = "select Reward.id, Reward.rewardReceived, Reward.activity_id, Reward.rewaredDate, Activity.name as activity_name from Reward JOIN Employee ON Reward.emp_id = Employee.id JOIN Activity ON Reward.activity_id=Activity.id where Reward.emp_id=" + db.escape(empId);
    var limtString = " LIMIT " + db.escape(startVal) +", " + db.escape(limt) + ";";
    
    if(rewardSearchCri.length > 0){
        rewardHistory += " and " + rewardSearchCri;
    }

    rewardHistory += limtString;
    db.query(rewardHistory, (err, result)=>{
        if(err){
            res.send({"message" : "internal error"});
            return;
        }

        res.send(result);
    })
}

/**
 * To construct search criteria based on the req object for employee get list
 */
const getSearchCriteria = function(req){

    var whereCriteria = "";
    var query = req.query;

    if(query.search_criteria != undefined){
        try{
            var searchCrit = JSON.parse(req.query.search_criteria);

            for(let i=0; i<fieldsList.length; i++){
                let fieldName = fieldsList[i];
                if(searchCrit[fieldName] != undefined){
                    if(whereCriteria.length == 0){
                        whereCriteria += fieldName + " like '%"+ searchCrit[fieldName] +"%'";
                    }else{
                        whereCriteria += " and " + fieldName + " like '%"+ searchCrit[fieldName] +"%'";
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

/**
 * To construct search criteria based on the req object for reward history get list
 */
const getRewardSearchCri = function(req){
    var whereCriteria = "";
    var query = req.query;
    if(query.search_criteria != undefined){
        try{
            var searchCri = JSON.parse(query.search_criteria);
            for(let i=0; i<reward_search_fields.length;i++){
                let fieldObj = reward_search_fields[i];
                if(searchCri[fieldObj.name] != undefined){
                    if(fieldObj.type == "string"){
                        if(whereCriteria.length == 0){
                            whereCriteria += fieldObj.searchKey + " like '%"+ searchCri[fieldObj.name] +"%'";
                        }else{
                            whereCriteria += " and " + fieldObj.searchKey + " like '%"+ searchCri[fieldObj.name] +"%'";
                        }
                    }else if(fieldObj.type == "int"){
                        if(whereCriteria.length == 0){
                            whereCriteria += fieldObj.searchKey + "=" + searchCri[fieldObj.name];
                        }else{
                            whereCriteria += " and " + fieldObj.searchKey + "=" + searchCri[fieldObj.name];
                        }
                    }else if(fieldObj.type == "Date"){
                        var dateCri = searchCri[fieldObj.name];

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
                }
            }
        }catch(err){
            return "InvalidCri";
        }
    }

    return whereCriteria;
}

module.exports = {
    getEmployeeList,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    getRewardsHistory
}