/**
 * Run it ONCE
 * DO NOT RUN THIS FILE THE FILE HAS ALREADY DID ITS JOB
 * AND GENERATED THE FILE subject_matrix.csv/json
 * */


const fs = require('fs');
const EDO = require("edo.js").EDO
const make_csv = require('./make_csv.js')
let edo = new EDO()


/**Create the set Matrix*/
let matrix = []
for (let i = 0; i < 100; i++) {
    let row = Array.from(new Array(14).keys())
    row = edo.shuffle_array(row)
    matrix.push(row)
}

/**Assign sets to subjects*/
const sets_per_sub = 7
let subs = []
let sub_counter = 0
for (let row = 0; row < matrix.length; row++) {
    for (let col = 0; col < matrix[row].length ; col+=sets_per_sub) {
        subs.push({subject_id:sub_counter,sets_assigned:matrix[row].slice(col,col+sets_per_sub),position_in_matrix:[row,col]})
        sub_counter++
    }

}

fs.writeFileSync('subject_matrix.json', JSON.stringify(subs));
make_csv(subs,Object.keys(subs[0]),'./subject_matrix.csv')
