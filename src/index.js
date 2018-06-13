import three_draw from './th';
// ------------------------------
document.body.style.padding = '0px';
document.body.style.margin = '0px';
let div = document.createElement('div');
div.style.width = '1600px';
div.style.height = '900px';
// div.style.border = 'solid 1px red';
document.body.appendChild(div);

((async function () {
   let geojsonRes = await fetch("./data/yx.geojson");
   let testDataRes = await fetch("./data/test.json");

   let geojson = await geojsonRes.json();
   let testData = await testDataRes.json();

   three_draw(div, geojson, testData);
})());