if (!Detector.webgl) Detector.addGetWebGLMessage();

var container, stats;
var data;

var camera, cameraTarget, scene, renderer;

var mouse = new THREE.Vector2(), INTERSECTED;

var heigth1 = [];
var heigth2 = [];
var heigth3 = [];
var heigth4 = [];
var heigth5 = [];
var heigth6 = [];
var heigth7 = [];
var heigth8 = [];

var layer = [];
var sortedLayers = [];
var heightsGlobal = [];
var heightsGlobal2 = [];

var graph = [];
var graphSystem;

var years = [];
var dataByYear = [];
var filteredData = [];

var stateId = 'NY';
var stateName = 'New York';
var currentYear = 2014;

var frustumSize = 1000;

//<-- variables and constants for range slider
const V32 = 6713924.71096368, V33 = 9220164.67645724, V34 = 6696779.94470847, V35 = 0, W32 = 147694.905991326, W33 = 62164.7495848525, W34 = 63714.9196865604, W35 = 0, X35 = 23244349.8830916, Y35 = 3402810.70215527, Z35 = 1927823.98763521, VIS_VAL_MAX = 4.25;
var rA1, rA2, rA3, rA4, rA5, rA6, ciA1, ciA2, ciA3, ciA4, ciA5, ciA6, tA1, tA2, tA3, tA4, tA5, tA6;
var rangeSlider = 0,
    dataCubeChart = [],
    dataRange = [
			10, // CL
			20,  // PA
			30,  // NG
			50, // A6
			60,  // A3
			70,  // A1
			80,  // A5
			90,  // A2
			95  // A4
    ],
    dataRangeArray = [
			10, // CL
			20,  // PA
			30,  // NG
			50, // A6
			60,  // A3
			70,  // A1
			80,  // A5
			90,  // A2
			95  // A4
    ],
    dataRangeLabelCode = [
			"CL",
			"PA",
			"NG",
			"A6",
			"A3",
			"A1",
			"A5",
			"A2",
			"A4"
    ],
    handleInited = [
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false,
			false
    ],
    dataRangeLabel = [
			"Coal",
			"Petroleum",
			"Natural Gas",
			"Nuclear",
			"Geothermal",
			"Solar",
			"Biomass",
			"Wind",
			"Hydro"
    ],
    sliderHandleStyleClass = [
			"coal",
			"petroleum",
			"natural-gas",
			"nuclear",
			"geothermal",
			"solar",
			"biomass",
			"wind",
			"hydro",
			"hydro"
    ],
    dataRangeColor = [
			"#404040",
			"#808080",
			"#bfbfbf",
			"#D9444E",
			"#F77C48",
			"#FFDB87",
			"#9DD7A5",
			"#3C8FBB",
			"#4E6EB1",
			"#4E6EB1"
    ],
    dataParamByIndex = {
			"rA1": 0,
			"rA2": 0,
			"rA3": 0,
			"rA4": 0,
			"rA5": 0,
			"rA6": 0,
			"ciA1": 0,
			"ciA2": 0,
			"ciA3": 0,
			"ciA4": 0,
			"ciA5": 0,
			"ciA6": 0,
			"tA1": 0,
			"tA2": 0,
			"tA3": 0,
			"tA4": 0,
			"tA5": 0,
			"tA6": 0,
			"cl": 0,
			"ng": 0,
			"pa": 0,
    };
//<-- variables and constants for range slider

// data for cube
$.getJSON('https://dl.dropboxusercontent.com/s/2wlj6asyoai8dk0/cube_test.json', function (info) {
	var count = Object.keys(info).length;
	for (var i = 1; i <= count; i++) {
		dataCubeChart.push(info[i]);
	}
});

$.getJSON('https://dl.dropboxusercontent.com/s/3aqbpvn6kar1a87/data.json', function (info) {
	data = info;

	var count = Object.keys(data).length;

	for (var i = 1; i < count; i++) {
		years.push(data[i].Year);
	}

	// get unique years
	years = years.filter(uniqueVal);
	years.sort(function (a, b) {return a - b});

	//sort data by years
	for (var i = 0; i < years.length; i++) {
		dataByYear[years[i]] = [];
		for (var j = 1; j < count; j++) {
			if (data[j].Year !== years[i]) { continue }
			dataByYear[years[i]].push(data[j]);
		}
	}

	//if we need clean array

	// for (var i = 0; i<dataByYear.length; i++) {
	//     if (dataByYear[i]) {
	//         filteredData.push(dataByYear[i]);
	//     }
	// }
	//dataByYear.clean(undefined);

	var input = document.getElementById("1");
	input.setAttribute("min", years[0]);
	input.setAttribute("max", years[years.length - 1]);
	input.setAttribute("value", years[years.length - 1]);

	document.getElementById("slider1-value").innerHTML = years[years.length - 1];

	init();
	animate();
	changeData(currentYear);

	// init slider connect color
	$('#range-slider .noUi-connect').each(function (index) {
		$(this).css('background', dataRangeColor[index]);
	});
	// add the hexagon class to slider handle
	$('#range-slider .noUi-tooltip').each(function (index) {
		$(this).addClass('hexagon').addClass(sliderHandleStyleClass[index]);
	});
});

// RETURN UNIQUE VALUE

function uniqueVal(value, index, self) { 
  return self.indexOf(value) === index;
}
// CLEAR ARRAY 
Array.prototype.clean = function(deleteValue) {
  for (var i = 0; i < this.length; i++) {
    if (this[i] == deleteValue) {         
      this.splice(i, 1);
      i--;
    }
  }
  return this;
};

var getParamIndex = function (paramName) {
  return dataParamByIndex[paramName];
};

function getHandleValue(values, handle, isInt) {
	var result = parseFloat(values[handle]);
	if (handle > 0) {
		result = parseFloat(values[handle]) - parseFloat(values[handle - 1]);
	}

	if (isInt) {
		return parseInt(Math.round(result));
	} else {
		return result;
	}
}
/**
 * Create multi range slider
 */
function createMultiRangeSlider(inputRange) {
	var data4Slider = [], maxRange = 0, inputRangeLen = inputRange.length;
	// Generate data for slider
	for (var i = 0; i < inputRangeLen; i++) {
		maxRange += inputRange[i];
		data4Slider.push(maxRange);
	}
	if (rangeSlider != 0) {
		// slider already created
		rangeSlider.noUiSlider.updateOptions({
			start: data4Slider
		});
	} else {
			// create multi range slider
		rangeSlider = document.getElementById('range-slider');
		noUiSlider.create(rangeSlider, {
			start: data4Slider,
			connect: [true, true, true, true, true, true, true, true, true, true],
			tooltips: [true, true, true, true, true, true, true, true, true],
			range: {
				'min': 0,
				'max': maxRange
			}
		}).on('update', function (values, handle) {
			var handles = values.length;
			for (var i = 0; i < handles; i++) {
				$('.noUi-handle[data-handle="' + i + '"] .noUi-tooltip').text('').html('<p class="noUi-tooltip-text">' + dataRangeLabel[i] + '</p>');
				$('.noUi-handle[data-handle="' + i + '"]').attr('data-before', getHandleValue(values, i, true));
			}
			updateRangeSlider(values, handle);
		});
	}
}
/**
 * Initialize range slider
 */
function initRangeSlider() {
	// init values
	var filteredDataLen = dataCubeChart.length, clSum = ngSum = paSum = checkSum = 0;
	for (var i = 0; i < filteredDataLen; i++) {
		var filteredDataItem = dataCubeChart[i], filterDataItemType = filteredDataItem.Type;

		if (filterDataItemType == "B") {
			clPercent = parseFloat(filteredDataItem['11']) / V32 * 100;
			ngPercent = (parseFloat(filteredDataItem['21']) - W32) / V32 * 100;
			paPercent = parseFloat(filteredDataItem['31']) / V32 * 100;
			
			var c13 = parseFloat(filteredDataItem['11']),
			d13 = clPercent * (W33 + W34) / 100,
			e13 = clPercent * V35 / 100,
			clSum = c13 + d13 + e13,
			f13 = ngPercent * V32 / 100,
			g13 = ngPercent * (V33 + V34) / 100,
			h13 = ngPercent * V35 / 100,
			ngSum = f13 + g13 + h13,
			i13 = paPercent * V32 / 100,
			j13 = paPercent * (V33 + V34) / 100;
			k13 = paPercent * V35,
			paSum = i13 + j13 + k13,
			checkSum = clSum + ngSum + paSum;

			// values for calculating
			dataParamByIndex['cl'] = clSum / checkSum;
			dataParamByIndex['ng'] = ngSum / checkSum;
			dataParamByIndex['pa'] = paSum / checkSum;

			// values for range slider
			dataRangeArray[dataRangeLabelCode.indexOf("CL")] = clPercent;
			dataRangeArray[dataRangeLabelCode.indexOf("NG")] = ngPercent;
			dataRangeArray[dataRangeLabelCode.indexOf("PA")] = paPercent;
		} else if (filterDataItemType != "C") {
			var rVal = parseFloat(filteredDataItem['11']) + parseFloat(filteredDataItem['21']) + parseFloat(filteredDataItem['31']),
					ciVal = parseFloat(filteredDataItem['12']) + parseFloat(filteredDataItem['22']) + parseFloat(filteredDataItem['32']),
					tVal = parseFloat(filteredDataItem['13']) + parseFloat(filteredDataItem['23']) + parseFloat(filteredDataItem['33']);
			dataParamByIndex["r" + filterDataItemType] = rVal;
			dataParamByIndex["ci" + filterDataItemType] = ciVal;
			dataParamByIndex["t" + filterDataItemType] = tVal;

			// value for range slider
			dataRangeArray[dataRangeLabelCode.indexOf(filterDataItemType)] = getParamIndex("r" + filterDataItemType) / V32 * 100;
		}
	}

	// create range slider
	createMultiRangeSlider(dataRangeArray);
}
/**
 * Update range slider event
 * @param {*} values data
 * @param {*} handle index
 */
function updateRangeSlider(values, handle) {
	// check if it is slider initialization
	if (!handleInited[handle]) {
		handleInited[handle] = true;
	}
	for(var i = 0; i < handleInited.length; i++) {
		if (!handleInited[i]) {
			return;
		}
	}
	// update the data
	var rangeLabel = dataRangeLabelCode[handle],
	clParam = dataRangeArray[dataRangeLabelCode.indexOf("CL")],
	ngParam = dataRangeArray[dataRangeLabelCode.indexOf("NG")],
	paParam = dataRangeArray[dataRangeLabelCode.indexOf("PA")];
	if (rangeLabel == "CL") {
		clParam = getHandleValue(values, handle, false);
	} else if (rangeLabel == "PA") {
		paParam = getHandleValue(values, handle, false);
	} else if (rangeLabel == "NG") {
		ngParam = getHandleValue(values, handle, false);
	} else {
		dataParamByIndex['r' + rangeLabel] = getHandleValue(values, handle, false) * V32 / 100;
		dataParamByIndex['ci' + rangeLabel] = getHandleValue(values, handle, false) * (V33 + V34) / 100;
		dataParamByIndex['t' + rangeLabel] = getHandleValue(values, handle, false) * V35 / 100;
	}

	// generate data from slider changes
	var updatedData = [], updatedDataLen = dataCubeChart.length;
	for (var i = 0; i < updatedDataLen; i++) {
		var updatedDataItem = {}, updatedDataItemType = dataCubeChart[i].Type;

		if (updatedDataItemType == "B") {
			updatedDataItem['11'] = String(clParam * V32 / 100);
			updatedDataItem['12'] = String((clParam * (V33 + V34)) / 100);
			updatedDataItem['13'] = String((clParam * V35) / 100);
			updatedDataItem['21'] = String(((ngParam * V32) / 100) + W32);
			updatedDataItem['22'] = String(((W33 + W34) + ((ngParam * (V33 + V34) / 100))));
			updatedDataItem['23'] = String(((ngParam * V35 / 100) + W35));
			updatedDataItem['31'] = String(paParam * V32 / 100);
			updatedDataItem['32'] = String(paParam * (V33 + V34) / 100);
			updatedDataItem['33'] = String(((paParam * V35 / 100) + (X35 + Y35 + Z35)));
		} else if (updatedDataItemType != "C") {
			for (var j = 1; j <= 3; j++) {
				updatedDataItem[j + '1'] = String(getParamIndex('r' + updatedDataItemType) * getParamIndex('cl'));
				updatedDataItem[j + '2'] = String(getParamIndex('ci' + updatedDataItemType) * getParamIndex('cl'));
				updatedDataItem[j + '3'] = String(getParamIndex('t' + updatedDataItemType) * getParamIndex('cl'));
			}
		} else {
			for (var j = 1; j <= 3; j++) {
				for (var k = 1; k <= 3; k++) {
					updatedDataItem[String(j) + String(k)] = dataCubeChart[i][String(j) + String(k)];
				}
			}
		}

		updatedDataItem['State'] = dataCubeChart[i].State;
		updatedDataItem['Type'] = dataCubeChart[i].Type;
		updatedDataItem['Year'] = dataCubeChart[i].Year;
		updatedData.push(updatedDataItem);
	}

	// update graph
	for (var i = 0; i < 8; i++) {
		layer[i] = [];
	}
	// console.log(updatedData);

	for (var i = 0; i < updatedDataLen; i++) {
		fillGraph(updatedData[i].Type, updatedData[i], i);
	}
	updateGraphVisually();
}
/**
 * jQuery plugin to add comma to numbers every three digits
 */
$.fn.digits = function () {
	return this.each(function () {
		$(this).text($(this).text().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"));
	})
}
/**
 * Show the total energy sum of cubes are visible currently
 */
function showTotalEnergySum() {
	var sum = 0;
	for (var i = graph.length - 1; i >= 0; i--) {
		if (graph[i].visible == true && graph[i].name.indexOf("-") >= 0) {
			sum += graph[i].value;
		}
	}
	$(".total_energy_sum").text(sum).digits();
}
/**
 * Switch filter item
 */
function switchFilterItem() {
	var checkBox = document.getElementById("switch-filter-item");
	$('.filter-item').each(function (index) {
		if (checkBox.checked == true) {
			$(this).removeClass('off').addClass('on');
		} else {
			$(this).removeClass('on').addClass('off');
		}
	});

	for (var i = graph.length - 1; i >= 0; i--) {
		graph[i].visible = checkBox.checked;
	}

	showTotalEnergySum();
}

function init() {
	container = document.getElementById('canvas');

	var aspect = window.innerWidth / window.innerHeight;
	// camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.01, 10000 );
	var d = 60;
	camera = new THREE.OrthographicCamera(- d * aspect, d * aspect, d, - d, 1, 1000);
	// camera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, 1, 2000 );
							
	camera.position.set(60, 60, 60);

	cameraTarget = new THREE.Vector3(0, 0, 0);

	scene = new THREE.Scene();
	///scene.background = new THREE.Color( 0x72645b );
	scene.fog = new THREE.Fog(0xffffff, 100, 150);

	// Ground if needed

	var plane = new THREE.Mesh(
		new THREE.PlaneBufferGeometry(40, 40),
		new THREE.MeshPhongMaterial({color: 0x9FD6E1, specular: 0x101010})
	);
	plane.rotation.x = -Math.PI/2;
	//scene.add( plane );

	// var axesHelper = new THREE.AxesHelper( 500 );
	// scene.add( axesHelper );

	// plane.receiveShadow = true;

	var spread =10.5;
	graphSystem = new THREE.Group();
	graphSystem.position.z = -100;
	graphSystem.rotation.y = Math.PI;
	//graphSystem.geometry.translate( 0, 0, -50 );
	//graphSystem.applyMatrix( new THREE.Matrix4().makeTranslation( 0,0,50 ) );
	scene.add(graphSystem);

	function createGraph() {
		for (var i = 0; i < 3; i++) {
			for (var j = 0; j < 3; j++) {
				var material1 = new THREE.MeshPhongMaterial({color: 0x333333, transparent: true, shininess: 200, opacity: 0.8});
				var material2 = new THREE.MeshPhongMaterial({color: 0x999999, transparent: true, shininess: 200, opacity: 0.8});
				var material3 = new THREE.MeshPhongMaterial({color: 0xD9444E, transparent: true, shininess: 200, opacity: 0.8}); //Nuclear
				var material4 = new THREE.MeshPhongMaterial({color: 0xF77C48, transparent: true, shininess: 200, opacity: 0.8}); //Geothermal
				var material5 = new THREE.MeshPhongMaterial({color: 0xFFDB87, transparent: true, shininess: 200, opacity: 0.8}); //Solar
				var material6 = new THREE.MeshPhongMaterial({color: 0x9DD7A5, transparent: true, shininess: 200, opacity: 0.8}); //Biofuel				
				var material7 = new THREE.MeshPhongMaterial({color: 0x3C8FBB, transparent: true, shininess: 200, opacity: 0.8}); //Wind
				var material8 = new THREE.MeshPhongMaterial({color: 0x4E6EB1, transparent: true, shininess: 200, opacity: 0.8}); //Hydro

				heigth1[i] =  1;
				heigth2[i] =  1;
				heigth3[i] =  1;
				heigth4[i] =  1;
				heigth5[i] =  1;
				heigth6[i] =  1;
				heigth7[i] =  1;
				heigth8[i] =  1;

				var firstLetter = i + 1;
				var secondLetter = j + 1;

				var geometry1 = new THREE.BoxBufferGeometry(10, heigth1[i], 10);
				var geometry2 = new THREE.BoxBufferGeometry(10, heigth2[i], 10);
				var geometry3 = new THREE.BoxBufferGeometry(10, heigth3[i], 10);
				var geometry4 = new THREE.BoxBufferGeometry(10, heigth4[i], 10);
				var geometry5 = new THREE.BoxBufferGeometry(10, heigth5[i], 10);
				var geometry6 = new THREE.BoxBufferGeometry(10, heigth6[i], 10);
				var geometry7 = new THREE.BoxBufferGeometry(10, heigth7[i], 10);
				var geometry8 = new THREE.BoxBufferGeometry(10, heigth8[i], 10);

				var cube = new THREE.Mesh(geometry1, material1);
				cube.position.set(spread * i - 11, heigth1[i] / 2, spread * j - 111);
				cube.name = 'B-' + firstLetter + '' + secondLetter + '';
				cube.energyType = 'waste';
				graphSystem.add(cube);
				graph.push(cube);

				var cube2 = new THREE.Mesh(geometry2, material2);
				cube2.position.set(spread * i - 11, heigth2[i] / 2 + heigth1[i], spread * j - 111);
				cube2.name = 'C-' + firstLetter + '' + secondLetter + '';
				cube2.energyType = 'waste';
				cube2.material.color = new THREE.Color(0xCAC9C9);

				if (firstLetter == 1) {
					cube.material.color = new THREE.Color(0x585B62);
				}

				if (firstLetter == 2) {
					cube.material.color = new THREE.Color(0xAEAEAE);
				}

				if (firstLetter == 3) {
					cube.material.color = new THREE.Color(0x808080);
				}

				if (secondLetter == 1) {
					cube.energyType = 'Coal';
					// cube2.energyType = 'Coal';
					cube2.material.transparent = true;
					cube2.material.opacity = 0.8;
				}

				if (secondLetter == 2) {
					cube.energyType = 'Petroleum';
					// cube2.energyType = 'Petroleum';
					cube2.material.transparent = true;
					cube2.material.opacity = 0.8;
				}

				if (secondLetter == 3) {
					cube.energyType = 'Natural Gas';
					// cube2.energyType = 'Natural Gas';
					cube2.material.transparent = true;
					cube2.material.opacity = 0.8;
				}

				graphSystem.add(cube2);
				graph.push(cube2);

				var cube3 = new THREE.Mesh(geometry3, material3);
				cube3.position.set(spread * i - 11, heigth3[i] / 2 + heigth1[i] + heigth2[i], spread * j - 111);
				cube3.name = 'A6-' + firstLetter + '' + secondLetter + '';
				cube3.energyType = 'Nuclear';
				graphSystem.add(cube3);
				graph.push(cube3);

				var cube4 = new THREE.Mesh(geometry4, material4);
				cube4.position.set(spread * i - 11, heigth4[i] / 2 + heigth1[i] + heigth2[i] + heigth3[i], spread * j - 111);
				cube4.name = 'A3-' + firstLetter + '' + secondLetter + '';
				cube4.energyType = 'Geothermal';
				graphSystem.add(cube4);
				graph.push(cube4);

				var cube5 = new THREE.Mesh(geometry5, material5);
				cube5.position.set(spread * i - 11, heigth5[i] / 2 + heigth1[i] + heigth2[i] + heigth3[i] + heigth4[i], spread * j - 111);
				cube5.name = 'A1-' + firstLetter + '' + secondLetter + '';
				cube5.energyType = 'Solar';
				graphSystem.add(cube5);
				graph.push(cube5);

				var cube6 = new THREE.Mesh(geometry6, material6);
				cube6.position.set(spread * i - 11, heigth6[i] / 2 + heigth1[i] + heigth2[i] + heigth3[i] + heigth4[i] + heigth5[i], spread * j - 111);
				cube6.name = 'A5-' + firstLetter + '' + secondLetter + '';
				cube6.energyType = 'Biofuel';
				graphSystem.add(cube6);
				graph.push(cube6);

				var cube7 = new THREE.Mesh(geometry7, material7);
				cube7.position.set(spread * i - 11, heigth7[i] / 2 + heigth1[i] + heigth2[i] + heigth3[i] + heigth4[i] + heigth5[i] + heigth6[i], spread * j - 111);
				cube7.name = 'A2-' + firstLetter + '' + secondLetter + '';
				cube7.energyType = 'Wind';
				graphSystem.add(cube7);
				graph.push(cube7);

				var cube8 = new THREE.Mesh(geometry8, material8);
				cube8.position.set(spread * i - 11, heigth8[i] / 2 + heigth1[i] + heigth2[i] + heigth3[i] + heigth4[i] + heigth5[i] + heigth6[i] + heigth7[i], spread * j - 111);
				cube8.name = 'A4-' + firstLetter + '' + secondLetter + '';
				cube8.energyType = 'Hydro';
				graphSystem.add(cube8);
				graph.push(cube8);
			}
		}
		//scene.add(graph);
	}

	function createGraph2() {
		var material00 = new THREE.MeshPhongMaterial({color: 0xAEAEAE, transparent: true, shininess: 200, opacity: 0.8});
		var material01 = new THREE.MeshPhongMaterial({color: 0x808080, transparent: true, shininess: 200, opacity: 0.8});
		var material02 = new THREE.MeshPhongMaterial({color: 0x585B62, transparent: true, shininess: 200, opacity: 0.8});
		var material1 = new THREE.MeshPhongMaterial({color: 0x333333, transparent: true, shininess: 200, opacity: 0.8});
		var material2 = new THREE.MeshPhongMaterial({color: 0x999999, transparent: true, shininess: 200, opacity: 0.8});		
		var material3 = new THREE.MeshPhongMaterial({color: 0xD9444E, transparent: true, shininess: 200, opacity: 0.8}); //Nuclear
		var material4 = new THREE.MeshPhongMaterial({color: 0xF77C48, transparent: true, shininess: 200, opacity: 0.8}); //Geothermal
		var material5 = new THREE.MeshPhongMaterial({color: 0xFFDB87, transparent: true, shininess: 200, opacity: 0.8}); //Solar
		var material6 = new THREE.MeshPhongMaterial({color: 0x9DD7A5, transparent: true, shininess: 200, opacity: 0.8}); //Biofuel				
		var material7 = new THREE.MeshPhongMaterial({color: 0x3C8FBB, transparent: true, shininess: 200, opacity: 0.8}); //Wind
		var material8 = new THREE.MeshPhongMaterial({color: 0x4E6EB1, transparent: true, shininess: 200, opacity: 0.8}); //Hydro

		var geometry = new THREE.BoxBufferGeometry(20, 1, 20);

		var cube00 = new THREE.Mesh(geometry, material00);
		cube00.position.set(0, 0, 100);
		cube00.name = 'B00';
		cube00.singleTower = true;
		cube00.energyType = 'Natural gas';
		graphSystem.add(cube00);
		graph.push(cube00);

		var cube01 = new THREE.Mesh(geometry, material01);
		cube01.position.set(0, 1, 100);
		cube01.name = 'B01';
		cube01.singleTower = true;
		cube01.energyType = 'Petroleum';
		graphSystem.add(cube01);
		graph.push(cube01);

		var cube02 = new THREE.Mesh(geometry, material02);
		cube02.position.set(0, 2, 100);
		cube02.name = 'B02';
		cube02.singleTower = true;
		cube02.energyType = 'Coal';
		graphSystem.add(cube02);
		graph.push(cube02);

		// var cube = new THREE.Mesh( geometry, material1 );
		// cube.position.set(0,0,100);
		// cube.name = 'B';
		// cube.singleTower = true;
		// cube.energyType = 'Natural gas';
		// graphSystem.add(cube);
		// graph.push( cube );

		var cube2 = new THREE.Mesh(geometry, material2);
		cube2.position.set(0, 3, 100);
		cube2.name = 'C';
		cube2.singleTower = true;
		cube2.energyType = 'waste';
		cube2.material.color = new THREE.Color(0xCAC9C9);
		graphSystem.add(cube2);
		graph.push(cube2);

		var cube3 = new THREE.Mesh(geometry, material3);
		cube3.position.set(0, 4, 100);
		cube3.name = 'A6';
		cube3.singleTower = true;
		cube3.energyType = 'Nuclear';
		graphSystem.add(cube3);
		graph.push(cube3);

		var cube4 = new THREE.Mesh(geometry, material4);
		cube4.position.set(0, 5, 100);
		cube4.name = 'A3';
		cube4.singleTower = true;
		cube4.energyType = 'Geothermal';
		graphSystem.add(cube4);
		graph.push(cube4);

		var cube5 = new THREE.Mesh(geometry, material5);
		cube5.position.set(0, 6, 100);
		cube5.name = 'A1';
		cube5.singleTower = true;
		cube5.energyType = 'Solar';
		graphSystem.add(cube5);
		graph.push(cube5);

		var cube6 = new THREE.Mesh(geometry, material6);
		cube6.position.set(0, 7, 100);
		cube6.name = 'A5';
		cube6.singleTower = true;
		cube6.energyType = 'Biofuel';
		graphSystem.add(cube6);
		graph.push(cube6);

		var cube7 = new THREE.Mesh(geometry, material7);
		cube7.position.set(0, 8, 100);
		cube7.name = 'A2';
		cube7.singleTower = true;
		cube7.energyType = 'Wind';
		graphSystem.add(cube7);
		graph.push(cube7);

		var cube8 = new THREE.Mesh(geometry, material8);
		cube8.position.set(0, 9, 100);
		cube8.name = 'A4';
		cube8.singleTower = true;
		cube8.energyType = 'Hydro';
		graphSystem.add(cube8);
		graph.push(cube8);
	}

	createGraph();
	createGraph2();	

	// Lights shortcodes to add light

	scene.add(new THREE.HemisphereLight(0xffffff, 0xcccccc, 0.4));

	addShadowedLight(1, 0, 1, 0xffffff, 0.6);
	addShadowedLight(-1, 0, 1, 0xffffff, 0.6);

	// renderer scene settings. Don't touch it

	renderer = new THREE.WebGLRenderer({antialias: true});
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setClearColor(0xffffff);
	renderer.setSize(window.innerWidth, window.innerHeight);

	renderer.gammaInput = true;
	renderer.gammaOutput = true;

	renderer.shadowMap.enabled = true;
	renderer.shadowMap.renderReverseSided = false;

	// CONTROLS
	cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
	cameraControls.addEventListener('change', render);

	container.appendChild(renderer.domElement);

	// stats - uncomment this to see the FPS

	//stats = new Stats();
	//container.appendChild( stats.dom );

	window.addEventListener('resize', onWindowResize, false);
	window.addEventListener('mousemove', onDocumentMouseMove, false);
}

// Function that creates light with its given parameters
function addShadowedLight(x, y, z, color, intensity) {
	var directionalLight = new THREE.DirectionalLight(color, intensity);
	directionalLight.position.set(x, y, z);
	scene.add(directionalLight);

	directionalLight.castShadow = true;

	var d = 1;
	directionalLight.shadow.camera.left = -d;
	directionalLight.shadow.camera.right = d;
	directionalLight.shadow.camera.top = d;
	directionalLight.shadow.camera.bottom = -d;

	directionalLight.shadow.camera.near = 1;
	directionalLight.shadow.camera.far = 4;

	directionalLight.shadow.mapSize.width = 1024;
	directionalLight.shadow.mapSize.height = 1024;

	directionalLight.shadow.bias = -0.005;
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
	requestAnimationFrame(animate);
	camera.lookAt(cameraTarget);

	// graphSystem.rotation.y += 0.1;

	render();
}

function render() {
	TWEEN.update();

	renderer.render(scene, camera);
}

// SLIDERS
var sliders = document.getElementsByClassName('slider');

for (var i = 0; i < sliders.length; i++) {
	sliders[i].addEventListener('input', onSliderInput, false);
	sliders[i].addEventListener('change', onSliderChange, false);
}

function onSliderInput() {
	var output = 'slider' + this.id + '-value';
	document.getElementById(output).innerHTML = this.value;
	changeData(this.value);
}

function onSliderChange() {
  changeData(this.value);
}

function onDocumentMouseMove(event) {
	if (!INTERSECTED) {
		var popupX = event.clientX;
		var popupY = event.clientY - 140;
	}

	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

	
	var raycaster = new THREE.Raycaster();
	raycaster.setFromCamera(mouse, camera);
	var intersects = raycaster.intersectObjects(graph);

	if (intersects.length > 0) {
		if (INTERSECTED != intersects[0].object) {
			if (INTERSECTED) INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);

			for (var i = 0; i < graph.length; i++) {
				graph[i].material.opacity = 0.6;
			}

			INTERSECTED = intersects[0].object;
			INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
			INTERSECTED.material.emissive.setHex(0xff0000);
			INTERSECTED.material.opacity = 0.8;

			$('html,body').css('cursor', 'pointer');
		}

		var towerName = INTERSECTED.name;
		towerName = towerName.substring(towerName.indexOf("-") + 1); // get tower index (11...33)

		if (INTERSECTED.singleTower) {
			var totalSum =  parseInt(scene.getObjectByName('B00').value) +
											parseInt(scene.getObjectByName('B01').value) +
											parseInt(scene.getObjectByName('B02').value) +
											parseInt(scene.getObjectByName('C').value) +
											parseInt(scene.getObjectByName('A1').value) +
											parseInt(scene.getObjectByName('A2').value) +
											parseInt(scene.getObjectByName('A3').value) +
											parseInt(scene.getObjectByName('A4').value) +
											parseInt(scene.getObjectByName('A5').value) +
											parseInt(scene.getObjectByName('A6').value);

			// var sectorType = ' All type of </b> sector(s)';
			var sectorType = '';
		} else {
			var totalSum =  parseInt(scene.getObjectByName('B-' + towerName + '').value) +
											parseInt(scene.getObjectByName('C-' + towerName + '').value) +
											parseInt(scene.getObjectByName('A1-' + towerName + '').value) +
											parseInt(scene.getObjectByName('A2-' + towerName + '').value) +
											parseInt(scene.getObjectByName('A3-' + towerName + '').value) +
											parseInt(scene.getObjectByName('A4-' + towerName + '').value) +
											parseInt(scene.getObjectByName('A5-' + towerName + '').value) +
											parseInt(scene.getObjectByName('A6-' + towerName + '').value);

			var sectorType = ' in ' + INTERSECTED.sector + '</b> sector(s)';
		}

		if (INTERSECTED.energyType == 'waste') {
			var verb = 'wasted';
			var energyType = '';
		} else {
			var verb = 'used';
			var energyType = INTERSECTED.energyType;
		}

		// $('#popup').html('<b>'+INTERSECTED.state+'</b> '+verb+' <b>'+INTERSECTED.value+'</b> Quads of <b>'+energyType+'</b> energy<b>'+sectorType+', out of <b>'+totalSum+'</b> Quads total, in <b>'+INTERSECTED.year+'</b> year<br>Some additional text here<br>Link: <a href="">You cant click this link :D</a>'); //show some data in popup window on intersection
		// $('#popup').html('<b>'+stateName+'</b> '+verb+' <b>'+INTERSECTED.value+'</b> Quads of <b>'+energyType+'</b> energy<b>'+sectorType+', out of <b>'+totalSum+'</b> Quads total, in <b>'+INTERSECTED.year+'</b> year<br>Some additional text here<br>Link: <a href="">You cant click this link :D</a>'); //show some data in popup window on intersection
		$('#popup').html('<b>Kansas City</b> ' + verb + ' <b>' + INTERSECTED.value + '</b> mm BTU of <b>' + energyType + '</b> energy<b>' + sectorType + ', out of <b>' + totalSum + '</b> mm BTUs total, in <b>' + INTERSECTED.year + '</b> year'); //show some data in popup window on intersection
		$('#popup').fadeIn(300);
		$('#popup').css('left', '' + popupX + 'px');
		$('#popup').css('top', '' + popupY + 'px');
	} else {
		if (INTERSECTED) INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);

		INTERSECTED = null;
		$('html,body').css('cursor', 'default');

		for (var i = 0; i < graph.length; i++) {
			graph[i].material.opacity = 0.8;
		}

		if ($('#popup').hasClass('close')) {
			$('#popup').fadeOut(400);
		} else {
			$('#popup').fadeIn(100);
		}
	}
}

function rotateGraph(angle) {
  graphSystem.rotation.y = angle;
}

function changeData(year) {
	currentYear = year;

	filteredData = [];

	for (var i = 0; i < dataByYear[year].length; i++) {
		if (dataByYear[year][i].State == stateId) {
			filteredData.push(dataByYear[year][i]);
		}
	}

	for (var i = 0; i < 8; i++) {
		layer[i] = [];
	}

	for (var i = 0; i < filteredData.length; i++) {
		fillGraph(filteredData[i].Type, filteredData[i], i);
	}

	updateGraphVisually();
	// updateChart();
	initRangeSlider();
}

function fillGraph(name, dataSet, layerNumber) {
	layer[layerNumber].name = name; //assigning layer name

	var correctionValue = 2; // any dummy positive value otherwise logarithmic scale returns -Infinity

	for (var i = 0; i < 8; i++) {
		heightsGlobal2[i] = [];
	}

	if (name == 'B') {
		var object00 = scene.getObjectByName('B00');
		var rawValue2 = parseInt(dataSet['11']) + parseInt(dataSet['12']) + parseInt(dataSet['13']);
		object00.value = Math.round(rawValue2);
		object00.state = dataSet.State;
		object00.year = dataSet.Year;
		var visValue2;

		if (rawValue2 < 1) { visValue2 = Math.log(correctionValue) } else { visValue2 = Math.log(rawValue2) }

		object00.visValue = visValue2;
		object00.scale.y = visValue2;

		var object01 = scene.getObjectByName('B01');
		var rawValue2 = parseInt(dataSet['21']) + parseInt(dataSet['22']) + parseInt(dataSet['23']);
		object01.value = Math.round(rawValue2);
		object01.state = dataSet.State;
		object01.year = dataSet.Year;
		var visValue2;

		if (rawValue2 < 1) { visValue2 = Math.log(correctionValue) } else { visValue2 = Math.log(rawValue2)}

		object01.visValue = visValue2;
		object01.scale.y = visValue2;

		var object02 = scene.getObjectByName('B02');
		var rawValue2 = parseInt(dataSet['31']) + parseInt(dataSet['32']) + parseInt(dataSet['33']);
		object02.value = Math.round(rawValue2);
		object02.state = dataSet.State;
		object02.year = dataSet.Year;
		var visValue2;

		if (rawValue2 < 1) { visValue2 = Math.log(correctionValue) } else { visValue2 = Math.log(rawValue2) }

		object02.visValue = visValue2;
		object02.scale.y = visValue2;
	} else {
		var object2 = scene.getObjectByName(name);
		var rawValue2 = parseInt(dataSet['11']) + parseInt(dataSet['12']) + parseInt(dataSet['13']) + parseInt(dataSet['21']) + parseInt(dataSet['22']) + parseInt(dataSet['23']) + parseInt(dataSet['31']) + parseInt(dataSet['32']) + parseInt(dataSet['33']);
		object2.value = Math.round(rawValue2);
		object2.state = dataSet.State;
		object2.year = dataSet.Year;
		var visValue2;
		
		if (rawValue2 < 1) {
			visValue2 = Math.log(correctionValue)
		} else {
			visValue2 = Math.log(rawValue2)
		}

		object2.visValue = visValue2;
		object2.scale.y = visValue2;
	}

	// heightsGlobal2[layerNumber] = visValue2; // not needed for now

	var visValueMax = 0; // maxium of visValue

	for (var i = 0; i < 3; i++) {
		for (var j = 0; j < 3; j++) {
			var firstLetter = i + 1;
			var secondLetter = j + 1;
			var object = scene.getObjectByName('' + name + '-' + firstLetter + '' + secondLetter + '');

			if (firstLetter == 1) {
				object.sector = 'Home';
			}

			if (firstLetter == 2) {
				object.sector = 'Business';
			}

			if (firstLetter == 3) {
				object.sector = 'Transport';
			}

			// if (secondLetter == 1) {
			//     object.energyType = 'Coal';
			// }

			// if (secondLetter == 2) {
			//     object.energyType = 'Petroleum';
			// }

			// if (secondLetter == 3) {
			//     object.energyType = 'Natural Gas';
			// }		

			var rawValue = dataSet['' + firstLetter + '' + secondLetter + ''];
			object.value = Math.round(rawValue);
			object.state = dataSet.State;
			object.year = dataSet.Year;

			var visValue;

			if (rawValue < 1) {
				visValue = Math.log(correctionValue)
			} else {
				visValue = Math.log(rawValue)
			}

			layer[layerNumber].push(object);
			object.visValue = visValue;
			object.scale.y = visValue;

			if (visValueMax < visValue) {
				visValueMax = visValue;
			}
		}
	}

	if (visValueMax > VIS_VAL_MAX) {
		// if visible value is too large, adjust it
		var divider4Adjust = visValueMax / VIS_VAL_MAX;
		for (var i = 0; i < 3; i++) {
			for (var j = 0; j < 3; j++) {
				var firstLetter = i + 1;
				var secondLetter = j + 1;
				var object = scene.getObjectByName('' + name + '-' + firstLetter + '' + secondLetter + '');
				var newVisValue = object.visValue / divider4Adjust;
				object.visValue = newVisValue;
				object.scale.y = newVisValue;
			}
		}
	}

	showTotalEnergySum();
}

function updateGraphVisually() {
	for (var i = 0; i < 3; i++) {
		heightsGlobal[i] = [];
		for (var j = 0; j < 3; j++) {
			heightsGlobal[i][j] = 0;
		}
	}

	for (var i = 0; i < layer.length; i++) {
		if (layer[i].name == 'B') { sortedLayers[0] = layer[i] }
		if (layer[i].name == 'C') { sortedLayers[1] = layer[i] }

		if (layer[i].name == 'A6') { sortedLayers[2] = layer[i] }
		if (layer[i].name == 'A3') { sortedLayers[3] = layer[i] }
		if (layer[i].name == 'A1') { sortedLayers[4] = layer[i] }
		if (layer[i].name == 'A5') { sortedLayers[5] = layer[i] }
		if (layer[i].name == 'A2') { sortedLayers[6] = layer[i] }
		if (layer[i].name == 'A4') { sortedLayers[7] = layer[i] }
	}

	for (var k = 0; k < sortedLayers.length; k++) {
		for (var i = 0; i < 3; i++) {
			for (var j = 0; j < 3; j++) {
				var firstLetter = i + 1;
				var secondLetter = j + 1;

				var object = scene.getObjectByName('' + sortedLayers[k].name + '-' + firstLetter + '' + secondLetter + '');

				if (sortedLayers[k].name == 'B') {
					object.position.y = object.visValue / 2;
					heightsGlobal[i][j] += object.visValue;
				} else {
					object.position.y = object.visValue / 2 + heightsGlobal[i][j];
					heightsGlobal[i][j] += object.visValue;
				}
			}
		}
	}

	var object00 = scene.getObjectByName('B00');
	object00.position.y = object00.visValue / 2;

	var object01 = scene.getObjectByName('B01');
	object01.position.y = object01.visValue / 2 + object00.visValue;

	var object02 = scene.getObjectByName('B02');
	object02.position.y = object02.visValue / 2 + object00.visValue + object01.visValue;

	var object2 = scene.getObjectByName('C');
	object2.position.y = object2.visValue / 2 + object00.visValue + object01.visValue + object02.visValue;

	var object3 = scene.getObjectByName('A4');
	object3.position.y = object3.visValue / 2 + object00.visValue + object01.visValue + object02.visValue + object2.visValue;

	var object4 = scene.getObjectByName('A2');
	object4.position.y = object4.visValue / 2 + object00.visValue + object01.visValue + object02.visValue + object2.visValue + object3.visValue;

	var object5 = scene.getObjectByName('A5');
	object5.position.y = object5.visValue / 2 + object00.visValue + object01.visValue + object02.visValue + object2.visValue + object3.visValue + object4.visValue;

	var object6 = scene.getObjectByName('A1');
	object6.position.y = object6.visValue / 2 + object00.visValue + object01.visValue + object02.visValue + object2.visValue + object3.visValue + object4.visValue + object5.visValue;

	var object7 = scene.getObjectByName('A3');
	object7.position.y = object7.visValue / 2 + object00.visValue + object01.visValue + object02.visValue + object2.visValue + object3.visValue + object4.visValue + object5.visValue + object6.visValue;

	var object8 = scene.getObjectByName('A6');
	object8.position.y = object8.visValue / 2 + object00.visValue + object01.visValue + object02.visValue + object2.visValue + object3.visValue + object4.visValue + object5.visValue + object6.visValue + object7.visValue;
}

function updateChart() {
	// dataD.datasets[0].data[0] = Math.random() * 20;
	// dataD.datasets[0].data[1] = Math.random() * 20;
	// dataD.datasets[0].data[2] = Math.random() * 20;
	// dataD.datasets[0].data[3] = Math.random() * 20;
	// dataD.datasets[0].data[4] = Math.random() * 10;
	// dataD.datasets[0].data[5] = Math.random() * 10;

  // myDoughnutChart.update();
}
function makeFlat() {
	scene.getObjectByName('B00').scale.z = 0.01;
	scene.getObjectByName('B01').scale.z = 0.01;
	scene.getObjectByName('B02').scale.z = 0.01;
	scene.getObjectByName('C').scale.z = 0.01;
	scene.getObjectByName('A4').scale.z = 0.01;
	scene.getObjectByName('A2').scale.z = 0.01;
	scene.getObjectByName('A5').scale.z = 0.01;
	scene.getObjectByName('A1').scale.z = 0.01;
	scene.getObjectByName('A3').scale.z = 0.01;
	scene.getObjectByName('A6').scale.z = 0.01;
}

function makeFat() {
	scene.getObjectByName('B00').scale.z = 1;
	scene.getObjectByName('B01').scale.z = 1;
	scene.getObjectByName('B02').scale.z = 1;
	scene.getObjectByName('C').scale.z = 1;
	scene.getObjectByName('A4').scale.z = 1;
	scene.getObjectByName('A2').scale.z = 1;
	scene.getObjectByName('A5').scale.z = 1;
	scene.getObjectByName('A1').scale.z = 1;
	scene.getObjectByName('A3').scale.z = 1;
	scene.getObjectByName('A6').scale.z = 1;
}

$('.mdl-radio__button').click(function() {
	var value = $(this).attr('value');

	if (value == '1') {
		rotateGraph(Math.PI);
		makeFat();
		cameraControls.enabled = true;
		cameraTarget = new THREE.Vector3(0, 30, 0);
	}
	if (value == '2') {
		rotateGraph(0);
		makeFat();
		cameraControls.enabled = true;
		cameraTarget = new THREE.Vector3(0, 10, 0);
	}
	if (value == '3') {
		rotateGraph(0);
		cameraControls.reset();
		cameraControls.enabled = false;
		makeFlat();
		cameraTarget = new THREE.Vector3(0, 20, 0);
	}
});

$('#popup').hover(function() {
  $('#popup').removeClass('close');
});
$('#popup').mouseleave(function() {
  $('#popup').addClass('close');
});

$('.filter-item').click(function() {
	var clickedId = $(this).attr('id');

	if ($(this).hasClass('on')) {
		$(this).removeClass('on');
		$(this).addClass('off');

		for (var i = graph.length - 1; i >= 0; i--) {
			if (graph[i].energyType == clickedId) {
				graph[i].visible = false;
			}
		}
	} else {
		$(this).removeClass('off');
		$(this).addClass('on');

		for (var i = graph.length - 1; i >= 0; i--) {
			if (graph[i].energyType == clickedId && ((graph[i].name.indexOf("-") >= 0 && $('#filter-item2-' + graph[i].name.slice(-1)).hasClass('on')))) {
				graph[i].visible = true;
			}
		}
	}

	showTotalEnergySum();
});

$('.filter-item2').click(function() {
	var clickedId = $(this).attr('id').slice(-1);

	if ($(this).hasClass('on')) {
		$(this).removeClass('on');
		$(this).addClass('off');

		for (var i = graph.length - 1; i >= 0; i--) {
			if ((graph[i].name.slice(-3) == '-1' + clickedId || graph[i].name.slice(-3) == '-2' + clickedId || graph[i].name.slice(-3) == '-3' + clickedId)) {
				graph[i].visible = false;
			}
		}
	} else {
		$(this).removeClass('off');
		$(this).addClass('on');

		for (var i = graph.length - 1; i >= 0; i--) {
			if ((graph[i].name.slice(-3) == '-1' + clickedId || graph[i].name.slice(-3) == '-2' + clickedId || graph[i].name.slice(-3) == '-3' + clickedId) && $('#' + graph[i].energyType).hasClass('on')) {
				graph[i].visible = true;
			}
		}
	}

	showTotalEnergySum();
});

$('.filter-item3').click(function () {
	if ($(this).hasClass('on')) {
		$(this).removeClass('on').addClass('off');
		$('.range-slider-wrapper').addClass('hidden');
	} else {
		$(this).removeClass('off').addClass('on');
		$('.range-slider-wrapper').removeClass('hidden');
	}
});

// simplemaps_usmap.hooks.click_state=function(id){
//     stateId = id;
//     stateName = simplemaps_usmap_mapdata.state_specific[id].name;
//     changeData(currentYear);
//     console.log('Changed state: ',id,'Current year: ',currentYear);
// }

$('#B-layer-text').hover(function () {
	for (var i = graph.length - 1; i >= 0; i--) {
		if (!['Coal'].includes(graph[i].energyType)) {
			graph[i].visible = false;
		}
	}

	showTotalEnergySum();
});

$('#B-layer-text').mouseleave(function () {
	for (var i = graph.length - 1; i >= 0; i--) {
		graph[i].visible = true;
	}

	showTotalEnergySum();
});

$('#C-layer-text').hover(function () {
	for (var i = graph.length - 1; i >= 0; i--) {
		if (!['waste'].includes(graph[i].energyType)) {
			graph[i].visible = false;
		}
	}

	showTotalEnergySum();
});

$('#C-layer-text').mouseleave(function () {
	for (var i = graph.length - 1; i >= 0; i--) {
		graph[i].visible = true;
	}

	showTotalEnergySum();
});

$('#others-layer-text').hover(function () {
	for (var i = graph.length - 1; i >= 0; i--) {
		if (!['Nuclear', 'Geothermal', 'Solar', 'Biofuel', 'Wind', 'Hydro', 'Petroleum'].includes(graph[i].energyType)) {
			graph[i].visible = false;
		}
	}

	showTotalEnergySum();
});

$('#others-layer-text').mouseleave(function () {
	for (var i = graph.length - 1; i >= 0; i--) {
		graph[i].visible = true;
	}

	showTotalEnergySum();
});