
findHistoricalData = function(doc){
  var query, symbol, startDate, endDate = Date.now();
  if (doc.historicalData) {
    startDate = 0;
    _.each(doc.historicalData, function(node){
      if (startDate < node.date) {
        startDate = node.date;
      }
    });
  } else {
    startDate = new Date(endDate);
    startDate.setMonth(startDate.getMonth() - 3);
    doc.historicalData = [];
  }
  startDate = convertDate(startDate);
  endDate = convertDate(endDate);
  symbol = doc.symbol;
  query = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.historicaldata%20where%20symbol%20%3D%20%22"+symbol+"%22%20and%20startDate%20%3D%20%22"+startDate+"%22%20and%20endDate%20%3D%20%22"+endDate+"%22&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=";
  $.get(query, function(val){
    _.each(val.query.results.quote, function(node){
      var d = {
        date: new Date(node.Date),
        open: parseFloat(node.Open),
        close: parseFloat(node.Close),
        volume: parseFloat(node.Volume),
        adjClose: parseFloat(node.Adj_Close),
        high: parseFloat(node.High),
        low: parseFloat(node.Low)
      }
      doc.historicalData.push(d)
      stocks.update({_id:doc._id}, {
        $addToSet:{
          historicalData: d
        }
      });
    });
  });
};

createStockFromSymbol = function(symbol) {
  var stock = {};
  var s = stocks.findOne({symbol:symbol.toUpperCase()});
  if (s) {
    stock.id = s._id;
  } else {
    var query = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from"+
                "%20yahoo.finance.quote%20where%20symbol%20%3D%20%22"+symbol+"%22&format="+
                "json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys"+
                "&callback=";
    $.ajax({
      url: query,
      async: false,
      dataType: "json",
      success: function(results){
        results = results.query.results;
        if (results && results.quote.StockExchange) {
          stock.name = results.quote.Name;
          stock.symbol = results.quote.Symbol;
          if (stock.name && stock.symbol) {
            stock.id = stocks.insert(stock);
          }
        }
      }
    });
  }
  return stock.id || false;
};

stocks.after.insert(function(userId, doc){
  findHistoricalData(doc);
  if (!Session.get('chartSymbol')) {
    Session.set('chartSymbol', stocks.findOne().symbol);
    refreshChart();
  }
});

convertDate = function(date) {
  string = '';
  date = new Date(date);
  string += date.getFullYear() + '-';
  string += date.getMonth()+1 + '-';
  string += date.getDate();
  return string;
}