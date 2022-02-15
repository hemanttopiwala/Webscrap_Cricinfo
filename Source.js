//node Source.js --url='https://www.espncricinfo.com/series/icc-cricket-world-cup-2019-1144415/match-results' --dest=CricInfo.html
let minimist=require('minimist');
let fs=require('fs');
let axios=require('axios');
let args=minimist(process.argv);

let PromiseofCricinfo=axios.get(args.url);

PromiseofCricinfo.then(function(response){

    let html=response.data;

    fs.writeFileSync(args.dest,html,'utf-8',);

}).catch(function(err){
    if(err){
        console.log("error in downloading");
    }
});