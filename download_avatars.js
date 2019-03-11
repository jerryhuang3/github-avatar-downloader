var request = require('request');
var token = require('./secrets.js');
console.log('Welcome to the GitHub Avatar Downloader!');
console.log(token.GITHUB_TOKEN);

function getRepoContributors(repoOwner, repoName, cb) {
    var options = {
        url: "https://api.github.com/repos/" + repoOwner + "/" + repoName + "/contributors",
        headers: {
            'User-Agent': 'request',
            'Authorization': 'token ' + token.GITHUB_TOKEN,
        }
    };
    //Stream the data and parsing it to a variable
    request(options, function(err, res, body) {
        var data = JSON.parse(body);
        cb(err, data);
        });
}


getRepoContributors('jquery', 'jquery', function(err, result) {
    console.log('Errors:', err);
    
    //Looping the data and logging each avatar_url entry
    for (var i = 0; i < result.length; i++) {
        var url = result[i].avatar_url;
        console.log('Result:', url);
    };
});