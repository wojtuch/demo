/*
    Turn the functionality of topic inference service on/off by setting 
    the inferencer_active property to 1/0.
*/
var topic_inferencer_settings = {
  'inferencer_active': 1,
  'endpoint' : 'http://de.dbpedia.org/topics/inference-service',
  'numTopics': 3
};

var myPieChart;

function argSort(arr) {
  var indices = [];
  for (var i=0;i<arr.length; i++){
    indices.push(i);
  }
  indices.sort(function(a,b){
    return arr[a].topicProbability < arr[b].topicProbability ? 1 : -1;
  });
  return indices;
};

function sort(arr) {
  arr.sort(function(a,b){
    return a.topicProbability < b.topicProbability ? 1 : -1;
  });
  return arr;
};

function ask_topic_inferencer(spotlightAnnotationJSON) {
  if (topic_inferencer_settings.inferencer_active == 1) {
    $.ajax({
      type: "POST",
      url: topic_inferencer_settings.endpoint+"/get-topics",
      data: {"spotlightAnnotationJSON": JSON.stringify(spotlightAnnotationJSON)},
      success: topic_inferencer_success_callback,
      error: topic_inferencer_error_callback,
      headers: {
        "Accept": "application/json"
      }
    });
  }
}

function topic_inferencer_error_callback(resp) {
  console.log("Oops, error while fetching topics... :(");
  console.log(resp);
}

function topic_inferencer_success_callback(resp) {
  console.log(resp);
  var predictions = sort(resp.predictions).slice(0,topic_inferencer_settings.numTopics);
  predictions.forEach(function (item, idx){
    predictions[idx].topicWordsCoverage.forEach(function (item2, idx2){
      predictions[idx].topicWordsCoverage[idx2] = parseFloat(Math.round(predictions[idx].topicWordsCoverage[idx2] * 100) / 100).toFixed(2);
    });
  });
  console.log(predictions);
  var labels = [];
  var distrs = [];
  for (var i=0; i<topic_inferencer_settings.numTopics; i++) {
    var label = predictions[i].topicLabel || "Topic "+(predictions[i].topicId+1);
    labels.push(label);
    distrs.push(parseFloat(Math.round(predictions[i].topicProbability*100 * 100) / 100).toFixed(2));
  }
  var data = {
    labels: labels,
    datasets: [{
      data: distrs,
      backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56"
      ],
      hoverBackgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56"
      ]
    }]  
  };
  var ctx = $("#topic_chart");
  $("#topic_info_container").css("display", "block");
  $("#topic_chart").css("height", "1500px");

  myPieChart = new Chart(ctx,{
      type: 'pie',
      data: data,
      predictions: predictions,
      options: {
          tooltipTemplate: function(v) {console.log(v); return v;},
          tooltips: {
            callbacks: {
                label: function(tooltipItem, data) {
                  var percentage = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                  var label = data.labels[tooltipItem.index];
                  var tooltipText = label +': '+ percentage+'%';
                  var prediction = $(this)[0]._chart.config.predictions[tooltipItem.index];
                  return tooltipText;
                },
                afterBody: function(tooltipItem, data) {
                  var prediction = $(this)[0]._chart.config.predictions[tooltipItem[0].index];
                  var body = [];
                  for (var i = 0; i < prediction.topicWords.length; i++) {
                    body.push(prediction.topicWords[i]+": " + prediction.topicWordsCoverage[i]+"%");
                  }
                  return body;
                }
            }
          }
      }
  });
}
