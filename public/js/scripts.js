/*
 * anime.js v3.1.0
 * (c) 2019 Julian Garnier
 * Released under the MIT license
 * animejs.com
 */

'use strict';

// Defaults

var defaultInstanceSettings = {
  update: null,
  begin: null,
  loopBegin: null,
  changeBegin: null,
  change: null,
  changeComplete: null,
  loopComplete: null,
  complete: null,
  loop: 1,
  direction: 'normal',
  autoplay: true,
  timelineOffset: 0
};

var defaultTweenSettings = {
  duration: 1000,
  delay: 0,
  endDelay: 0,
  easing: 'easeOutElastic(1, .5)',
  round: 0
};

var validTransforms = ['translateX', 'translateY', 'translateZ', 'rotate', 'rotateX', 'rotateY', 'rotateZ', 'scale', 'scaleX', 'scaleY', 'scaleZ', 'skew', 'skewX', 'skewY', 'perspective'];

// Caching

var cache = {
  CSS: {},
  springs: {}
};

// Utils

function minMax(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

function stringContains(str, text) {
  return str.indexOf(text) > -1;
}

function applyArguments(func, args) {
  return func.apply(null, args);
}

var is = {
  arr: function (a) { return Array.isArray(a); },
  obj: function (a) { return stringContains(Object.prototype.toString.call(a), 'Object'); },
  pth: function (a) { return is.obj(a) && a.hasOwnProperty('totalLength'); },
  svg: function (a) { return a instanceof SVGElement; },
  inp: function (a) { return a instanceof HTMLInputElement; },
  dom: function (a) { return a.nodeType || is.svg(a); },
  str: function (a) { return typeof a === 'string'; },
  fnc: function (a) { return typeof a === 'function'; },
  und: function (a) { return typeof a === 'undefined'; },
  hex: function (a) { return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(a); },
  rgb: function (a) { return /^rgb/.test(a); },
  hsl: function (a) { return /^hsl/.test(a); },
  col: function (a) { return (is.hex(a) || is.rgb(a) || is.hsl(a)); },
  key: function (a) { return !defaultInstanceSettings.hasOwnProperty(a) && !defaultTweenSettings.hasOwnProperty(a) && a !== 'targets' && a !== 'keyframes'; }
};

// Easings

function parseEasingParameters(string) {
  var match = /\(([^)]+)\)/.exec(string);
  return match ? match[1].split(',').map(function (p) { return parseFloat(p); }) : [];
}

// Spring solver inspired by Webkit Copyright © 2016 Apple Inc. All rights reserved. https://webkit.org/demos/spring/spring.js

function spring(string, duration) {

  var params = parseEasingParameters(string);
  var mass = minMax(is.und(params[0]) ? 1 : params[0], .1, 100);
  var stiffness = minMax(is.und(params[1]) ? 100 : params[1], .1, 100);
  var damping = minMax(is.und(params[2]) ? 10 : params[2], .1, 100);
  var velocity =  minMax(is.und(params[3]) ? 0 : params[3], .1, 100);
  var w0 = Math.sqrt(stiffness / mass);
  var zeta = damping / (2 * Math.sqrt(stiffness * mass));
  var wd = zeta < 1 ? w0 * Math.sqrt(1 - zeta * zeta) : 0;
  var a = 1;
  var b = zeta < 1 ? (zeta * w0 + -velocity) / wd : -velocity + w0;

  function solver(t) {
    var progress = duration ? (duration * t) / 1000 : t;
    if (zeta < 1) {
      progress = Math.exp(-progress * zeta * w0) * (a * Math.cos(wd * progress) + b * Math.sin(wd * progress));
    } else {
      progress = (a + b * progress) * Math.exp(-progress * w0);
    }
    if (t === 0 || t === 1) { return t; }
    return 1 - progress;
  }

  function getDuration() {
    var cached = cache.springs[string];
    if (cached) { return cached; }
    var frame = 1/6;
    var elapsed = 0;
    var rest = 0;
    while(true) {
      elapsed += frame;
      if (solver(elapsed) === 1) {
        rest++;
        if (rest >= 16) { break; }
      } else {
        rest = 0;
      }
    }
    var duration = elapsed * frame * 1000;
    cache.springs[string] = duration;
    return duration;
  }

  return duration ? solver : getDuration;

}

// Basic steps easing implementation https://developer.mozilla.org/fr/docs/Web/CSS/transition-timing-function

function steps(steps) {
  if ( steps === void 0 ) steps = 10;

  return function (t) { return Math.round(t * steps) * (1 / steps); };
}

// BezierEasing https://github.com/gre/bezier-easing

var bezier = (function () {

  var kSplineTableSize = 11;
  var kSampleStepSize = 1.0 / (kSplineTableSize - 1.0);

  function A(aA1, aA2) { return 1.0 - 3.0 * aA2 + 3.0 * aA1 }
  function B(aA1, aA2) { return 3.0 * aA2 - 6.0 * aA1 }
  function C(aA1)      { return 3.0 * aA1 }

  function calcBezier(aT, aA1, aA2) { return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT }
  function getSlope(aT, aA1, aA2) { return 3.0 * A(aA1, aA2) * aT * aT + 2.0 * B(aA1, aA2) * aT + C(aA1) }

  function binarySubdivide(aX, aA, aB, mX1, mX2) {
    var currentX, currentT, i = 0;
    do {
      currentT = aA + (aB - aA) / 2.0;
      currentX = calcBezier(currentT, mX1, mX2) - aX;
      if (currentX > 0.0) { aB = currentT; } else { aA = currentT; }
    } while (Math.abs(currentX) > 0.0000001 && ++i < 10);
    return currentT;
  }

  function newtonRaphsonIterate(aX, aGuessT, mX1, mX2) {
    for (var i = 0; i < 4; ++i) {
      var currentSlope = getSlope(aGuessT, mX1, mX2);
      if (currentSlope === 0.0) { return aGuessT; }
      var currentX = calcBezier(aGuessT, mX1, mX2) - aX;
      aGuessT -= currentX / currentSlope;
    }
    return aGuessT;
  }

  function bezier(mX1, mY1, mX2, mY2) {

    if (!(0 <= mX1 && mX1 <= 1 && 0 <= mX2 && mX2 <= 1)) { return; }
    var sampleValues = new Float32Array(kSplineTableSize);

    if (mX1 !== mY1 || mX2 !== mY2) {
      for (var i = 0; i < kSplineTableSize; ++i) {
        sampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
      }
    }

    function getTForX(aX) {

      var intervalStart = 0;
      var currentSample = 1;
      var lastSample = kSplineTableSize - 1;

      for (; currentSample !== lastSample && sampleValues[currentSample] <= aX; ++currentSample) {
        intervalStart += kSampleStepSize;
      }

      --currentSample;

      var dist = (aX - sampleValues[currentSample]) / (sampleValues[currentSample + 1] - sampleValues[currentSample]);
      var guessForT = intervalStart + dist * kSampleStepSize;
      var initialSlope = getSlope(guessForT, mX1, mX2);

      if (initialSlope >= 0.001) {
        return newtonRaphsonIterate(aX, guessForT, mX1, mX2);
      } else if (initialSlope === 0.0) {
        return guessForT;
      } else {
        return binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize, mX1, mX2);
      }

    }

    return function (x) {
      if (mX1 === mY1 && mX2 === mY2) { return x; }
      if (x === 0 || x === 1) { return x; }
      return calcBezier(getTForX(x), mY1, mY2);
    }

  }

  return bezier;

})();

var penner = (function () {

  // Based on jQuery UI's implemenation of easing equations from Robert Penner (http://www.robertpenner.com/easing)

  var eases = { linear: function () { return function (t) { return t; }; } };

  var functionEasings = {
    Sine: function () { return function (t) { return 1 - Math.cos(t * Math.PI / 2); }; },
    Circ: function () { return function (t) { return 1 - Math.sqrt(1 - t * t); }; },
    Back: function () { return function (t) { return t * t * (3 * t - 2); }; },
    Bounce: function () { return function (t) {
      var pow2, b = 4;
      while (t < (( pow2 = Math.pow(2, --b)) - 1) / 11) {}
      return 1 / Math.pow(4, 3 - b) - 7.5625 * Math.pow(( pow2 * 3 - 2 ) / 22 - t, 2)
    }; },
    Elastic: function (amplitude, period) {
      if ( amplitude === void 0 ) amplitude = 1;
      if ( period === void 0 ) period = .5;

      var a = minMax(amplitude, 1, 10);
      var p = minMax(period, .1, 2);
      return function (t) {
        return (t === 0 || t === 1) ? t : 
          -a * Math.pow(2, 10 * (t - 1)) * Math.sin((((t - 1) - (p / (Math.PI * 2) * Math.asin(1 / a))) * (Math.PI * 2)) / p);
      }
    }
  };

  var baseEasings = ['Quad', 'Cubic', 'Quart', 'Quint', 'Expo'];

  baseEasings.forEach(function (name, i) {
    functionEasings[name] = function () { return function (t) { return Math.pow(t, i + 2); }; };
  });

  Object.keys(functionEasings).forEach(function (name) {
    var easeIn = functionEasings[name];
    eases['easeIn' + name] = easeIn;
    eases['easeOut' + name] = function (a, b) { return function (t) { return 1 - easeIn(a, b)(1 - t); }; };
    eases['easeInOut' + name] = function (a, b) { return function (t) { return t < 0.5 ? easeIn(a, b)(t * 2) / 2 : 
      1 - easeIn(a, b)(t * -2 + 2) / 2; }; };
  });

  return eases;

})();

function parseEasings(easing, duration) {
  if (is.fnc(easing)) { return easing; }
  var name = easing.split('(')[0];
  var ease = penner[name];
  var args = parseEasingParameters(easing);
  switch (name) {
    case 'spring' : return spring(easing, duration);
    case 'cubicBezier' : return applyArguments(bezier, args);
    case 'steps' : return applyArguments(steps, args);
    default : return applyArguments(ease, args);
  }
}

// Strings

function selectString(str) {
  try {
    var nodes = document.querySelectorAll(str);
    return nodes;
  } catch(e) {
    return;
  }
}

// Arrays

function filterArray(arr, callback) {
  var len = arr.length;
  var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
  var result = [];
  for (var i = 0; i < len; i++) {
    if (i in arr) {
      var val = arr[i];
      if (callback.call(thisArg, val, i, arr)) {
        result.push(val);
      }
    }
  }
  return result;
}

function flattenArray(arr) {
  return arr.reduce(function (a, b) { return a.concat(is.arr(b) ? flattenArray(b) : b); }, []);
}

function toArray(o) {
  if (is.arr(o)) { return o; }
  if (is.str(o)) { o = selectString(o) || o; }
  if (o instanceof NodeList || o instanceof HTMLCollection) { return [].slice.call(o); }
  return [o];
}

function arrayContains(arr, val) {
  return arr.some(function (a) { return a === val; });
}

// Objects

function cloneObject(o) {
  var clone = {};
  for (var p in o) { clone[p] = o[p]; }
  return clone;
}

function replaceObjectProps(o1, o2) {
  var o = cloneObject(o1);
  for (var p in o1) { o[p] = o2.hasOwnProperty(p) ? o2[p] : o1[p]; }
  return o;
}

function mergeObjects(o1, o2) {
  var o = cloneObject(o1);
  for (var p in o2) { o[p] = is.und(o1[p]) ? o2[p] : o1[p]; }
  return o;
}

// Colors

function rgbToRgba(rgbValue) {
  var rgb = /rgb\((\d+,\s*[\d]+,\s*[\d]+)\)/g.exec(rgbValue);
  return rgb ? ("rgba(" + (rgb[1]) + ",1)") : rgbValue;
}

function hexToRgba(hexValue) {
  var rgx = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  var hex = hexValue.replace(rgx, function (m, r, g, b) { return r + r + g + g + b + b; } );
  var rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  var r = parseInt(rgb[1], 16);
  var g = parseInt(rgb[2], 16);
  var b = parseInt(rgb[3], 16);
  return ("rgba(" + r + "," + g + "," + b + ",1)");
}

function hslToRgba(hslValue) {
  var hsl = /hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/g.exec(hslValue) || /hsla\((\d+),\s*([\d.]+)%,\s*([\d.]+)%,\s*([\d.]+)\)/g.exec(hslValue);
  var h = parseInt(hsl[1], 10) / 360;
  var s = parseInt(hsl[2], 10) / 100;
  var l = parseInt(hsl[3], 10) / 100;
  var a = hsl[4] || 1;
  function hue2rgb(p, q, t) {
    if (t < 0) { t += 1; }
    if (t > 1) { t -= 1; }
    if (t < 1/6) { return p + (q - p) * 6 * t; }
    if (t < 1/2) { return q; }
    if (t < 2/3) { return p + (q - p) * (2/3 - t) * 6; }
    return p;
  }
  var r, g, b;
  if (s == 0) {
    r = g = b = l;
  } else {
    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return ("rgba(" + (r * 255) + "," + (g * 255) + "," + (b * 255) + "," + a + ")");
}

function colorToRgb(val) {
  if (is.rgb(val)) { return rgbToRgba(val); }
  if (is.hex(val)) { return hexToRgba(val); }
  if (is.hsl(val)) { return hslToRgba(val); }
}

// Units

function getUnit(val) {
  var split = /[+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?(%|px|pt|em|rem|in|cm|mm|ex|ch|pc|vw|vh|vmin|vmax|deg|rad|turn)?$/.exec(val);
  if (split) { return split[1]; }
}

function getTransformUnit(propName) {
  if (stringContains(propName, 'translate') || propName === 'perspective') { return 'px'; }
  if (stringContains(propName, 'rotate') || stringContains(propName, 'skew')) { return 'deg'; }
}

// Values

function getFunctionValue(val, animatable) {
  if (!is.fnc(val)) { return val; }
  return val(animatable.target, animatable.id, animatable.total);
}

function getAttribute(el, prop) {
  return el.getAttribute(prop);
}

function convertPxToUnit(el, value, unit) {
  var valueUnit = getUnit(value);
  if (arrayContains([unit, 'deg', 'rad', 'turn'], valueUnit)) { return value; }
  var cached = cache.CSS[value + unit];
  if (!is.und(cached)) { return cached; }
  var baseline = 100;
  var tempEl = document.createElement(el.tagName);
  var parentEl = (el.parentNode && (el.parentNode !== document)) ? el.parentNode : document.body;
  parentEl.appendChild(tempEl);
  tempEl.style.position = 'absolute';
  tempEl.style.width = baseline + unit;
  var factor = baseline / tempEl.offsetWidth;
  parentEl.removeChild(tempEl);
  var convertedUnit = factor * parseFloat(value);
  cache.CSS[value + unit] = convertedUnit;
  return convertedUnit;
}

function getCSSValue(el, prop, unit) {
  if (prop in el.style) {
    var uppercasePropName = prop.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    var value = el.style[prop] || getComputedStyle(el).getPropertyValue(uppercasePropName) || '0';
    return unit ? convertPxToUnit(el, value, unit) : value;
  }
}

function getAnimationType(el, prop) {
  if (is.dom(el) && !is.inp(el) && (getAttribute(el, prop) || (is.svg(el) && el[prop]))) { return 'attribute'; }
  if (is.dom(el) && arrayContains(validTransforms, prop)) { return 'transform'; }
  if (is.dom(el) && (prop !== 'transform' && getCSSValue(el, prop))) { return 'css'; }
  if (el[prop] != null) { return 'object'; }
}

function getElementTransforms(el) {
  if (!is.dom(el)) { return; }
  var str = el.style.transform || '';
  var reg  = /(\w+)\(([^)]*)\)/g;
  var transforms = new Map();
  var m; while (m = reg.exec(str)) { transforms.set(m[1], m[2]); }
  return transforms;
}

function getTransformValue(el, propName, animatable, unit) {
  var defaultVal = stringContains(propName, 'scale') ? 1 : 0 + getTransformUnit(propName);
  var value = getElementTransforms(el).get(propName) || defaultVal;
  if (animatable) {
    animatable.transforms.list.set(propName, value);
    animatable.transforms['last'] = propName;
  }
  return unit ? convertPxToUnit(el, value, unit) : value;
}

function getOriginalTargetValue(target, propName, unit, animatable) {
  switch (getAnimationType(target, propName)) {
    case 'transform': return getTransformValue(target, propName, animatable, unit);
    case 'css': return getCSSValue(target, propName, unit);
    case 'attribute': return getAttribute(target, propName);
    default: return target[propName] || 0;
  }
}

function getRelativeValue(to, from) {
  var operator = /^(\*=|\+=|-=)/.exec(to);
  if (!operator) { return to; }
  var u = getUnit(to) || 0;
  var x = parseFloat(from);
  var y = parseFloat(to.replace(operator[0], ''));
  switch (operator[0][0]) {
    case '+': return x + y + u;
    case '-': return x - y + u;
    case '*': return x * y + u;
  }
}

function validateValue(val, unit) {
  if (is.col(val)) { return colorToRgb(val); }
  if (/\s/g.test(val)) { return val; }
  var originalUnit = getUnit(val);
  var unitLess = originalUnit ? val.substr(0, val.length - originalUnit.length) : val;
  if (unit) { return unitLess + unit; }
  return unitLess;
}

// getTotalLength() equivalent for circle, rect, polyline, polygon and line shapes
// adapted from https://gist.github.com/SebLambla/3e0550c496c236709744

function getDistance(p1, p2) {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

function getCircleLength(el) {
  return Math.PI * 2 * getAttribute(el, 'r');
}

function getRectLength(el) {
  return (getAttribute(el, 'width') * 2) + (getAttribute(el, 'height') * 2);
}

function getLineLength(el) {
  return getDistance(
    {x: getAttribute(el, 'x1'), y: getAttribute(el, 'y1')}, 
    {x: getAttribute(el, 'x2'), y: getAttribute(el, 'y2')}
  );
}

function getPolylineLength(el) {
  var points = el.points;
  var totalLength = 0;
  var previousPos;
  for (var i = 0 ; i < points.numberOfItems; i++) {
    var currentPos = points.getItem(i);
    if (i > 0) { totalLength += getDistance(previousPos, currentPos); }
    previousPos = currentPos;
  }
  return totalLength;
}

function getPolygonLength(el) {
  var points = el.points;
  return getPolylineLength(el) + getDistance(points.getItem(points.numberOfItems - 1), points.getItem(0));
}

// Path animation

function getTotalLength(el) {
  if (el.getTotalLength) { return el.getTotalLength(); }
  switch(el.tagName.toLowerCase()) {
    case 'circle': return getCircleLength(el);
    case 'rect': return getRectLength(el);
    case 'line': return getLineLength(el);
    case 'polyline': return getPolylineLength(el);
    case 'polygon': return getPolygonLength(el);
  }
}

function setDashoffset(el) {
  var pathLength = getTotalLength(el);
  el.setAttribute('stroke-dasharray', pathLength);
  return pathLength;
}

// Motion path

function getParentSvgEl(el) {
  var parentEl = el.parentNode;
  while (is.svg(parentEl)) {
    if (!is.svg(parentEl.parentNode)) { break; }
    parentEl = parentEl.parentNode;
  }
  return parentEl;
}

function getParentSvg(pathEl, svgData) {
  var svg = svgData || {};
  var parentSvgEl = svg.el || getParentSvgEl(pathEl);
  var rect = parentSvgEl.getBoundingClientRect();
  var viewBoxAttr = getAttribute(parentSvgEl, 'viewBox');
  var width = rect.width;
  var height = rect.height;
  var viewBox = svg.viewBox || (viewBoxAttr ? viewBoxAttr.split(' ') : [0, 0, width, height]);
  return {
    el: parentSvgEl,
    viewBox: viewBox,
    x: viewBox[0] / 1,
    y: viewBox[1] / 1,
    w: width / viewBox[2],
    h: height / viewBox[3]
  }
}

function getPath(path, percent) {
  var pathEl = is.str(path) ? selectString(path)[0] : path;
  var p = percent || 100;
  return function(property) {
    return {
      property: property,
      el: pathEl,
      svg: getParentSvg(pathEl),
      totalLength: getTotalLength(pathEl) * (p / 100)
    }
  }
}

function getPathProgress(path, progress) {
  function point(offset) {
    if ( offset === void 0 ) offset = 0;

    var l = progress + offset >= 1 ? progress + offset : 0;
    return path.el.getPointAtLength(l);
  }
  var svg = getParentSvg(path.el, path.svg);
  var p = point();
  var p0 = point(-1);
  var p1 = point(+1);
  switch (path.property) {
    case 'x': return (p.x - svg.x) * svg.w;
    case 'y': return (p.y - svg.y) * svg.h;
    case 'angle': return Math.atan2(p1.y - p0.y, p1.x - p0.x) * 180 / Math.PI;
  }
}

// Decompose value

function decomposeValue(val, unit) {
  // const rgx = /-?\d*\.?\d+/g; // handles basic numbers
  // const rgx = /[+-]?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g; // handles exponents notation
  var rgx = /[+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g; // handles exponents notation
  var value = validateValue((is.pth(val) ? val.totalLength : val), unit) + '';
  return {
    original: value,
    numbers: value.match(rgx) ? value.match(rgx).map(Number) : [0],
    strings: (is.str(val) || unit) ? value.split(rgx) : []
  }
}

// Animatables

function parseTargets(targets) {
  var targetsArray = targets ? (flattenArray(is.arr(targets) ? targets.map(toArray) : toArray(targets))) : [];
  return filterArray(targetsArray, function (item, pos, self) { return self.indexOf(item) === pos; });
}

function getAnimatables(targets) {
  var parsed = parseTargets(targets);
  return parsed.map(function (t, i) {
    return {target: t, id: i, total: parsed.length, transforms: { list: getElementTransforms(t) } };
  });
}

// Properties

function normalizePropertyTweens(prop, tweenSettings) {
  var settings = cloneObject(tweenSettings);
  // Override duration if easing is a spring
  if (/^spring/.test(settings.easing)) { settings.duration = spring(settings.easing); }
  if (is.arr(prop)) {
    var l = prop.length;
    var isFromTo = (l === 2 && !is.obj(prop[0]));
    if (!isFromTo) {
      // Duration divided by the number of tweens
      if (!is.fnc(tweenSettings.duration)) { settings.duration = tweenSettings.duration / l; }
    } else {
      // Transform [from, to] values shorthand to a valid tween value
      prop = {value: prop};
    }
  }
  var propArray = is.arr(prop) ? prop : [prop];
  return propArray.map(function (v, i) {
    var obj = (is.obj(v) && !is.pth(v)) ? v : {value: v};
    // Default delay value should only be applied to the first tween
    if (is.und(obj.delay)) { obj.delay = !i ? tweenSettings.delay : 0; }
    // Default endDelay value should only be applied to the last tween
    if (is.und(obj.endDelay)) { obj.endDelay = i === propArray.length - 1 ? tweenSettings.endDelay : 0; }
    return obj;
  }).map(function (k) { return mergeObjects(k, settings); });
}


function flattenKeyframes(keyframes) {
  var propertyNames = filterArray(flattenArray(keyframes.map(function (key) { return Object.keys(key); })), function (p) { return is.key(p); })
  .reduce(function (a,b) { if (a.indexOf(b) < 0) { a.push(b); } return a; }, []);
  var properties = {};
  var loop = function ( i ) {
    var propName = propertyNames[i];
    properties[propName] = keyframes.map(function (key) {
      var newKey = {};
      for (var p in key) {
        if (is.key(p)) {
          if (p == propName) { newKey.value = key[p]; }
        } else {
          newKey[p] = key[p];
        }
      }
      return newKey;
    });
  };

  for (var i = 0; i < propertyNames.length; i++) loop( i );
  return properties;
}

function getProperties(tweenSettings, params) {
  var properties = [];
  var keyframes = params.keyframes;
  if (keyframes) { params = mergeObjects(flattenKeyframes(keyframes), params); }
  for (var p in params) {
    if (is.key(p)) {
      properties.push({
        name: p,
        tweens: normalizePropertyTweens(params[p], tweenSettings)
      });
    }
  }
  return properties;
}

// Tweens

function normalizeTweenValues(tween, animatable) {
  var t = {};
  for (var p in tween) {
    var value = getFunctionValue(tween[p], animatable);
    if (is.arr(value)) {
      value = value.map(function (v) { return getFunctionValue(v, animatable); });
      if (value.length === 1) { value = value[0]; }
    }
    t[p] = value;
  }
  t.duration = parseFloat(t.duration);
  t.delay = parseFloat(t.delay);
  return t;
}

function normalizeTweens(prop, animatable) {
  var previousTween;
  return prop.tweens.map(function (t) {
    var tween = normalizeTweenValues(t, animatable);
    var tweenValue = tween.value;
    var to = is.arr(tweenValue) ? tweenValue[1] : tweenValue;
    var toUnit = getUnit(to);
    var originalValue = getOriginalTargetValue(animatable.target, prop.name, toUnit, animatable);
    var previousValue = previousTween ? previousTween.to.original : originalValue;
    var from = is.arr(tweenValue) ? tweenValue[0] : previousValue;
    var fromUnit = getUnit(from) || getUnit(originalValue);
    var unit = toUnit || fromUnit;
    if (is.und(to)) { to = previousValue; }
    tween.from = decomposeValue(from, unit);
    tween.to = decomposeValue(getRelativeValue(to, from), unit);
    tween.start = previousTween ? previousTween.end : 0;
    tween.end = tween.start + tween.delay + tween.duration + tween.endDelay;
    tween.easing = parseEasings(tween.easing, tween.duration);
    tween.isPath = is.pth(tweenValue);
    tween.isColor = is.col(tween.from.original);
    if (tween.isColor) { tween.round = 1; }
    previousTween = tween;
    return tween;
  });
}

// Tween progress

var setProgressValue = {
  css: function (t, p, v) { return t.style[p] = v; },
  attribute: function (t, p, v) { return t.setAttribute(p, v); },
  object: function (t, p, v) { return t[p] = v; },
  transform: function (t, p, v, transforms, manual) {
    transforms.list.set(p, v);
    if (p === transforms.last || manual) {
      var str = '';
      transforms.list.forEach(function (value, prop) { str += prop + "(" + value + ") "; });
      t.style.transform = str;
    }
  }
};

// Set Value helper

function setTargetsValue(targets, properties) {
  var animatables = getAnimatables(targets);
  animatables.forEach(function (animatable) {
    for (var property in properties) {
      var value = getFunctionValue(properties[property], animatable);
      var target = animatable.target;
      var valueUnit = getUnit(value);
      var originalValue = getOriginalTargetValue(target, property, valueUnit, animatable);
      var unit = valueUnit || getUnit(originalValue);
      var to = getRelativeValue(validateValue(value, unit), originalValue);
      var animType = getAnimationType(target, property);
      setProgressValue[animType](target, property, to, animatable.transforms, true);
    }
  });
}

// Animations

function createAnimation(animatable, prop) {
  var animType = getAnimationType(animatable.target, prop.name);
  if (animType) {
    var tweens = normalizeTweens(prop, animatable);
    var lastTween = tweens[tweens.length - 1];
    return {
      type: animType,
      property: prop.name,
      animatable: animatable,
      tweens: tweens,
      duration: lastTween.end,
      delay: tweens[0].delay,
      endDelay: lastTween.endDelay
    }
  }
}

function getAnimations(animatables, properties) {
  return filterArray(flattenArray(animatables.map(function (animatable) {
    return properties.map(function (prop) {
      return createAnimation(animatable, prop);
    });
  })), function (a) { return !is.und(a); });
}

// Create Instance

function getInstanceTimings(animations, tweenSettings) {
  var animLength = animations.length;
  var getTlOffset = function (anim) { return anim.timelineOffset ? anim.timelineOffset : 0; };
  var timings = {};
  timings.duration = animLength ? Math.max.apply(Math, animations.map(function (anim) { return getTlOffset(anim) + anim.duration; })) : tweenSettings.duration;
  timings.delay = animLength ? Math.min.apply(Math, animations.map(function (anim) { return getTlOffset(anim) + anim.delay; })) : tweenSettings.delay;
  timings.endDelay = animLength ? timings.duration - Math.max.apply(Math, animations.map(function (anim) { return getTlOffset(anim) + anim.duration - anim.endDelay; })) : tweenSettings.endDelay;
  return timings;
}

var instanceID = 0;

function createNewInstance(params) {
  var instanceSettings = replaceObjectProps(defaultInstanceSettings, params);
  var tweenSettings = replaceObjectProps(defaultTweenSettings, params);
  var properties = getProperties(tweenSettings, params);
  var animatables = getAnimatables(params.targets);
  var animations = getAnimations(animatables, properties);
  var timings = getInstanceTimings(animations, tweenSettings);
  var id = instanceID;
  instanceID++;
  return mergeObjects(instanceSettings, {
    id: id,
    children: [],
    animatables: animatables,
    animations: animations,
    duration: timings.duration,
    delay: timings.delay,
    endDelay: timings.endDelay
  });
}

// Core

var activeInstances = [];
var pausedInstances = [];
var raf;

var engine = (function () {
  function play() { 
    raf = requestAnimationFrame(step);
  }
  function step(t) {
    var activeInstancesLength = activeInstances.length;
    if (activeInstancesLength) {
      var i = 0;
      while (i < activeInstancesLength) {
        var activeInstance = activeInstances[i];
        if (!activeInstance.paused) {
          activeInstance.tick(t);
        } else {
          var instanceIndex = activeInstances.indexOf(activeInstance);
          if (instanceIndex > -1) {
            activeInstances.splice(instanceIndex, 1);
            activeInstancesLength = activeInstances.length;
          }
        }
        i++;
      }
      play();
    } else {
      raf = cancelAnimationFrame(raf);
    }
  }
  return play;
})();

function handleVisibilityChange() {
  if (document.hidden) {
    activeInstances.forEach(function (ins) { return ins.pause(); });
    pausedInstances = activeInstances.slice(0);
    anime.running = activeInstances = [];
  } else {
    pausedInstances.forEach(function (ins) { return ins.play(); });
  }
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', handleVisibilityChange);
}

// Public Instance

function anime(params) {
  if ( params === void 0 ) params = {};


  var startTime = 0, lastTime = 0, now = 0;
  var children, childrenLength = 0;
  var resolve = null;

  function makePromise(instance) {
    var promise = window.Promise && new Promise(function (_resolve) { return resolve = _resolve; });
    instance.finished = promise;
    return promise;
  }

  var instance = createNewInstance(params);
  var promise = makePromise(instance);

  function toggleInstanceDirection() {
    var direction = instance.direction;
    if (direction !== 'alternate') {
      instance.direction = direction !== 'normal' ? 'normal' : 'reverse';
    }
    instance.reversed = !instance.reversed;
    children.forEach(function (child) { return child.reversed = instance.reversed; });
  }

  function adjustTime(time) {
    return instance.reversed ? instance.duration - time : time;
  }

  function resetTime() {
    startTime = 0;
    lastTime = adjustTime(instance.currentTime) * (1 / anime.speed);
  }

  function seekChild(time, child) {
    if (child) { child.seek(time - child.timelineOffset); }
  }

  function syncInstanceChildren(time) {
    if (!instance.reversePlayback) {
      for (var i = 0; i < childrenLength; i++) { seekChild(time, children[i]); }
    } else {
      for (var i$1 = childrenLength; i$1--;) { seekChild(time, children[i$1]); }
    }
  }

  function setAnimationsProgress(insTime) {
    var i = 0;
    var animations = instance.animations;
    var animationsLength = animations.length;
    while (i < animationsLength) {
      var anim = animations[i];
      var animatable = anim.animatable;
      var tweens = anim.tweens;
      var tweenLength = tweens.length - 1;
      var tween = tweens[tweenLength];
      // Only check for keyframes if there is more than one tween
      if (tweenLength) { tween = filterArray(tweens, function (t) { return (insTime < t.end); })[0] || tween; }
      var elapsed = minMax(insTime - tween.start - tween.delay, 0, tween.duration) / tween.duration;
      var eased = isNaN(elapsed) ? 1 : tween.easing(elapsed);
      var strings = tween.to.strings;
      var round = tween.round;
      var numbers = [];
      var toNumbersLength = tween.to.numbers.length;
      var progress = (void 0);
      for (var n = 0; n < toNumbersLength; n++) {
        var value = (void 0);
        var toNumber = tween.to.numbers[n];
        var fromNumber = tween.from.numbers[n] || 0;
        if (!tween.isPath) {
          value = fromNumber + (eased * (toNumber - fromNumber));
        } else {
          value = getPathProgress(tween.value, eased * toNumber);
        }
        if (round) {
          if (!(tween.isColor && n > 2)) {
            value = Math.round(value * round) / round;
          }
        }
        numbers.push(value);
      }
      // Manual Array.reduce for better performances
      var stringsLength = strings.length;
      if (!stringsLength) {
        progress = numbers[0];
      } else {
        progress = strings[0];
        for (var s = 0; s < stringsLength; s++) {
          var a = strings[s];
          var b = strings[s + 1];
          var n$1 = numbers[s];
          if (!isNaN(n$1)) {
            if (!b) {
              progress += n$1 + ' ';
            } else {
              progress += n$1 + b;
            }
          }
        }
      }
      setProgressValue[anim.type](animatable.target, anim.property, progress, animatable.transforms);
      anim.currentValue = progress;
      i++;
    }
  }

  function setCallback(cb) {
    if (instance[cb] && !instance.passThrough) { instance[cb](instance); }
  }

  function countIteration() {
    if (instance.remaining && instance.remaining !== true) {
      instance.remaining--;
    }
  }

  function setInstanceProgress(engineTime) {
    var insDuration = instance.duration;
    var insDelay = instance.delay;
    var insEndDelay = insDuration - instance.endDelay;
    var insTime = adjustTime(engineTime);
    instance.progress = minMax((insTime / insDuration) * 100, 0, 100);
    instance.reversePlayback = insTime < instance.currentTime;
    if (children) { syncInstanceChildren(insTime); }
    if (!instance.began && instance.currentTime > 0) {
      instance.began = true;
      setCallback('begin');
    }
    if (!instance.loopBegan && instance.currentTime > 0) {
      instance.loopBegan = true;
      setCallback('loopBegin');
    }
    if (insTime <= insDelay && instance.currentTime !== 0) {
      setAnimationsProgress(0);
    }
    if ((insTime >= insEndDelay && instance.currentTime !== insDuration) || !insDuration) {
      setAnimationsProgress(insDuration);
    }
    if (insTime > insDelay && insTime < insEndDelay) {
      if (!instance.changeBegan) {
        instance.changeBegan = true;
        instance.changeCompleted = false;
        setCallback('changeBegin');
      }
      setCallback('change');
      setAnimationsProgress(insTime);
    } else {
      if (instance.changeBegan) {
        instance.changeCompleted = true;
        instance.changeBegan = false;
        setCallback('changeComplete');
      }
    }
    instance.currentTime = minMax(insTime, 0, insDuration);
    if (instance.began) { setCallback('update'); }
    if (engineTime >= insDuration) {
      lastTime = 0;
      countIteration();
      if (!instance.remaining) {
        instance.paused = true;
        if (!instance.completed) {
          instance.completed = true;
          setCallback('loopComplete');
          setCallback('complete');
          if (!instance.passThrough && 'Promise' in window) {
            resolve();
            promise = makePromise(instance);
          }
        }
      } else {
        startTime = now;
        setCallback('loopComplete');
        instance.loopBegan = false;
        if (instance.direction === 'alternate') {
          toggleInstanceDirection();
        }
      }
    }
  }

  instance.reset = function() {
    var direction = instance.direction;
    instance.passThrough = false;
    instance.currentTime = 0;
    instance.progress = 0;
    instance.paused = true;
    instance.began = false;
    instance.loopBegan = false;
    instance.changeBegan = false;
    instance.completed = false;
    instance.changeCompleted = false;
    instance.reversePlayback = false;
    instance.reversed = direction === 'reverse';
    instance.remaining = instance.loop;
    children = instance.children;
    childrenLength = children.length;
    for (var i = childrenLength; i--;) { instance.children[i].reset(); }
    if (instance.reversed && instance.loop !== true || (direction === 'alternate' && instance.loop === 1)) { instance.remaining++; }
    setAnimationsProgress(instance.reversed ? instance.duration : 0);
  };

  // Set Value helper

  instance.set = function(targets, properties) {
    setTargetsValue(targets, properties);
    return instance;
  };

  instance.tick = function(t) {
    now = t;
    if (!startTime) { startTime = now; }
    setInstanceProgress((now + (lastTime - startTime)) * anime.speed);
  };

  instance.seek = function(time) {
    setInstanceProgress(adjustTime(time));
  };

  instance.pause = function() {
    instance.paused = true;
    resetTime();
  };

  instance.play = function() {
    if (!instance.paused) { return; }
    if (instance.completed) { instance.reset(); }
    instance.paused = false;
    activeInstances.push(instance);
    resetTime();
    if (!raf) { engine(); }
  };

  instance.reverse = function() {
    toggleInstanceDirection();
    resetTime();
  };

  instance.restart = function() {
    instance.reset();
    instance.play();
  };

  instance.reset();

  if (instance.autoplay) { instance.play(); }

  return instance;

}

// Remove targets from animation

function removeTargetsFromAnimations(targetsArray, animations) {
  for (var a = animations.length; a--;) {
    if (arrayContains(targetsArray, animations[a].animatable.target)) {
      animations.splice(a, 1);
    }
  }
}

function removeTargets(targets) {
  var targetsArray = parseTargets(targets);
  for (var i = activeInstances.length; i--;) {
    var instance = activeInstances[i];
    var animations = instance.animations;
    var children = instance.children;
    removeTargetsFromAnimations(targetsArray, animations);
    for (var c = children.length; c--;) {
      var child = children[c];
      var childAnimations = child.animations;
      removeTargetsFromAnimations(targetsArray, childAnimations);
      if (!childAnimations.length && !child.children.length) { children.splice(c, 1); }
    }
    if (!animations.length && !children.length) { instance.pause(); }
  }
}

// Stagger helpers

function stagger(val, params) {
  if ( params === void 0 ) params = {};

  var direction = params.direction || 'normal';
  var easing = params.easing ? parseEasings(params.easing) : null;
  var grid = params.grid;
  var axis = params.axis;
  var fromIndex = params.from || 0;
  var fromFirst = fromIndex === 'first';
  var fromCenter = fromIndex === 'center';
  var fromLast = fromIndex === 'last';
  var isRange = is.arr(val);
  var val1 = isRange ? parseFloat(val[0]) : parseFloat(val);
  var val2 = isRange ? parseFloat(val[1]) : 0;
  var unit = getUnit(isRange ? val[1] : val) || 0;
  var start = params.start || 0 + (isRange ? val1 : 0);
  var values = [];
  var maxValue = 0;
  return function (el, i, t) {
    if (fromFirst) { fromIndex = 0; }
    if (fromCenter) { fromIndex = (t - 1) / 2; }
    if (fromLast) { fromIndex = t - 1; }
    if (!values.length) {
      for (var index = 0; index < t; index++) {
        if (!grid) {
          values.push(Math.abs(fromIndex - index));
        } else {
          var fromX = !fromCenter ? fromIndex%grid[0] : (grid[0]-1)/2;
          var fromY = !fromCenter ? Math.floor(fromIndex/grid[0]) : (grid[1]-1)/2;
          var toX = index%grid[0];
          var toY = Math.floor(index/grid[0]);
          var distanceX = fromX - toX;
          var distanceY = fromY - toY;
          var value = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
          if (axis === 'x') { value = -distanceX; }
          if (axis === 'y') { value = -distanceY; }
          values.push(value);
        }
        maxValue = Math.max.apply(Math, values);
      }
      if (easing) { values = values.map(function (val) { return easing(val / maxValue) * maxValue; }); }
      if (direction === 'reverse') { values = values.map(function (val) { return axis ? (val < 0) ? val * -1 : -val : Math.abs(maxValue - val); }); }
    }
    var spacing = isRange ? (val2 - val1) / maxValue : val1;
    return start + (spacing * (Math.round(values[i] * 100) / 100)) + unit;
  }
}

// Timeline

function timeline(params) {
  if ( params === void 0 ) params = {};

  var tl = anime(params);
  tl.duration = 0;
  tl.add = function(instanceParams, timelineOffset) {
    var tlIndex = activeInstances.indexOf(tl);
    var children = tl.children;
    if (tlIndex > -1) { activeInstances.splice(tlIndex, 1); }
    function passThrough(ins) { ins.passThrough = true; }
    for (var i = 0; i < children.length; i++) { passThrough(children[i]); }
    var insParams = mergeObjects(instanceParams, replaceObjectProps(defaultTweenSettings, params));
    insParams.targets = insParams.targets || params.targets;
    var tlDuration = tl.duration;
    insParams.autoplay = false;
    insParams.direction = tl.direction;
    insParams.timelineOffset = is.und(timelineOffset) ? tlDuration : getRelativeValue(timelineOffset, tlDuration);
    passThrough(tl);
    tl.seek(insParams.timelineOffset);
    var ins = anime(insParams);
    passThrough(ins);
    children.push(ins);
    var timings = getInstanceTimings(children, params);
    tl.delay = timings.delay;
    tl.endDelay = timings.endDelay;
    tl.duration = timings.duration;
    tl.seek(0);
    tl.reset();
    if (tl.autoplay) { tl.play(); }
    return tl;
  };
  return tl;
}

anime.version = '3.1.0';
anime.speed = 1;
anime.running = activeInstances;
anime.remove = removeTargets;
anime.get = getOriginalTargetValue;
anime.set = setTargetsValue;
anime.convertPx = convertPxToUnit;
anime.path = getPath;
anime.setDashoffset = setDashoffset;
anime.stagger = stagger;
anime.timeline = timeline;
anime.easing = parseEasings;
anime.penner = penner;
anime.random = function (min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; };

module.exports = anime;

/*! UIkit 3.3.6 | https://www.getuikit.com | (c) 2014 - 2020 YOOtheme | MIT License */

!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define("uikit",e):(t=t||self).UIkit=e()}(this,function(){"use strict";var t=Object.prototype,i=t.hasOwnProperty;function l(t,e){return i.call(t,e)}var e={},n=/([a-z\d])([A-Z])/g;function d(t){return t in e||(e[t]=t.replace(n,"$1-$2").toLowerCase()),e[t]}var r=/-(\w)/g;function f(t){return t.replace(r,o)}function o(t,e){return e?e.toUpperCase():""}function p(t){return t.length?o(0,t.charAt(0))+t.slice(1):""}var s=String.prototype,a=s.startsWith||function(t){return 0===this.lastIndexOf(t,0)};function w(t,e){return a.call(t,e)}var h=s.endsWith||function(t){return this.substr(-t.length)===t};function u(t,e){return h.call(t,e)}function c(t,e){return~this.indexOf(t,e)}var m=Array.prototype,g=s.includes||c,v=m.includes||c;function b(t,e){return t&&(D(t)?g:v).call(t,e)}var x=m.findIndex||function(t){for(var e=arguments,i=0;i<this.length;i++)if(t.call(e[1],this[i],i,this))return i;return-1};function y(t,e){return x.call(t,e)}var k=Array.isArray;function $(t){return"function"==typeof t}function I(t){return null!==t&&"object"==typeof t}var S=t.toString;function T(t){return"[object Object]"===S.call(t)}function E(t){return I(t)&&t===t.window}function A(t){return I(t)&&9===t.nodeType}function C(t){return I(t)&&!!t.jquery}function _(t){return I(t)&&1<=t.nodeType}function N(t){return I(t)&&1===t.nodeType}function M(t){return S.call(t).match(/^\[object (NodeList|HTMLCollection)\]$/)}function z(t){return"boolean"==typeof t}function D(t){return"string"==typeof t}function B(t){return"number"==typeof t}function P(t){return B(t)||D(t)&&!isNaN(t-parseFloat(t))}function O(t){return!(k(t)?t.length:I(t)&&Object.keys(t).length)}function H(t){return void 0===t}function L(t){return z(t)?t:"true"===t||"1"===t||""===t||"false"!==t&&"0"!==t&&t}function F(t){var e=Number(t);return!isNaN(e)&&e}function j(t){return parseFloat(t)||0}function W(t){return _(t)?t:M(t)||C(t)?t[0]:k(t)?W(t[0]):null}function V(t){return _(t)?[t]:M(t)?m.slice.call(t):k(t)?t.map(W).filter(Boolean):C(t)?t.toArray():[]}function R(t){return E(t)?t:(t=W(t))?(A(t)?t:t.ownerDocument).defaultView:window}function q(t){return k(t)?t:D(t)?t.split(/,(?![^(]*\))/).map(function(t){return P(t)?F(t):L(t.trim())}):[t]}function U(t){return t?u(t,"ms")?j(t):1e3*j(t):0}function Y(t,i){return t===i||I(t)&&I(i)&&Object.keys(t).length===Object.keys(i).length&&J(t,function(t,e){return t===i[e]})}function X(t,e,i){return t.replace(new RegExp(e+"|"+i,"mg"),function(t){return t===e?i:e})}var G=Object.assign||function(t){for(var e=[],i=arguments.length-1;0<i--;)e[i]=arguments[i+1];t=Object(t);for(var n=0;n<e.length;n++){var r=e[n];if(null!==r)for(var o in r)l(r,o)&&(t[o]=r[o])}return t};function K(t){return t[t.length-1]}function J(t,e){for(var i in t)if(!1===e(t[i],i))return!1;return!0}function Z(t,r){return t.sort(function(t,e){var i=t[r];void 0===i&&(i=0);var n=e[r];return void 0===n&&(n=0),n<i?1:i<n?-1:0})}function Q(t,i){var n=new Set;return t.filter(function(t){var e=t[i];return!n.has(e)&&(n.add(e)||!0)})}function tt(t,e,i){return void 0===e&&(e=0),void 0===i&&(i=1),Math.min(Math.max(F(t)||0,e),i)}function et(){}function it(t,e){return t.left<e.right&&t.right>e.left&&t.top<e.bottom&&t.bottom>e.top}function nt(t,e){return t.x<=e.right&&t.x>=e.left&&t.y<=e.bottom&&t.y>=e.top}var rt={ratio:function(t,e,i){var n,r="width"===e?"height":"width";return(n={})[r]=t[e]?Math.round(i*t[r]/t[e]):t[r],n[e]=i,n},contain:function(i,n){var r=this;return J(i=G({},i),function(t,e){return i=i[e]>n[e]?r.ratio(i,e,n[e]):i}),i},cover:function(i,n){var r=this;return J(i=this.contain(i,n),function(t,e){return i=i[e]<n[e]?r.ratio(i,e,n[e]):i}),i}};function ot(t,e,i){if(I(e))for(var n in e)ot(t,n,e[n]);else{if(H(i))return(t=W(t))&&t.getAttribute(e);V(t).forEach(function(t){$(i)&&(i=i.call(t,ot(t,e))),null===i?at(t,e):t.setAttribute(e,i)})}}function st(t,e){return V(t).some(function(t){return t.hasAttribute(e)})}function at(t,e){t=V(t),e.split(" ").forEach(function(e){return t.forEach(function(t){return t.hasAttribute(e)&&t.removeAttribute(e)})})}function ht(t,e){for(var i=0,n=[e,"data-"+e];i<n.length;i++)if(st(t,n[i]))return ot(t,n[i])}var ut=/msie|trident/i.test(window.navigator.userAgent),ct="rtl"===ot(document.documentElement,"dir"),lt="ontouchstart"in window,dt=window.PointerEvent,ft=lt||window.DocumentTouch&&document instanceof DocumentTouch||navigator.maxTouchPoints,pt=dt?"pointerdown":lt?"touchstart":"mousedown",mt=dt?"pointermove":lt?"touchmove":"mousemove",gt=dt?"pointerup":lt?"touchend":"mouseup",vt=dt?"pointerenter":lt?"":"mouseenter",wt=dt?"pointerleave":lt?"":"mouseleave",bt=dt?"pointercancel":"touchcancel";function xt(t,e){return W(t)||$t(t,kt(t,e))}function yt(t,e){var i=V(t);return i.length&&i||It(t,kt(t,e))}function kt(t,e){return void 0===e&&(e=document),At(t)||A(e)?e:e.ownerDocument}function $t(t,e){return W(St(t,e,"querySelector"))}function It(t,e){return V(St(t,e,"querySelectorAll"))}function St(t,s,e){if(void 0===s&&(s=document),!t||!D(t))return null;var a;At(t=t.replace(Et,"$1 *"))&&(a=[],t=t.match(Ct).map(function(t){return t.replace(/,$/,"").trim()}).map(function(t,e){var i=s;if("!"===t[0]){var n=t.substr(1).trim().split(" ");i=Dt(Bt(s),n[0]),t=n.slice(1).join(" ").trim()}if("-"===t[0]){var r=t.substr(1).trim().split(" "),o=(i||s).previousElementSibling;i=Mt(o,t.substr(1))?o:null,t=r.slice(1).join(" ")}return i?(i.id||(i.id="uk-"+Date.now()+e,a.push(function(){return at(i,"id")})),"#"+Ot(i.id)+" "+t):null}).filter(Boolean).join(","),s=document);try{return s[e](t)}catch(t){return null}finally{a&&a.forEach(function(t){return t()})}}var Tt=/(^|[^\\],)\s*[!>+~-]/,Et=/([!>+~-])(?=\s+[!>+~-]|\s*$)/g;function At(t){return D(t)&&t.match(Tt)}var Ct=/.*?[^\\](?:,|$)/g;var _t=Element.prototype,Nt=_t.matches||_t.webkitMatchesSelector||_t.msMatchesSelector;function Mt(t,e){return V(t).some(function(t){return Nt.call(t,e)})}var zt=_t.closest||function(t){var e=this;do{if(Mt(e,t))return e}while(e=Bt(e))};function Dt(t,e){return w(e,">")&&(e=e.slice(1)),N(t)?zt.call(t,e):V(t).map(function(t){return Dt(t,e)}).filter(Boolean)}function Bt(t){return(t=W(t))&&N(t.parentNode)&&t.parentNode}var Pt=window.CSS&&CSS.escape||function(t){return t.replace(/([^\x7f-\uFFFF\w-])/g,function(t){return"\\"+t})};function Ot(t){return D(t)?Pt.call(null,t):""}var Ht={area:!0,base:!0,br:!0,col:!0,embed:!0,hr:!0,img:!0,input:!0,keygen:!0,link:!0,menuitem:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0};function Lt(t){return V(t).some(function(t){return Ht[t.tagName.toLowerCase()]})}function Ft(t){return V(t).some(function(t){return t.offsetWidth||t.offsetHeight||t.getClientRects().length})}var jt="input,select,textarea,button";function Wt(t){return V(t).some(function(t){return Mt(t,jt)})}function Vt(t,e){return V(t).filter(function(t){return Mt(t,e)})}function Rt(t,e){return D(e)?Mt(t,e)||Dt(t,e):t===e||(A(e)?e.documentElement:W(e)).contains(W(t))}function qt(t,e){for(var i=[];t=Bt(t);)e&&!Mt(t,e)||i.push(t);return i}function Ut(t,e){var i=(t=W(t))?V(t.children):[];return e?Vt(i,e):i}function Yt(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];var i,n,r=Zt(t),o=r[0],s=r[1],a=r[2],h=r[3],u=r[4];return o=ie(o),1<h.length&&(i=h,h=function(t){return k(t.detail)?i.apply(void 0,[t].concat(t.detail)):i(t)}),u&&u.self&&(n=h,h=function(t){if(t.target===t.currentTarget||t.target===t.current)return n.call(null,t)}),a&&(h=function(t,n,r){var o=this;return function(i){t.forEach(function(t){var e=">"===n[0]?It(n,t).reverse().filter(function(t){return Rt(i.target,t)})[0]:Dt(i.target,n);e&&(i.delegate=t,i.current=e,r.call(o,i))})}}(o,a,h)),u=Qt(u),s.split(" ").forEach(function(e){return o.forEach(function(t){return t.addEventListener(e,h,u)})}),function(){return Xt(o,s,h,u)}}function Xt(t,e,i,n){void 0===n&&(n=!1),n=Qt(n),t=ie(t),e.split(" ").forEach(function(e){return t.forEach(function(t){return t.removeEventListener(e,i,n)})})}function Gt(){for(var t=[],e=arguments.length;e--;)t[e]=arguments[e];var i=Zt(t),n=i[0],r=i[1],o=i[2],s=i[3],a=i[4],h=i[5],u=Yt(n,r,o,function(t){var e=!h||h(t);e&&(u(),s(t,e))},a);return u}function Kt(t,i,n){return ie(t).reduce(function(t,e){return t&&e.dispatchEvent(Jt(i,!0,!0,n))},!0)}function Jt(t,e,i,n){if(void 0===e&&(e=!0),void 0===i&&(i=!1),D(t)){var r=document.createEvent("CustomEvent");r.initCustomEvent(t,e,i,n),t=r}return t}function Zt(t){return $(t[2])&&t.splice(2,0,!1),t}function Qt(t){return t&&ut&&!z(t)?!!t.capture:t}function te(t){return t&&"addEventListener"in t}function ee(t){return te(t)?t:W(t)}function ie(t){return k(t)?t.map(ee).filter(Boolean):D(t)?It(t):te(t)?[t]:V(t)}function ne(t){return"touch"===t.pointerType||!!t.touches}function re(t){var e=t.touches,i=t.changedTouches,n=e&&e[0]||i&&i[0]||t;return{x:n.clientX,y:n.clientY}}function oe(){var i=this;this.promise=new se(function(t,e){i.reject=e,i.resolve=t})}var se="Promise"in window?window.Promise:ue,ae=2,he="setImmediate"in window?setImmediate:setTimeout;function ue(t){this.state=ae,this.value=void 0,this.deferred=[];var e=this;try{t(function(t){e.resolve(t)},function(t){e.reject(t)})}catch(t){e.reject(t)}}ue.reject=function(i){return new ue(function(t,e){e(i)})},ue.resolve=function(i){return new ue(function(t,e){t(i)})},ue.all=function(s){return new ue(function(i,t){var n=[],r=0;function e(e){return function(t){n[e]=t,(r+=1)===s.length&&i(n)}}0===s.length&&i(n);for(var o=0;o<s.length;o+=1)ue.resolve(s[o]).then(e(o),t)})},ue.race=function(n){return new ue(function(t,e){for(var i=0;i<n.length;i+=1)ue.resolve(n[i]).then(t,e)})};var ce=ue.prototype;function le(s,a){return new se(function(t,e){var i=G({data:null,method:"GET",headers:{},xhr:new XMLHttpRequest,beforeSend:et,responseType:""},a);i.beforeSend(i);var n=i.xhr;for(var r in i)if(r in n)try{n[r]=i[r]}catch(t){}for(var o in n.open(i.method.toUpperCase(),s),i.headers)n.setRequestHeader(o,i.headers[o]);Yt(n,"load",function(){0===n.status||200<=n.status&&n.status<300||304===n.status?t(n):e(G(Error(n.statusText),{xhr:n,status:n.status}))}),Yt(n,"error",function(){return e(G(Error("Network Error"),{xhr:n}))}),Yt(n,"timeout",function(){return e(G(Error("Network Timeout"),{xhr:n}))}),n.send(i.data)})}function de(n,r,o){return new se(function(t,e){var i=new Image;i.onerror=e,i.onload=function(){return t(i)},o&&(i.sizes=o),r&&(i.srcset=r),i.src=n})}function fe(t){if("loading"===document.readyState)var e=Yt(document,"DOMContentLoaded",function(){e(),t()});else t()}function pe(t,e){return e?V(t).indexOf(W(e)):Ut(Bt(t)).indexOf(t)}function me(t,e,i,n){void 0===i&&(i=0),void 0===n&&(n=!1);var r=(e=V(e)).length;return t=P(t)?F(t):"next"===t?i+1:"previous"===t?i-1:pe(e,t),n?tt(t,0,r-1):(t%=r)<0?t+r:t}function ge(t){return(t=_e(t)).innerHTML="",t}function ve(t,e){return t=_e(t),H(e)?t.innerHTML:we(t.hasChildNodes()?ge(t):t,e)}function we(e,t){return e=_e(e),ye(t,function(t){return e.appendChild(t)})}function be(e,t){return e=_e(e),ye(t,function(t){return e.parentNode.insertBefore(t,e)})}function xe(e,t){return e=_e(e),ye(t,function(t){return e.nextSibling?be(e.nextSibling,t):we(e.parentNode,t)})}function ye(t,e){return(t=D(t)?Ae(t):t)?"length"in t?V(t).map(e):e(t):null}function ke(t){V(t).map(function(t){return t.parentNode&&t.parentNode.removeChild(t)})}function $e(t,e){for(e=W(be(t,e));e.firstChild;)e=e.firstChild;return we(e,t),e}function Ie(t,e){return V(V(t).map(function(t){return t.hasChildNodes?$e(V(t.childNodes),e):we(t,e)}))}function Se(t){V(t).map(Bt).filter(function(t,e,i){return i.indexOf(t)===e}).forEach(function(t){be(t,t.childNodes),ke(t)})}ce.resolve=function(t){var e=this;if(e.state===ae){if(t===e)throw new TypeError("Promise settled with itself.");var i=!1;try{var n=t&&t.then;if(null!==t&&I(t)&&$(n))return void n.call(t,function(t){i||e.resolve(t),i=!0},function(t){i||e.reject(t),i=!0})}catch(t){return void(i||e.reject(t))}e.state=0,e.value=t,e.notify()}},ce.reject=function(t){var e=this;if(e.state===ae){if(t===e)throw new TypeError("Promise settled with itself.");e.state=1,e.value=t,e.notify()}},ce.notify=function(){var o=this;he(function(){if(o.state!==ae)for(;o.deferred.length;){var t=o.deferred.shift(),e=t[0],i=t[1],n=t[2],r=t[3];try{0===o.state?$(e)?n(e.call(void 0,o.value)):n(o.value):1===o.state&&($(i)?n(i.call(void 0,o.value)):r(o.value))}catch(t){r(t)}}})},ce.then=function(i,n){var r=this;return new ue(function(t,e){r.deferred.push([i,n,t,e]),r.notify()})},ce.catch=function(t){return this.then(void 0,t)};var Te=/^\s*<(\w+|!)[^>]*>/,Ee=/^<(\w+)\s*\/?>(?:<\/\1>)?$/;function Ae(t){var e=Ee.exec(t);if(e)return document.createElement(e[1]);var i=document.createElement("div");return Te.test(t)?i.insertAdjacentHTML("beforeend",t.trim()):i.textContent=t,1<i.childNodes.length?V(i.childNodes):i.firstChild}function Ce(t,e){if(N(t))for(e(t),t=t.firstElementChild;t;){var i=t.nextElementSibling;Ce(t,e),t=i}}function _e(t,e){return D(t)?Me(t)?W(Ae(t)):$t(t,e):W(t)}function Ne(t,e){return D(t)?Me(t)?V(Ae(t)):It(t,e):V(t)}function Me(t){return"<"===t[0]||t.match(/^\s*</)}function ze(t){for(var e=[],i=arguments.length-1;0<i--;)e[i]=arguments[i+1];Le(t,e,"add")}function De(t){for(var e=[],i=arguments.length-1;0<i--;)e[i]=arguments[i+1];Le(t,e,"remove")}function Be(t,e){ot(t,"class",function(t){return(t||"").replace(new RegExp("\\b"+e+"\\b","g"),"")})}function Pe(t){for(var e=[],i=arguments.length-1;0<i--;)e[i]=arguments[i+1];e[0]&&De(t,e[0]),e[1]&&ze(t,e[1])}function Oe(t,e){return e&&V(t).some(function(t){return t.classList.contains(e.split(" ")[0])})}function He(t){for(var n=[],e=arguments.length-1;0<e--;)n[e]=arguments[e+1];if(n.length){var r=D(K(n=Fe(n)))?[]:n.pop();n=n.filter(Boolean),V(t).forEach(function(t){for(var e=t.classList,i=0;i<n.length;i++)je.Force?e.toggle.apply(e,[n[i]].concat(r)):e[(H(r)?!e.contains(n[i]):r)?"add":"remove"](n[i])})}}function Le(t,i,n){(i=Fe(i).filter(Boolean)).length&&V(t).forEach(function(t){var e=t.classList;je.Multiple?e[n].apply(e,i):i.forEach(function(t){return e[n](t)})})}function Fe(t){return t.reduce(function(t,e){return t.concat.call(t,D(e)&&b(e," ")?e.trim().split(" "):e)},[])}var je={get Multiple(){return this.get("_multiple")},get Force(){return this.get("_force")},get:function(t){if(!l(this,t)){var e=document.createElement("_").classList;e.add("a","b"),e.toggle("c",!1),this._multiple=e.contains("b"),this._force=!e.contains("c")}return this[t]}},We={"animation-iteration-count":!0,"column-count":!0,"fill-opacity":!0,"flex-grow":!0,"flex-shrink":!0,"font-weight":!0,"line-height":!0,opacity:!0,order:!0,orphans:!0,"stroke-dasharray":!0,"stroke-dashoffset":!0,widows:!0,"z-index":!0,zoom:!0};function Ve(t,e,r){return V(t).map(function(i){if(D(e)){if(e=Ge(e),H(r))return qe(i,e);r||B(r)?i.style[e]=P(r)&&!We[e]?r+"px":r:i.style.removeProperty(e)}else{if(k(e)){var n=Re(i);return e.reduce(function(t,e){return t[e]=n[Ge(e)],t},{})}I(e)&&J(e,function(t,e){return Ve(i,e,t)})}return i})[0]}function Re(t,e){return(t=W(t)).ownerDocument.defaultView.getComputedStyle(t,e)}function qe(t,e,i){return Re(t,i)[e]}var Ue={};function Ye(t){var e=document.documentElement;if(!ut)return Re(e).getPropertyValue("--uk-"+t);if(!(t in Ue)){var i=we(e,document.createElement("div"));ze(i,"uk-"+t),Ue[t]=qe(i,"content",":before").replace(/^["'](.*)["']$/,"$1"),ke(i)}return Ue[t]}var Xe={};function Ge(t){var e=Xe[t];return e=e||(Xe[t]=function(t){t=d(t);var e=document.documentElement.style;if(t in e)return t;var i,n=Ke.length;for(;n--;)if((i="-"+Ke[n]+"-"+t)in e)return i}(t)||t)}var Ke=["webkit","moz","ms"];function Je(t,s,a,h){return void 0===a&&(a=400),void 0===h&&(h="linear"),se.all(V(t).map(function(o){return new se(function(i,n){for(var t in s){var e=Ve(o,t);""===e&&Ve(o,t,e)}var r=setTimeout(function(){return Kt(o,"transitionend")},a);Gt(o,"transitionend transitioncanceled",function(t){var e=t.type;clearTimeout(r),De(o,"uk-transition"),Ve(o,{transitionProperty:"",transitionDuration:"",transitionTimingFunction:""}),("transitioncanceled"===e?n:i)()},{self:!0}),ze(o,"uk-transition"),Ve(o,G({transitionProperty:Object.keys(s).map(Ge).join(","),transitionDuration:a+"ms",transitionTimingFunction:h},s))})}))}var Ze={start:Je,stop:function(t){return Kt(t,"transitionend"),se.resolve()},cancel:function(t){Kt(t,"transitioncanceled")},inProgress:function(t){return Oe(t,"uk-transition")}},Qe="uk-animation-",ti="uk-cancel-animation";function ei(t,e,i,a,h){var u=arguments;return void 0===i&&(i=200),se.all(V(t).map(function(s){return new se(function(n,r){if(Oe(s,ti))requestAnimationFrame(function(){return se.resolve().then(function(){return ei.apply(void 0,u).then(n,r)})});else{var t=e+" "+Qe+(h?"leave":"enter");w(e,Qe)&&(a&&(t+=" uk-transform-origin-"+a),h&&(t+=" "+Qe+"reverse")),o(),Gt(s,"animationend animationcancel",function(t){var e=t.type,i=!1;"animationcancel"===e?(r(),o()):(n(),se.resolve().then(function(){i=!0,o()})),requestAnimationFrame(function(){i||(ze(s,ti),requestAnimationFrame(function(){return De(s,ti)}))})},{self:!0}),Ve(s,"animationDuration",i+"ms"),ze(s,t)}function o(){Ve(s,"animationDuration",""),Be(s,Qe+"\\S*")}})}))}var ii=new RegExp(Qe+"(enter|leave)"),ni={in:function(t,e,i,n){return ei(t,e,i,n,!1)},out:function(t,e,i,n){return ei(t,e,i,n,!0)},inProgress:function(t){return ii.test(ot(t,"class"))},cancel:function(t){Kt(t,"animationcancel")}},ri={width:["x","left","right"],height:["y","top","bottom"]};function oi(t,e,c,l,d,i,n,r){c=mi(c),l=mi(l);var f={element:c,target:l};if(!t||!e)return f;var p=ai(t),m=ai(e),g=m;if(pi(g,c,p,-1),pi(g,l,m,1),d=gi(d,p.width,p.height),i=gi(i,m.width,m.height),d.x+=i.x,d.y+=i.y,g.left+=d.x,g.top+=d.y,n){var o=[ai(R(t))];r&&o.unshift(ai(r)),J(ri,function(t,s){var a=t[0],h=t[1],u=t[2];!0!==n&&!b(n,a)||o.some(function(n){var t=c[a]===h?-p[s]:c[a]===u?p[s]:0,e=l[a]===h?m[s]:l[a]===u?-m[s]:0;if(g[h]<n[h]||g[h]+p[s]>n[u]){var i=p[s]/2,r="center"===l[a]?-m[s]/2:0;return"center"===c[a]&&(o(i,r)||o(-i,-r))||o(t,e)}function o(e,t){var i=g[h]+e+t-2*d[a];if(i>=n[h]&&i+p[s]<=n[u])return g[h]=i,["element","target"].forEach(function(t){f[t][a]=e?f[t][a]===ri[s][1]?ri[s][2]:ri[s][1]:f[t][a]}),!0}})})}return si(t,g),f}function si(i,n){if(!n)return ai(i);var r=si(i),o=Ve(i,"position");["left","top"].forEach(function(t){if(t in n){var e=Ve(i,t);Ve(i,t,n[t]-r[t]+j("absolute"===o&&"auto"===e?hi(i)[t]:e))}})}function ai(t){if(!t)return{};var e,i,n=R(t),r=n.pageYOffset,o=n.pageXOffset;if(E(t)){var s=t.innerHeight,a=t.innerWidth;return{top:r,left:o,height:s,width:a,bottom:r+s,right:o+a}}Ft(t)||"none"!==Ve(t,"display")||(e=ot(t,"style"),i=ot(t,"hidden"),ot(t,{style:(e||"")+";display:block !important;",hidden:null}));var h=(t=W(t)).getBoundingClientRect();return H(e)||ot(t,{style:e,hidden:i}),{height:h.height,width:h.width,top:h.top+r,left:h.left+o,bottom:h.bottom+r,right:h.right+o}}function hi(t,e){e=e||W(t).offsetParent||R(t).document.documentElement;var i=si(t),n=si(e);return{top:i.top-n.top-j(Ve(e,"borderTopWidth")),left:i.left-n.left-j(Ve(e,"borderLeftWidth"))}}function ui(t){var e=[0,0];t=W(t);do{if(e[0]+=t.offsetTop,e[1]+=t.offsetLeft,"fixed"===Ve(t,"position")){var i=R(t);return e[0]+=i.pageYOffset,e[1]+=i.pageXOffset,e}}while(t=t.offsetParent);return e}var ci=di("height"),li=di("width");function di(n){var r=p(n);return function(t,e){if(H(e)){if(E(t))return t["inner"+r];if(A(t)){var i=t.documentElement;return Math.max(i["offset"+r],i["scroll"+r])}return(e="auto"===(e=Ve(t=W(t),n))?t["offset"+r]:j(e)||0)-fi(t,n)}Ve(t,n,e||0===e?+e+fi(t,n)+"px":"")}}function fi(i,t,e){return void 0===e&&(e="border-box"),Ve(i,"boxSizing")===e?ri[t].slice(1).map(p).reduce(function(t,e){return t+j(Ve(i,"padding"+e))+j(Ve(i,"border"+e+"Width"))},0):0}function pi(o,s,a,h){J(ri,function(t,e){var i=t[0],n=t[1],r=t[2];s[i]===r?o[n]+=a[e]*h:"center"===s[i]&&(o[n]+=a[e]*h/2)})}function mi(t){var e=/left|center|right/,i=/top|center|bottom/;return 1===(t=(t||"").split(" ")).length&&(t=e.test(t[0])?t.concat("center"):i.test(t[0])?["center"].concat(t):["center","center"]),{x:e.test(t[0])?t[0]:"center",y:i.test(t[1])?t[1]:"center"}}function gi(t,e,i){var n=(t||"").split(" "),r=n[0],o=n[1];return{x:r?j(r)*(u(r,"%")?e/100:1):0,y:o?j(o)*(u(o,"%")?i/100:1):0}}function vi(t){switch(t){case"left":return"right";case"right":return"left";case"top":return"bottom";case"bottom":return"top";default:return t}}function wi(t,e,i){return void 0===e&&(e="width"),void 0===i&&(i=window),P(t)?+t:u(t,"vh")?bi(ci(R(i)),t):u(t,"vw")?bi(li(R(i)),t):u(t,"%")?bi(ai(i)[e],t):j(t)}function bi(t,e){return t*j(e)/100}var xi={reads:[],writes:[],read:function(t){return this.reads.push(t),$i(),t},write:function(t){return this.writes.push(t),$i(),t},clear:function(t){return Si(this.reads,t)||Si(this.writes,t)},flush:yi};function yi(t){void 0===t&&(t=1),Ii(xi.reads),Ii(xi.writes.splice(0,xi.writes.length)),xi.scheduled=!1,(xi.reads.length||xi.writes.length)&&$i(t+1)}var ki=5;function $i(t){if(!xi.scheduled){if(xi.scheduled=!0,ki<t)throw new Error("Maximum recursion limit reached.");t?se.resolve().then(function(){return yi(t)}):requestAnimationFrame(function(){return yi()})}}function Ii(t){for(var e;e=t.shift();)e()}function Si(t,e){var i=t.indexOf(e);return!!~i&&!!t.splice(i,1)}function Ti(){}Ti.prototype={positions:[],init:function(){var e,t=this;this.positions=[],this.unbind=Yt(document,"mousemove",function(t){return e=re(t)}),this.interval=setInterval(function(){e&&(t.positions.push(e),5<t.positions.length&&t.positions.shift())},50)},cancel:function(){this.unbind&&this.unbind(),this.interval&&clearInterval(this.interval)},movesTo:function(t){if(this.positions.length<2)return!1;var i=t.getBoundingClientRect(),e=i.left,n=i.right,r=i.top,o=i.bottom,s=this.positions[0],a=K(this.positions),h=[s,a];return!nt(a,i)&&[[{x:e,y:r},{x:n,y:o}],[{x:e,y:o},{x:n,y:r}]].some(function(t){var e=function(t,e){var i=t[0],n=i.x,r=i.y,o=t[1],s=o.x,a=o.y,h=e[0],u=h.x,c=h.y,l=e[1],d=l.x,f=l.y,p=(f-c)*(s-n)-(d-u)*(a-r);if(0==p)return!1;var m=((d-u)*(r-c)-(f-c)*(n-u))/p;if(m<0)return!1;return{x:n+m*(s-n),y:r+m*(a-r)}}(h,t);return e&&nt(e,i)})}};var Ei={};function Ai(t,e,i){return Ei.computed($(t)?t.call(i,i):t,$(e)?e.call(i,i):e)}function Ci(t,e){return t=t&&!k(t)?[t]:t,e?t?t.concat(e):k(e)?e:[e]:t}function _i(e,i,n){var r={};if($(i)&&(i=i.options),i.extends&&(e=_i(e,i.extends,n)),i.mixins)for(var t=0,o=i.mixins.length;t<o;t++)e=_i(e,i.mixins[t],n);for(var s in e)h(s);for(var a in i)l(e,a)||h(a);function h(t){r[t]=(Ei[t]||function(t,e){return H(e)?t:e})(e[t],i[t],n)}return r}function Ni(t,e){var i;void 0===e&&(e=[]);try{return t?w(t,"{")?JSON.parse(t):e.length&&!b(t,":")?((i={})[e[0]]=t,i):t.split(";").reduce(function(t,e){var i=e.split(/:(.*)/),n=i[0],r=i[1];return n&&!H(r)&&(t[n.trim()]=r.trim()),t},{}):{}}catch(t){return{}}}Ei.events=Ei.created=Ei.beforeConnect=Ei.connected=Ei.beforeDisconnect=Ei.disconnected=Ei.destroy=Ci,Ei.args=function(t,e){return!1!==e&&Ci(e||t)},Ei.update=function(t,e){return Z(Ci(t,$(e)?{read:e}:e),"order")},Ei.props=function(t,e){return k(e)&&(e=e.reduce(function(t,e){return t[e]=String,t},{})),Ei.methods(t,e)},Ei.computed=Ei.methods=function(t,e){return e?t?G({},t,e):e:t},Ei.data=function(e,i,t){return t?Ai(e,i,t):i?e?function(t){return Ai(e,i,t)}:i:e};function Mi(t){this.id=++zi,this.el=W(t)}var zi=0;function Di(t,e){try{t.contentWindow.postMessage(JSON.stringify(G({event:"command"},e)),"*")}catch(t){}}function Bi(t,e,i){if(void 0===e&&(e=0),void 0===i&&(i=0),!Ft(t))return!1;for(var n=ji(t).concat(t),r=0;r<n.length-1;r++){var o=si(Fi(n[r])),s={top:o.top-e,left:o.left-i,bottom:o.bottom+e,right:o.right+i},a=si(n[r+1]);if(!it(a,s)&&!nt({x:a.left,y:a.top},s))return!1}return!0}function Pi(t,e){(t=(E(t)||A(t)?Wi:W)(t)).scrollTop=e}function Oi(t,e){void 0===e&&(e={});var c=e.offset;if(void 0===c&&(c=0),Ft(t)){for(var l=ji(t).concat(t),i=se.resolve(),n=function(u){i=i.then(function(){return new se(function(i){var t,n=l[u],e=l[u+1],r=n.scrollTop,o=hi(e,Fi(n)).top-c,s=(t=Math.abs(o),40*Math.pow(t,.375)),a=Date.now(),h=function(){var t,e=(t=tt((Date.now()-a)/s),.5*(1-Math.cos(Math.PI*t)));Pi(n,r+o*e),1!=e?requestAnimationFrame(h):i()};h()})})},r=0;r<l.length-1;r++)n(r);return i}}function Hi(t,e){if(void 0===e&&(e=0),!Ft(t))return 0;var i=K(Li(t)),n=i.scrollHeight,r=i.scrollTop,o=si(Fi(i)).height,s=ui(t)[0]-r-ui(i)[0],a=Math.min(o,s+r);return tt(-1*(s-a)/Math.min(si(t).height+e+a,n-(s+r),n-o))}function Li(t,e){void 0===e&&(e=/auto|scroll/);var i=Wi(t),n=qt(t).filter(function(t){return t===i||e.test(Ve(t,"overflow"))&&t.scrollHeight>Math.round(si(t).height)}).reverse();return n.length?n:[i]}function Fi(t){return t===Wi(t)?window:t}function ji(t){return Li(t,/auto|scroll|hidden/)}function Wi(t){var e=R(t).document;return e.scrollingElement||e.documentElement}Mi.prototype.isVideo=function(){return this.isYoutube()||this.isVimeo()||this.isHTML5()},Mi.prototype.isHTML5=function(){return"VIDEO"===this.el.tagName},Mi.prototype.isIFrame=function(){return"IFRAME"===this.el.tagName},Mi.prototype.isYoutube=function(){return this.isIFrame()&&!!this.el.src.match(/\/\/.*?youtube(-nocookie)?\.[a-z]+\/(watch\?v=[^&\s]+|embed)|youtu\.be\/.*/)},Mi.prototype.isVimeo=function(){return this.isIFrame()&&!!this.el.src.match(/vimeo\.com\/video\/.*/)},Mi.prototype.enableApi=function(){var e=this;if(this.ready)return this.ready;var i,r=this.isYoutube(),o=this.isVimeo();return r||o?this.ready=new se(function(t){var n;Gt(e.el,"load",function(){if(r){var t=function(){return Di(e.el,{event:"listening",id:e.id})};i=setInterval(t,100),t()}}),n=function(t){return r&&t.id===e.id&&"onReady"===t.event||o&&Number(t.player_id)===e.id},new se(function(i){Gt(window,"message",function(t,e){return i(e)},!1,function(t){var e=t.data;if(e&&D(e)){try{e=JSON.parse(e)}catch(t){return}return e&&n(e)}})}).then(function(){t(),i&&clearInterval(i)}),ot(e.el,"src",e.el.src+(b(e.el.src,"?")?"&":"?")+(r?"enablejsapi=1":"api=1&player_id="+e.id))}):se.resolve()},Mi.prototype.play=function(){var t=this;if(this.isVideo())if(this.isIFrame())this.enableApi().then(function(){return Di(t.el,{func:"playVideo",method:"play"})});else if(this.isHTML5())try{var e=this.el.play();e&&e.catch(et)}catch(t){}},Mi.prototype.pause=function(){var t=this;this.isVideo()&&(this.isIFrame()?this.enableApi().then(function(){return Di(t.el,{func:"pauseVideo",method:"pause"})}):this.isHTML5()&&this.el.pause())},Mi.prototype.mute=function(){var t=this;this.isVideo()&&(this.isIFrame()?this.enableApi().then(function(){return Di(t.el,{func:"mute",method:"setVolume",value:0})}):this.isHTML5()&&(this.el.muted=!0,ot(this.el,"muted","")))};var Vi="IntersectionObserver"in window?window.IntersectionObserver:function(){function t(e,t){var i=this;void 0===t&&(t={});var n=t.rootMargin;void 0===n&&(n="0 0"),this.targets=[];var r,o=(n||"0 0").split(" ").map(j),s=o[0],a=o[1];this.offsetTop=s,this.offsetLeft=a,this.apply=function(){r=r||requestAnimationFrame(function(){return setTimeout(function(){var t=i.takeRecords();t.length&&e(t,i),r=!1})})},this.off=Yt(window,"scroll resize load",this.apply,{passive:!0,capture:!0})}return t.prototype.takeRecords=function(){var i=this;return this.targets.filter(function(t){var e=Bi(t.target,i.offsetTop,i.offsetLeft);if(null===t.isIntersecting||e^t.isIntersecting)return t.isIntersecting=e,!0})},t.prototype.observe=function(t){this.targets.push({target:t,isIntersecting:null}),this.apply()},t.prototype.disconnect=function(){this.targets=[],this.off()},t}();function Ri(t){return!(!w(t,"uk-")&&!w(t,"data-uk-"))&&f(t.replace("data-uk-","").replace("uk-",""))}function qi(t){this._init(t)}var Ui,Yi,Xi,Gi,Ki,Ji,Zi,Qi,tn;function en(t,e){if(t)for(var i in t)t[i]._connected&&t[i]._callUpdate(e)}function nn(t,e){var i={},n=t.args;void 0===n&&(n=[]);var r=t.props;void 0===r&&(r={});var o=t.el;if(!r)return i;for(var s in r){var a=d(s),h=ht(o,a);if(!H(h)){if(h=r[s]===Boolean&&""===h||an(r[s],h),"target"===a&&(!h||w(h,"_")))continue;i[s]=h}}var u=Ni(ht(o,e),n);for(var c in u){var l=f(c);void 0!==r[l]&&(i[l]=an(r[l],u[c]))}return i}function rn(n,r,o){Object.defineProperty(n,r,{enumerable:!0,get:function(){var t=n._computeds,e=n.$props,i=n.$el;return l(t,r)||(t[r]=(o.get||o).call(n,e,i)),t[r]},set:function(t){var e=n._computeds;e[r]=o.set?o.set.call(n,t):t,H(e[r])&&delete e[r]}})}function on(e,i,n){T(i)||(i={name:n,handler:i});var t=i.name,r=i.el,o=i.handler,s=i.capture,a=i.passive,h=i.delegate,u=i.filter,c=i.self;r=$(r)?r.call(e):r||e.$el,k(r)?r.forEach(function(t){return on(e,G({},i,{el:t}),n)}):!r||u&&!u.call(e)||e._events.push(Yt(r,t,h?D(h)?h:h.call(e):null,D(o)?e[o]:o.bind(e),{passive:a,capture:s,self:c}))}function sn(t,e){return t.every(function(t){return!t||!l(t,e)})}function an(t,e){return t===Boolean?L(e):t===Number?F(e):"list"===t?q(e):t?t(e):e}qi.util=Object.freeze({__proto__:null,ajax:le,getImage:de,transition:Je,Transition:Ze,animate:ei,Animation:ni,attr:ot,hasAttr:st,removeAttr:at,data:ht,addClass:ze,removeClass:De,removeClasses:Be,replaceClass:Pe,hasClass:Oe,toggleClass:He,positionAt:oi,offset:si,position:hi,offsetPosition:ui,height:ci,width:li,boxModelAdjust:fi,flipPosition:vi,toPx:wi,ready:fe,index:pe,getIndex:me,empty:ge,html:ve,prepend:function(e,t){return(e=_e(e)).hasChildNodes()?ye(t,function(t){return e.insertBefore(t,e.firstChild)}):we(e,t)},append:we,before:be,after:xe,remove:ke,wrapAll:$e,wrapInner:Ie,unwrap:Se,fragment:Ae,apply:Ce,$:_e,$$:Ne,isIE:ut,isRtl:ct,hasTouch:ft,pointerDown:pt,pointerMove:mt,pointerUp:gt,pointerEnter:vt,pointerLeave:wt,pointerCancel:bt,on:Yt,off:Xt,once:Gt,trigger:Kt,createEvent:Jt,toEventTargets:ie,isTouch:ne,getEventPos:re,fastdom:xi,isVoidElement:Lt,isVisible:Ft,selInput:jt,isInput:Wt,filter:Vt,within:Rt,parents:qt,children:Ut,hasOwn:l,hyphenate:d,camelize:f,ucfirst:p,startsWith:w,endsWith:u,includes:b,findIndex:y,isArray:k,isFunction:$,isObject:I,isPlainObject:T,isWindow:E,isDocument:A,isJQuery:C,isNode:_,isElement:N,isNodeCollection:M,isBoolean:z,isString:D,isNumber:B,isNumeric:P,isEmpty:O,isUndefined:H,toBoolean:L,toNumber:F,toFloat:j,toNode:W,toNodes:V,toWindow:R,toList:q,toMs:U,isEqual:Y,swap:X,assign:G,last:K,each:J,sortBy:Z,uniqueBy:Q,clamp:tt,noop:et,intersectRect:it,pointInRect:nt,Dimensions:rt,MouseTracker:Ti,mergeOptions:_i,parseOptions:Ni,Player:Mi,Promise:se,Deferred:oe,IntersectionObserver:Vi,query:xt,queryAll:yt,find:$t,findAll:It,matches:Mt,closest:Dt,parent:Bt,escape:Ot,css:Ve,getStyles:Re,getStyle:qe,getCssVar:Ye,propName:Ge,isInView:Bi,scrollTop:Pi,scrollIntoView:Oi,scrolledOver:Hi,scrollParents:Li,getViewport:Fi}),qi.data="__uikit__",qi.prefix="uk-",qi.options={},qi.version="3.3.6",Xi=(Ui=qi).data,Ui.use=function(t){if(!t.installed)return t.call(null,this),t.installed=!0,this},Ui.mixin=function(t,e){(e=(D(e)?Ui.component(e):e)||this).options=_i(e.options,t)},Ui.extend=function(t){t=t||{};function e(t){this._init(t)}return((e.prototype=Object.create(this.prototype)).constructor=e).options=_i(this.options,t),e.super=this,e.extend=this.extend,e},Ui.update=function(t,e){qt(t=t?W(t):document.body).reverse().forEach(function(t){return en(t[Xi],e)}),Ce(t,function(t){return en(t[Xi],e)})},Object.defineProperty(Ui,"container",{get:function(){return Yi||document.body},set:function(t){Yi=_e(t)}}),(Gi=qi).prototype._callHook=function(t){var e=this,i=this.$options[t];i&&i.forEach(function(t){return t.call(e)})},Gi.prototype._callConnected=function(){this._connected||(this._data={},this._computeds={},this._frames={reads:{},writes:{}},this._initProps(),this._callHook("beforeConnect"),this._connected=!0,this._initEvents(),this._initObserver(),this._callHook("connected"),this._callUpdate())},Gi.prototype._callDisconnected=function(){this._connected&&(this._callHook("beforeDisconnect"),this._observer&&(this._observer.disconnect(),this._observer=null),this._unbindEvents(),this._callHook("disconnected"),this._connected=!1)},Gi.prototype._callUpdate=function(t){var o=this;void 0===t&&(t="update");var s=t.type||t;b(["update","resize"],s)&&this._callWatches();var e=this.$options.update,i=this._frames,a=i.reads,h=i.writes;e&&e.forEach(function(t,e){var i=t.read,n=t.write,r=t.events;"update"!==s&&!b(r,s)||(i&&!b(xi.reads,a[e])&&(a[e]=xi.read(function(){var t=o._connected&&i.call(o,o._data,s);!1===t&&n?xi.clear(h[e]):T(t)&&G(o._data,t)})),n&&!b(xi.writes,h[e])&&(h[e]=xi.write(function(){return o._connected&&n.call(o,o._data,s)})))})},Gi.prototype._callWatches=function(){var h=this,u=this._frames;if(!u.watch){var c=!l(u,"watch");u.watch=xi.read(function(){if(h._connected){var t=h.$options.computed,e=h._computeds;for(var i in t){var n=l(e,i),r=e[i];delete e[i];var o=t[i],s=o.watch,a=o.immediate;s&&(c&&a||n&&!Y(r,h[i]))&&s.call(h,h[i],r)}u.watch=null}})}},Ji=0,(Ki=qi).prototype._init=function(t){(t=t||{}).data=function(t,e){var i=t.data,n=(t.el,e.args),r=e.props;void 0===r&&(r={});if(i=k(i)?O(n)?void 0:i.slice(0,n.length).reduce(function(t,e,i){return T(e)?G(t,e):t[n[i]]=e,t},{}):i)for(var o in i)H(i[o])?delete i[o]:i[o]=r[o]?an(r[o],i[o]):i[o];return i}(t,this.constructor.options),this.$options=_i(this.constructor.options,t,this),this.$el=null,this.$props={},this._uid=Ji++,this._initData(),this._initMethods(),this._initComputeds(),this._callHook("created"),t.el&&this.$mount(t.el)},Ki.prototype._initData=function(){var t=this.$options.data;for(var e in void 0===t&&(t={}),t)this.$props[e]=this[e]=t[e]},Ki.prototype._initMethods=function(){var t=this.$options.methods;if(t)for(var e in t)this[e]=t[e].bind(this)},Ki.prototype._initComputeds=function(){var t=this.$options.computed;if(this._computeds={},t)for(var e in t)rn(this,e,t[e])},Ki.prototype._initProps=function(t){var e;for(e in t=t||nn(this.$options,this.$name))H(t[e])||(this.$props[e]=t[e]);var i=[this.$options.computed,this.$options.methods];for(e in this.$props)e in t&&sn(i,e)&&(this[e]=this.$props[e])},Ki.prototype._initEvents=function(){var i=this;this._events=[];var t=this.$options.events;t&&t.forEach(function(t){if(l(t,"handler"))on(i,t);else for(var e in t)on(i,t[e],e)})},Ki.prototype._unbindEvents=function(){this._events.forEach(function(t){return t()}),delete this._events},Ki.prototype._initObserver=function(){var i=this,t=this.$options,n=t.attrs,e=t.props,r=t.el;if(!this._observer&&e&&!1!==n){n=k(n)?n:Object.keys(e),this._observer=new MutationObserver(function(){var e=nn(i.$options,i.$name);n.some(function(t){return!H(e[t])&&e[t]!==i.$props[t]})&&i.$reset()});var o=n.map(function(t){return d(t)}).concat(this.$name);this._observer.observe(r,{attributes:!0,attributeFilter:o.concat(o.map(function(t){return"data-"+t}))})}},Qi=(Zi=qi).data,tn={},Zi.component=function(s,t){var e=d(s);if(s=f(e),!t)return T(tn[s])&&(tn[s]=Zi.extend(tn[s])),tn[s];Zi[s]=function(t,i){for(var e=arguments.length,n=Array(e);e--;)n[e]=arguments[e];var r=Zi.component(s);return r.options.functional?new r({data:T(t)?t:[].concat(n)}):t?Ne(t).map(o)[0]:o(t);function o(t){var e=Zi.getComponent(t,s);if(e){if(!i)return e;e.$destroy()}return new r({el:t,data:i})}};var i=T(t)?G({},t):t.options;return i.name=s,i.install&&i.install(Zi,i,s),Zi._initialized&&!i.functional&&xi.read(function(){return Zi[s]("[uk-"+e+"],[data-uk-"+e+"]")}),tn[s]=T(t)?i:t},Zi.getComponents=function(t){return t&&t[Qi]||{}},Zi.getComponent=function(t,e){return Zi.getComponents(t)[e]},Zi.connect=function(t){if(t[Qi])for(var e in t[Qi])t[Qi][e]._callConnected();for(var i=0;i<t.attributes.length;i++){var n=Ri(t.attributes[i].name);n&&n in tn&&Zi[n](t)}},Zi.disconnect=function(t){for(var e in t[Qi])t[Qi][e]._callDisconnected()},function(n){var r=n.data;n.prototype.$create=function(t,e,i){return n[t](e,i)},n.prototype.$mount=function(t){var e=this.$options.name;t[r]||(t[r]={}),t[r][e]||((t[r][e]=this).$el=this.$options.el=this.$options.el||t,Rt(t,document)&&this._callConnected())},n.prototype.$reset=function(){this._callDisconnected(),this._callConnected()},n.prototype.$destroy=function(t){void 0===t&&(t=!1);var e=this.$options,i=e.el,n=e.name;i&&this._callDisconnected(),this._callHook("destroy"),i&&i[r]&&(delete i[r][n],O(i[r])||delete i[r],t&&ke(this.$el))},n.prototype.$emit=function(t){this._callUpdate(t)},n.prototype.$update=function(t,e){void 0===t&&(t=this.$el),n.update(t,e)},n.prototype.$getComponent=n.getComponent;var e={};Object.defineProperties(n.prototype,{$container:Object.getOwnPropertyDescriptor(n,"container"),$name:{get:function(){var t=this.$options.name;return e[t]||(e[t]=n.prefix+d(t)),e[t]}}})}(qi);var hn={connected:function(){Oe(this.$el,this.$name)||ze(this.$el,this.$name)}},un={props:{cls:Boolean,animation:"list",duration:Number,origin:String,transition:String,queued:Boolean},data:{cls:!1,animation:[!1],duration:200,origin:!1,transition:"linear",queued:!1,initProps:{overflow:"",height:"",paddingTop:"",paddingBottom:"",marginTop:"",marginBottom:""},hideProps:{overflow:"hidden",height:0,paddingTop:0,paddingBottom:0,marginTop:0,marginBottom:0}},computed:{hasAnimation:function(t){return!!t.animation[0]},hasTransition:function(t){var e=t.animation;return this.hasAnimation&&!0===e[0]}},methods:{toggleElement:function(u,c,l){var d=this;return new se(function(t){u=V(u);function e(t){return se.all(t.map(function(t){return d._toggleElement(t,c,l)}))}var i;if(!d.queued||!H(c)||!d.hasAnimation||u.length<2)i=e(u);else{var n=u.filter(function(t){return d.isToggled(t)}),r=u.filter(function(t){return!b(n,t)}),o=document.body,s=o.scrollTop,a=n[0],h=ni.inProgress(a)&&Oe(a,"uk-animation-leave")||Ze.inProgress(a)&&"0px"===a.style.height;i=e(n),h||(i=i.then(function(){var t=e(r);return o.scrollTop=s,t}))}i.then(t,et)})},isToggled:function(t){var e=V(t||this.$el);return this.cls?Oe(e,this.cls.split(" ")[0]):!st(e,"hidden")},updateAria:function(t){!1===this.cls&&ot(t,"aria-hidden",!this.isToggled(t))},_toggleElement:function(t,e,i){var n=this;if(e=z(e)?e:ni.inProgress(t)?Oe(t,"uk-animation-leave"):Ze.inProgress(t)?"0px"===t.style.height:!this.isToggled(t),!Kt(t,"before"+(e?"show":"hide"),[this]))return se.reject();var o,r=($(i)?i:!1!==i&&this.hasAnimation?this.hasTransition?cn(this):(o=this,function(t,e){ni.cancel(t);var i=o.animation,n=o.duration,r=o._toggle;return e?(r(t,!0),ni.in(t,i[0],n,o.origin)):ni.out(t,i[1]||i[0],n,o.origin).then(function(){return r(t,!1)})}):this._toggle)(t,e);Kt(t,e?"show":"hide",[this]);function s(){Kt(t,e?"shown":"hidden",[n]),n.$update(t)}return r?r.then(s):se.resolve(s())},_toggle:function(t,e){var i;t&&(e=Boolean(e),this.cls?(i=b(this.cls," ")||e!==Oe(t,this.cls))&&He(t,this.cls,b(this.cls," ")?void 0:e):(i=e===st(t,"hidden"))&&ot(t,"hidden",e?null:""),Ne("[autofocus]",t).some(function(t){return Ft(t)?t.focus()||!0:t.blur()}),this.updateAria(t),i&&(Kt(t,"toggled",[this]),this.$update(t)))}}};function cn(t){var s=t.isToggled,a=t.duration,h=t.initProps,u=t.hideProps,c=t.transition,l=t._toggle;return function(t,e){var i=Ze.inProgress(t),n=t.hasChildNodes?j(Ve(t.firstElementChild,"marginTop"))+j(Ve(t.lastElementChild,"marginBottom")):0,r=Ft(t)?ci(t)+(i?0:n):0;Ze.cancel(t),s(t)||l(t,!0),ci(t,""),xi.flush();var o=ci(t)+(i?0:n);return ci(t,r),(e?Ze.start(t,G({},h,{overflow:"hidden",height:o}),Math.round(a*(1-r/o)),c):Ze.start(t,u,Math.round(a*(r/o)),c).then(function(){return l(t,!1)})).then(function(){return Ve(t,h)})}}var ln={mixins:[hn,un],props:{targets:String,active:null,collapsible:Boolean,multiple:Boolean,toggle:String,content:String,transition:String,offset:Number},data:{targets:"> *",active:!1,animation:[!0],collapsible:!0,multiple:!1,clsOpen:"uk-open",toggle:"> .uk-accordion-title",content:"> .uk-accordion-content",transition:"ease",offset:0},computed:{items:{get:function(t,e){return Ne(t.targets,e)},watch:function(t,e){var i=this;if(t.forEach(function(t){return dn(_e(i.content,t),!Oe(t,i.clsOpen))}),!e&&!Oe(t,this.clsOpen)){var n=!1!==this.active&&t[Number(this.active)]||!this.collapsible&&t[0];n&&this.toggle(n,!1)}},immediate:!0}},events:[{name:"click",delegate:function(){return this.targets+" "+this.$props.toggle},handler:function(t){t.preventDefault(),this.toggle(pe(Ne(this.targets+" "+this.$props.toggle,this.$el),t.current))}}],methods:{toggle:function(t,r){var o=this,e=[this.items[me(t,this.items)]],i=Vt(this.items,"."+this.clsOpen);this.multiple||b(i,e[0])||(e=e.concat(i)),(this.collapsible||Vt(e,":not(."+this.clsOpen+")").length)&&e.forEach(function(t){return o.toggleElement(t,!Oe(t,o.clsOpen),function(e,i){He(e,o.clsOpen,i);var n=_e((e._wrapper?"> * ":"")+o.content,e);if(!1!==r&&o.hasTransition)return e._wrapper||(e._wrapper=$e(n,"<div"+(i?" hidden":"")+">")),dn(n,!1),cn(o)(e._wrapper,i).then(function(){if(dn(n,!i),delete e._wrapper,Se(n),i){var t=_e(o.$props.toggle,e);Bi(t)||Oi(t,{offset:o.offset})}});dn(n,!i)})})}}};function dn(t,e){ot(t,"hidden",e?"":null)}var fn={mixins:[hn,un],args:"animation",props:{close:String},data:{animation:[!0],selClose:".uk-alert-close",duration:150,hideProps:G({opacity:0},un.data.hideProps)},events:[{name:"click",delegate:function(){return this.selClose},handler:function(t){t.preventDefault(),this.close()}}],methods:{close:function(){var t=this;this.toggleElement(this.$el).then(function(){return t.$destroy(!0)})}}},pn={args:"autoplay",props:{automute:Boolean,autoplay:Boolean},data:{automute:!1,autoplay:!0},computed:{inView:function(t){return"inview"===t.autoplay}},connected:function(){this.inView&&!st(this.$el,"preload")&&(this.$el.preload="none"),this.player=new Mi(this.$el),this.automute&&this.player.mute()},update:{read:function(){return!!this.player&&{visible:Ft(this.$el)&&"hidden"!==Ve(this.$el,"visibility"),inView:this.inView&&Bi(this.$el)}},write:function(t){var e=t.visible,i=t.inView;!e||this.inView&&!i?this.player.pause():(!0===this.autoplay||this.inView&&i)&&this.player.play()},events:["resize","scroll"]}},mn={mixins:[hn,pn],props:{width:Number,height:Number},data:{automute:!0},update:{read:function(){var t=this.$el,e=function(t){for(;t=Bt(t);)if("static"!==Ve(t,"position"))return t}(t)||t.parentNode,i=e.offsetHeight,n=e.offsetWidth,r=rt.cover({width:this.width||t.naturalWidth||t.videoWidth||t.clientWidth,height:this.height||t.naturalHeight||t.videoHeight||t.clientHeight},{width:n+(n%2?1:0),height:i+(i%2?1:0)});return!(!r.width||!r.height)&&r},write:function(t){var e=t.height,i=t.width;Ve(this.$el,{height:e,width:i})},events:["resize"]}};var gn,vn={props:{pos:String,offset:null,flip:Boolean,clsPos:String},data:{pos:"bottom-"+(ct?"right":"left"),flip:!0,offset:!1,clsPos:""},computed:{pos:function(t){var e=t.pos;return(e+(b(e,"-")?"":"-center")).split("-")},dir:function(){return this.pos[0]},align:function(){return this.pos[1]}},methods:{positionAt:function(t,e,i){var n;Be(t,this.clsPos+"-(top|bottom|left|right)(-[a-z]+)?"),Ve(t,{top:"",left:""});var r=this.offset,o=this.getAxis();P(r)||(r=(n=_e(r))?si(n)["x"===o?"left":"top"]-si(e)["x"===o?"right":"bottom"]:0);var s=oi(t,e,"x"===o?vi(this.dir)+" "+this.align:this.align+" "+vi(this.dir),"x"===o?this.dir+" "+this.align:this.align+" "+this.dir,"x"===o?""+("left"===this.dir?-r:r):" "+("top"===this.dir?-r:r),null,this.flip,i).target,a=s.x,h=s.y;this.dir="x"===o?a:h,this.align="x"===o?h:a,He(t,this.clsPos+"-"+this.dir+"-"+this.align,!1===this.offset)},getAxis:function(){return"top"===this.dir||"bottom"===this.dir?"y":"x"}}},wn={mixins:[vn,un],args:"pos",props:{mode:"list",toggle:Boolean,boundary:Boolean,boundaryAlign:Boolean,delayShow:Number,delayHide:Number,clsDrop:String},data:{mode:["click","hover"],toggle:"- *",boundary:window,boundaryAlign:!1,delayShow:0,delayHide:800,clsDrop:!1,animation:["uk-animation-fade"],cls:"uk-open"},computed:{boundary:function(t,e){return xt(t.boundary,e)},clsDrop:function(t){return t.clsDrop||"uk-"+this.$options.name},clsPos:function(){return this.clsDrop}},created:function(){this.tracker=new Ti},connected:function(){ze(this.$el,this.clsDrop);var t=this.$props.toggle;this.toggle=t&&this.$create("toggle",xt(t,this.$el),{target:this.$el,mode:this.mode}),this.toggle||Kt(this.$el,"updatearia")},disconnected:function(){this.isActive()&&(gn=null)},events:[{name:"click",delegate:function(){return"."+this.clsDrop+"-close"},handler:function(t){t.preventDefault(),this.hide(!1)}},{name:"click",delegate:function(){return'a[href^="#"]'},handler:function(t){var e=t.defaultPrevented,i=t.current.hash;e||!i||Rt(i,this.$el)||this.hide(!1)}},{name:"beforescroll",handler:function(){this.hide(!1)}},{name:"toggle",self:!0,handler:function(t,e){t.preventDefault(),this.isToggled()?this.hide(!1):this.show(e,!1)}},{name:"toggleshow",self:!0,handler:function(t,e){t.preventDefault(),this.show(e)}},{name:"togglehide",self:!0,handler:function(t){t.preventDefault(),this.hide()}},{name:vt,filter:function(){return b(this.mode,"hover")},handler:function(t){ne(t)||this.clearTimers()}},{name:wt,filter:function(){return b(this.mode,"hover")},handler:function(t){ne(t)||this.hide()}},{name:"toggled",self:!0,handler:function(){this.isToggled()&&(this.clearTimers(),ni.cancel(this.$el),this.position())}},{name:"show",self:!0,handler:function(){var n=this;(gn=this).tracker.init(),Kt(this.$el,"updatearia");var t=bn(document,"click",function(t){var e=t.defaultPrevented,i=t.target;e||Rt(i,n.$el)||n.toggle&&Rt(i,n.toggle.$el)||n.hide(!1)});Gt(this.$el,"hide",t,{self:!0})}},{name:"beforehide",self:!0,handler:function(){this.clearTimers()}},{name:"hide",handler:function(t){var e=t.target;this.$el===e?(gn=this.isActive()?null:gn,Kt(this.$el,"updatearia"),this.tracker.cancel()):gn=null===gn&&Rt(e,this.$el)&&this.isToggled()?this:gn}},{name:"updatearia",self:!0,handler:function(t,e){t.preventDefault(),this.updateAria(this.$el),(e||this.toggle)&&(ot((e||this.toggle).$el,"aria-expanded",this.isToggled()),He(this.toggle.$el,this.cls,this.isToggled()))}}],update:{write:function(){this.isToggled()&&!ni.inProgress(this.$el)&&this.position()},events:["resize"]},methods:{show:function(t,e){var i=this;if(void 0===t&&(t=this.toggle),void 0===e&&(e=!0),this.isToggled()&&t&&this.toggle&&t.$el!==this.toggle.$el&&this.hide(!1),this.toggle=t,this.clearTimers(),!this.isActive()){if(gn){if(e&&gn.isDelaying)return void(this.showTimer=setTimeout(this.show,10));for(;gn&&!Rt(this.$el,gn.$el);)gn.hide(!1)}this.showTimer=setTimeout(function(){return!i.isToggled()&&i.toggleElement(i.$el,!0)},e&&this.delayShow||0)}},hide:function(t){var e=this;void 0===t&&(t=!0);function i(){return e.toggleElement(e.$el,!1,!1)}var n,r;this.clearTimers(),this.isDelaying=(n=this.$el,r=[],Ce(n,function(t){return"static"!==Ve(t,"position")&&r.push(t)}),r.some(function(t){return e.tracker.movesTo(t)})),t&&this.isDelaying?this.hideTimer=setTimeout(this.hide,50):t&&this.delayHide?this.hideTimer=setTimeout(i,this.delayHide):i()},clearTimers:function(){clearTimeout(this.showTimer),clearTimeout(this.hideTimer),this.showTimer=null,this.hideTimer=null,this.isDelaying=!1},isActive:function(){return gn===this},position:function(){Be(this.$el,this.clsDrop+"-(stack|boundary)"),He(this.$el,this.clsDrop+"-boundary",this.boundaryAlign);var t=si(this.boundary),e=this.boundaryAlign?t:si(this.toggle.$el);if("justify"===this.align){var i="y"===this.getAxis()?"width":"height";Ve(this.$el,i,e[i])}else this.$el.offsetWidth>Math.max(t.right-e.left,e.right-t.left)&&ze(this.$el,this.clsDrop+"-stack");this.positionAt(this.$el,this.boundaryAlign?this.boundary:this.toggle.$el,this.boundary)}}};function bn(t,e,i){var n=Gt(t,e,function(){return n=Yt(t,e,i)},!0);return function(){return n()}}var xn={mixins:[hn],args:"target",props:{target:Boolean},data:{target:!1},computed:{input:function(t,e){return _e(jt,e)},state:function(){return this.input.nextElementSibling},target:function(t,e){var i=t.target;return i&&(!0===i&&this.input.parentNode===e&&this.input.nextElementSibling||xt(i,e))}},update:function(){var t=this.target,e=this.input;if(t){var i,n=Wt(t)?"value":"textContent",r=t[n],o=e.files&&e.files[0]?e.files[0].name:Mt(e,"select")&&(i=Ne("option",e).filter(function(t){return t.selected})[0])?i.textContent:e.value;r!==o&&(t[n]=o)}},events:[{name:"change",handler:function(){this.$update()}},{name:"reset",el:function(){return Dt(this.$el,"form")},handler:function(){this.$update()}}]},yn={update:{read:function(t){var e=Bi(this.$el);if(!e||t.isInView===e)return!1;t.isInView=e},write:function(){this.$el.src=this.$el.src},events:["scroll","resize"]}},kn={props:{margin:String,firstColumn:Boolean},data:{margin:"uk-margin-small-top",firstColumn:"uk-first-column"},update:{read:function(t){var e=this.$el.children;if(!e.length||!Ft(this.$el))return t.rows=[[]];t.rows=$n(e),t.stacks=!t.rows.some(function(t){return 1<t.length})},write:function(t){var n=this;t.rows.forEach(function(t,i){return t.forEach(function(t,e){He(t,n.margin,0!==i),He(t,n.firstColumn,0===e)})})},events:["resize"]}};function $n(t){for(var e=[[]],i=0;i<t.length;i++){var n=t[i],r=In(n);if(r.height)for(var o=e.length-1;0<=o;o--){var s=e[o];if(!s[0]){s.push(n);break}var a=void 0;if(a=s[0].offsetParent===n.offsetParent?In(s[0]):(r=In(n,!0),In(s[0],!0)),r.top>=a.bottom-1&&r.top!==a.top){e.push([n]);break}if(r.bottom>a.top){if(r.left<a.left&&!ct){s.unshift(n);break}s.push(n);break}if(0===o){e.unshift([n]);break}}}return e}function In(t,e){var i;void 0===e&&(e=!1);var n=t.offsetTop,r=t.offsetLeft,o=t.offsetHeight;return e&&(n=(i=ui(t))[0],r=i[1]),{top:n,left:r,height:o,bottom:n+o}}var Sn={extends:kn,mixins:[hn],name:"grid",props:{masonry:Boolean,parallax:Number},data:{margin:"uk-grid-margin",clsStack:"uk-grid-stack",masonry:!1,parallax:0},computed:{length:function(t,e){return e.children.length},parallax:function(t){var e=t.parallax;return e&&this.length?Math.abs(e):""}},connected:function(){this.masonry&&ze(this.$el,"uk-flex-top uk-flex-wrap-top")},update:[{write:function(t){var e=t.stacks;He(this.$el,this.clsStack,e)},events:["resize"]},{read:function(t){var r=t.rows;if(!this.masonry&&!this.parallax)return!1;r=r.map(function(t){return Z(t,"offsetLeft")}),ct&&r.map(function(t){return t.reverse()});var e,i,n,o,s,a=r.some(function(t){return t.some(Ze.inProgress)}),h=!1,u="";if(this.masonry&&this.length){var c=0;h=r.reduce(function(i,t,n){return i[n]=t.map(function(t,e){return 0===n?0:j(i[n-1][e])+(c-j(r[n-1][e]&&r[n-1][e].offsetHeight))}),c=t.reduce(function(t,e){return Math.max(t,e.offsetHeight)},0),i},[]),s=r,u=Math.max.apply(Math,s.reduce(function(i,t){return t.forEach(function(t,e){return i[e]=(i[e]||0)+t.offsetHeight}),i},[]))+(e=this.$el,i=this.margin,n=Ut(e),j((o=n.filter(function(t){return Oe(t,i)})[0])?Ve(o,"marginTop"):Ve(n[0],"paddingLeft"))*(r.length-1))}return{padding:this.parallax&&function(t,e,i){for(var n=0,r=0,o=0,s=e.length-1;0<=s;s--)for(var a=n;a<e[s].length;a++){var h=e[s][a],u=h.offsetTop+ci(h)+(i&&-i[s][a]);r=Math.max(r,u),o=Math.max(o,u+(a%2?t:t/8)),n++}return o-r}(this.parallax,r,h),rows:r,translates:h,height:!a&&u}},write:function(t){var e=t.stacks,i=t.height,n=t.padding;He(this.$el,this.clsStack,e),Ve(this.$el,"paddingBottom",n),!1!==i&&Ve(this.$el,"height",i)},events:["resize"]},{read:function(t){var e=t.height;return{scrolled:!!this.parallax&&Hi(this.$el,e?e-ci(this.$el):0)*this.parallax}},write:function(t){var e=t.rows,n=t.scrolled,r=t.translates;!1===n&&!r||e.forEach(function(t,i){return t.forEach(function(t,e){return Ve(t,"transform",n||r?"translateY("+((r&&-r[i][e])+(n?e%2?n:n/8:0))+"px)":"")})})},events:["scroll","resize"]}]};var Tn=ut?{props:{selMinHeight:String},data:{selMinHeight:!1,forceHeight:!1},computed:{elements:function(t,e){var i=t.selMinHeight;return i?Ne(i,e):[e]}},update:[{read:function(){Ve(this.elements,"height","")},order:-5,events:["resize"]},{write:function(){var i=this;this.elements.forEach(function(t){var e=j(Ve(t,"minHeight"));e&&(i.forceHeight||Math.round(e+fi(t,"height","content-box"))>=t.offsetHeight)&&Ve(t,"height",e)})},order:5,events:["resize"]}]}:{},En={mixins:[Tn],args:"target",props:{target:String,row:Boolean},data:{target:"> *",row:!0,forceHeight:!0},computed:{elements:function(t,e){return Ne(t.target,e)}},update:{read:function(){return{rows:(this.row?$n(this.elements):[this.elements]).map(An)}},write:function(t){t.rows.forEach(function(t){var i=t.heights;return t.elements.forEach(function(t,e){return Ve(t,"minHeight",i[e])})})},events:["resize"]}};function An(t){var e;if(t.length<2)return{heights:[""],elements:t};var i=Cn(t),n=i.heights,r=i.max,o=t.some(function(t){return t.style.minHeight}),s=t.some(function(t,e){return!t.style.minHeight&&n[e]<r});return o&&s&&(Ve(t,"minHeight",""),e=Cn(t),n=e.heights,r=e.max),{heights:n=t.map(function(t,e){return n[e]===r&&j(t.style.minHeight).toFixed(2)!==r.toFixed(2)?"":r}),elements:t}}function Cn(t){var e=t.map(function(t){return si(t).height-fi(t,"height","content-box")});return{heights:e,max:Math.max.apply(null,e)}}var _n={mixins:[Tn],props:{expand:Boolean,offsetTop:Boolean,offsetBottom:Boolean,minHeight:Number},data:{expand:!1,offsetTop:!1,offsetBottom:!1,minHeight:0},update:{read:function(t){var e=t.minHeight;if(!Ft(this.$el))return!1;var i="",n=fi(this.$el,"height","content-box");if(this.expand){if(this.$el.dataset.heightExpand="",_e("[data-height-expand]")!==this.$el)return!1;i=ci(window)-(Nn(document.documentElement)-Nn(this.$el))-n||""}else{if(i="calc(100vh",this.offsetTop){var r=si(this.$el).top;i+=0<r&&r<ci(window)/2?" - "+r+"px":""}!0===this.offsetBottom?i+=" - "+Nn(this.$el.nextElementSibling)+"px":P(this.offsetBottom)?i+=" - "+this.offsetBottom+"vh":this.offsetBottom&&u(this.offsetBottom,"px")?i+=" - "+j(this.offsetBottom)+"px":D(this.offsetBottom)&&(i+=" - "+Nn(xt(this.offsetBottom,this.$el))+"px"),i+=(n?" - "+n+"px":"")+")"}return{minHeight:i,prev:e}},write:function(t){var e=t.minHeight,i=t.prev;Ve(this.$el,{minHeight:e}),e!==i&&this.$update(this.$el,"resize"),this.minHeight&&j(Ve(this.$el,"minHeight"))<this.minHeight&&Ve(this.$el,"minHeight",this.minHeight)},events:["resize"]}};function Nn(t){return t&&si(t).height||0}var Mn={args:"src",props:{id:Boolean,icon:String,src:String,style:String,width:Number,height:Number,ratio:Number,class:String,strokeAnimation:Boolean,focusable:Boolean,attributes:"list"},data:{ratio:1,include:["style","class","focusable"],class:"",strokeAnimation:!1},beforeConnect:function(){var t,e=this;if(this.class+=" uk-svg",!this.icon&&b(this.src,"#")){var i=this.src.split("#");1<i.length&&(t=i,this.src=t[0],this.icon=t[1])}this.svg=this.getSvg().then(function(t){return e.applyAttributes(t),e.svgEl=function(t,e){if(Lt(e)||"CANVAS"===e.tagName){ot(e,"hidden",!0);var i=e.nextElementSibling;return On(t,i)?i:xe(e,t)}var n=e.lastElementChild;return On(t,n)?n:we(e,t)}(t,e.$el)},et)},disconnected:function(){var e=this;Lt(this.$el)&&ot(this.$el,"hidden",null),this.svg&&this.svg.then(function(t){return(!e._connected||t!==e.svgEl)&&ke(t)},et),this.svg=this.svgEl=null},update:{read:function(){return!!(this.strokeAnimation&&this.svgEl&&Ft(this.svgEl))},write:function(){var t,e;t=this.svgEl,(e=Pn(t))&&t.style.setProperty("--uk-animation-stroke",e)},type:["resize"]},methods:{getSvg:function(){var e=this;return function(i){if(zn[i])return zn[i];return zn[i]=new se(function(e,t){i?w(i,"data:")?e(decodeURIComponent(i.split(",")[1])):le(i).then(function(t){return e(t.response)},function(){return t("SVG not found.")}):t()})}(this.src).then(function(t){return function(t,e){e&&b(t,"<symbol")&&(t=function(t,e){if(!Bn[t]){var i;for(Bn[t]={},Dn.lastIndex=0;i=Dn.exec(t);)Bn[t][i[3]]='<svg xmlns="http://www.w3.org/2000/svg"'+i[1]+"svg>"}return Bn[t][e]}(t,e)||t);return(t=_e(t.substr(t.indexOf("<svg"))))&&t.hasChildNodes()&&t}(t,e.icon)||se.reject("SVG not found.")})},applyAttributes:function(i){var n=this;for(var t in this.$options.props)this[t]&&b(this.include,t)&&ot(i,t,this[t]);for(var e in this.attributes){var r=this.attributes[e].split(":",2),o=r[0],s=r[1];ot(i,o,s)}this.id||at(i,"id");var a=["width","height"],h=[this.width,this.height];h.some(function(t){return t})||(h=a.map(function(t){return ot(i,t)}));var u=ot(i,"viewBox");u&&!h.some(function(t){return t})&&(h=u.split(" ").slice(2)),h.forEach(function(t,e){(t=(0|t)*n.ratio)&&ot(i,a[e],t),t&&!h[1^e]&&at(i,a[1^e])}),ot(i,"data-svg",this.icon||this.src)}}},zn={};var Dn=/<symbol([^]*?id=(['"])(.+?)\2[^]*?<\/)symbol>/g,Bn={};function Pn(t){return Math.ceil(Math.max.apply(Math,[0].concat(Ne("[stroke]",t).map(function(t){try{return t.getTotalLength()}catch(t){return 0}}))))}function On(t,e){return ot(t,"data-svg")===ot(e,"data-svg")}var Hn={},Ln={spinner:'<svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg"><circle fill="none" stroke="#000" cx="15" cy="15" r="14"/></svg>',totop:'<svg width="18" height="10" viewBox="0 0 18 10" xmlns="http://www.w3.org/2000/svg"><polyline fill="none" stroke="#000" stroke-width="1.2" points="1 9 9 1 17 9 "/></svg>',marker:'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><rect x="9" y="4" width="1" height="11"/><rect x="4" y="9" width="11" height="1"/></svg>',"close-icon":'<svg width="14" height="14" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg"><line fill="none" stroke="#000" stroke-width="1.1" x1="1" y1="1" x2="13" y2="13"/><line fill="none" stroke="#000" stroke-width="1.1" x1="13" y1="1" x2="1" y2="13"/></svg>',"close-large":'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><line fill="none" stroke="#000" stroke-width="1.4" x1="1" y1="1" x2="19" y2="19"/><line fill="none" stroke="#000" stroke-width="1.4" x1="19" y1="1" x2="1" y2="19"/></svg>',"navbar-toggle-icon":'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><rect y="9" width="20" height="2"/><rect y="3" width="20" height="2"/><rect y="15" width="20" height="2"/></svg>',"overlay-icon":'<svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><rect x="19" y="0" width="1" height="40"/><rect x="0" y="19" width="40" height="1"/></svg>',"pagination-next":'<svg width="7" height="12" viewBox="0 0 7 12" xmlns="http://www.w3.org/2000/svg"><polyline fill="none" stroke="#000" stroke-width="1.2" points="1 1 6 6 1 11"/></svg>',"pagination-previous":'<svg width="7" height="12" viewBox="0 0 7 12" xmlns="http://www.w3.org/2000/svg"><polyline fill="none" stroke="#000" stroke-width="1.2" points="6 1 1 6 6 11"/></svg>',"search-icon":'<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><circle fill="none" stroke="#000" stroke-width="1.1" cx="9" cy="9" r="7"/><path fill="none" stroke="#000" stroke-width="1.1" d="M14,14 L18,18 L14,14 Z"/></svg>',"search-large":'<svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><circle fill="none" stroke="#000" stroke-width="1.8" cx="17.5" cy="17.5" r="16.5"/><line fill="none" stroke="#000" stroke-width="1.8" x1="38" y1="39" x2="29" y2="30"/></svg>',"search-navbar":'<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle fill="none" stroke="#000" stroke-width="1.1" cx="10.5" cy="10.5" r="9.5"/><line fill="none" stroke="#000" stroke-width="1.1" x1="23" y1="23" x2="17" y2="17"/></svg>',"slidenav-next":'<svg width="14px" height="24px" viewBox="0 0 14 24" xmlns="http://www.w3.org/2000/svg"><polyline fill="none" stroke="#000" stroke-width="1.4" points="1.225,23 12.775,12 1.225,1 "/></svg>',"slidenav-next-large":'<svg width="25px" height="40px" viewBox="0 0 25 40" xmlns="http://www.w3.org/2000/svg"><polyline fill="none" stroke="#000" stroke-width="2" points="4.002,38.547 22.527,20.024 4,1.5 "/></svg>',"slidenav-previous":'<svg width="14px" height="24px" viewBox="0 0 14 24" xmlns="http://www.w3.org/2000/svg"><polyline fill="none" stroke="#000" stroke-width="1.4" points="12.775,1 1.225,12 12.775,23 "/></svg>',"slidenav-previous-large":'<svg width="25px" height="40px" viewBox="0 0 25 40" xmlns="http://www.w3.org/2000/svg"><polyline fill="none" stroke="#000" stroke-width="2" points="20.527,1.5 2,20.024 20.525,38.547 "/></svg>'},Fn={install:function(r){r.icon.add=function(t,e){var i,n=D(t)?((i={})[t]=e,i):t;J(n,function(t,e){Ln[e]=t,delete Hn[e]}),r._initialized&&Ce(document.body,function(t){return J(r.getComponents(t),function(t){t.$options.isIcon&&t.icon in n&&t.$reset()})})}},extends:Mn,args:"icon",props:["icon"],data:{include:["focusable"]},isIcon:!0,beforeConnect:function(){ze(this.$el,"uk-icon")},methods:{getSvg:function(){var t,e=function(t){if(!Ln[t])return null;Hn[t]||(Hn[t]=_e(Ln[t].trim()));return Hn[t].cloneNode(!0)}((t=this.icon,ct?X(X(t,"left","right"),"previous","next"):t));return e?se.resolve(e):se.reject("Icon not found.")}}},jn={args:!1,extends:Fn,data:function(t){return{icon:d(t.constructor.options.name)}},beforeConnect:function(){ze(this.$el,this.$name)}},Wn={extends:jn,beforeConnect:function(){ze(this.$el,"uk-slidenav")},computed:{icon:function(t,e){var i=t.icon;return Oe(e,"uk-slidenav-large")?i+"-large":i}}},Vn={extends:jn,computed:{icon:function(t,e){var i=t.icon;return Oe(e,"uk-search-icon")&&qt(e,".uk-search-large").length?"search-large":qt(e,".uk-search-navbar").length?"search-navbar":i}}},Rn={extends:jn,computed:{icon:function(){return"close-"+(Oe(this.$el,"uk-close-large")?"large":"icon")}}},qn={extends:jn,connected:function(){var e=this;this.svg.then(function(t){return 1!==e.ratio&&Ve(_e("circle",t),"strokeWidth",1/e.ratio)},et)}};var Un={args:"dataSrc",props:{dataSrc:String,dataSrcset:Boolean,sizes:String,width:Number,height:Number,offsetTop:String,offsetLeft:String,target:String},data:{dataSrc:"",dataSrcset:!1,sizes:!1,width:!1,height:!1,offsetTop:"50vh",offsetLeft:0,target:!1},computed:{cacheKey:function(t){var e=t.dataSrc;return this.$name+"."+e},width:function(t){var e=t.width,i=t.dataWidth;return e||i},height:function(t){var e=t.height,i=t.dataHeight;return e||i},sizes:function(t){var e=t.sizes,i=t.dataSizes;return e||i},isImg:function(t,e){return Qn(e)},target:{get:function(t){var e=t.target;return[this.$el].concat(yt(e,this.$el))},watch:function(){this.observe()}},offsetTop:function(t){return wi(t.offsetTop,"height")},offsetLeft:function(t){return wi(t.offsetLeft,"width")}},connected:function(){er[this.cacheKey]?Yn(this.$el,er[this.cacheKey]||this.dataSrc,this.dataSrcset,this.sizes):this.isImg&&this.width&&this.height&&Yn(this.$el,function(t,e,i){var n;i&&(n=rt.ratio({width:t,height:e},"width",wi(Gn(i))),t=n.width,e=n.height);return'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="'+t+'" height="'+e+'"></svg>'}(this.width,this.height,this.sizes)),this.observer=new Vi(this.load,{rootMargin:this.offsetTop+"px "+this.offsetLeft+"px"}),requestAnimationFrame(this.observe)},disconnected:function(){this.observer.disconnect()},update:{read:function(t){var e=this,i=t.image;if(i||"complete"!==document.readyState||this.load(this.observer.takeRecords()),this.isImg)return!1;i&&i.then(function(t){return t&&""!==t.currentSrc&&Yn(e.$el,tr(t))})},write:function(t){if(this.dataSrcset&&1!==window.devicePixelRatio){var e=Ve(this.$el,"backgroundSize");!e.match(/^(auto\s?)+$/)&&j(e)!==t.bgSize||(t.bgSize=(i=this.dataSrcset,n=this.sizes,r=wi(Gn(n)),(o=(i.match(Zn)||[]).map(j).sort(function(t,e){return t-e})).filter(function(t){return r<=t})[0]||o.pop()||""),Ve(this.$el,"backgroundSize",t.bgSize+"px"))}var i,n,r,o},events:["resize"]},methods:{load:function(t){var e=this;t.some(function(t){return H(t.isIntersecting)||t.isIntersecting})&&(this._data.image=de(this.dataSrc,this.dataSrcset,this.sizes).then(function(t){return Yn(e.$el,tr(t),t.srcset,t.sizes),er[e.cacheKey]=tr(t),t},et),this.observer.disconnect())},observe:function(){var e=this;this._connected&&!this._data.image&&this.target.forEach(function(t){return e.observer.observe(t)})}}};function Yn(t,e,i,n){if(Qn(t))n&&(t.sizes=n),i&&(t.srcset=i),e&&(t.src=e);else if(e){!b(t.style.backgroundImage,e)&&(Ve(t,"backgroundImage","url("+Ot(e)+")"),Kt(t,Jt("load",!1)))}}var Xn=/\s*(.*?)\s*(\w+|calc\(.*?\))\s*(?:,|$)/g;function Gn(t){var e,i;for(Xn.lastIndex=0;e=Xn.exec(t);)if(!e[1]||window.matchMedia(e[1]).matches){e=w(i=e[2],"calc")?i.substring(5,i.length-1).replace(Kn,function(t){return wi(t)}).replace(/ /g,"").match(Jn).reduce(function(t,e){return t+ +e},0):i;break}return e||"100vw"}var Kn=/\d+(?:\w+|%)/g,Jn=/[+-]?(\d+)/g;var Zn=/\s+\d+w\s*(?:,|$)/g;function Qn(t){return"IMG"===t.tagName}function tr(t){return t.currentSrc||t.src}var er,ir="__test__";try{(er=window.sessionStorage||{})[ir]=1,delete er[ir]}catch(t){er={}}var nr={props:{media:Boolean},data:{media:!1},computed:{matchMedia:function(){var t=function(t){if(D(t)){if("@"===t[0])t=j(Ye("breakpoint-"+t.substr(1)));else if(isNaN(t))return t}return!(!t||isNaN(t))&&"(min-width: "+t+"px)"}(this.media);return!t||window.matchMedia(t).matches}}};var rr={mixins:[hn,nr],props:{fill:String},data:{fill:"",clsWrapper:"uk-leader-fill",clsHide:"uk-leader-hide",attrFill:"data-fill"},computed:{fill:function(t){return t.fill||Ye("leader-fill-content")}},connected:function(){var t;t=Ie(this.$el,'<span class="'+this.clsWrapper+'">'),this.wrapper=t[0]},disconnected:function(){Se(this.wrapper.childNodes)},update:{read:function(t){var e=t.changed,i=t.width,n=i;return{width:i=Math.floor(this.$el.offsetWidth/2),fill:this.fill,changed:e||n!==i,hide:!this.matchMedia}},write:function(t){He(this.wrapper,this.clsHide,t.hide),t.changed&&(t.changed=!1,ot(this.wrapper,this.attrFill,new Array(t.width).join(t.fill)))},events:["resize"]}},or={props:{container:Boolean},data:{container:!0},computed:{container:function(t){var e=t.container;return!0===e&&this.$container||e&&_e(e)}}},sr=[],ar={mixins:[hn,or,un],props:{selPanel:String,selClose:String,escClose:Boolean,bgClose:Boolean,stack:Boolean},data:{cls:"uk-open",escClose:!0,bgClose:!0,overlay:!0,stack:!1},computed:{panel:function(t,e){return _e(t.selPanel,e)},transitionElement:function(){return this.panel},bgClose:function(t){return t.bgClose&&this.panel}},beforeDisconnect:function(){this.isToggled()&&this.toggleNow(this.$el,!1)},events:[{name:"click",delegate:function(){return this.selClose},handler:function(t){t.preventDefault(),this.hide()}},{name:"toggle",self:!0,handler:function(t){t.defaultPrevented||(t.preventDefault(),this.toggle())}},{name:"beforeshow",self:!0,handler:function(t){if(b(sr,this))return!1;!this.stack&&sr.length?(se.all(sr.map(function(t){return t.hide()})).then(this.show),t.preventDefault()):sr.push(this)}},{name:"show",self:!0,handler:function(){var r=this;li(window)-li(document)&&this.overlay&&Ve(document.body,"overflowY","scroll"),ze(document.documentElement,this.clsPage),this.bgClose&&Gt(this.$el,"hide",bn(document,"click",function(t){var e=t.defaultPrevented,i=t.target,n=K(sr);e||n!==r||n.overlay&&!Rt(i,n.$el)||Rt(i,n.panel)||n.hide()}),{self:!0}),this.escClose&&Gt(this.$el,"hide",Yt(document,"keydown",function(t){var e=K(sr);27===t.keyCode&&e===r&&(t.preventDefault(),e.hide())}),{self:!0})}},{name:"hidden",self:!0,handler:function(){var e=this;sr.splice(sr.indexOf(this),1),sr.length||Ve(document.body,"overflowY",""),sr.some(function(t){return t.clsPage===e.clsPage})||De(document.documentElement,this.clsPage)}}],methods:{toggle:function(){return this.isToggled()?this.hide():this.show()},show:function(){var e=this;return this.container&&this.$el.parentNode!==this.container?(we(this.container,this.$el),new se(function(t){return requestAnimationFrame(function(){return e.show().then(t)})})):this.toggleElement(this.$el,!0,hr(this))},hide:function(){return this.toggleElement(this.$el,!1,hr(this))}}};function hr(t){var s=t.transitionElement,a=t._toggle;return function(r,o){return new se(function(i,n){return Gt(r,"show hide",function(){r._reject&&r._reject(),r._reject=n,a(r,o);var t=Gt(s,"transitionstart",function(){Gt(s,"transitionend transitioncancel",i,{self:!0}),clearTimeout(e)},{self:!0}),e=setTimeout(function(){t(),i()},U(Ve(s,"transitionDuration")))})})}}var ur={install:function(t){var a=t.modal;function e(t,e,i,n){e=G({bgClose:!1,escClose:!0,labels:a.labels},e);var r=a.dialog(t(e),e),o=new oe,s=!1;return Yt(r.$el,"submit","form",function(t){t.preventDefault(),o.resolve(n&&n(r)),s=!0,r.hide()}),Yt(r.$el,"hide",function(){return!s&&i(o)}),o.promise.dialog=r,o.promise}a.dialog=function(t,e){var i=a('<div class="uk-modal"> <div class="uk-modal-dialog">'+t+"</div> </div>",e);return i.show(),Yt(i.$el,"hidden",function(){return se.resolve().then(function(){return i.$destroy(!0)})},{self:!0}),i},a.alert=function(i,t){return e(function(t){var e=t.labels;return'<div class="uk-modal-body">'+(D(i)?i:ve(i))+'</div> <div class="uk-modal-footer uk-text-right"> <button class="uk-button uk-button-primary uk-modal-close" autofocus>'+e.ok+"</button> </div>"},t,function(t){return t.resolve()})},a.confirm=function(i,t){return e(function(t){var e=t.labels;return'<form> <div class="uk-modal-body">'+(D(i)?i:ve(i))+'</div> <div class="uk-modal-footer uk-text-right"> <button class="uk-button uk-button-default uk-modal-close" type="button">'+e.cancel+'</button> <button class="uk-button uk-button-primary" autofocus>'+e.ok+"</button> </div> </form>"},t,function(t){return t.reject()})},a.prompt=function(i,n,t){return e(function(t){var e=t.labels;return'<form class="uk-form-stacked"> <div class="uk-modal-body"> <label>'+(D(i)?i:ve(i))+'</label> <input class="uk-input" value="'+(n||"")+'" autofocus> </div> <div class="uk-modal-footer uk-text-right"> <button class="uk-button uk-button-default uk-modal-close" type="button">'+e.cancel+'</button> <button class="uk-button uk-button-primary">'+e.ok+"</button> </div> </form>"},t,function(t){return t.resolve(null)},function(t){return _e("input",t.$el).value})},a.labels={ok:"Ok",cancel:"Cancel"}},mixins:[ar],data:{clsPage:"uk-modal-page",selPanel:".uk-modal-dialog",selClose:".uk-modal-close, .uk-modal-close-default, .uk-modal-close-outside, .uk-modal-close-full"},events:[{name:"show",self:!0,handler:function(){Oe(this.panel,"uk-margin-auto-vertical")?ze(this.$el,"uk-flex"):Ve(this.$el,"display","block"),ci(this.$el)}},{name:"hidden",self:!0,handler:function(){Ve(this.$el,"display",""),De(this.$el,"uk-flex")}}]};var cr={extends:ln,data:{targets:"> .uk-parent",toggle:"> a",content:"> ul"}},lr={mixins:[hn,Tn],props:{dropdown:String,mode:"list",align:String,offset:Number,boundary:Boolean,boundaryAlign:Boolean,clsDrop:String,delayShow:Number,delayHide:Number,dropbar:Boolean,dropbarMode:String,dropbarAnchor:Boolean,duration:Number},data:{dropdown:".uk-navbar-nav > li",align:ct?"right":"left",clsDrop:"uk-navbar-dropdown",mode:void 0,offset:void 0,delayShow:void 0,delayHide:void 0,boundaryAlign:void 0,flip:"x",boundary:!0,dropbar:!1,dropbarMode:"slide",dropbarAnchor:!1,duration:200,forceHeight:!0,selMinHeight:".uk-navbar-nav > li > a, .uk-navbar-item, .uk-navbar-toggle"},computed:{boundary:function(t,e){var i=t.boundary,n=t.boundaryAlign;return!0===i||n?e:i},dropbarAnchor:function(t,e){return xt(t.dropbarAnchor,e)},pos:function(t){return"bottom-"+t.align},dropbar:{get:function(t){var e=t.dropbar;return e?(e=this._dropbar||xt(e,this.$el)||_e("+ .uk-navbar-dropbar",this.$el))||(this._dropbar=_e("<div></div>")):null},watch:function(t){ze(t,"uk-navbar-dropbar"),He(t,"uk-navbar-dropbar-slide","slide"===this.dropbarMode)},immediate:!0},dropdowns:{get:function(t,e){return Ne(t.dropdown+" ."+t.clsDrop,e)},watch:function(t){var e=this;this.$create("drop",t.filter(function(t){return!e.getDropdown(t)}),G({},this.$props,{boundary:this.boundary,pos:this.pos,offset:this.dropbar||this.offset}))},immediate:!0}},disconnected:function(){this.dropbar&&ke(this.dropbar),delete this._dropbar},events:[{name:"mouseover",delegate:function(){return this.dropdown},handler:function(t){var e=t.current,i=this.getActive();i&&i.toggle&&!Rt(i.toggle.$el,e)&&!i.tracker.movesTo(i.$el)&&i.hide(!1)}},{name:"mouseleave",el:function(){return this.dropbar},handler:function(){var t=this.getActive();t&&!this.dropdowns.some(function(t){return Mt(t,":hover")})&&t.hide()}},{name:"beforeshow",capture:!0,filter:function(){return this.dropbar},handler:function(){this.dropbar.parentNode||xe(this.dropbarAnchor||this.$el,this.dropbar)}},{name:"show",capture:!0,filter:function(){return this.dropbar},handler:function(t,e){var i=e.$el,n=e.dir;this.clsDrop&&ze(i,this.clsDrop+"-dropbar"),"bottom"===n&&this.transitionTo(i.offsetHeight+j(Ve(i,"marginTop"))+j(Ve(i,"marginBottom")),i)}},{name:"beforehide",filter:function(){return this.dropbar},handler:function(t,e){var i=e.$el,n=this.getActive();Mt(this.dropbar,":hover")&&n&&n.$el===i&&t.preventDefault()}},{name:"hide",filter:function(){return this.dropbar},handler:function(t,e){var i=e.$el,n=this.getActive();(!n||n&&n.$el===i)&&this.transitionTo(0)}}],methods:{getActive:function(){var t=this.dropdowns.map(this.getDropdown).filter(function(t){return t&&t.isActive()})[0];return t&&b(t.mode,"hover")&&Rt(t.toggle.$el,this.$el)&&t},transitionTo:function(t,e){var i=this,n=this.dropbar,r=Ft(n)?ci(n):0;return Ve(e=r<t&&e,"clip","rect(0,"+e.offsetWidth+"px,"+r+"px,0)"),ci(n,r),Ze.cancel([e,n]),se.all([Ze.start(n,{height:t},this.duration),Ze.start(e,{clip:"rect(0,"+e.offsetWidth+"px,"+t+"px,0)"},this.duration)]).catch(et).then(function(){Ve(e,{clip:""}),i.$update(n)})},getDropdown:function(t){return this.$getComponent(t,"drop")||this.$getComponent(t,"dropdown")}}},dr={mixins:[ar],args:"mode",props:{mode:String,flip:Boolean,overlay:Boolean},data:{mode:"slide",flip:!1,overlay:!1,clsPage:"uk-offcanvas-page",clsContainer:"uk-offcanvas-container",selPanel:".uk-offcanvas-bar",clsFlip:"uk-offcanvas-flip",clsContainerAnimation:"uk-offcanvas-container-animation",clsSidebarAnimation:"uk-offcanvas-bar-animation",clsMode:"uk-offcanvas",clsOverlay:"uk-offcanvas-overlay",selClose:".uk-offcanvas-close",container:!1},computed:{clsFlip:function(t){var e=t.flip,i=t.clsFlip;return e?i:""},clsOverlay:function(t){var e=t.overlay,i=t.clsOverlay;return e?i:""},clsMode:function(t){var e=t.mode;return t.clsMode+"-"+e},clsSidebarAnimation:function(t){var e=t.mode,i=t.clsSidebarAnimation;return"none"===e||"reveal"===e?"":i},clsContainerAnimation:function(t){var e=t.mode,i=t.clsContainerAnimation;return"push"!==e&&"reveal"!==e?"":i},transitionElement:function(t){return"reveal"===t.mode?this.panel.parentNode:this.panel}},events:[{name:"click",delegate:function(){return'a[href^="#"]'},handler:function(t){var e=t.current.hash;!t.defaultPrevented&&e&&_e(e,document.body)&&this.hide()}},{name:"touchstart",passive:!0,el:function(){return this.panel},handler:function(t){var e=t.targetTouches;1===e.length&&(this.clientY=e[0].clientY)}},{name:"touchmove",self:!0,passive:!1,filter:function(){return this.overlay},handler:function(t){t.cancelable&&t.preventDefault()}},{name:"touchmove",passive:!1,el:function(){return this.panel},handler:function(t){if(1===t.targetTouches.length){var e=event.targetTouches[0].clientY-this.clientY,i=this.panel,n=i.scrollTop,r=i.scrollHeight,o=i.clientHeight;(r<=o||0===n&&0<e||r-n<=o&&e<0)&&t.cancelable&&t.preventDefault()}}},{name:"show",self:!0,handler:function(){"reveal"!==this.mode||Oe(this.panel.parentNode,this.clsMode)||($e(this.panel,"<div>"),ze(this.panel.parentNode,this.clsMode)),Ve(document.documentElement,"overflowY",this.overlay?"hidden":""),ze(document.body,this.clsContainer,this.clsFlip),Ve(document.body,"touch-action","pan-y pinch-zoom"),Ve(this.$el,"display","block"),ze(this.$el,this.clsOverlay),ze(this.panel,this.clsSidebarAnimation,"reveal"!==this.mode?this.clsMode:""),ci(document.body),ze(document.body,this.clsContainerAnimation),this.clsContainerAnimation&&(fr().content+=",user-scalable=0")}},{name:"hide",self:!0,handler:function(){De(document.body,this.clsContainerAnimation),Ve(document.body,"touch-action","")}},{name:"hidden",self:!0,handler:function(){var t;this.clsContainerAnimation&&((t=fr()).content=t.content.replace(/,user-scalable=0$/,"")),"reveal"===this.mode&&Se(this.panel),De(this.panel,this.clsSidebarAnimation,this.clsMode),De(this.$el,this.clsOverlay),Ve(this.$el,"display",""),De(document.body,this.clsContainer,this.clsFlip),Ve(document.documentElement,"overflowY","")}},{name:"swipeLeft swipeRight",handler:function(t){this.isToggled()&&u(t.type,"Left")^this.flip&&this.hide()}}]};function fr(){return _e('meta[name="viewport"]',document.head)||we(document.head,'<meta name="viewport">')}var pr={mixins:[hn],props:{selContainer:String,selContent:String},data:{selContainer:".uk-modal",selContent:".uk-modal-dialog"},computed:{container:function(t,e){return Dt(e,t.selContainer)},content:function(t,e){return Dt(e,t.selContent)}},connected:function(){Ve(this.$el,"minHeight",150)},update:{read:function(){return!(!this.content||!this.container)&&{current:j(Ve(this.$el,"maxHeight")),max:Math.max(150,ci(this.container)-(si(this.content).height-ci(this.$el)))}},write:function(t){var e=t.current,i=t.max;Ve(this.$el,"maxHeight",i),Math.round(e)!==Math.round(i)&&Kt(this.$el,"resize")},events:["resize"]}},mr={props:["width","height"],connected:function(){ze(this.$el,"uk-responsive-width")},update:{read:function(){return!!(Ft(this.$el)&&this.width&&this.height)&&{width:li(this.$el.parentNode),height:this.height}},write:function(t){ci(this.$el,rt.contain({height:this.height,width:this.width},t).height)},events:["resize"]}},gr={props:{offset:Number},data:{offset:0},methods:{scrollTo:function(t){var e=this;t=t&&_e(t)||document.body,Kt(this.$el,"beforescroll",[this,t])&&Oi(t,{offset:this.offset}).then(function(){return Kt(e.$el,"scrolled",[e,t])})}},events:{click:function(t){t.defaultPrevented||(t.preventDefault(),this.scrollTo(Ot(decodeURIComponent(this.$el.hash)).substr(1)))}}},vr={args:"cls",props:{cls:String,target:String,hidden:Boolean,offsetTop:Number,offsetLeft:Number,repeat:Boolean,delay:Number},data:function(){return{cls:!1,target:!1,hidden:!0,offsetTop:0,offsetLeft:0,repeat:!1,delay:0,inViewClass:"uk-scrollspy-inview"}},computed:{elements:{get:function(t,e){var i=t.target;return i?Ne(i,e):[e]},watch:function(t){this.hidden&&Ve(Vt(t,":not(."+this.inViewClass+")"),"visibility","hidden")},immediate:!0}},update:[{read:function(t){var i=this;t.update&&this.elements.forEach(function(t){var e=t._ukScrollspyState;(e=e||{cls:ht(t,"uk-scrollspy-class")||i.cls}).show=Bi(t,i.offsetTop,i.offsetLeft),t._ukScrollspyState=e})},write:function(n){var r=this;if(!n.update)return this.$update(),n.update=!0;this.elements.forEach(function(e){function t(t){Ve(e,"visibility",!t&&r.hidden?"hidden":""),He(e,r.inViewClass,t),He(e,i.cls),Kt(e,t?"inview":"outview"),i.inview=t,r.$update(e)}var i=e._ukScrollspyState;!i.show||i.inview||i.queued?!i.show&&i.inview&&!i.queued&&r.repeat&&t(!1):(i.queued=!0,n.promise=(n.promise||se.resolve()).then(function(){return new se(function(t){return setTimeout(t,r.delay)})}).then(function(){t(!0),setTimeout(function(){return i.queued=!1},300)}))})},events:["scroll","resize"]}]},wr={props:{cls:String,closest:String,scroll:Boolean,overflow:Boolean,offset:Number},data:{cls:"uk-active",closest:!1,scroll:!1,overflow:!0,offset:0},computed:{links:{get:function(t,e){return Ne('a[href^="#"]',e).filter(function(t){return t.hash})},watch:function(t){this.scroll&&this.$create("scroll",t,{offset:this.offset||0})},immediate:!0},targets:function(){return Ne(this.links.map(function(t){return Ot(t.hash).substr(1)}).join(","))},elements:function(t){var e=t.closest;return Dt(Ne(this.targets.map(function(t){return'[href="#'+t.id+'"]'}).join(",")),e||"*")}},update:[{read:function(){var i=this,t=this.targets.length;if(!t||!Ft(this.$el))return!1;var e=K(Li(this.targets[0])),n=e.scrollTop,r=e.scrollHeight,o=Fi(e),s=n,a=r-si(o).height,h=!1;return s===a?h=t-1:(this.targets.every(function(t,e){if(hi(t,o).top-i.offset<=0)return h=e,!0}),!1===h&&this.overflow&&(h=0)),{active:h}},write:function(t){var e=t.active;this.links.forEach(function(t){return t.blur()}),De(this.elements,this.cls),!1!==e&&Kt(this.$el,"active",[e,ze(this.elements[e],this.cls)])},events:["scroll","resize"]}]},br={mixins:[hn,nr],props:{top:null,bottom:Boolean,offset:String,animation:String,clsActive:String,clsInactive:String,clsFixed:String,clsBelow:String,selTarget:String,widthElement:Boolean,showOnUp:Boolean,targetOffset:Number},data:{top:0,bottom:!1,offset:0,animation:"",clsActive:"uk-active",clsInactive:"",clsFixed:"uk-sticky-fixed",clsBelow:"uk-sticky-below",selTarget:"",widthElement:!1,showOnUp:!1,targetOffset:!1},computed:{offset:function(t){return wi(t.offset)},selTarget:function(t,e){var i=t.selTarget;return i&&_e(i,e)||e},widthElement:function(t,e){return xt(t.widthElement,e)||this.placeholder},isActive:{get:function(){return Oe(this.selTarget,this.clsActive)},set:function(t){t&&!this.isActive?(Pe(this.selTarget,this.clsInactive,this.clsActive),Kt(this.$el,"active")):t||Oe(this.selTarget,this.clsInactive)||(Pe(this.selTarget,this.clsActive,this.clsInactive),Kt(this.$el,"inactive"))}}},connected:function(){this.placeholder=_e("+ .uk-sticky-placeholder",this.$el)||_e('<div class="uk-sticky-placeholder"></div>'),this.isFixed=!1,this.isActive=!1},disconnected:function(){this.isFixed&&(this.hide(),De(this.selTarget,this.clsInactive)),ke(this.placeholder),this.placeholder=null,this.widthElement=null},events:[{name:"load hashchange popstate",el:window,handler:function(){var n=this;if(!1!==this.targetOffset&&location.hash&&0<window.pageYOffset){var r=_e(location.hash);r&&xi.read(function(){var t=si(r).top,e=si(n.$el).top,i=n.$el.offsetHeight;n.isFixed&&t<=e+i&&e<=t+r.offsetHeight&&Pi(window,t-i-(P(n.targetOffset)?n.targetOffset:0)-n.offset)})}}}],update:[{read:function(t,e){var i=t.height;this.isActive&&"update"!==e&&(this.hide(),i=this.$el.offsetHeight,this.show()),i=this.isActive?i:this.$el.offsetHeight,this.topOffset=si(this.isFixed?this.placeholder:this.$el).top,this.bottomOffset=this.topOffset+i;var n=xr("bottom",this);return this.top=Math.max(j(xr("top",this)),this.topOffset)-this.offset,this.bottom=n&&n-i,this.inactive=!this.matchMedia,{lastScroll:!1,height:i,margins:Ve(this.$el,["marginTop","marginBottom","marginLeft","marginRight"])}},write:function(t){var e=t.height,i=t.margins,n=this.placeholder;Ve(n,G({height:e},i)),Rt(n,document)||(xe(this.$el,n),ot(n,"hidden","")),this.isActive=this.isActive},events:["resize"]},{read:function(t){var e=t.scroll;return void 0===e&&(e=0),this.width=(Ft(this.widthElement)?this.widthElement:this.$el).offsetWidth,this.scroll=window.pageYOffset,{dir:e<=this.scroll?"down":"up",scroll:this.scroll,visible:Ft(this.$el),top:ui(this.placeholder)[0]}},write:function(t,e){var i=this,n=t.initTimestamp;void 0===n&&(n=0);var r=t.dir,o=t.lastDir,s=t.lastScroll,a=t.scroll,h=t.top,u=t.visible,c=performance.now();if(!((t.lastScroll=a)<0||a===s||!u||this.disabled||this.showOnUp&&"scroll"!==e||((300<c-n||r!==o)&&(t.initScroll=a,t.initTimestamp=c),t.lastDir=r,this.showOnUp&&Math.abs(t.initScroll-a)<=30&&Math.abs(s-a)<=10)))if(this.inactive||a<this.top||this.showOnUp&&(a<=this.top||"down"===r||"up"===r&&!this.isFixed&&a<=this.bottomOffset)){if(!this.isFixed)return void(ni.inProgress(this.$el)&&a<h&&(ni.cancel(this.$el),this.hide()));this.isFixed=!1,this.animation&&a>this.topOffset?(ni.cancel(this.$el),ni.out(this.$el,this.animation).then(function(){return i.hide()},et)):this.hide()}else this.isFixed?this.update():this.animation?(ni.cancel(this.$el),this.show(),ni.in(this.$el,this.animation).catch(et)):this.show()},events:["resize","scroll"]}],methods:{show:function(){this.isFixed=!0,this.update(),ot(this.placeholder,"hidden",null)},hide:function(){this.isActive=!1,De(this.$el,this.clsFixed,this.clsBelow),Ve(this.$el,{position:"",top:"",width:""}),ot(this.placeholder,"hidden","")},update:function(){var t=0!==this.top||this.scroll>this.top,e=Math.max(0,this.offset);this.bottom&&this.scroll>this.bottom-this.offset&&(e=this.bottom-this.scroll),Ve(this.$el,{position:"fixed",top:e+"px",width:this.width}),this.isActive=t,He(this.$el,this.clsBelow,this.scroll>this.bottomOffset),ze(this.$el,this.clsFixed)}}};function xr(t,e){var i=e.$props,n=e.$el,r=e[t+"Offset"],o=i[t];if(o)return P(o)&&D(o)&&o.match(/^-?\d/)?r+wi(o):si(!0===o?n.parentNode:xt(o,n)).bottom}var yr={mixins:[un],args:"connect",props:{connect:String,toggle:String,active:Number,swiping:Boolean},data:{connect:"~.uk-switcher",toggle:"> * > :first-child",active:0,swiping:!0,cls:"uk-active",clsContainer:"uk-switcher",attrItem:"uk-switcher-item",queued:!0},computed:{connects:{get:function(t,e){return yt(t.connect,e)},watch:function(t){var e=this;t.forEach(function(t){return e.updateAria(t.children)}),this.swiping&&Ve(t,"touch-action","pan-y pinch-zoom")},immediate:!0},toggles:{get:function(t,e){return Ne(t.toggle,e).filter(function(t){return!Mt(t,".uk-disabled *, .uk-disabled, [disabled]")})},watch:function(t){var e=this.index();this.show(~e&&e||t[this.active]||t[0])},immediate:!0}},events:[{name:"click",delegate:function(){return this.toggle},handler:function(t){b(this.toggles,t.current)&&(t.preventDefault(),this.show(t.current))}},{name:"click",el:function(){return this.connects},delegate:function(){return"["+this.attrItem+"],[data-"+this.attrItem+"]"},handler:function(t){t.preventDefault(),this.show(ht(t.current,this.attrItem))}},{name:"swipeRight swipeLeft",filter:function(){return this.swiping},el:function(){return this.connects},handler:function(t){var e=t.type;this.show(u(e,"Left")?"next":"previous")}},{name:"show",el:function(){return this.connects},handler:function(){var i=this,n=this.index();this.toggles.forEach(function(e,t){He(Ut(i.$el).filter(function(t){return Rt(e,t)}),i.cls,n===t),ot(e,"aria-expanded",n===t)})}}],methods:{index:function(){return pe(Ut(this.connects[0],"."+this.cls)[0])},show:function(t){var i=this,n=this.index(),r=me(t,this.toggles,n);this.connects.forEach(function(t){var e=t.children;return i.toggleElement([e[n],e[r]],void 0,0<=n)})}}},kr={mixins:[hn],extends:yr,props:{media:Boolean},data:{media:960,attrItem:"uk-tab-item"},connected:function(){var t=Oe(this.$el,"uk-tab-left")?"uk-tab-left":!!Oe(this.$el,"uk-tab-right")&&"uk-tab-right";t&&this.$create("toggle",this.$el,{cls:t,mode:"media",media:this.media})}},$r={mixins:[nr,un],args:"target",props:{href:String,target:null,mode:"list"},data:{href:!1,target:!1,mode:"click",queued:!0},computed:{target:{get:function(t,e){var i=t.href,n=t.target;return(n=yt(n||i,e)).length&&n||[e]},watch:function(){Kt(this.target,"updatearia",[this])},immediate:!0}},events:[{name:vt+" "+wt,filter:function(){return b(this.mode,"hover")},handler:function(t){ne(t)||this.toggle("toggle"+(t.type===vt?"show":"hide"))}},{name:"click",filter:function(){return b(this.mode,"click")||ft&&b(this.mode,"hover")},handler:function(t){var e;(Dt(t.target,'a[href="#"], a[href=""]')||(e=Dt(t.target,"a[href]"))&&(this.cls&&!Oe(this.target,this.cls.split(" ")[0])||!Ft(this.target)||e.hash&&Mt(this.target,e.hash)))&&t.preventDefault(),this.toggle()}}],update:{read:function(){return!(!b(this.mode,"media")||!this.media)&&{match:this.matchMedia}},write:function(t){var e=t.match,i=this.isToggled(this.target);(e?!i:i)&&this.toggle()},events:["resize"]},methods:{toggle:function(t){Kt(this.target,t||"toggle",[this])&&this.toggleElement(this.target)}}},Ir=Object.freeze({__proto__:null,Accordion:ln,Alert:fn,Cover:mn,Drop:wn,Dropdown:wn,FormCustom:xn,Gif:yn,Grid:Sn,HeightMatch:En,HeightViewport:_n,Icon:Fn,Img:Un,Leader:rr,Margin:kn,Modal:ur,Nav:cr,Navbar:lr,Offcanvas:dr,OverflowAuto:pr,Responsive:mr,Scroll:gr,Scrollspy:vr,ScrollspyNav:wr,Sticky:br,Svg:Mn,Switcher:yr,Tab:kr,Toggle:$r,Video:pn,Close:Rn,Spinner:qn,SlidenavNext:Wn,SlidenavPrevious:Wn,SearchIcon:Vn,Marker:jn,NavbarToggleIcon:jn,OverlayIcon:jn,PaginationNext:jn,PaginationPrevious:jn,Totop:jn}),Sr={mixins:[hn],props:{date:String,clsWrapper:String},data:{date:"",clsWrapper:".uk-countdown-%unit%"},computed:{date:function(t){var e=t.date;return Date.parse(e)},days:function(t,e){return _e(t.clsWrapper.replace("%unit%","days"),e)},hours:function(t,e){return _e(t.clsWrapper.replace("%unit%","hours"),e)},minutes:function(t,e){return _e(t.clsWrapper.replace("%unit%","minutes"),e)},seconds:function(t,e){return _e(t.clsWrapper.replace("%unit%","seconds"),e)},units:function(){var e=this;return["days","hours","minutes","seconds"].filter(function(t){return e[t]})}},connected:function(){this.start()},disconnected:function(){var e=this;this.stop(),this.units.forEach(function(t){return ge(e[t])})},events:[{name:"visibilitychange",el:document,handler:function(){document.hidden?this.stop():this.start()}}],update:{write:function(){var t,e,n=this,r=(t=this.date,{total:e=t-Date.now(),seconds:e/1e3%60,minutes:e/1e3/60%60,hours:e/1e3/60/60%24,days:e/1e3/60/60/24});r.total<=0&&(this.stop(),r.days=r.hours=r.minutes=r.seconds=0),this.units.forEach(function(t){var e=String(Math.floor(r[t]));e=e.length<2?"0"+e:e;var i=n[t];i.textContent!==e&&((e=e.split("")).length!==i.children.length&&ve(i,e.map(function(){return"<span></span>"}).join("")),e.forEach(function(t,e){return i.children[e].textContent=t}))})}},methods:{start:function(){this.stop(),this.date&&this.units.length&&(this.$update(),this.timer=setInterval(this.$update,1e3))},stop:function(){this.timer&&(clearInterval(this.timer),this.timer=null)}}};var Tr,Er="uk-animation-target",Ar={props:{animation:Number},data:{animation:150},computed:{target:function(){return this.$el}},methods:{animate:function(t){var n=this;!function(){if(Tr)return;(Tr=we(document.head,"<style>").sheet).insertRule("."+Er+" > * {\n            margin-top: 0 !important;\n            transform: none !important;\n        }",0)}();var r=Ut(this.target),o=r.map(function(t){return Cr(t,!0)}),e=ci(this.target),i=window.pageYOffset;t(),Ze.cancel(this.target),r.forEach(Ze.cancel),_r(this.target),this.$update(this.target,"resize"),xi.flush();var s=ci(this.target),a=(r=r.concat(Ut(this.target).filter(function(t){return!b(r,t)}))).map(function(t,e){return!!(t.parentNode&&e in o)&&(o[e]?Ft(t)?Nr(t):{opacity:0}:{opacity:Ft(t)?1:0})});return o=a.map(function(t,e){var i=r[e].parentNode===n.target&&(o[e]||Cr(r[e]));if(i)if(t){if(!("opacity"in t)){i.opacity%1?t.opacity=1:delete i.opacity}}else delete i.opacity;return i}),ze(this.target,Er),r.forEach(function(t,e){return o[e]&&Ve(t,o[e])}),Ve(this.target,"height",e),Pi(window,i),se.all(r.map(function(t,e){return["top","left","height","width"].some(function(t){return o[e][t]!==a[e][t]})&&Ze.start(t,a[e],n.animation,"ease")}).concat(e!==s&&Ze.start(this.target,{height:s},this.animation,"ease"))).then(function(){r.forEach(function(t,e){return Ve(t,{display:0===a[e].opacity?"none":"",zIndex:""})}),_r(n.target),n.$update(n.target,"resize"),xi.flush()},et)}}};function Cr(t,e){var i=Ve(t,"zIndex");return!!Ft(t)&&G({display:"",opacity:e?Ve(t,"opacity"):"0",pointerEvents:"none",position:"absolute",zIndex:"auto"===i?pe(t):i},Nr(t))}function _r(t){Ve(t.children,{height:"",left:"",opacity:"",pointerEvents:"",position:"",top:"",width:""}),De(t,Er),Ve(t,"height","")}function Nr(t){var e=si(t),i=e.height,n=e.width,r=hi(t);return{top:r.top,left:r.left,height:i,width:n}}var Mr={mixins:[Ar],args:"target",props:{target:Boolean,selActive:Boolean},data:{target:null,selActive:!1,attrItem:"uk-filter-control",cls:"uk-active",animation:250},computed:{toggles:{get:function(t,e){t.attrItem;return Ne("["+this.attrItem+"],[data-"+this.attrItem+"]",e)},watch:function(){var e=this;if(this.updateState(),!1!==this.selActive){var i=Ne(this.selActive,this.$el);this.toggles.forEach(function(t){return He(t,e.cls,b(i,t))})}},immediate:!0},target:function(t,e){return _e(t.target,e)},children:{get:function(){return Ut(this.target)},watch:function(t,e){var i,n;n=e,(i=t).length===n.length&&i.every(function(t){return~n.indexOf(t)})||this.updateState()}}},events:[{name:"click",delegate:function(){return"["+this.attrItem+"],[data-"+this.attrItem+"]"},handler:function(t){t.preventDefault(),this.apply(t.current)}}],methods:{apply:function(t){this.setState(Dr(t,this.attrItem,this.getState()))},getState:function(){var i=this;return this.toggles.filter(function(t){return Oe(t,i.cls)}).reduce(function(t,e){return Dr(e,i.attrItem,t)},{filter:{"":""},sort:[]})},setState:function(u,t){var c=this;void 0===t&&(t=!0),u=G({filter:{"":""},sort:[]},u),Kt(this.$el,"beforeFilter",[this,u]);var l=this.children;this.toggles.forEach(function(t){return He(t,c.cls,!!function(t,e,i){var n=i.filter;void 0===n&&(n={"":""});var r=i.sort,o=r[0],s=r[1],a=zr(t,e),h=a.filter;void 0===h&&(h="");var u=a.group;void 0===u&&(u="");var c=a.sort,l=a.order;void 0===l&&(l="asc");return H(c)?u in n&&h===n[u]||!h&&u&&!(u in n)&&!n[""]:o===c&&s===l}(t,c.attrItem,u))});function e(){var t,e,i=(t=u.filter,e="",J(t,function(t){return e+=t||""}),e);l.forEach(function(t){return Ve(t,"display",i&&!Mt(t,i)?"none":"")});var n,r,o=u.sort,s=o[0],a=o[1];if(s){var h=(n=s,r=a,G([],l).sort(function(t,e){return ht(t,n).localeCompare(ht(e,n),void 0,{numeric:!0})*("asc"===r||-1)}));Y(h,l)||h.forEach(function(t){return we(c.target,t)})}}t?this.animate(e).then(function(){return Kt(c.$el,"afterFilter",[c])}):(e(),Kt(this.$el,"afterFilter",[this]))},updateState:function(){var t=this;xi.write(function(){return t.setState(t.getState(),!1)})}}};function zr(t,e){return Ni(ht(t,e),["filter"])}function Dr(t,e,i){var n=zr(t,e),r=n.filter,o=n.group,s=n.sort,a=n.order;return void 0===a&&(a="asc"),(r||H(s))&&(o?r?(delete i.filter[""],i.filter[o]=r):(delete i.filter[o],(O(i.filter)||""in i.filter)&&(i.filter={"":r||""})):i.filter={"":r||""}),H(s)||(i.sort=[s,a]),i}var Br={slide:{show:function(t){return[{transform:Or(-100*t)},{transform:Or()}]},percent:function(t){return Pr(t)},translate:function(t,e){return[{transform:Or(-100*e*t)},{transform:Or(100*e*(1-t))}]}}};function Pr(t){return Math.abs(Ve(t,"transform").split(",")[4]/t.offsetWidth)||0}function Or(t,e){return void 0===t&&(t=0),void 0===e&&(e="%"),t+=t?e:"",ut?"translateX("+t+")":"translate3d("+t+", 0, 0)"}function Hr(t){return"scale3d("+t+", "+t+", 1)"}var Lr=G({},Br,{fade:{show:function(){return[{opacity:0},{opacity:1}]},percent:function(t){return 1-Ve(t,"opacity")},translate:function(t){return[{opacity:1-t},{opacity:t}]}},scale:{show:function(){return[{opacity:0,transform:Hr(.8)},{opacity:1,transform:Hr(1)}]},percent:function(t){return 1-Ve(t,"opacity")},translate:function(t){return[{opacity:1-t,transform:Hr(1-.2*t)},{opacity:t,transform:Hr(.8+.2*t)}]}}});function Fr(t,e,i){Kt(t,Jt(e,!1,!1,i))}var jr={mixins:[{props:{autoplay:Boolean,autoplayInterval:Number,pauseOnHover:Boolean},data:{autoplay:!1,autoplayInterval:7e3,pauseOnHover:!0},connected:function(){this.autoplay&&this.startAutoplay()},disconnected:function(){this.stopAutoplay()},update:function(){ot(this.slides,"tabindex","-1")},events:[{name:"visibilitychange",el:document,filter:function(){return this.autoplay},handler:function(){document.hidden?this.stopAutoplay():this.startAutoplay()}}],methods:{startAutoplay:function(){var t=this;this.stopAutoplay(),this.interval=setInterval(function(){return(!t.draggable||!_e(":focus",t.$el))&&(!t.pauseOnHover||!Mt(t.$el,":hover"))&&!t.stack.length&&t.show("next")},this.autoplayInterval)},stopAutoplay:function(){this.interval&&clearInterval(this.interval)}}},{props:{draggable:Boolean},data:{draggable:!0,threshold:10},created:function(){var n=this;["start","move","end"].forEach(function(t){var i=n[t];n[t]=function(t){var e=re(t).x*(ct?-1:1);n.prevPos=e!==n.pos?n.pos:n.prevPos,n.pos=e,i(t)}})},events:[{name:pt,delegate:function(){return this.selSlides},handler:function(t){var e;!this.draggable||!ne(t)&&(!(e=t.target).children.length&&e.childNodes.length)||Dt(t.target,jt)||0<t.button||this.length<2||this.start(t)}},{name:"touchmove",passive:!1,handler:"move",delegate:function(){return this.selSlides}},{name:"dragstart",handler:function(t){t.preventDefault()}}],methods:{start:function(){var t=this;this.drag=this.pos,this._transitioner?(this.percent=this._transitioner.percent(),this.drag+=this._transitioner.getDistance()*this.percent*this.dir,this._transitioner.cancel(),this._transitioner.translate(this.percent),this.dragging=!0,this.stack=[]):this.prevIndex=this.index;var e="touchmove"!=mt?Yt(document,mt,this.move,{passive:!1}):et;this.unbindMove=function(){e(),t.unbindMove=null},Yt(window,"scroll",this.unbindMove),Yt(document,gt,this.end,!0),Ve(this.list,"userSelect","none")},move:function(t){var e=this;if(this.unbindMove){var i=this.pos-this.drag;if(!(0==i||this.prevPos===this.pos||!this.dragging&&Math.abs(i)<this.threshold)){Ve(this.list,"pointerEvents","none"),t.cancelable&&t.preventDefault(),this.dragging=!0,this.dir=i<0?1:-1;for(var n=this.slides,r=this.prevIndex,o=Math.abs(i),s=this.getIndex(r+this.dir,r),a=this._getDistance(r,s)||n[r].offsetWidth;s!==r&&a<o;)this.drag-=a*this.dir,r=s,o-=a,s=this.getIndex(r+this.dir,r),a=this._getDistance(r,s)||n[r].offsetWidth;this.percent=o/a;var h,u=n[r],c=n[s],l=this.index!==s,d=r===s;[this.index,this.prevIndex].filter(function(t){return!b([s,r],t)}).forEach(function(t){Kt(n[t],"itemhidden",[e]),d&&(h=!0,e.prevIndex=r)}),(this.index===r&&this.prevIndex!==r||h)&&Kt(n[this.index],"itemshown",[this]),l&&(this.prevIndex=r,this.index=s,d||Kt(u,"beforeitemhide",[this]),Kt(c,"beforeitemshow",[this])),this._transitioner=this._translate(Math.abs(this.percent),u,!d&&c),l&&(d||Kt(u,"itemhide",[this]),Kt(c,"itemshow",[this]))}}},end:function(){if(Xt(window,"scroll",this.unbindMove),this.unbindMove&&this.unbindMove(),Xt(document,gt,this.end,!0),this.dragging)if(this.dragging=null,this.index===this.prevIndex)this.percent=1-this.percent,this.dir*=-1,this._show(!1,this.index,!0),this._transitioner=null;else{var t=(ct?this.dir*(ct?1:-1):this.dir)<0==this.prevPos>this.pos;this.index=t?this.index:this.prevIndex,t&&(this.percent=1-this.percent),this.show(0<this.dir&&!t||this.dir<0&&t?"next":"previous",!0)}Ve(this.list,{userSelect:"",pointerEvents:""}),this.drag=this.percent=null}}},{data:{selNav:!1},computed:{nav:function(t,e){return _e(t.selNav,e)},selNavItem:function(t){var e=t.attrItem;return"["+e+"],[data-"+e+"]"},navItems:function(t,e){return Ne(this.selNavItem,e)}},update:{write:function(){var i=this;this.nav&&this.length!==this.nav.children.length&&ve(this.nav,this.slides.map(function(t,e){return"<li "+i.attrItem+'="'+e+'"><a href></a></li>'}).join("")),He(Ne(this.selNavItem,this.$el).concat(this.nav),"uk-hidden",!this.maxIndex),this.updateNav()},events:["resize"]},events:[{name:"click",delegate:function(){return this.selNavItem},handler:function(t){t.preventDefault(),this.show(ht(t.current,this.attrItem))}},{name:"itemshow",handler:"updateNav"}],methods:{updateNav:function(){var i=this,n=this.getValidIndex();this.navItems.forEach(function(t){var e=ht(t,i.attrItem);He(t,i.clsActive,F(e)===n),He(t,"uk-invisible",i.finite&&("previous"===e&&0===n||"next"===e&&n>=i.maxIndex))})}}}],props:{clsActivated:Boolean,easing:String,index:Number,finite:Boolean,velocity:Number,selSlides:String},data:function(){return{easing:"ease",finite:!1,velocity:1,index:0,prevIndex:-1,stack:[],percent:0,clsActive:"uk-active",clsActivated:!1,Transitioner:!1,transitionOptions:{}}},connected:function(){this.prevIndex=-1,this.index=this.getValidIndex(this.index),this.stack=[]},disconnected:function(){De(this.slides,this.clsActive)},computed:{duration:function(t,e){var i=t.velocity;return Wr(e.offsetWidth/i)},list:function(t,e){return _e(t.selList,e)},maxIndex:function(){return this.length-1},selSlides:function(t){return t.selList+" "+(t.selSlides||"> *")},slides:{get:function(){return Ne(this.selSlides,this.$el)},watch:function(){this.$reset()}},length:function(){return this.slides.length}},events:{itemshown:function(){this.$update(this.list)}},methods:{show:function(t,e){var i=this;if(void 0===e&&(e=!1),!this.dragging&&this.length){var n=this.stack,r=e?0:n.length,o=function(){n.splice(r,1),n.length&&i.show(n.shift(),!0)};if(n[e?"unshift":"push"](t),!e&&1<n.length)2===n.length&&this._transitioner.forward(Math.min(this.duration,200));else{var s=this.getIndex(this.index),a=Oe(this.slides,this.clsActive)&&this.slides[s],h=this.getIndex(t,this.index),u=this.slides[h];if(a!==u){var c,l;if(this.dir=(l=s,"next"!==(c=t)&&("previous"===c||c<l)?-1:1),this.prevIndex=s,this.index=h,a&&Kt(a,"beforeitemhide",[this]),!Kt(u,"beforeitemshow",[this,a]))return this.index=this.prevIndex,void o();var d=this._show(a,u,e).then(function(){return a&&Kt(a,"itemhidden",[i]),Kt(u,"itemshown",[i]),new se(function(t){xi.write(function(){n.shift(),n.length?i.show(n.shift(),!0):i._transitioner=null,t()})})});return a&&Kt(a,"itemhide",[this]),Kt(u,"itemshow",[this]),d}o()}}},getIndex:function(t,e){return void 0===t&&(t=this.index),void 0===e&&(e=this.index),tt(me(t,this.slides,e,this.finite),0,this.maxIndex)},getValidIndex:function(t,e){return void 0===t&&(t=this.index),void 0===e&&(e=this.prevIndex),this.getIndex(t,e)},_show:function(t,e,i){if(this._transitioner=this._getTransitioner(t,e,this.dir,G({easing:i?e.offsetWidth<600?"cubic-bezier(0.25, 0.46, 0.45, 0.94)":"cubic-bezier(0.165, 0.84, 0.44, 1)":this.easing},this.transitionOptions)),!i&&!t)return this._translate(1),se.resolve();var n=this.stack.length;return this._transitioner[1<n?"forward":"show"](1<n?Math.min(this.duration,75+75/(n-1)):this.duration,this.percent)},_getDistance:function(t,e){return this._getTransitioner(t,t!==e&&e).getDistance()},_translate:function(t,e,i){void 0===e&&(e=this.prevIndex),void 0===i&&(i=this.index);var n=this._getTransitioner(e!==i&&e,i);return n.translate(t),n},_getTransitioner:function(t,e,i,n){return void 0===t&&(t=this.prevIndex),void 0===e&&(e=this.index),void 0===i&&(i=this.dir||1),void 0===n&&(n=this.transitionOptions),new this.Transitioner(B(t)?this.slides[t]:t,B(e)?this.slides[e]:e,i*(ct?-1:1),n)}}};function Wr(t){return.5*t+300}var Vr={mixins:[jr],props:{animation:String},data:{animation:"slide",clsActivated:"uk-transition-active",Animations:Br,Transitioner:function(o,s,a,t){var e=t.animation,h=t.easing,i=e.percent,n=e.translate,r=e.show;void 0===r&&(r=et);var u=r(a),c=new oe;return{dir:a,show:function(t,e,i){var n=this;void 0===e&&(e=0);var r=i?"linear":h;return t-=Math.round(t*tt(e,-1,1)),this.translate(e),Fr(s,"itemin",{percent:e,duration:t,timing:r,dir:a}),Fr(o,"itemout",{percent:1-e,duration:t,timing:r,dir:a}),se.all([Ze.start(s,u[1],t,r),Ze.start(o,u[0],t,r)]).then(function(){n.reset(),c.resolve()},et),c.promise},stop:function(){return Ze.stop([s,o])},cancel:function(){Ze.cancel([s,o])},reset:function(){for(var t in u[0])Ve([s,o],t,"")},forward:function(t,e){return void 0===e&&(e=this.percent()),Ze.cancel([s,o]),this.show(t,e,!0)},translate:function(t){this.reset();var e=n(t,a);Ve(s,e[1]),Ve(o,e[0]),Fr(s,"itemtranslatein",{percent:t,dir:a}),Fr(o,"itemtranslateout",{percent:1-t,dir:a})},percent:function(){return i(o||s,s,a)},getDistance:function(){return o&&o.offsetWidth}}}},computed:{animation:function(t){var e=t.animation,i=t.Animations;return G(e in i?i[e]:i.slide,{name:e})},transitionOptions:function(){return{animation:this.animation}}},events:{"itemshow itemhide itemshown itemhidden":function(t){var e=t.target;this.$update(e)},beforeitemshow:function(t){ze(t.target,this.clsActive)},itemshown:function(t){ze(t.target,this.clsActivated)},itemhidden:function(t){De(t.target,this.clsActive,this.clsActivated)}}},Rr={mixins:[or,ar,un,Vr],functional:!0,props:{delayControls:Number,preload:Number,videoAutoplay:Boolean,template:String},data:function(){return{preload:1,videoAutoplay:!1,delayControls:3e3,items:[],cls:"uk-open",clsPage:"uk-lightbox-page",selList:".uk-lightbox-items",attrItem:"uk-lightbox-item",selClose:".uk-close-large",selCaption:".uk-lightbox-caption",pauseOnHover:!1,velocity:2,Animations:Lr,template:'<div class="uk-lightbox uk-overflow-hidden"> <ul class="uk-lightbox-items"></ul> <div class="uk-lightbox-toolbar uk-position-top uk-text-right uk-transition-slide-top uk-transition-opaque"> <button class="uk-lightbox-toolbar-icon uk-close-large" type="button" uk-close></button> </div> <a class="uk-lightbox-button uk-position-center-left uk-position-medium uk-transition-fade" href uk-slidenav-previous uk-lightbox-item="previous"></a> <a class="uk-lightbox-button uk-position-center-right uk-position-medium uk-transition-fade" href uk-slidenav-next uk-lightbox-item="next"></a> <div class="uk-lightbox-toolbar uk-lightbox-caption uk-position-bottom uk-text-center uk-transition-slide-bottom uk-transition-opaque"></div> </div>'}},created:function(){var t=_e(this.template),e=_e(this.selList,t);this.items.forEach(function(){return we(e,"<li></li>")}),this.$mount(we(this.container,t))},computed:{caption:function(t,e){t.selCaption;return _e(".uk-lightbox-caption",e)}},events:[{name:mt+" "+pt+" keydown",handler:"showControls"},{name:"click",self:!0,delegate:function(){return this.selSlides},handler:function(t){t.defaultPrevented||this.hide()}},{name:"shown",self:!0,handler:function(){this.showControls()}},{name:"hide",self:!0,handler:function(){this.hideControls(),De(this.slides,this.clsActive),Ze.stop(this.slides)}},{name:"hidden",self:!0,handler:function(){this.$destroy(!0)}},{name:"keyup",el:document,handler:function(t){if(this.isToggled(this.$el)&&this.draggable)switch(t.keyCode){case 37:this.show("previous");break;case 39:this.show("next")}}},{name:"beforeitemshow",handler:function(t){this.isToggled()||(this.draggable=!1,t.preventDefault(),this.toggleElement(this.$el,!0,!1),this.animation=Lr.scale,De(t.target,this.clsActive),this.stack.splice(1,0,this.index))}},{name:"itemshow",handler:function(t){var e=pe(t.target),i=this.getItem(e).caption;Ve(this.caption,"display",i?"":"none"),ve(this.caption,i);for(var n=0;n<=this.preload;n++)this.loadItem(this.getIndex(e+n)),this.loadItem(this.getIndex(e-n))}},{name:"itemshown",handler:function(){this.draggable=this.$props.draggable}},{name:"itemload",handler:function(t,r){var o,s=this,e=r.source,i=r.type,n=r.alt;if(this.setItem(r,"<span uk-spinner></span>"),e)if("image"===i||e.match(/\.(jpe?g|png|gif|svg|webp)($|\?)/i))de(e).then(function(t){return s.setItem(r,'<img width="'+t.width+'" height="'+t.height+'" src="'+e+'" alt="'+(n||"")+'">')},function(){return s.setError(r)});else if("video"===i||e.match(/\.(mp4|webm|ogv)($|\?)/i)){var a=_e("<video controls playsinline"+(r.poster?' poster="'+r.poster+'"':"")+' uk-video="'+this.videoAutoplay+'"></video>');ot(a,"src",e),Gt(a,"error loadedmetadata",function(t){"error"===t?s.setError(r):(ot(a,{width:a.videoWidth,height:a.videoHeight}),s.setItem(r,a))})}else if("iframe"===i||e.match(/\.(html|php)($|\?)/i))this.setItem(r,'<iframe class="uk-lightbox-iframe" src="'+e+'" frameborder="0" allowfullscreen></iframe>');else if(o=e.match(/\/\/.*?youtube(-nocookie)?\.[a-z]+\/watch\?v=([^&\s]+)/)||e.match(/()youtu\.be\/(.*)/)){var h=o[2],u=function(t,e){return void 0===t&&(t=640),void 0===e&&(e=450),s.setItem(r,qr("https://www.youtube"+(o[1]||"")+".com/embed/"+h,t,e,s.videoAutoplay))};de("https://img.youtube.com/vi/"+h+"/maxresdefault.jpg").then(function(t){var e=t.width,i=t.height;120===e&&90===i?de("https://img.youtube.com/vi/"+h+"/0.jpg").then(function(t){var e=t.width,i=t.height;return u(e,i)},u):u(e,i)},u)}else(o=e.match(/(\/\/.*?)vimeo\.[a-z]+\/([0-9]+).*?/))&&le("https://vimeo.com/api/oembed.json?maxwidth=1920&url="+encodeURI(e),{responseType:"json",withCredentials:!1}).then(function(t){var e=t.response,i=e.height,n=e.width;return s.setItem(r,qr("https://player.vimeo.com/video/"+o[2],n,i,s.videoAutoplay))},function(){return s.setError(r)})}}],methods:{loadItem:function(t){void 0===t&&(t=this.index);var e=this.getItem(t);e.content||Kt(this.$el,"itemload",[e])},getItem:function(t){return void 0===t&&(t=this.index),this.items[t]||{}},setItem:function(t,e){G(t,{content:e});var i=ve(this.slides[this.items.indexOf(t)],e);Kt(this.$el,"itemloaded",[this,i]),this.$update(i)},setError:function(t){this.setItem(t,'<span uk-icon="icon: bolt; ratio: 2"></span>')},showControls:function(){clearTimeout(this.controlsTimer),this.controlsTimer=setTimeout(this.hideControls,this.delayControls),ze(this.$el,"uk-active","uk-transition-active")},hideControls:function(){De(this.$el,"uk-active","uk-transition-active")}}};function qr(t,e,i,n){return'<iframe src="'+t+'" width="'+e+'" height="'+i+'" style="max-width: 100%; box-sizing: border-box;" frameborder="0" allowfullscreen uk-video="autoplay: '+n+'" uk-responsive></iframe>'}var Ur,Yr={install:function(t,e){t.lightboxPanel||t.component("lightboxPanel",Rr);G(e.props,t.component("lightboxPanel").options.props)},props:{toggle:String},data:{toggle:"a"},computed:{toggles:{get:function(t,e){return Ne(t.toggle,e)},watch:function(){this.hide()}}},disconnected:function(){this.hide()},events:[{name:"click",delegate:function(){return this.toggle+":not(.uk-disabled)"},handler:function(t){t.preventDefault(),this.show(t.current)}}],methods:{show:function(t){var e=this,i=Q(this.toggles.map(Xr),"source");if(N(t)){var n=Xr(t).source;t=y(i,function(t){var e=t.source;return n===e})}return this.panel=this.panel||this.$create("lightboxPanel",G({},this.$props,{items:i})),Yt(this.panel.$el,"hidden",function(){return e.panel=!1}),this.panel.show(t)},hide:function(){return this.panel&&this.panel.hide()}}};function Xr(i){return["href","caption","type","poster","alt"].reduce(function(t,e){return t["href"===e?"source":e]=ht(i,e),t},{})}var Gr={functional:!0,args:["message","status"],data:{message:"",status:"",timeout:5e3,group:null,pos:"top-center",clsContainer:"uk-notification",clsClose:"uk-notification-close",clsMsg:"uk-notification-message"},install:function(r){r.notification.closeAll=function(i,n){Ce(document.body,function(t){var e=r.getComponent(t,"notification");!e||i&&i!==e.group||e.close(n)})}},computed:{marginProp:function(t){return"margin"+(w(t.pos,"top")?"Top":"Bottom")},startProps:function(){var t;return(t={opacity:0})[this.marginProp]=-this.$el.offsetHeight,t}},created:function(){var t=_e("."+this.clsContainer+"-"+this.pos,this.$container)||we(this.$container,'<div class="'+this.clsContainer+" "+this.clsContainer+"-"+this.pos+'" style="display: block"></div>');this.$mount(we(t,'<div class="'+this.clsMsg+(this.status?" "+this.clsMsg+"-"+this.status:"")+'"> <a href class="'+this.clsClose+'" data-uk-close></a> <div>'+this.message+"</div> </div>"))},connected:function(){var t,e=this,i=j(Ve(this.$el,this.marginProp));Ze.start(Ve(this.$el,this.startProps),((t={opacity:1})[this.marginProp]=i,t)).then(function(){e.timeout&&(e.timer=setTimeout(e.close,e.timeout))})},events:((Ur={click:function(t){Dt(t.target,'a[href="#"],a[href=""]')&&t.preventDefault(),this.close()}})[vt]=function(){this.timer&&clearTimeout(this.timer)},Ur[wt]=function(){this.timeout&&(this.timer=setTimeout(this.close,this.timeout))},Ur),methods:{close:function(t){function e(){var t=i.$el.parentNode;Kt(i.$el,"close",[i]),ke(i.$el),t&&!t.hasChildNodes()&&ke(t)}var i=this;this.timer&&clearTimeout(this.timer),t?e():Ze.start(this.$el,this.startProps).then(e)}}};var Kr=["x","y","bgx","bgy","rotate","scale","color","backgroundColor","borderColor","opacity","blur","hue","grayscale","invert","saturate","sepia","fopacity","stroke"],Jr={mixins:[nr],props:Kr.reduce(function(t,e){return t[e]="list",t},{}),data:Kr.reduce(function(t,e){return t[e]=void 0,t},{}),computed:{props:function(m,g){var v=this;return Kr.reduce(function(t,e){if(H(m[e]))return t;var i,n,r,o=e.match(/color/i),s=o||"opacity"===e,a=m[e].slice(0);s&&Ve(g,e,""),a.length<2&&a.unshift(("scale"===e?1:s?Ve(g,e):0)||0);var h=a.reduce(function(t,e){return D(e)&&e.replace(/-|\d/g,"").trim()||t},"");if(o){var u=g.style.color;a=a.map(function(t){return Ve(Ve(g,"color",t),"color").split(/[(),]/g).slice(1,-1).concat(1).slice(0,4).map(j)}),g.style.color=u}else if(w(e,"bg")){var c="bgy"===e?"height":"width";if(a=a.map(function(t){return wi(t,c,v.$el)}),Ve(g,"background-position-"+e[2],""),n=Ve(g,"backgroundPosition").split(" ")["x"===e[2]?0:1],v.covers){var l=Math.min.apply(Math,a),d=Math.max.apply(Math,a),f=a.indexOf(l)<a.indexOf(d);r=d-l,a=a.map(function(t){return t-(f?l:d)}),i=(f?-r:0)+"px"}else i=n}else a=a.map(j);if("stroke"===e){if(!a.some(function(t){return t}))return t;var p=Pn(v.$el);Ve(g,"strokeDasharray",p),"%"===h&&(a=a.map(function(t){return t*p/100})),a=a.reverse(),e="strokeDashoffset"}return t[e]={steps:a,unit:h,pos:i,bgPos:n,diff:r},t},{})},bgProps:function(){var e=this;return["bgx","bgy"].filter(function(t){return t in e.props})},covers:function(t,e){return n=(i=e).style.backgroundSize,r="cover"===Ve(Ve(i,"backgroundSize",""),"backgroundSize"),i.style.backgroundSize=n,r;var i,n,r}},disconnected:function(){delete this._image},update:{read:function(t){var h=this;if(t.active=this.matchMedia,t.active){if(!t.image&&this.covers&&this.bgProps.length){var e=Ve(this.$el,"backgroundImage").replace(/^none|url\(["']?(.+?)["']?\)$/,"$1");if(e){var i=new Image;i.src=e,(t.image=i).naturalWidth||(i.onload=function(){return h.$update()})}}var n=t.image;if(n&&n.naturalWidth){var u={width:this.$el.offsetWidth,height:this.$el.offsetHeight},c={width:n.naturalWidth,height:n.naturalHeight},l=rt.cover(c,u);this.bgProps.forEach(function(t){var e=h.props[t],i=e.diff,n=e.bgPos,r=e.steps,o="bgy"===t?"height":"width",s=l[o]-u[o];if(s<i)u[o]=l[o]+i-s;else if(i<s){var a=u[o]/wi(n,o,h.$el);a&&(h.props[t].steps=r.map(function(t){return t-(s-i)/a}))}l=rt.cover(c,u)}),t.dim=l}}},write:function(t){var e=t.dim;t.active?e&&Ve(this.$el,{backgroundSize:e.width+"px "+e.height+"px",backgroundRepeat:"no-repeat"}):Ve(this.$el,{backgroundSize:"",backgroundRepeat:""})},events:["resize"]},methods:{reset:function(){var i=this;J(this.getCss(0),function(t,e){return Ve(i.$el,e,"")})},getCss:function(l){var d=this.props;return Object.keys(d).reduce(function(t,e){var i=d[e],n=i.steps,r=i.unit,o=i.pos,s=function(t,e,i){void 0===i&&(i=2);var n=Zr(t,e),r=n[0],o=n[1],s=n[2];return(B(r)?r+Math.abs(r-o)*s*(r<o?1:-1):+o).toFixed(i)}(n,l);switch(e){case"x":case"y":r=r||"px",t.transform+=" translate"+p(e)+"("+j(s).toFixed("px"===r?0:2)+r+")";break;case"rotate":r=r||"deg",t.transform+=" rotate("+(s+r)+")";break;case"scale":t.transform+=" scale("+s+")";break;case"bgy":case"bgx":t["background-position-"+e[2]]="calc("+o+" + "+s+"px)";break;case"color":case"backgroundColor":case"borderColor":var a=Zr(n,l),h=a[0],u=a[1],c=a[2];t[e]="rgba("+h.map(function(t,e){return t+=c*(u[e]-t),3===e?j(t):parseInt(t,10)}).join(",")+")";break;case"blur":r=r||"px",t.filter+=" blur("+(s+r)+")";break;case"hue":r=r||"deg",t.filter+=" hue-rotate("+(s+r)+")";break;case"fopacity":r=r||"%",t.filter+=" opacity("+(s+r)+")";break;case"grayscale":case"invert":case"saturate":case"sepia":r=r||"%",t.filter+=" "+e+"("+(s+r)+")";break;default:t[e]=s}return t},{transform:"",filter:""})}}};function Zr(t,e){var i=t.length-1,n=Math.min(Math.floor(i*e),i-1),r=t.slice(n,n+2);return r.push(1===e?1:e%(1/i)*i),r}var Qr={mixins:[Jr],props:{target:String,viewport:Number,easing:Number},data:{target:!1,viewport:1,easing:1},computed:{target:function(t,e){var i=t.target;return function t(e){return e?"offsetTop"in e?e:t(e.parentNode):document.body}(i&&xt(i,e)||e)}},update:{read:function(t,e){var i=t.percent;if("scroll"!==e&&(i=!1),t.active){var n,r,o=i;return n=Hi(this.target)/(this.viewport||1),r=this.easing,{percent:i=tt(n*(1-(r-r*n))),style:o!==i&&this.getCss(i)}}},write:function(t){var e=t.style;t.active?e&&Ve(this.$el,e):this.reset()},events:["scroll","resize"]}};var to={update:{write:function(){if(!this.stack.length&&!this.dragging){var t=this.getValidIndex(this.index);~this.prevIndex&&this.index===t||this.show(t)}},events:["resize"]}};function eo(t,e,i){var n,r=ro(t,e);return i?r-(n=t,si(e).width/2-si(n).width/2):Math.min(r,io(e))}function io(t){return Math.max(0,no(t)-si(t).width)}function no(t){return so(t).reduce(function(t,e){return si(e).width+t},0)}function ro(t,e){return(hi(t).left+(ct?si(t).width-si(e).width:0))*(ct?-1:1)}function oo(t,e,i){Kt(t,Jt(e,!1,!1,i))}function so(t){return Ut(t)}var ao={mixins:[hn,jr,to],props:{center:Boolean,sets:Boolean},data:{center:!1,sets:!1,attrItem:"uk-slider-item",selList:".uk-slider-items",selNav:".uk-slider-nav",clsContainer:"uk-slider-container",Transitioner:function(r,n,o,t){var e=t.center,s=t.easing,a=t.list,h=new oe,i=r?eo(r,a,e):eo(n,a,e)+si(n).width*o,u=n?eo(n,a,e):i+si(r).width*o*(ct?-1:1);return{dir:o,show:function(t,e,i){void 0===e&&(e=0);var n=i?"linear":s;return t-=Math.round(t*tt(e,-1,1)),this.translate(e),r&&this.updateTranslates(),e=r?e:tt(e,0,1),oo(this.getItemIn(),"itemin",{percent:e,duration:t,timing:n,dir:o}),r&&oo(this.getItemIn(!0),"itemout",{percent:1-e,duration:t,timing:n,dir:o}),Ze.start(a,{transform:Or(-u*(ct?-1:1),"px")},t,n).then(h.resolve,et),h.promise},stop:function(){return Ze.stop(a)},cancel:function(){Ze.cancel(a)},reset:function(){Ve(a,"transform","")},forward:function(t,e){return void 0===e&&(e=this.percent()),Ze.cancel(a),this.show(t,e,!0)},translate:function(t){var e=this.getDistance()*o*(ct?-1:1);Ve(a,"transform",Or(tt(e-e*t-u,-no(a),si(a).width)*(ct?-1:1),"px")),this.updateTranslates(),r&&(t=tt(t,-1,1),oo(this.getItemIn(),"itemtranslatein",{percent:t,dir:o}),oo(this.getItemIn(!0),"itemtranslateout",{percent:1-t,dir:o}))},percent:function(){return Math.abs((Ve(a,"transform").split(",")[4]*(ct?-1:1)+i)/(u-i))},getDistance:function(){return Math.abs(u-i)},getItemIn:function(t){void 0===t&&(t=!1);var e=this.getActives(),i=Z(so(a),"offsetLeft"),n=pe(i,e[0<o*(t?-1:1)?e.length-1:0]);return~n&&i[n+(r&&!t?o:0)]},getActives:function(){var i=eo(r||n,a,e);return Z(so(a).filter(function(t){var e=ro(t,a);return i<=e&&e+si(t).width<=si(a).width+i}),"offsetLeft")},updateTranslates:function(){var i=this.getActives();so(a).forEach(function(t){var e=b(i,t);oo(t,"itemtranslate"+(e?"in":"out"),{percent:e?1:0,dir:t.offsetLeft<=n.offsetLeft?1:-1})})}}}},computed:{avgWidth:function(){return no(this.list)/this.length},finite:function(t){return t.finite||Math.ceil(no(this.list))<si(this.list).width+so(this.list).reduce(function(t,e){return Math.max(t,si(e).width)},0)+this.center},maxIndex:function(){if(!this.finite||this.center&&!this.sets)return this.length-1;if(this.center)return K(this.sets);Ve(this.slides,"order","");for(var t=io(this.list),e=this.length;e--;)if(ro(this.list.children[e],this.list)<t)return Math.min(e+1,this.length-1);return 0},sets:function(t){var o=this,e=t.sets,s=si(this.list).width/(this.center?2:1),a=0,h=s,u=0;return!O(e=e&&this.slides.reduce(function(t,e,i){var n=si(e).width;if(a<u+n&&(!o.center&&i>o.maxIndex&&(i=o.maxIndex),!b(t,i))){var r=o.slides[i+1];o.center&&r&&n<h-si(r).width/2?h-=n:(h=s,t.push(i),a=u+s+(o.center?n/2:0))}return u+=n,t},[]))&&e},transitionOptions:function(){return{center:this.center,list:this.list}}},connected:function(){He(this.$el,this.clsContainer,!_e("."+this.clsContainer,this.$el))},update:{write:function(){var i=this;Ne("["+this.attrItem+"],[data-"+this.attrItem+"]",this.$el).forEach(function(t){var e=ht(t,i.attrItem);i.maxIndex&&He(t,"uk-hidden",P(e)&&(i.sets&&!b(i.sets,j(e))||e>i.maxIndex))}),!this.length||this.dragging||this.stack.length||this._translate(1)},events:["resize"]},events:{beforeitemshow:function(t){!this.dragging&&this.sets&&this.stack.length<2&&!b(this.sets,this.index)&&(this.index=this.getValidIndex());var e=Math.abs(this.index-this.prevIndex+(0<this.dir&&this.index<this.prevIndex||this.dir<0&&this.index>this.prevIndex?(this.maxIndex+1)*this.dir:0));if(!this.dragging&&1<e){for(var i=0;i<e;i++)this.stack.splice(1,0,0<this.dir?"next":"previous");t.preventDefault()}else this.duration=Wr(this.avgWidth/this.velocity)*(si(this.dir<0||!this.slides[this.prevIndex]?this.slides[this.index]:this.slides[this.prevIndex]).width/this.avgWidth),this.reorder()},itemshow:function(){H(this.prevIndex)||ze(this._getTransitioner().getItemIn(),this.clsActive)},itemshown:function(){var e=this,i=this._getTransitioner(this.index).getActives();this.slides.forEach(function(t){return He(t,e.clsActive,b(i,t))}),this.sets&&!b(this.sets,j(this.index))||this.slides.forEach(function(t){return He(t,e.clsActivated,b(i,t))})}},methods:{reorder:function(){var i=this;if(Ve(this.slides,"order",""),!this.finite){var n=0<this.dir&&this.slides[this.prevIndex]?this.prevIndex:this.index;if(this.slides.forEach(function(t,e){return Ve(t,"order",0<i.dir&&e<n?1:i.dir<0&&e>=i.index?-1:"")}),this.center)for(var t=this.slides[n],e=si(this.list).width/2-si(t).width/2,r=0;0<e;){var o=this.getIndex(--r+n,n),s=this.slides[o];Ve(s,"order",n<o?-2:-1),e-=si(s).width}}},getValidIndex:function(t,e){if(void 0===t&&(t=this.index),void 0===e&&(e=this.prevIndex),t=this.getIndex(t,e),!this.sets)return t;var i;do{if(b(this.sets,t))return t;i=t,t=this.getIndex(t+this.dir,e)}while(t!==i);return t}}},ho={mixins:[Jr],data:{selItem:"!li"},computed:{item:function(t,e){return xt(t.selItem,e)}},events:[{name:"itemshown",self:!0,el:function(){return this.item},handler:function(){Ve(this.$el,this.getCss(.5))}},{name:"itemin itemout",self:!0,el:function(){return this.item},handler:function(t){var e=t.type,i=t.detail,n=i.percent,r=i.duration,o=i.timing,s=i.dir;Ze.cancel(this.$el),Ve(this.$el,this.getCss(co(e,s,n))),Ze.start(this.$el,this.getCss(uo(e)?.5:0<s?1:0),r,o).catch(et)}},{name:"transitioncanceled transitionend",self:!0,el:function(){return this.item},handler:function(){Ze.cancel(this.$el)}},{name:"itemtranslatein itemtranslateout",self:!0,el:function(){return this.item},handler:function(t){var e=t.type,i=t.detail,n=i.percent,r=i.dir;Ze.cancel(this.$el),Ve(this.$el,this.getCss(co(e,r,n)))}}]};function uo(t){return u(t,"in")}function co(t,e,i){return i/=2,uo(t)?e<0?1-i:i:e<0?i:1-i}var lo,fo,po=G({},Br,{fade:{show:function(){return[{opacity:0,zIndex:0},{zIndex:-1}]},percent:function(t){return 1-Ve(t,"opacity")},translate:function(t){return[{opacity:1-t,zIndex:0},{zIndex:-1}]}},scale:{show:function(){return[{opacity:0,transform:Hr(1.5),zIndex:0},{zIndex:-1}]},percent:function(t){return 1-Ve(t,"opacity")},translate:function(t){return[{opacity:1-t,transform:Hr(1+.5*t),zIndex:0},{zIndex:-1}]}},pull:{show:function(t){return t<0?[{transform:Or(30),zIndex:-1},{transform:Or(),zIndex:0}]:[{transform:Or(-100),zIndex:0},{transform:Or(),zIndex:-1}]},percent:function(t,e,i){return i<0?1-Pr(e):Pr(t)},translate:function(t,e){return e<0?[{transform:Or(30*t),zIndex:-1},{transform:Or(-100*(1-t)),zIndex:0}]:[{transform:Or(100*-t),zIndex:0},{transform:Or(30*(1-t)),zIndex:-1}]}},push:{show:function(t){return t<0?[{transform:Or(100),zIndex:0},{transform:Or(),zIndex:-1}]:[{transform:Or(-30),zIndex:-1},{transform:Or(),zIndex:0}]},percent:function(t,e,i){return 0<i?1-Pr(e):Pr(t)},translate:function(t,e){return e<0?[{transform:Or(100*t),zIndex:0},{transform:Or(-30*(1-t)),zIndex:-1}]:[{transform:Or(-30*t),zIndex:-1},{transform:Or(100*(1-t)),zIndex:0}]}}}),mo={mixins:[hn,Vr,to],props:{ratio:String,minHeight:Number,maxHeight:Number},data:{ratio:"16:9",minHeight:!1,maxHeight:!1,selList:".uk-slideshow-items",attrItem:"uk-slideshow-item",selNav:".uk-slideshow-nav",Animations:po},update:{read:function(){var t=this.ratio.split(":").map(Number),e=t[0],i=t[1];return i=i*this.list.offsetWidth/e||0,this.minHeight&&(i=Math.max(this.minHeight,i)),this.maxHeight&&(i=Math.min(this.maxHeight,i)),{height:i-fi(this.list,"height","content-box")}},write:function(t){var e=t.height;0<e&&Ve(this.list,"minHeight",e)},events:["resize"]}},go={mixins:[hn,Ar],props:{group:String,threshold:Number,clsItem:String,clsPlaceholder:String,clsDrag:String,clsDragState:String,clsBase:String,clsNoDrag:String,clsEmpty:String,clsCustom:String,handle:String},data:{group:!1,threshold:5,clsItem:"uk-sortable-item",clsPlaceholder:"uk-sortable-placeholder",clsDrag:"uk-sortable-drag",clsDragState:"uk-drag",clsBase:"uk-sortable",clsNoDrag:"uk-sortable-nodrag",clsEmpty:"uk-sortable-empty",clsCustom:"",handle:!1,pos:{}},created:function(){var i=this;["init","start","move","end"].forEach(function(t){var e=i[t];i[t]=function(t){G(i.pos,re(t)),e(t)}})},events:{name:pt,passive:!1,handler:"init"},computed:{isEmpty:{get:function(){return O(this.$el.children)},watch:function(t){He(this.$el,this.clsEmpty,t)},immediate:!0},handles:{get:function(t,e){var i=t.handle;return i?Ne(i,e):Ut(e)},watch:function(t,e){Ve(e,{touchAction:"",userSelect:""}),Ve(t,{touchAction:ft?"none":"",userSelect:"none"})},immediate:!0}},update:{write:function(){if(this.drag&&Bt(this.placeholder)){var t=this.pos,e=t.x,i=t.y,n=this.origin,r=n.offsetTop,o=n.offsetLeft,s=this.drag,a=s.offsetHeight,h=s.offsetWidth,u=si(window),c=u.right,l=u.bottom,d=document.elementFromPoint(e,i);Ve(this.drag,{top:tt(i-r,0,l-a),left:tt(e-o,0,c-h)});var f=this.getSortable(d),p=this.getSortable(this.placeholder),m=f!==p;if(f&&!Rt(d,this.placeholder)&&(!m||f.group&&f.group===p.group)){if(d=f.$el===d.parentNode&&d||Ut(f.$el).filter(function(t){return Rt(d,t)})[0],m)p.remove(this.placeholder);else if(!d)return;f.insert(this.placeholder,d),b(this.touched,f)||this.touched.push(f)}}},events:["move"]},methods:{init:function(t){var e=t.target,i=t.button,n=t.defaultPrevented,r=Ut(this.$el).filter(function(t){return Rt(e,t)})[0];!r||n||0<i||Wt(e)||Rt(e,"."+this.clsNoDrag)||this.handle&&!Rt(e,this.handle)||(t.preventDefault(),this.touched=[this],this.placeholder=r,this.origin=G({target:e,index:pe(r)},this.pos),Yt(document,mt,this.move),Yt(document,gt,this.end),this.threshold||this.start(t))},start:function(t){var e,i,n;this.drag=(e=this.$container,i=this.placeholder,ot(n=we(e,i.outerHTML.replace(/(^<)li|li(\/>$)/g,"$1div$2")),"style",ot(n,"style")+";margin:0!important"),Ve(n,G({boxSizing:"border-box",width:i.offsetWidth,height:i.offsetHeight,overflow:"hidden"},Ve(i,["paddingLeft","paddingRight","paddingTop","paddingBottom"]))),ci(n.firstElementChild,ci(i.firstElementChild)),n);var r,o,s=this.placeholder.getBoundingClientRect(),a=s.left,h=s.top;G(this.origin,{offsetLeft:this.pos.x-a,offsetTop:this.pos.y-h}),ze(this.drag,this.clsDrag,this.clsCustom),ze(this.placeholder,this.clsPlaceholder),ze(this.$el.children,this.clsItem),ze(document.documentElement,this.clsDragState),Kt(this.$el,"start",[this,this.placeholder]),r=this.pos,o=Date.now(),lo=setInterval(function(){var t=r.x,a=r.y;a+=window.pageYOffset;var h=.3*(Date.now()-o);o=Date.now(),Li(document.elementFromPoint(t,r.y)).some(function(t){var e=t.scrollTop,i=t.scrollHeight,n=si(Fi(t)),r=n.top,o=n.bottom,s=n.height;if(r<a&&a<r+30)e-=h;else{if(!(a<o&&o-30<a))return;e+=h}if(0<e&&e<i-s)return Pi(t,e),!0})},15),this.move(t)},move:function(t){this.drag?this.$emit("move"):(Math.abs(this.pos.x-this.origin.x)>this.threshold||Math.abs(this.pos.y-this.origin.y)>this.threshold)&&this.start(t)},end:function(t){if(Xt(document,mt,this.move),Xt(document,gt,this.end),Xt(window,"scroll",this.scroll),this.drag){clearInterval(lo);var e=this.getSortable(this.placeholder);this===e?this.origin.index!==pe(this.placeholder)&&Kt(this.$el,"moved",[this,this.placeholder]):(Kt(e.$el,"added",[e,this.placeholder]),Kt(this.$el,"removed",[this,this.placeholder])),Kt(this.$el,"stop",[this,this.placeholder]),ke(this.drag),this.drag=null;var i=this.touched.map(function(t){return t.clsPlaceholder+" "+t.clsItem}).join(" ");this.touched.forEach(function(t){return De(t.$el.children,i)}),De(document.documentElement,this.clsDragState)}else"touchend"===t.type&&t.target.click()},insert:function(i,n){var r=this;ze(this.$el.children,this.clsItem);function t(){var t,e;n?(!Rt(i,r.$el)||(e=n,(t=i).parentNode===e.parentNode&&pe(t)>pe(e))?be:xe)(n,i):we(r.$el,i)}this.animation?this.animate(t):t()},remove:function(t){Rt(t,this.$el)&&(this.animation?this.animate(function(){return ke(t)}):ke(t))},getSortable:function(t){return t&&(this.$getComponent(t,"sortable")||this.getSortable(t.parentNode))}}};var vo=[],wo={mixins:[or,un,vn],args:"title",props:{delay:Number,title:String},data:{pos:"top",title:"",delay:0,animation:["uk-animation-scale-up"],duration:100,cls:"uk-active",clsPos:"uk-tooltip"},beforeConnect:function(){this._hasTitle=st(this.$el,"title"),ot(this.$el,{title:"","aria-expanded":!1})},disconnected:function(){this.hide(),ot(this.$el,{title:this._hasTitle?this.title:null,"aria-expanded":null})},methods:{show:function(){var e=this;!this.isActive()&&this.title&&(vo.forEach(function(t){return t.hide()}),vo.push(this),this._unbind=Yt(document,gt,function(t){return!Rt(t.target,e.$el)&&e.hide()}),clearTimeout(this.showTimer),this.showTimer=setTimeout(this._show,this.delay))},hide:function(){var t=this;this.isActive()&&!Mt(this.$el,"input:focus")&&this.toggleElement(this.tooltip,!1,!1).then(function(){vo.splice(vo.indexOf(t),1),clearTimeout(t.showTimer),clearInterval(t.hideTimer),t.tooltip=ke(t.tooltip),t._unbind()})},_show:function(){var e=this;this.tooltip=we(this.container,'<div class="'+this.clsPos+'"> <div class="'+this.clsPos+'-inner">'+this.title+"</div> </div>"),Yt(this.tooltip,"toggled",function(){var t=e.isToggled(e.tooltip);ot(e.$el,"aria-expanded",t),t&&(e.positionAt(e.tooltip,e.$el),e.origin="y"===e.getAxis()?vi(e.dir)+"-"+e.align:e.align+"-"+vi(e.dir))}),this.toggleElement(this.tooltip,!0),this.hideTimer=setInterval(function(){return!Ft(e.$el)&&e.hide()},150)},isActive:function(){return b(vo,this)}},events:((fo={focus:"show",blur:"hide"})[vt+" "+wt]=function(t){ne(t)||(t.type===vt?this.show():this.hide())},fo[pt]=function(t){ne(t)&&(this.isActive()?this.hide():this.show())},fo)},bo={props:{allow:String,clsDragover:String,concurrent:Number,maxSize:Number,method:String,mime:String,msgInvalidMime:String,msgInvalidName:String,msgInvalidSize:String,multiple:Boolean,name:String,params:Object,type:String,url:String},data:{allow:!1,clsDragover:"uk-dragover",concurrent:1,maxSize:0,method:"POST",mime:!1,msgInvalidMime:"Invalid File Type: %s",msgInvalidName:"Invalid File Name: %s",msgInvalidSize:"Invalid File Size: %s Kilobytes Max",multiple:!1,name:"files[]",params:{},type:"",url:"",abort:et,beforeAll:et,beforeSend:et,complete:et,completeAll:et,error:et,fail:et,load:et,loadEnd:et,loadStart:et,progress:et},events:{change:function(t){Mt(t.target,'input[type="file"]')&&(t.preventDefault(),t.target.files&&this.upload(t.target.files),t.target.value="")},drop:function(t){yo(t);var e=t.dataTransfer;e&&e.files&&(De(this.$el,this.clsDragover),this.upload(e.files))},dragenter:function(t){yo(t)},dragover:function(t){yo(t),ze(this.$el,this.clsDragover)},dragleave:function(t){yo(t),De(this.$el,this.clsDragover)}},methods:{upload:function(t){var n=this;if(t.length){Kt(this.$el,"upload",[t]);for(var e=0;e<t.length;e++){if(this.maxSize&&1e3*this.maxSize<t[e].size)return void this.fail(this.msgInvalidSize.replace("%s",this.maxSize));if(this.allow&&!xo(this.allow,t[e].name))return void this.fail(this.msgInvalidName.replace("%s",this.allow));if(this.mime&&!xo(this.mime,t[e].type))return void this.fail(this.msgInvalidMime.replace("%s",this.mime))}this.multiple||(t=[t[0]]),this.beforeAll(this,t);var r=function(t,e){for(var i=[],n=0;n<t.length;n+=e){for(var r=[],o=0;o<e;o++)r.push(t[n+o]);i.push(r)}return i}(t,this.concurrent),o=function(t){var e=new FormData;for(var i in t.forEach(function(t){return e.append(n.name,t)}),n.params)e.append(i,n.params[i]);le(n.url,{data:e,method:n.method,responseType:n.type,beforeSend:function(t){var e=t.xhr;e.upload&&Yt(e.upload,"progress",n.progress),["loadStart","load","loadEnd","abort"].forEach(function(t){return Yt(e,t.toLowerCase(),n[t])}),n.beforeSend(t)}}).then(function(t){n.complete(t),r.length?o(r.shift()):n.completeAll(t)},function(t){return n.error(t)})};o(r.shift())}}}};function xo(t,e){return e.match(new RegExp("^"+t.replace(/\//g,"\\/").replace(/\*\*/g,"(\\/[^\\/]+)*").replace(/\*/g,"[^\\/]+").replace(/((?!\\))\?/g,"$1.")+"$","i"))}function yo(t){t.preventDefault(),t.stopPropagation()}var ko,$o,Io,So=Object.freeze({__proto__:null,Countdown:Sr,Filter:Mr,Lightbox:Yr,LightboxPanel:Rr,Notification:Gr,Parallax:Qr,Slider:ao,SliderParallax:ho,Slideshow:mo,SlideshowParallax:ho,Sortable:go,Tooltip:wo,Upload:bo});function To(t,e){qi.component(e,t)}return J(Ir,To),J(So,To),qi.use(function(r){fe(function(){var e;r.update(),Yt(window,"load resize",function(){return r.update(null,"resize")}),Yt(document,"loadedmetadata load",function(t){var e=t.target;return r.update(e,"resize")},!0),Yt(window,"scroll",function(t){e||(e=!0,xi.write(function(){return e=!1}),r.update(null,t.type))},{passive:!0,capture:!0});var i,n=0;Yt(document,"animationstart",function(t){var e=t.target;(Ve(e,"animationName")||"").match(/^uk-.*(left|right)/)&&(n++,Ve(document.body,"overflowX","hidden"),setTimeout(function(){--n||Ve(document.body,"overflowX","")},U(Ve(e,"animationDuration"))+100))},!0),Yt(document,pt,function(t){if(i&&i(),ne(t)){var s=re(t),a="tagName"in t.target?t.target:t.target.parentNode;i=Gt(document,gt+" "+bt,function(t){var e=re(t),r=e.x,o=e.y;(a&&r&&100<Math.abs(s.x-r)||o&&100<Math.abs(s.y-o))&&setTimeout(function(){var t,e,i,n;Kt(a,"swipe"),Kt(a,"swipe"+(t=s.x,e=s.y,i=r,n=o,Math.abs(t-i)>=Math.abs(e-n)?0<t-i?"Left":"Right":0<e-n?"Up":"Down"))})}),"touchstart"==pt&&(Ve(document.body,"cursor","pointer"),Gt(document,gt+" "+bt,function(){return setTimeout(function(){return Ve(document.body,"cursor","")},50)}))}},{passive:!0})})}),$o=(ko=qi).connect,Io=ko.disconnect,"MutationObserver"in window&&xi.read(function(){document.body&&Ce(document.body,$o);new MutationObserver(function(t){var r=[];t.forEach(function(t){return i=r,n=(e=t).target,void(("attributes"!==e.type?function(t){for(var e=t.addedNodes,i=t.removedNodes,n=0;n<e.length;n++)Ce(e[n],$o);for(var r=0;r<i.length;r++)Ce(i[r],Io);return!0}:function(t){var e=t.target,i=t.attributeName;if("href"===i)return!0;var n=Ri(i);if(!(n&&n in ko))return;if(st(e,i))return ko[n](e),!0;var r=ko.getComponent(e,n);if(r)return r.$destroy(),!0})(e)&&!i.some(function(t){return t.contains(n)})&&i.push(n.contains?n:n.parentNode));var e,i,n}),r.forEach(function(t){return ko.update(t)})}).observe(document,{childList:!0,subtree:!0,characterData:!0,attributes:!0}),ko._initialized=!0}),qi});