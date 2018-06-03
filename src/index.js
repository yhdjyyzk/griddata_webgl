import './index.scss';

import three_draw from './th';
// ------------------------------
let div = document.createElement('div');
div.style.width = '800px';
div.style.height = '500px';
// div.style.border = 'solid 1px red';
document.body.appendChild(div);

((async function () {
   let geojsonRes = await fetch("./data/yx.geojson");
   let testDataRes = await fetch("./data/test.json");

   let geojson = await geojsonRes.json();
   let testData = await testDataRes.json();

   three_draw(div, geojson, testData);

   console.log(geojson);
   console.log(testData);
})());