//node ProcessData.js 
// npm install minimist
// npm install jsdom
// npm install excel4node
// npm install axios
// npm install pdf-lib

// node ProcessData.js --Source='https://www.espncricinfo.com/series/icc-cricket-world-cup-2019-1144415/match-results' --datafolder=data --dest=Cricinfo.html --destexcel=data.csv


let minimist=require('minimist');
let jsdom=require('jsdom');
let excel4node=require('excel4node');
let pdf=require('pdf-lib');
let axios=require('axios');
let fs=require('fs');
//read the data from cricinfo website
//make a folder of data 
// convert the data in excel formate using excel4node
// make pdf file using pdf-lib



// download the data
let args=minimist(process.argv);
let promisefordownload=axios.get(args.Source);

promisefordownload.then(function(response){
    let html=response.data;

    let dom=new jsdom.JSDOM(html);
    let document=dom.window.document;

    let matchbox=document.querySelectorAll('div.match-score-block');
    let matches=[];
    for(let i=0;i<matchbox.length;i++){

        let match={

        };

        let teamsname=matchbox[i].querySelectorAll('p.name');

       

        match.t1=teamsname[0].textContent;
        match.t2=teamsname[1].textContent;


        let teamScore=matchbox[i].querySelectorAll('span.score');

       if(teamScore.length==2){
            match.t1Score=teamScore[0].textContent;
            match.t2Score=teamScore[1].textContent;
       }
       else if(teamScore.length==1){
        match.t1Score=teamScore[0].textContent;
        match.t2Score="";
       }
       else{
        match.t1Score="";
        match.t2Score="";

       }

        let resultarr=matchbox[i].querySelectorAll('div.status-text>span')
        match.result=resultarr[0].textContent;

        matches.push(match);


    }


    
    
    let teams = [];

    for(let i=0;i<matches.length;i++){
        
        populateTeams(teams,matches[i]);
    }


   

      for(let i=0;i<matches.length;i++){
          populateMatches(teams,matches[i]);
      }


   
    let jsonformate=JSON.stringify(teams);

    fs.writeFileSync('hemant.json',jsonformate);



     createExcelFile(teams);
    
   

}).catch(function(err){
    console.log(err);
});




// funtion for array manipulation and save data accordingly.
function populateTeams(teams,match){

    let t1idx=-1;
    
    for(let i=0;i<teams.length;i++){

        if(teams[i].name==match.t1){
            t1idx=i;
            break;
        }
    }

    if(t1idx==-1){
        

        teams.push({
            name:match.t1,
            matches:[]
        });
    }


    let t2idx=-1;
    for(let i=0;i<teams.length;i++){

        if(teams[i].name==match.t2){
            t2idx=i;
            break;
        }
    }

    if(t2idx==-1){
        teams.push({
            name:match.t2,
            matches:[]
        });
    }

}

function populateMatches(teams,match){

     
    let t1idx=-1;

    for(let i=0;i<teams.length;i++){

        if(teams[i].name==match.t1){
            t1idx=i;
            break;
        }
        
    }

    let team1=teams[t1idx];

    team1.matches.push({
        vs: match.t2,
        selfScore: match.t1Score,
        opponentScore: match.t2Score,
        result: match.result
    });


    let t2idx=-1;

    for(let i=0;i<teams.length;i++){

        if(teams[i].name==match.t2){
            t2idx=i;
            break;
        }
        
    }

    let team2=teams[t2idx];

    team2.matches.push({
        vs: match.t1,
        selfScore: match.t2Score,
        opponentScore: match.t1Score,
        result: match.result
    });


}



function createExcelFile(teams){
        let wb=new excel4node.Workbook();
        var style = wb.createStyle({
            font: {
            color: 'white',
            size: 12,
            },
            fill:{

                type:'pattern',
                patternType:'solid',

                fgColor: "pink"
            },
            alignment: {
                wrapText: true,
                horizontal: 'center',
            }
        });

        for(let i=0;i<teams.length;i++){

            let sheet=wb.addWorksheet(teams[i].name);

            sheet.cell(1,1).string(teams[i].name).style(style);
            sheet.cell(1,3).string("Opponent").style(style);
            sheet.cell(1,5).string("Self Score").style(style);
            sheet.cell(1,7).string("Opponent Score").style(style);
            sheet.cell(1,9).string("Result").style(style);


            for(let j=0;j<teams[i].matches.length;j++){

                sheet.cell(2+j,3).string(teams[i].matches[j].vs);

                sheet.cell(2+j,5).string(teams[i].matches[j].selfScore);
                sheet.cell(2+j,7).string(teams[i].matches[j].opponentScore);
                sheet.cell(2+j,9).string(teams[i].matches[j].result);


            }



        }

        wb.write(args.destexcel);

}

