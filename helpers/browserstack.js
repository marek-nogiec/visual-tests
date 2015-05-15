var request = require('request');

var username = 'marekn2';
var token = 'n3su1p58ZQFK8FUxoJqo';

_activeWorkers = [];

function checkJobStatus(jobId, callback) {
  var url = 'http://' + username + ':' + token + '@www.browserstack.com/screenshots/' + jobId + '.json';
  var opts = {
    method: 'GET',
    uri: url
  };
  request(opts, function (error, response, body) {
    if(error) {
      console.log(error);
    } else {
      var jobData = JSON.parse(body);
      if (jobData.state === 'done') {
        callback(jobData);
        console.log('Job complete: ', jobId);
      } else {
        console.log('Job incomplete: ' + jobId + '. Job state: ' + jobData.state);
      }
    }
  });
}

function takeScreenshots(callback) {
  getWorkers().forEach(function(worker){
    var url = 'http://' + username + ':' + token + '@www.browserstack.com/screenshots';
    var opts = {
      method: 'POST',
      uri: url,
      json: true,
      body: worker
    };
    request(opts, function (error, response, body) {
      if(error) {
        console.log(error);
        process.exit();
      } else {
        console.log(body);
        callback(body.job_id);
      }
    });
  })
}

function getWorkers () {
  return _activeWorkers;
}

module.exports = {
  checkJobStatus: checkJobStatus,
  takeScreenshots: takeScreenshots,
  createWorker: createWorker
};

function createWorker (url, browsers) {
  _activeWorkers.push({
    "url": url,
    "quality": "compressed",
    "wait_time": 5,
    "orientation": "portrait",
    "browsers": browsers
  })
}