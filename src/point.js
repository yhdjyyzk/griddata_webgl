//定义点类
function Point(X, Y) {
   this.X = X;
   this.Y = Y;
}

Point.prototype = {

   constructor: Point,

   standPoints: [[1, 50, 10], [30, 30, 40], [25, 25, 50], [50, 50, 10], [1, 1, 10]],//标准点坐标，为了演示先写进去

   getdisArr: function () {
      var disArr = new Array();// 存放点到标准点距离

      for(var i = 0, len = this.standPoints.length; i < len; i++) {
         var dis = Math.sqrt(Math.pow(this.standPoints[i][0] - this.X, 2) + Math.pow(this.standPoints[i][1] - this.Y, 2));
         disArr.push(dis);
      }

      return disArr;
   },

   getDenominator: function (disArr) {
      var Denominator = 0;  //保留分母

      for(var i = 0, len = disArr.length; i < len; i++) {
         Denominator += Math.pow((1 / disArr[i]), 2);
      }

      return Denominator;

   },

   getWeigArr: function (disArr, Denominator) {
      var weigArr = new Array();
      for(var i = 0, len = this.standPoints.length; i < len; i++) {
         var wei = Math.pow((1 / disArr[i]), 2) / Denominator;
         weigArr.push(wei);
      }

      return weigArr;
   },

   getZValue: function () {
      var disArr = this.getdisArr();//获取距离数组

      var Denominator = this.getDenominator(disArr);//获取分母

      var weigArr = this.getWeigArr(disArr, Denominator);//获取权重数组

      var zValue = 0;

      for(var i = 0, len = weigArr.length; i < len; i++) {
         zValue += this.standPoints[i][2] * weigArr[i];
      }
      // console.log(zValue);
      return zValue;
   },

}

export default Point;