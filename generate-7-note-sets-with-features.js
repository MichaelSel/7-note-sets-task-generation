/**
 * DO NOT RUN THIS FILE THE FILE HAS ALREADY DID ITS JOB
 * AND GENERATED THE FILE 7-note-sets.json/csv
 * */


const fs = require('fs');
const csv = require('csv-parser');
const EDO = require("edo.js").EDO


const make_csv = function (scales) {
    let id=0
    const createCsvWriter = require('csv-writer').createObjectCsvWriter;
    const csvWriter = createCsvWriter({
        path: "7-note-sets.csv",
        header: [
            {id: 'id', title: 'ID'},
            {id: 'name', title: 'EDO.JS name'},
            {id: 'set', title: 'Pitches'},
            {id: 'note2', title: 'Note 2'},
            {id: 'note3', title: 'Note 3'},
            {id: 'note4', title: 'Note 4'},
            {id: 'note5', title: 'Note 5'},
            {id: 'note6', title: 'Note 6'},
            {id: 'note7', title: 'Note 7'},
            {id: 'IC1', title: '# IC 1'},
            {id: 'IC2', title: '# IC 2'},
            {id: 'IC3', title: '# IC 3'},
            {id: 'IC4', title: '# IC 4'},
            {id: 'IC5', title: '# IC 5'},
            {id: 'IC6', title: '# IC 6'},
            {id: 'area', title: 'Polygon Area'},
            {id: 'coherence_quotient', title: 'Coherence Quotient'},
            {id: 'diatonic_alterations', title: 'Alterations from diatonic in closest mode'},
            {id: 'ambigious_modes', title: '# modes that cannot be mapped into Stable / active notes'},
            {id: 'mappable_modes', title: '# modes that can be mapped onto unique scalar roles'},
        ]
    });



    let data =scales.map((scale,i) => {
        const interval_vector = scale.get.interval_vector()
        const stability_vector = function (pitches) {
            let ratios = pitches.map(p=>edo.convert.interval_to_ratio(p))
            let vector = pitches.map(p=>0)
            vector[0]='*'
            let closest_P5=0
            let P5_tol = 10
            let P5 = 3/2

            let closest_M3=0
            let M3_tol = 15
            let M3 = 5/4

            let closest_m3=0
            let m3_tol = 20
            let m3 = 6/5


            ratios.forEach(r=>{
                let diff = Math.abs(P5-r)
                if(diff<Math.abs(P5-closest_P5)) {
                    closest_P5= r
                }

                diff = Math.abs(M3-r)
                if(diff<Math.abs(M3-closest_M3)) {
                    closest_M3= r
                }
            })
            if(Math.abs(edo.convert.ratio_to_cents(P5) - edo.convert.ratio_to_cents(closest_P5))>P5_tol) {}
            else {
                let ind = ratios.indexOf(closest_P5)
                vector[ind]="*"
            }



            if(Math.abs(edo.convert.ratio_to_cents(M3) - edo.convert.ratio_to_cents(closest_M3))>M3_tol){
                ratios.forEach(r=>{
                    diff = Math.abs(m3-r)
                    if(diff<Math.abs(m3-closest_m3)) {
                        closest_m3= r
                    }
                })
                if(Math.abs(edo.convert.ratio_to_cents(m3) - edo.convert.ratio_to_cents(closest_m3))>m3_tol) {

                }
                else {
                    let ind = ratios.indexOf(closest_m3)
                    vector[ind]="*"
                }


            } else {
                let ind = ratios.indexOf(closest_M3)
                vector[ind]="*"
            }
            for (let i = 0; i < vector.length; i++) {
                if(vector[i]=="*") continue
                else if(vector[i-1]=="*" && vector[(i+1)%vector.length]=="*") vector[i]="<>"
                else if(vector[i-1]=="*" && vector[(i+1)%vector.length]!="*") vector[i]="<<"
                else if(vector[i-1]!="*" && vector[(i+1)%vector.length]=="*") vector[i]=">>"
                else vector[i]="!"
            }
            return vector
        }
        const diatonic_alterations = function (scale) {
            let modes = scale.pitches.map((s,i)=>scale.mode(i))
            let deltas = modes.map(m=>m.get.per_note_set_difference().reduce((ag,el)=>(el!=0)?ag+1:ag,0))
            let smallest_delta = Math.min(...deltas)
            return smallest_delta
        }
        const ambigious_modes = function (scale) {
            let ambigious = 0
            for (let i = 0; i < scale.count.pitches(); i++) {
                let mode = scale.mode(i)
                let vector = stability_vector( mode.pitches)
                if(vector.indexOf('!')!=-1) ambigious++

            }
            return ambigious
        }
        const mappable_modes = function (scale) {
            let mappable = 0
            for (let i = 0; i < scale.count.pitches(); i++) {
                let mode = scale.mode(i)
                let roles = mode.get.scale_degree_roles()
                if(edo.is.element_of([1,2,3,4,5,6,7],roles)) mappable++
            }
            return mappable
        }


        let dat = {
            name: scale.get.name().split('-')[1],
            id: id++,
            set: scale.get.pitches(),
            IC1: interval_vector[0],
            IC2: interval_vector[1],
            IC3: interval_vector[2],
            IC4: interval_vector[3],
            IC5: interval_vector[4],
            IC6: interval_vector[5],
            area: scale.get.area(),
            coherence_quotient: scale.get.coherence_quotient(),
            note2:scale.pitches[1],
            note3:scale.pitches[2],
            note4:scale.pitches[3],
            note5:scale.pitches[4],
            note6:scale.pitches[5],
            note7:scale.pitches[6],
            diatonic_alterations:diatonic_alterations(scale),
            ambigious_modes:ambigious_modes(scale),
            mappable_modes:mappable_modes(scale),
        }

        return dat
    })
    csvWriter
        .writeRecords(data)
        .then(()=> console.log("CSV file created."));

    fs.writeFileSync('7-note-sets.json', JSON.stringify(data));

}


let divisions = 12
edo = new EDO(divisions)
let scales = edo.get.scales()
scales = scales.filter((scale)=>scale.count.pitches()==7)
    .filter(scale=>scale.is.prime_form()) //only include PF sets (do not include set inversions)

make_csv(scales)

