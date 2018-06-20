// import * as d3 from 'd3';
import * as pathTool from 'zrender/src/tool/path';
import * as THREE from 'three';
import OrbitControls from 'three-orbitcontrols';
import Point from './point';
import geo from './geo';
import * as tooltip from './tooltip';

export default function three_draw(dom, geojson, testData) {
   let width = getSize(dom.style.width);
   let heigth = getSize(dom.style.height);

   let scene = new THREE.Scene();
   scene.translateX(-200);
   scene.translateY(-200);

   let camera = new THREE.PerspectiveCamera(45, width / heigth, 0.1, 2000);
   camera.position.set(0, 0, 800);

   let renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      precision: 'highp',
      devicePixelRatio: window.devicePixelRatio
   });
   renderer.setSize(width, heigth);
   renderer.setClearColor(new THREE.Color(0, 0, 0));

   // 控制
   let orbitControl = new OrbitControls(camera, renderer.domElement);
   orbitControl.enableDamping = true;
   orbitControl.dampingFactor = 0.25;
   orbitControl.enableZoom = true;
   orbitControl.minDistance = 0.1;
   orbitControl.maxDistance = 2000;

   dom.appendChild(renderer.domElement);

   let axesHelper = new THREE.AxesHelper(1000);
   scene.add(axesHelper);

   let geoBounds;
   let {projection, paths} = geo(geojson);
   let group = new THREE.Object3D();
   // group.rotation.x = -Math.PI / 2.5;
   scene.add(group);

   // let geoScene = scene.clone();
   // geoScene.add(new THREE.AxesHelper(6000));

   paths.forEach(path => {
      let pathProxy = pathTool.createPathProxyFromString(path);
      geoBounds = pathProxy.getBoundingRect();
      let pathData = pathProxy.data;

      let step = 1;
      let geoShape = new THREE.Shape();

      for(let i = 0; i < pathData.length; i += step) {
         if(i == 0) {
            geoShape.moveTo(pathData[i + 1], pathData[i + 2]);
            step = 3;
         }
         else {
            if(pathData[i] == 2) {
               geoShape.lineTo(pathData[i + 1], pathData[i + 2]);
            }
         }
      }

      let geoGeometry = new THREE.ExtrudeBufferGeometry(geoShape, {
         steps: 2,
         depth: -16,
         bevelEnabled: true,
         bevelThickness: 1,
         bevelSize: 1,
         bevelSegments: 1
      });

      let geoMaterial = new THREE.ShaderMaterial({
         vertexShader: `
             void main() {
                gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4( position, 1.0 );
                gl_PointSize = 10.0;
             }
         `,
         fragmentShader: `
             precision mediump float;

             void main() {
               gl_FragColor = vec4(1.0, 1.0, 0.0, 0.7);
             }
         `,
         side: THREE.DoubleSide,
         // wireframe: true
      });

      let mesh = new THREE.Mesh(geoGeometry, geoMaterial);

      // mesh.rotation.x = -Math.PI / 2.5;
      // geoScene.add(mesh);
      scene.add(mesh.clone());
   });

   // let geoTarget = new THREE.WebGLRenderTarget(512, 512);
   // renderer.setRenderTarget(geoTarget);
   // renderer.render(geoScene, camera, geoTarget);
   // renderer.setRenderTarget(null);

   let positions = [];

   let pointsGeometry = new THREE.BufferGeometry();
   let minZ = Number.MAX_VALUE;
   let maxZ = Number.MIN_VALUE;
   testData.sumPre.forEach(s => {
      let pos = projection([s.lon, s.lat]);
      let z = s.sum_pre;
      let z10 = z * 10;

      minZ = minZ > z10 ? z10 : minZ;
      maxZ = maxZ < z10 ? z10 : maxZ;

      positions.push(pos[0], pos[1], z * 10);
   });

   pointsGeometry.addAttribute("position", new THREE.Float32BufferAttribute(positions, 3));

   let uniforms = {
      "maxZ": {value: maxZ},
      "minZ": {value: minZ}
   };

   let pointMaterial = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: `
         varying vec3 pos;

         void main() {
            pos = position;
            gl_PointSize = 10.0;
            gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
         }
      `,
      fragmentShader: `
         varying vec3 pos;
         uniform float maxZ;
         uniform float minZ;

         void main() {
            if(distance(gl_PointCoord, vec2(0.5, 0.5)) > 0.5) {
               discard;
            }
            else {
               vec3 color1 = vec3(0.0, 0.0, 1.0);
               vec3 color2 = vec3(1.0, 0.0, 0.0);
               float Z = pos.z;
               float tempMaxZ = maxZ;
               tempMaxZ = tempMaxZ - minZ;
               Z = Z - minZ;
               float mixVaue = Z / tempMaxZ;
               vec3 color0 = mix(color1, color2, mixVaue);

               gl_FragColor = vec4(color0, 1.0);
            }
         }
      `,
      vertexColors: THREE.VertexColors,
      depthTest: true,
      depthWrite: true
   });

   let points = new THREE.Points(pointsGeometry, pointMaterial);
   group.add(points);

   // 点的交互
   let renderDomRect = renderer.domElement.getBoundingClientRect();
   function onMouseMove(event) {
      event.preventDefault();

      let vector = new THREE.Vector2(((event.clientX - renderDomRect.left) / (width - renderDomRect.left)) * 2 - 1, -((event.clientY - renderDomRect.top) / (heigth - renderDomRect.top)) * 2 + 1);
      let raycaster = new THREE.Raycaster();
      raycaster.far = 2000;
      raycaster.near = 0.1;
      raycaster.setFromCamera(vector, camera);

      let intersects = raycaster.intersectObject(points);

      if(intersects.length > 0) {
         let index = intersects[0].index;
         let tooltipData = testData.sumPre[index];
         let html = ``;

         for(let k in tooltipData) {
            let v = tooltipData[k];
            html += `
               <span>${k}: ${v}</span></br>
            `
         }

         tooltip.tooltip(html);
         let {pageX, pageY} = event;
         tooltip.show(pageX, pageY);
      }
      else {
         tooltip.hidden();
      }
   }

   dom.addEventListener('mousemove', onMouseMove, false);

   //  创建网格
   let geoWidth = geoBounds.width;
   let geoHeight = geoBounds.height;
   let geoX = geoBounds.x;
   let geoY = geoBounds.y;

   let gridSize = Math.floor(Math.min(geoWidth / 2, geoHeight / 2)); // 网格大小
   let positionArr = [];

   for(let i = 0; i < positions.length; i += 3) {
      positionArr.push(
         [positions[i], positions[i + 1], positions[i + 2]]
      );
   }

   function meshFunction(u0, v0, dest) {
      let result = dest || new THREE.Vector3();
      let u = geoWidth * u0 + geoX;
      let v = geoHeight * v0 + geoY;

      let x = u;
      let y = v;

      let point = new Point(x, y);
      point.standPoints = positionArr;
      let z = point.getZValue();

      if(isNaN(x) || isNaN(y) || isNaN(z)) {
         result.x = 0;
         result.y = 0;
         result.z = 0;
      }
      else {
         result.x = x;
         result.y = y;
         result.z = z;
      }

      return result;
   };

   let texture = new THREE.TextureLoader().load('./data/map.png');
   let palneGeometry = new THREE.ParametricBufferGeometry(meshFunction, gridSize, gridSize);
   let planeMaterial = new THREE.ShaderMaterial({
      vertexShader: `
         varying vec3 pos;
         varying vec2 v_Uv;

         void main() {
            v_Uv = uv;
            pos = position;
            gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
         }
      `,
      fragmentShader: `
         varying vec3 pos;
         uniform float maxZ1;
         uniform float minZ1;
         uniform sampler2D texture;
         varying vec2 v_Uv;

         void main() {
            vec4 pixel = texture2D(texture, v_Uv);

            if(pixel[0] == 0.0) {
               discard;
            }
            else {
               vec3 color1 = vec3(0.0, 0.0, 1.0);
               vec3 color2 = vec3(1.0, 0.0, 0.0);
               float Z = pos.z;
               float tempMaxZ = maxZ1;
               tempMaxZ = tempMaxZ - minZ1;
               Z = Z - minZ1;
               float mixVaue = Z / tempMaxZ;
               vec3 color0 = mix(color1, color2, mixVaue * 2.0);

               gl_FragColor = vec4(color0, 1.0);
            }
         }
      `,
      uniforms: {
         'maxZ1': {type: 'f', value: maxZ},
         'minZ1': {type: 'f', value: minZ},
         'texture': {value: texture}
      },
      side: THREE.DoubleSide,
      // wireframe: true,
   });

   // planeMaterial = new THREE.MeshBasicMaterial({
   //    map: texture
   // });

   let planeMesh = new THREE.Mesh(palneGeometry, planeMaterial);
   group.add(planeMesh);

   // ************************

   loop();

   function loop() {
      requestAnimationFrame(loop);
      // scene.rotation.y += 0.01;
      orbitControl.update();
      renderer.render(scene, camera);
      // renderer.render(geoScene, camera);
   }
}

function getSize(size) {
   return Number(size.replace('px', ''));
}


