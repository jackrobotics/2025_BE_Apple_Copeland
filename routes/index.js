var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  // res.render('index', { title: 'Express' });
  res.status.json({
    success: true,
    msg: "API Server"
  })
});

const momo = require('./momo');

router.get('/api', async function (req, res, next) {
  const data = await momo.get();
  let energy = {};

  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      energy[key] = await momo.get_energy_month(key);
    }
  }

  res.status(200).json({
    success: true,
    data: data,
    energy: energy,
  })
});

module.exports = router;
