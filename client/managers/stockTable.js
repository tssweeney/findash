Template.stockTable.helpers({
  stocks: function(){
    return stocks.find({},{sort:{ownedStocks:-1}}).fetch();
  },
  convertDate: function(date) {
    string = '';
    date = new Date(date);
    
    string += date.getMonth()+1 + '-';
    string += date.getDate() + '-';
    string += date.getFullYear();
    return string;
  },
  convertCurrency: function(money) {
    return '$'+money.toFixed(2);
  },
  sortDate: function(array) {
    return _.sortBy(array, function(item){
      return item.date;
    }).reverse();
  }
});

Template.stockTable.events({
  'click .stockRow': function(event, template){
    $(template.find("#"+this.symbol+"_history")).toggle();
    if (!Session.get('chartSymbol') || !Session.equals('chartSymbol', this.symbol)) {
      Session.set('chartSymbol', this.symbol);
      refreshChart();
    } 
    
  }
});


refreshChart = function(){
  var series = [];
  var data = [];
  var s = stocks.find({symbol:Session.get('chartSymbol')}).fetch()[0];
  if (s) {
    _.each(s.historicalData.reverse(), function(h){
      var datapoint = {
        x: h.date,
        open: h.open,
        high: h.high,
        low: h.low,
        close: h.close
      };
      data.push(datapoint);
    });
    series.push({data:_.sortBy(data,function(d){return d.x;}), type: 'ohlc', name: s.name});
    $('#highChart').highcharts("StockChart", {
      series:series, 
      navigator:{enabled:false}, 
      scrollbar:{enabled:false}, 
      rangeSelector:{inputEditDateFormat:"%m-%d-%Y"},
      title: {text: s.name}
    });
    Session.set('chartSymbol', s.symbol);
  }
};