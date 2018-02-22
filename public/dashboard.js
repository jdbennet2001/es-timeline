(function($) {
    $.fn.extend({
        request: function(data) {

          var parser = document.createElement('a');
              parser.href = data.name;
              
          let start = data.annotations.start || new Date(data.date).getTime();
          let width = (data.duration / data.trace_duration) * 100;
          let offset = ((start - data.trace_start_time) / data.trace_duration) * 100;

          var row = $('<div/>', {
              "class": "row",
          }).appendTo(this);
          
          var bar = $('<div/>', {
            class: 'bar',
            css: {
              "background-color" : "grey",
              "width": `${width}%`,
              "margin-left" : `${offset}%`
            }
          }).appendTo(row);
          
          var summary = $('<span/>', {
            class: "bar-summary",
            text: `${data.duration} ms`
          }).appendTo(bar);
          
          var summary = $('<div/>', {
            "class" : "summary", 
            css: {
              
            }, 
            text: decodeURIComponent(parser.pathname)
          }).appendTo(row);
            
          bar.tooltipster({
              content: JSON.stringify(data)
          });  
            
        }
    });
})(jQuery);


function chompLeft(s, prefix) {
    
    if (s.indexOf(prefix) === 0) {
       return s.slice(prefix.length);
    }
    return s;

}

$.get( "/indices", function( data ) {
  
  for (let index of data ){
    let title = chompLeft(index, 'ace-request-tracking-');
    let data = {value:index, text:title};
    if ( title === '2018-02-18'){
      data = _.assign(data, {selected: "selected"});
    }
    $('#select-index').append($(`<option/>`, data));
  }
  
  $( "#select-index" ).selectmenu();
});

$( "#render-action" ).click(function() {
  let q = $('#input-query').val();
  let index = $('#select-index').val();
  $('#data').empty();
  $.post( "/query", { q, index } ).then(data =>{
    
    let results = _.map(data.hits.hits, hit =>{
      return hit._source;
    });
    

    let trace_start_time = _.reduce(results, function(acc, result) {
      let start = result.annotations.start;
          return Math.min(start, acc);
    }, _.now() );
    
    let trace_end_time = _.reduce(results, function(acc, result) {
      let end = result.annotations.start + result.duration;
      return Math.max(end, acc);
    }, 0 );
    
    let trace_duration = trace_end_time - trace_start_time;
    
    results = _.sortBy(results, [function(o) { return o.annotations.start; }]);
    
    for (let item of results ){
       let trace = _.assign({}, item, {trace_duration, trace_start_time, trace_end_time});
        $('#data').request(trace);
    }
    
    $('<div/>', {
      "class" : "trace-summary",
      "text" : `Total duration ${trace_duration} ms.`
    }).appendTo('#data');
    
  });
});