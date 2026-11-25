var test = require('node:test');
var assert = require('node:assert/strict');

var invoice = require('../lib/invoice');
var pricing = require('../lib/pricing');

function calculate(order) {
  return {
    invoice: invoice.computeInvoiceFigures(order),
    checkout: pricing.computeTotals(order.items, order.coupon)
  };
}

test('invoice matches checkout HSN GST and capped coupon figures for #1002 data', function () {
  var order = {
    coupon: 'SAVE10',
    items: [
      { name: 'Rice', price: 640, qty: 1, hsn: '1006' },
      { name: 'Sunflower Oil', price: 190, qty: 2, hsn: '1512' }
    ]
  };
  var result = calculate(order);

  assert.deepEqual(
    {
      subtotal: result.invoice.subtotal,
      discount: result.invoice.discount,
      tax: result.invoice.tax,
      cgst: result.invoice.cgst,
      sgst: result.invoice.sgst,
      total: result.invoice.total
    },
    {
      subtotal: result.checkout.subtotal,
      discount: result.checkout.discount,
      tax: result.checkout.tax,
      cgst: result.checkout.cgst,
      sgst: result.checkout.sgst,
      total: result.checkout.total
    }
  );
  assert.deepEqual(
    result.invoice.rows.map(function (row) {
      return { gstPercent: row.gstPercent, lineTax: row.lineTax };
    }),
    [
      { gstPercent: 5, lineTax: 28.8 },
      { gstPercent: 5, lineTax: 17.1 }
    ]
  );
});

test('CURRENT BEHAVIOUR: #1001-style 5% and 12% items produce matching no-coupon figures', function () {
  var order = {
    coupon: '',
    items: [
      { name: 'Rice', price: 640, qty: 1, hsn: '1006', gstRate: 5 },
      { name: 'Ghee', price: 450, qty: 1, hsn: '0405', gstRate: 12 }
    ]
  };
  var result = calculate(order);

  assert.deepEqual(result.invoice, {
    subtotal: 1090,
    discount: 0,
    tax: 86,
    cgst: 43,
    sgst: 43,
    total: 1176,
    rows: [
      { name: 'Rice', sku: '-', hsn: '1006', qty: 1, price: 640, gstPercent: 5, line: 640, lineTax: 32 },
      { name: 'Ghee', sku: '-', hsn: '0405', qty: 1, price: 450, gstPercent: 12, line: 450, lineTax: 54 }
    ]
  });
  assert.equal(result.checkout.total, 1176);
});

test('CURRENT BEHAVIOUR: #1002 SAVE10 matches checkout tax and discount', function () {
  var order = {
    coupon: 'SAVE10',
    items: [
      { name: 'Rice', price: 640, qty: 1, hsn: '1006', gstRate: 5 },
      { name: 'Sunflower Oil', price: 190, qty: 2, hsn: '1512', gstRate: 5 }
    ]
  };
  var result = calculate(order);

  assert.deepEqual(result.invoice, {
    subtotal: 1020,
    discount: 102,
    tax: 45.9,
    cgst: 22.95,
    sgst: 22.95,
    total: 963.9,
    rows: [
      { name: 'Rice', sku: '-', hsn: '1006', qty: 1, price: 640, gstPercent: 5, line: 640, lineTax: 28.8 },
      { name: 'Sunflower Oil', sku: '-', hsn: '1512', qty: 2, price: 190, gstPercent: 5, line: 380, lineTax: 17.1 }
    ]
  });
  assert.deepEqual(
    { discount: result.checkout.discount, tax: result.checkout.tax, total: result.checkout.total },
    { discount: 102, tax: 45.9, total: 963.9 }
  );
});

test('CURRENT BEHAVIOUR: #1004 SAVE10 applies the ₹150 coupon cap before tax', function () {
  var order = {
    coupon: 'SAVE10',
    items: [
      { name: 'Groundnut Oil', price: 1120, qty: 2, hsn: '1508', gstRate: 5 }
    ]
  };
  var result = calculate(order);

  assert.deepEqual(result.invoice, {
    subtotal: 2240,
    discount: 150,
    tax: 104.5,
    cgst: 52.25,
    sgst: 52.25,
    total: 2194.5,
    rows: [
      { name: 'Groundnut Oil', sku: '-', hsn: '1508', qty: 2, price: 1120, gstPercent: 5, line: 2240, lineTax: 104.5 }
    ]
  });
  assert.deepEqual(
    { discount: result.checkout.discount, tax: result.checkout.tax, total: result.checkout.total },
    { discount: 150, tax: 104.5, total: 2194.5 }
  );
});

test('CURRENT BEHAVIOUR: #1008 all-18% items match checkout without a coupon', function () {
  var order = {
    coupon: '',
    items: [
      { name: 'Tea', price: 140, qty: 1, hsn: '0902', gstRate: 18 },
      { name: 'Kokum Concentrate', price: 180, qty: 2, hsn: '2106', gstRate: 18 }
    ]
  };
  var result = calculate(order);

  assert.deepEqual(result.invoice, {
    subtotal: 500,
    discount: 0,
    tax: 90,
    cgst: 45,
    sgst: 45,
    total: 590,
    rows: [
      { name: 'Tea', sku: '-', hsn: '0902', qty: 1, price: 140, gstPercent: 18, line: 140, lineTax: 25.2 },
      { name: 'Kokum Concentrate', sku: '-', hsn: '2106', qty: 2, price: 180, gstPercent: 18, line: 360, lineTax: 64.8 }
    ]
  });
  assert.equal(result.checkout.total, 590);
});
