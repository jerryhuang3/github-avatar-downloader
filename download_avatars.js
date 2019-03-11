var request = require('request');
var fs = require('fs');
var token = require('./secrets.js');
console.log('Welcome to the GitHub Avatar Downloader!');
console.log(token.GITHUB_TOKEN);

//Command line input for repo owner and name
var repoOwner = process.argv[2];
var repoName = process.argv[3];

function getRepoContributors(repoOwner, repoName, cb) {
    var options = {
        url: "https://api.github.com/repos/" + repoOwner + "/" + repoName + "/contributors",
        headers: {
            'User-Agent': 'request',
            'Authorization': 'token ' + token.GITHUB_TOKEN,
        }
    };
    //Check for errors and status code during request
    request(options, function(err, res, body) {
        if (err) {
            throw err;
        };
        if (res.statusCode !== 200) {
            console.log('Connection problem!');
        }
        //Parse through body of text and store in data object
        var data = JSON.parse(body);
        cb(err, data);
        });
}

function downloadImageByURL(url, filePath) {
        request.get(url)
            .on('error', function (err) {
                throw err;
            })
            
            .on('response', function (response) {
                console.log('Downloading image...');
                console.log('Response Status Code: ', response.statusCode, response.headers['content-type']);
            })
            
            .pipe(fs.createWriteStream('./avatar/' + filePath + '.jpg'))
            .on('finish', function () {
                console.log('Download complete.');
            });
}

getRepoContributors(repoOwner, repoName, function(err, result) {
    console.log('Errors:', err);
    
    //Looping the data and logging each avatar_url and login entry
    for (var i = 0; i < result.length; i++) {
        var url = result[i].avatar_url;
        var name = result[i].login;
        downloadImageByURL(url, name);
    };
   
});