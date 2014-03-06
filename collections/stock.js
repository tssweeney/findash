historicalDataSchema = new SimpleSchema({
  date: {
    type: Date,
  },
  open: {
    type: Number,
    decimal: true
  },
  close: {
    type: Number,
    decimal: true
  },
  volume: {
    type: Number,
    decimal: true
  },
  adjClose: {
    type: Number,
    decimal: true
  },
  high: {
    type: Number,
    decimal: true
  },
  low: {
    type: Number,
    decimal: true
  }
});

ownershipSchema = new SimpleSchema({
  datePurchased: {
    type: Date
  },
  quantity: {
    type: Number,
    decimal: true
  },
  fullPrice: {
    type: Number,
    decimal: true
  }
});

keyStatsSchema = new SimpleSchema({
  date: {
    type: Date
  },
  marketCap: {
    type: Number,
    decimal: true
  },
  trailingPE: {
    type: Number,
    decimal: true
  },
  profitMargin: {
    type: Number,
    decimal: true
  },
  operatingMargin: {
    type: Number,
    decimal: true
  },
  ReturnOnEquity: {
    type: Number,
    decimal: true
  },
  RevenuePerShare: {
    type: Number,
    decimal: true
  }
});

stocks = new Meteor.Collection("stocks", {
    schema: new SimpleSchema({
        symbol: {
            type: String,
            label: "Symbol",
            unique: true
        },
        name: {
            type: String,
            label: "Name"
        },
        historicalData: {
            type: [historicalDataSchema],
            optional: true
        },
        ownedStocks: {
            type: ownershipSchema,
            optional: true
        },
        keyStats: {
          type: [keyStatsSchema],
          optional: true
        }
    })
});

stocks.helpers({
  latestValues: function(){
    var result = {
      date: null,
      close: null
    }
    if (this.historicalData) {
      var r = _.max(this.historicalData, function(stockData){
        return stockData.date;
      });
      result.date = r.date;
      result.close = r.close
    }
    return result;
  },
  netValue: function(){
    if (this.ownedStocks && this.historicalData) {
      return (this.latestValues().close * this.ownedStocks.quantity) - this.ownedStocks.fullPrice;
    }
    return 0;
  }
});

if (Meteor.isClient) {
  Meteor.subscribe("stocks", function(){
    _.each(stocks.find({}).fetch(), function(stock){findHistoricalData(stock);});
    if (stocks.findOne()) {
      Session.setDefault('chartSymbol', stocks.findOne().symbol);
    }
    refreshChart();
  });
}

if (Meteor.isServer) {
  Meteor.publish("stocks", function(){
    return stocks.find({},{sort:{ownedStocks:-1}});
  });
}