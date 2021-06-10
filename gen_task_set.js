const fs = require('fs');
const csv = require('csv-parser');
const make_stimuli = require('./make_stimuli')
const make_folder = require('./make_folder')
const split_stimuli_to_blocks = require('./split_stimuli_to_blocks')
const make_block_csv = require('./make_block_csv')
const make_audio = require('./make_audio')
const all_sets = JSON.parse(fs.readFileSync('./selected-7-note-sets.json','utf-8'))
const matrix = JSON.parse(fs.readFileSync('./subject_matrix.json','utf-8'))



/**Set Settings here*/
const gen_task_set = function (sub_id,prefix="SNS",root='./task_sets') {
    let sub = matrix.filter(row=>row.subject_id==sub_id)[0]
    const sub_name = prefix + "0".repeat(4-String(sub_id).length) + String(sub_id)

    make_folder(root,"/" + sub_name)
    make_folder(root + "/" + sub_name,["/audio","/csv"])
    sub.sets_assigned = sub.sets_assigned.map(sa=>all_sets.filter(all=>all.id==sa)[0].set)

    const stimuli = make_stimuli(sets=sub.sets_assigned,Qs_per_set=20, range = [0,12],length = 16,make_decoys=false) /**Set Settings here*/
    console.log(stimuli.length)
    const blocks = split_stimuli_to_blocks(stimuli,7)


    blocks.forEach((block,index)=>{
        block.forEach((stimulus,Q_num)=>{
            let shift_ord
            let swapped_ord
            if(stimulus.order[0]=="swapped") {
                swapped_ord=1
                shift_ord=2
            } else if (stimulus.order[0]=="shifted") {
                swapped_ord=2
                shift_ord=1
            }
            make_audio(stimulus.probe,root+"/" + sub_name +"/audio/" + "Block-" + (index+1) + "-Q-" +(Q_num+1) + '-000-probe.mp3')
            make_audio(stimulus.swapped,root+"/" + sub_name +"/audio/" + "Block-" + (index+1) + "-Q-" +(Q_num+1)+ "-00" + swapped_ord + '-swapped.mp3')
            make_audio(stimulus.shifted,root+"/" + sub_name +"/audio/" + "Block-" + (index+1) + "-Q-" +(Q_num+1)+ "-00" + shift_ord + '-shifted.mp3')
        })
        make_block_csv(sub_name,root+"/" + sub_name +"/",index+1,block)
    })
    return sub_name
}


module.exports = gen_task_set



// gen_task_set(1)
