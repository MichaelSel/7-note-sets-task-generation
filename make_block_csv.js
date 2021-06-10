const fs = require('fs');
const csv = require('csv-parser');

const make_block_csv = function (participant_id, participant_dir, block_num, stimuli) {
    const createCsvWriter = require('csv-writer').createObjectCsvWriter;
    const csvWriter = createCsvWriter({
        path: participant_dir + "csv/" + "block_" + block_num + ".csv",
        header: [
            {id: 'subject_id', title: 'Subject ID'}, //OVS...
            {id: 'block_num', title: 'Block Number'}, //1-...
            {id: 'probe_set', title: 'Probe Set'}, // diatonic / chromatic
            {id: 'probe_contour', title: 'Probe Contour'},
            {id: 'option_1', title: 'Option 1'}, // swapped / shifted
            {id: 'option_2', title: 'Option 2'}, // swapped / shifted
            {id: 'shift_dir', title: 'Shift Direction'}, // up / down
            {id: 'probe_pitches', title: 'Probe Pitches'},
            {id: 'swapped_pitches', title: 'swapped Pitches'},
            {id: 'shifted_pitches', title: 'Shifted Pitches'},
            {id: 'has_decoy', title: 'Has Decoy'},
            {id: 'decoy_position', title: 'Decoy Position'},
        ]
    });

    stimuli = stimuli.map((stim,i) => {
        let option1 = stim.order[0]
        let option2 = stim.order[1]
        stim.probe_file = "Block-" + block_num + "-Q-" + (i+1) + "-000-probe.mp3"
        stim.option_1_file = "Block-" + block_num + "-Q-" + (i+1) + "-001-" + option1 + ".mp3"
        stim.option_2_file = "Block-" + block_num + "-Q-" + (i+1) + "-002-" + option2 + ".mp3"
        stim.block = block_num
        stim.subject_id = participant_id
        return stim
    })



    fs.writeFile(participant_dir + "csv/" + "block_" + block_num + ".json", JSON.stringify(stimuli), function(err) {
        if(err) {
            return console.log(err);
        }
    });

    let data =stimuli.map((stim,i) => {
        let option1 = stim.order[0]
        let option2 = stim.order[1]
        let dat = {
            subject_id: participant_id,
            block_num: block_num,
            probe_set: stim.set,
            shift_dir: stim.shift_dir,
            probe_pitches: stim.probe,
            swapped_pitches: stim.swapped,
            shifted_pitches: stim.shifted,
            option_1: option1,
            option_2: option2,
            has_decoy: stim.has_decoy,
            decoy_position: stim.decoy_position,
            probe_contour: stim.probe_contour
        }

        return dat
    })


    csvWriter
        .writeRecords(data)
        .then(()=> console.log("CSV file subject",participant_id,"block", block_num,"was successfully created."));
}

module.exports = make_block_csv