Template.modals.events({
  'click #stockSave' : function(event, template){
    var stock = {};
    var symbol = template.find('#stockSymbol').value;
    var id = createStockFromSymbol(symbol);
    if (id) {
      stock.fullPrice = parseFloat(template.find('#stockPrice').value);
      stock.quantity = parseInt(template.find('#stockQuantity').value);
      stock.datePurchased = new Date(template.find('#stockDate').value);
      if (stock.fullPrice && stock.quantity && stock.datePurchased) {
        stocks.update({_id:id}, {$set:{ownedStocks:stock}});
        $('#addStock').modal('hide');
      } else if (stock.price || stock.quantity || stock.date) {
        $(template.find("#stockMessage")).text("Must include quantity, price, and date is owned.");
      } else {
        $('#addStock').modal('hide');
      }
    } else {
      $(template.find("#stockMessage")).text("Must include a new, valid symbol.");
    }
  }
});