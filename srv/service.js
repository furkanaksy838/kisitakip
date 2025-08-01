const moment = require("moment");
const cds = require('@sap/cds');
const path = require("path");

module.exports = srv => {

  // Yaş hesaplama
  srv.before("CREATE", "People", req => {
    const birthday = req.data.Birthday;
    if (birthday) {
      const age = moment().diff(moment(birthday), 'years');
      req.data.Age = age;
    }
  });

  // /cp.portal endpoint'i
  cds.on('bootstrap', app => {
    app.get('/cp.portal', (req, res) => {
      res.send('Hoş geldin! cp.portal çalışıyor.');
    });
  });

};
