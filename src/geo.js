import * as d3 from 'd3';

export default function geo(geojson) {
   let projection = d3.geoMercator()
      .center([118.2, 39])
      .scale(25000);
   let path = d3.geoPath()
      .projection(projection);
   let { features } = geojson;
   let paths = [];

   for(let i = 0; i < features.length; i++) {
      paths.push(path(features[i]));
   }

   return { projection, paths };
}