const hopTemplates = require("./hopService");

function random(arr){

    return arr[Math.floor(Math.random()*arr.length)];

}

function generateHop(interests){

    const availableCategories = Object.keys(hopTemplates);
    const validInterests = Array.isArray(interests)
        ? interests.filter((interest) => hopTemplates[interest])
        : [];

    const category=random(validInterests.length > 0 ? validInterests : availableCategories);

    const hop=random(hopTemplates[category]);

    return{

        ...hop,

        category

    }

}

module.exports=generateHop;
