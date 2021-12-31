const {records_per_page, starting_index} = require("./constants")

/**
 * To get basic query obejct
 * To get records per page and starting idex value
 * If the values are not sent in req default values are used
 */
const getBasicQueryObject = function(req){
    var basicQuer = {
        "start_index" : starting_index,
        "records_per_page" : records_per_page
    }

    var query = req.query;

    if(query.start_index != undefined && !isNaN(query.start_index)){
        basicQuer.start_index = parseInt(query.start_index);
    }

    if(query.records_per_page != undefined && !isNaN(query.records_per_page)){
        basicQuer.records_per_page = parseInt(query.records_per_page);
    }
    
    return basicQuer;
}



module.exports = {
    getBasicQueryObject
}