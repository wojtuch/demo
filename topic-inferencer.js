/*
    Turn the functionality of topic inference service on/off by setting 
    the inferencer_active property to 1/0.
*/
var topic_inferencer_settings = {
  'inferencer_active': 1,
  'endpoint' : 'http://localhost:8182/inference-service',
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
  var predictions = sort(resp.predictions);
  var labels = [];
  for (var i=0; i<topic_inferencer_settings.numTopics; i++) {
    labels.push("Topic "+(i+1));
  }
  var distrs = [];
  for (var i=0; i<topic_inferencer_settings.numTopics; i++) {
    distrs.push(predictions[i].topicProbability*100);
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
  myPieChart = new Chart(ctx,{
      type: 'pie',
      data: data
  });
}