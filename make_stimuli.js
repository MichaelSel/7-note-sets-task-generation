const EDO = require("edo.js").EDO
let edo = new EDO(12)
const mod = (n, m) => {
    return ((n % m) + m) % m;
}
const JS = function (thing) {
    return JSON.stringify(thing).replace(/"/g,'')
}
const rand_int_in_range = function (min,max) {
    return Math.floor(Math.random() * (max - min +1)) + min
}



const make_stimuli = function (sets,Qs_per_set=20, range = [-5,17],length = 8,make_decoys=false) {
    const make_stimuli_from_set = function (set,Qs_per_set,range,length,num_of_decoys = Qs_per_set) {
        const end_with_first=false
        const allow_repetitions=true
        const avoid_leaps=6
        let shift_direction = [...Array.from(new Array(Math.floor(Qs_per_set/2)).fill(1)),...Array.from(new Array(Math.floor(Qs_per_set/2)).fill(-1))]
        shift_direction = edo.shuffle_array(shift_direction).slice(0,Qs_per_set)

        let shift_position = [...Array.from(new Array(Math.floor(Qs_per_set/2)).fill(Math.floor(length/2))),...Array.from(new Array(Math.floor(Qs_per_set/2)).fill(Math.floor(length/2)+1))]
        shift_position = edo.shuffle_array(shift_position).slice(0,Qs_per_set)

        let question_order = [...Array.from(new Array(Math.floor(Qs_per_set/2)).fill(["shifted",'swapped'])),...Array.from(new Array(Math.floor(Qs_per_set/2)).fill(["swapped",'shifted']))]
        question_order = edo.shuffle_array(question_order).slice(0,Qs_per_set)

        const transposition_range = 7
        let transpositions = new Array(Math.ceil(Qs_per_set/transposition_range)).fill(Array.from(new Array(transposition_range).keys()).map(t=>t-Math.floor(transposition_range/2))).flat();
        transpositions = edo.shuffle_array(transpositions).slice(0,Qs_per_set)

        let trials = []
        while(trials.length<Qs_per_set) {
            let edo_set = edo.scale(set)
            let modes = edo_set.get.modes()
            let rand_mode = rand_int_in_range(0,modes.length-1)
            let mode = modes[rand_mode]
            let probe = edo.get.random_melody(length,range,allow_repetitions,mode,avoid_leaps,end_with_first)
            let swap_pos1 = Math.ceil(probe.length/2)-1
            let swap_pos2 = Math.ceil(probe.length/2)
            let contour = edo.get.contour(probe)
            let swapped = [...probe]
            var temp = swapped[swap_pos2]
            swapped[swap_pos2] = swapped[swap_pos1];
            swapped[swap_pos1] = temp;
            if(swapped[swap_pos1]==swapped[swap_pos2]) continue //if middle pitches are same
            let shifted = [...probe]
            let note_to_shift = shift_position[shift_position.length-1]
            let amount_to_shift = shift_direction[shift_direction.length-1]
            let shift_dir = (amount_to_shift==-1) ? "down" : "up"

            let temp_set = new Set(probe.map(note=>(note+1200)%12))
            if(temp_set.size<mode.length) continue //if doesn't contain all 7 pitches, re-do


            /**Make sure shifted note violates set*/
            if (mode.indexOf(mod(shifted[note_to_shift]+amount_to_shift,12))!=-1) continue
            shifted[note_to_shift] = shifted[note_to_shift]+amount_to_shift

            if(!allow_repetitions) {
                if(!end_with_first) {
                    if(edo.get.unique_elements(shifted).length!=shifted.length) continue
                } else {
                    if(edo.get.unique_elements(shifted.slice(0,-1)).length!=shifted.slice(0,-1).length) continue
                }
            }

            if(edo.convert.to_steps(probe).indexOf(0)!=-1) continue
            if(edo.convert.to_steps(swapped).indexOf(0)!=-1) continue
            if(edo.convert.to_steps(shifted).indexOf(0)!=-1) continue

            let transposition = transpositions[transpositions.length-1]
            probe = probe.map(n=>n+transposition)
            swapped = swapped.map(n=>n+transposition)
            shifted = shifted.map(n=>n+transposition)



            transpositions.pop()
            shift_position.pop()
            shift_direction.pop()
            let order = question_order.pop()
            trials.push({mode:mode,mode_no:rand_mode,probe:probe,swapped:swapped,shifted:shifted,shift_dir:shift_dir,shift_amount:amount_to_shift,shift_position:note_to_shift,transposition:transposition, set:set,order:order,probe_contour:contour,has_decoy:false})
        }
        return trials
    }


    let stimuli = []

    sets.forEach(set=>{
        stimuli.push(...make_stimuli_from_set(set,Qs_per_set,range,length))
    })

    /**Shuffling the stimuli BEFORE adding the decoys at the end*/
    stimuli = edo.shuffle_array(stimuli)
    if(make_decoys) {
        let decoys = make_stimuli_from_set([0,2,4,5,7,9,11],Qs_per_set,range,length)
        decoys = decoys.map(decoy=>{
            decoy.has_decoy=true
            decoy.swapped=[...decoy.probe]
            return decoy
        })

        stimuli.push(...decoys)
    }
    return stimuli
}




module.exports = make_stimuli


