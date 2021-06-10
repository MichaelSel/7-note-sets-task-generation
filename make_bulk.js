const fs = require('fs');
const gen_task_set = require('./gen_task_set')
const make_folder = require('./make_folder')
const make_bulk = function (starting_id=0,num_of_sets=11,prefix="SNS",root='./task_sets') {
    if (!fs.existsSync(root)){
        fs.mkdirSync(root);
    }
    let generated_sets = []
    for (let i = starting_id; i < starting_id+num_of_sets; i++) {
        generated_sets.push(gen_task_set(i,prefix,root))
    }

    generated_sets = generated_sets.join('\n')
    fs.writeFile(root + "/66_available.txt", generated_sets, function(err) {
        if(err) {
            return console.log(err);
        }
    });
}


const make_list = function (list_of_sets,prefix="SNS",root='./task_sets') {
    if (!fs.existsSync(root)){
        fs.mkdirSync(root);
    }
    let generated_sets = []
    for(let i in list_of_sets) {
        generated_sets.push(gen_task_set(list_of_sets[i],prefix,root))
    }
    generated_sets = generated_sets.join('\n')
    fs.writeFile(root + "/66_available.txt", generated_sets, function(err) {
        if(err) {
            return console.log(err);
        }
    });
}
make_bulk(90,30)






