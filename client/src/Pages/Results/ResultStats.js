export const giveNoOfResultsForYesNo = (question,response) => {
    let results = new Map();
    response.forEach((res)=>{
        if(res.question_id===question._id){
            results.set(res.answer,results.get(res.answer)?results.get(res.answer)+1:1);
        }
    })
    return results;
}

