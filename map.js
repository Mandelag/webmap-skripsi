var log = {};
/**********************
 * MAP RELATED AMANNN *
 **********************/
/* sources */

//id counter perlu karena ubah atribut nanti pakai getId
var COUNTER=0;  //nantinya id ini baiknya dibedakan per source.

var kosSource = new ol.source.Vector({});
var favoritSource = new ol.source.Vector({});

kosSource.setProperties({
	variableName: "kosSource",
	idCounter: 0,
	name: "Tempat tinggal",
	type: "Point",
	attributes: ['nama', 'arahan', 'lama_tahun', 'lama_bulan', 'selesai_tahun', 'selesai_bulan'],
	attdisplay: [true, true, false, false]
});

favoritSource.setProperties({
	variableName: "favoritSource",
	idCounter: 0,
	name: "Tempat makan",
	type: "Point",
	attributes: ['peringkat', 'nama', 'waktu', 'freq', 'arahan', 'harga-1', 'harga-2', 
	'kenyamanan-1', 'kenyamanan-2', 'akses-1', 'akses-2', 'fasilitas-1', 'fasilitas-2',
	'manusia-1', 'manusia-2'],
	attdisplay: [true, true, false, false, true, false, false, false, false, false, false, false, false, false, false]
});

/* layers */

var styleFunction = function (stringColor){
	var resultFunction = function(feature, zl){
		var radius;
		if(zl < 0.3) {
			radius = 16;
		}else if(zl > 2){
			radius = 12;
		}else {
			radius = 14;
		}
		
		var style = new ol.style.Style({
			image: new ol.style.Circle({
			radius: radius,
			fill: new ol.style.Fill({
				color: stringColor
			}),
			stroke: new ol.style.Stroke({
				color: '#aaa',
				width: 1
			})
			}),
			text: new ol.style.Text({
				text: feature.get("nama"),
				stroke: new ol.style.Stroke({
						color: '#fff',
						width: 2
					}),
				scale: 1,
				font: '12px sans-serif',
				offsetX: 0,
				offsetY: -24,
				textAlgin: "center"
				})
		})
		return style;
	}
	return resultFunction;
};

var kosLayer = new ol.layer.Vector({
	name: "kosLayer",
	source: kosSource,
	style: styleFunction('#e63')
});

var favoritLayer = new ol.layer.Vector({
	name: "favoritLayer",
	source: favoritSource,
	style: styleFunction('#6e6')
});

var osmLayer = new ol.layer.Tile({
	source: new ol.source.OSM({  
		url: 'http://a.tile2.opencyclemap.org/transport/{z}/{x}/{y}.png',
		//url: 'https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png',
		//attributions: ol.source.OSM.ATTRIBUTION
	})
	
	//source: new ol.source.OSM()
});

var surveyLayer = new ol.layer.Tile({
	source: new ol.source.TileImage({
		url: 'basemap-sm/{z}/{x}/{y}.png'
	})
});

/* interactions */

var currentDrawInteraction;

var selectInteraction = new ol.interaction.Select({  //buka editor atribut apabila fitur di klik.
	layers: [kosLayer, favoritLayer],
	toggleCondition: ol.events.condition.never, // disable multiple selection.
});

var defaultSelectFunction = function(evt){	
	if(evt.selected.length == 1){
		var feature = evt.selected[0];
		var layerName = feature.get("layerName"); //unik di aplikasi ini aja.. karena yang buat juga pengguna (bukan fitur hasil import).
		var sourceName = feature.get("sourceName");
		var source = getSourceByName(sourceName);
		
		if(evt.deselected.length==0){ //klik fitur baru dari tadinya kosong.
			$(container).css("opacity",0);
			openAttributeOverlay(source, feature, source.getProperties()['name']);
			overlay.setPosition(feature.getGeometry().getCoordinates());
			$(container).animate({opacity: 1},100, "swing", function(){});
		}else if(evt.deselected.length >= 1) { //klik fitur baru dari tadinya fitur lain.
			$(container).animate({opacity: 0},100, "swing", function(){	
				overlay.setPosition(undefined);
				openAttributeOverlay(source, feature);
				$(container).animate({opacity: 1},100, "swing", function(){	
					overlay.setPosition(evt.selected[0].getGeometry().getCoordinates());
				});
			});
		}
	}else{
		closeOverlay(true);
	}
}
//selectInteraction.on('select', defaultSelectFunction);

var modifyInteraction;

/* main map */

var minx = ol.proj.transform([106.813, -6.374], 'EPSG:4326', 'EPSG:3857');
var maxx = ol.proj.transform([106.826, -6.356], 'EPSG:4326', 'EPSG:3857');

var map = new ol.Map ({
	target : "map",
	layers : [/*osmLayer, */surveyLayer, favoritLayer, kosLayer],
	view : new ol.View({
		minZoom: 16,
		maxZoom: 19,
		zoom: 16,
		center: ol.proj.transform([106.822, -6.365], 'EPSG:4326', 'EPSG:3857'),
		extent: [minx[0],minx[1],maxx[0],maxx[1]]
	})
});

/* overlay */
/* attribute container */
var container = document.getElementById("popup");
var containerGeser = document.getElementById("popup-geser");

$("#popup-closer").on("click", function(){
	closeOverlay(true);
});

var overlay = new ol.Overlay(/** @type {olx.OverlayOptions} */ ({
	element: container,
	autoPan: true,
	autoPanAnimation: {
		duration: 250
	}
}));

var overlayGeser = new ol.Overlay(/** @type {olx.OverlayOptions} */ ({
	element: containerGeser,
	autoPan: true,
	autoPanAnimation: {
		duration: 250
	}
}));

function closeOverlay(unselect){
	$(container).animate({opacity: 0},200, "swing", function(){	
			overlay.setPosition(undefined);
	});
	selectInteraction.getFeatures().clear();
}


map.addOverlay(overlay);
map.addOverlay(overlayGeser);
noEdit();




/********************
 * map related done *
 ********************/




/*
 * 
 * Attribute overlay yang muncul ketika fitur diklik.
 * Attribute yang muncul hanya ditampilkan, tidak bisa diubah.
 * 
 */
function openAttributeOverlay (source, feature, msg) {
	$("#popup-title").html(msg);
	var containerHtml = $("#popup-content");
	containerHtml.empty();
	var id = feature.getId();
	var attributes = source.getProperties()['attributes']; 
	var atd = source.getProperties()['attdisplay'];
	var props = feature.getProperties();
	console.log(props);
	var table = $("<table></table>");
	table.css("width","100%");
	table.append("<br />");	
	for(var i=0; i<attributes.length; i++){
		if(atd[i]){
			var row = $("<tr></tr>");
			row.append("<td style='font-weight:bold;'>"+attributes[i]+"</td>");
			var value = props[attributes[i]];
			if( value == "") {
				value = "-"
			}
			row.append("<td><div>"+value+"</div></td>");
			table.append(row);
		}
	}
	containerHtml.append(table);
	containerHtml.append("<br />");

	var line = $('<div style="width:100%"></div>');
	//line.css("width", "100%");
	line.css("margin","auto");
	var buttonEdit = $('<button class="ui-button ui-corner-all" style="padding-left:0;padding-right:0;width:45%;"><span class="ui-icon ui-icon-pencil" style="zoom: 100%;"></span>Ubah Info</button>');
	var buttonMove = $('<button class="ui-button ui-corner-all" style="padding-left:0;padding-right:0;width:45%;"><span class="ui-icon ui-icon-pin-s" style="zoom: 100%;"></span>Pindahkan</button>');
	
	buttonEdit.on("click", function(){
		
		closeOverlay(true);
		var containerDialog;
		
		if (source == kosSource) {
			containerDialog = $("#kosLayerAttribute");
		} else /*if (layer == favoritSource)*/{
			containerDialog = $("#makanFavoritAttribute");
		}
		
		formDialog = openAttributeEditorForm2(source, feature, containerDialog, "updateAttribute");
		
		containerDialog.dialog("open");
	});
	
	buttonMove.on("click", function(evt){
		closeOverlay(true);
		
		modifyInteraction = new ol.interaction.Modify({
			features: new ol.Collection([feature])
		});
		
		modifyInteraction.on("modifyend", function(evt){
			$(container).animate({opacity: 1},100, "swing", function(){
				
				});
			overlayGeser.setPosition(feature.getGeometry().getCoordinates());
		});
		
		modifyInteraction.on("modifystart", function(evt){
			overlayGeser.setPosition(undefined);
		});
		
		$(containerGeser).empty();
		var info = $('<p>Klik dan geser</p>');
		var doneButton = $('<button class="ui-button ui-corner-all"><span class="ui-icon ui-icon-check" style="zoom: 100%;"></span>Selesai</button>');
		doneButton.on("click", function(evt){
			overlayGeser.setPosition(undefined);
			map.removeInteraction(modifyInteraction);
			map.addInteraction(selectInteraction);
			$("#tmain").show();
			$("#informasi").show();
		});
		$(containerGeser).append(info);
		$(containerGeser).append(doneButton);
		overlayGeser.setPosition(feature.getGeometry().getCoordinates());

		
		map.removeInteraction(selectInteraction);
		map.addInteraction(modifyInteraction);
		
		
		
		$("#tmain").hide();
		$("#informasi").hide();
	});
	
	line.append(buttonMove);
	line.append('<span style="width:10%;">&nbsp;&nbsp;</span>');
	line.append(buttonEdit);
	containerHtml.append(line);
}




function getSourceByName(sourceName) {
	var source;
	map.getLayers().forEach( function (el, index, array){	/* cari layer */
		var sourceData = el.getSource();
		var variableName = sourceData.getProperties()['variableName'];
		if(variableName == sourceName) {			
			source = sourceData;
		}
	});
	return source;
}

function noEdit() {
	$(".draw").prop('disabled', false);	
	map.removeInteraction(currentDrawInteraction);
	currentDrawInteraction = null;
}

/**
 *
 * menambahkan interaksi 'draw' di peta pada source tertentu.
 * Setelah selesai akan memanggil callback(str)
 * 
 */
function draw(attributDefault, defaultValue, source, finishCallback, cancelCallback) { //dari html manggil variabel langsung.
	
	selectInteraction.getFeatures().clear();
	
	var props = source.getProperties();
	currentDrawInteraction = new ol.interaction.Draw({		/* tambahkan attribut default pada saat drawend */
		source: source,
		type: source.getProperties()['type']
	});
		
	currentDrawInteraction.on('drawend', function(evt){	
		var featureHasil = evt.feature;
		var prop = {};
		
		source.getProperties()['attributes'].forEach(function(attribute){
			prop[attribute] = ""; //diisi dengan "" supaya ngga undefined.
		});
		
		if(attributDefault == "id") {
			featureHasil.setId(defaultValue);
		}else {
			prop[attributDefault] = defaultValue;
			featureHasil.setId(COUNTER++);
		}
		prop['sourceName'] = source.getProperties()['variableName'];
		featureHasil.setProperties(prop); 
				
		window.setTimeout(function () {
			closeOverlay(true);
			
			var formDialog;
			if (source == kosSource) {
				formDialog = $("#kosLayerAttribute");
			} else /*if (layer == favoritSource)*/{
				formDialog = $("#makanFavoritAttribute");
				$("#keterangan").html("Favorit #"+featureHasil.getProperties()["peringkat"]);
			}
			
			formDialog = openAttributeEditorForm2(source, featureHasil, formDialog, "updateAttribute", finishCallback, cancelCallback);
			formDialog.dialog("open");
		}, 100); //memastikan kalau atributnya sudah terpasang ketika membuka form ini.
		map.removeInteraction(currentDrawInteraction);
		finishCallback("drawend");
	});
		
	map.addInteraction(currentDrawInteraction); /* tambahkan interaction sesuai dengan source */
	closeOverlay(true);
};

/* v2 
 * jQueryForm is more like dialog container.. usually div, not form element
 * */
function openAttributeEditorForm2 (source, feature, jQueryForm, stringCallback, finishCallback=undefined, cancelCallback=undefined) {
	var id = feature.getId();
	
	var cb = stringCallback+"(this, "+source.getProperties()["variableName"]+", \""+id+"\")";
	
	var props = feature.getProperties();
	var attribs = source.getProperties()["attributes"];
	
	for(i=0;i<attribs.length;i++){
		var attrib = attribs[i];
		var inputEl = jQueryForm.find("[name='"+attrib+"']");
		var inputElSize = inputEl.length;
		
		if(inputElSize > 0 ) {
			if(inputElSize <= 1 ) { //
				inputEl.val(props[attrib]);
				inputEl.attr("oninput", cb);
				//inputEl.val("");
				
			} else if(inputElSize > 1){  // for checkbox or radio button 
				inputEl.attr("onchange", cb);
				//implemented for radio button only..
				inputEl.each(function(i, el){
					//coba.. VVVV
					//$(this).prop("checked", props[attrib] == $(this).val());
					el.checked = props[attrib] == $(this).val(); //ga tau sync ga yah ama jquery buttonnya?
				});	
			}
		}
	}
	
	//jQueryForm.find("input[type='radio']").checkboxradio("refresh"); //entah mengapa tidak berefek pada mobile.

	//represh();

	var buttonCancel = $('<button class="ui-button ui-corner-all" id="zancel" style="display:none;"><span class="ui-icon ui-icon-trash" style="zoom: 100%;"></span>OK</button>');
	var buttonSubmit = $('<button class="ui-button ui-corner-all" id="zubmit" style="display:none;"><span class="ui-icon ui-icon-check" style="zoom: 100%;"></span>OK</button>');
	
	jQueryForm.children("form").on('submit', function(evt){
		evt.preventDefault();
		
		jQueryForm.dialog("close");		
		if(!(typeof finishCallback === "undefined")) {
			finishCallback("finish");
		}
		jQueryForm.children("form").off("submit");
		buttonSubmit.remove()
		buttonCancel.off("click");
		buttonCancel.remove();
	});
	
	if(!(typeof cancelCallback === "undefined")) {
		buttonCancel.on("click", function(evt){
			
			source.removeFeature(source.getFeatureById(feature.getId()));
			//COUNTER--;
			
			evt.preventDefault();
		
			jQueryForm.dialog("close");	
			
			if(!(typeof cancelCallback === "undefined")) {
				cancelCallback();
			}
			jQueryForm.children("form").off("submit");
			buttonSubmit.remove();
			buttonCancel.off("click");
			buttonCancel.remove();
		});
		jQueryForm.children("form").append(buttonCancel);
	}
	
	
	jQueryForm.children("form").append(buttonSubmit);
	
	jQueryForm.find("input[type='radio']").checkboxradio("refresh"); //entah mengapa tidak berefek pada mobile.
	return jQueryForm;
}

/* 
 * Fungsi ini dipanggil oleh DOM event ketika mengisi form input attribute editor. 
 */
function updateAttribute(input, source, featureId) {
	var inputForm = $(input);
	var feature = source.getFeatureById(featureId);
	var propBaru = {};
	var attributeKey = inputForm.attr('name');
	
	propBaru[attributeKey] = inputForm.val();
	
	//var gj = new ol.format.GeoJSON();
	//console.log(gj.writeFeatures(source.getFeatures()));
	feature.setProperties(propBaru);	
	//console.log(feature.getProperties());
}



/*******************
 * LOGIC APPLIKASI *
 *******************/
function formSubmit() {
	var gjsWriter = new ol.format.GeoJSON({
		defaultDataProjection:"EPSG:3857"
	});
	var kosanJSON = gjsWriter.writeFeatures(kosSource.getFeatures());
	var ruteJSON = gjsWriter.writeFeatures(lineSource.getFeatures());
	var poiJSON = gjsWriter.writeFeatures(keteranganSource.getFeatures());
	
	$("#kosLayer").val(kosanJSON);
	$("#ruteLayer").val(ruteJSON);
	$("#keteranganLayer").val(poiJSON);
	$("#timestamp_mulai").val(waktuMulaiServer);
}


var defaultDialogClose = function(event, ui) {
	closeOverlay(true);
	selectInteraction.getFeatures().clear();
}

function validateAttribute(ui){
	$("#attr_edit").submit(function(evt){
		evt.preventDefault();
		$("#makanFavoritAttribute").dialog("close");
	});
}

function validateAttribute2(dialogId, formId, callback){
	$("#"+formId).submit(function(evt){
		evt.preventDefault();
		$("#"+dialogId).dialog("close");
		callback("finish");
	});
}

$("#kosLayerAttribute").dialog({
	autoOpen: false,
	dialogClass: "no-close",
	height: "auto",
	//width: "90%",
	maxWidth: "450px",
	resizable : false,
	modal: true,
	//close: defaultDialogClose,
	show: {
		effect: "fade",
		duration: 300
	},
	maxHeight: 450,
	hide: {
		effect: "fade",
		duration: 300
	},
	buttons: [
	{
		text: "Cancel",
		icons: {
			primary: "ui-icon-trash"
		},
		click: function(){
			$( "#zancel" ).trigger("click");
			$(this).dialog("close");
		}
	},
    {
      text: "OK",
      icons: {
		primary: "ui-icon-check"
	  },
      click: function() {
        $( "#zubmit" ).trigger("click");
        //alert("hey");
        //$( this ).dialog( "close" );
      }
    }
  ]
});

$("#makanFavoritAttribute").dialog({
	autoOpen: false,
	dialogClass: "no-close",
	height: "auto",
	maxWidth: "450px",
	resizable : false,
	modal: true,
	show: {
		effect: "fade",
		duration: 300
	},
	maxHeight: 450,
	hide: {
		effect: "fade",
		duration: 300
	},
    
	buttons: [
	{
		text: "Cancel",
		icons: {
			primary: "ui-icon-trash"
		},
		click: function(){
			console.log("click biasa..");
			$( "#zancel" ).trigger("click");
			$(this).dialog("close");
		}
	},
    {
      text: "OK",
      icons: {
		primary: "ui-icon-check"
	  },
      click: function() {
		$( "#zubmit" ).trigger("click");
      }
    }
  ]
});

$("#identitas").dialog({
	autoOpen: false,
	height: "auto",
	maxWidth: "450px",
	resizable : false,
	modal: true,
	show: {
		effect: "fade",
		duration: 300
	},
	maxHeight: 450,
	hide: {
		effect: "fade",
		duration: 300
	},
	buttons: [
    {
      text: "OK",
      icons: {
		primary: "ui-icon-check"
	  },
      click: function() {
		$( "#kirim" ).trigger("click");
      }
    }]
});

$("#identitas-form").on("submit", function(evt){
	log.submit = Math.round(new Date().getTime()/1000);
	evt.preventDefault();
	//disable submit button
	$("#kirim").prop("disabled", true);
	var forms = $("#identitas-form").serialize();
		
	var gjsWriter = new ol.format.GeoJSON({
		defaultDataProjection:"EPSG:3857"
	});
	var kosanJSON = gjsWriter.writeFeatures(kosSource.getFeatures());
	var favJSON = gjsWriter.writeFeatures(favoritSource.getFeatures());
	var logJSON = JSON.stringify(log);
	//console.log(logJSON);
	
	var request = forms + "&kosLayer=" + encodeURI(kosanJSON) + "&favoritLayer="+ encodeURI(favJSON) + "&log=" + encodeURI(logJSON);
	//console.log(request);
	try {
		$.post( "submit-pg.php", request, function( data ) {
			console.log(data);
			//var data = JSON.parse(data);
			
			if ("Sukses" === data ){
				$("#dialog-message p").html("Sukses!<br /><br />Anda akan diredirect ke <a href='done.html'>halaman ini</a> secara otomatis..");
				window.onbeforeunload = function(){};
				setTimeout(function(){
					window.location = "done.html";
				}, 1000);
			}else {
				alert("Server sedang bermasalah.\nCoba lagi dalam beberapa saat.");
				$("#dialog-message").dialog("close");
			}
			$("#kirim").prop("disabled", false);
		}).fail(function(){
			alert("Gagal terhubung dengan server.\nCoba lagi dalam beberapa saat.");
			$("#dialog-message").dialog("close");
			$("#kirim").prop("disabled", false);
		});
	}catch(e){
		$("#dialog-message").dialog("close");
		$("#kirim").prop("disabled", false);
		console.log(e);
	}
	$("#dialog-message").dialog("open");
	$("#kirim").prop("disabled", true);
});

function getSourceGeoJSON(source) {
	var gj = new ol.format.GeoJSON(); //kasih proyeksi nanti..epsg:4326
	return gj.writeFeatures(source.getFeatures());
}

$(function () {
	//$("body").show();
	$("body").animate({opacity: 1},500, "swing", function(){
		$("html").css("background-color", "white");
	});
});

	
