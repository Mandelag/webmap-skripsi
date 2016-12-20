$(function () {
	//$("body").show();
	$("body").animate({opacity: 1},500, "swing", function(){
		$("html").css("background-color", "white");
	});
});

/**********************
 * MAP RELATED AMANNN *
 **********************/

//id counter perlu karena ubah atribut nanti pakai getId
var COUNTER=0;  //nantinya id ini harusnya dibedakan per source.

var kosSource = new ol.source.Vector({});
var favoritSource = new ol.source.Vector({});

kosSource.setProperties({
	variableName: "kosSource",
	name: "Tempat tinggal",
	type: "Point",
	attributes: ['nama', 'keterangan', 'alamat', 'lama_bulan', 'lama_hari']
});

favoritSource.setProperties({
	variableName: "favoritSource",
	name: "Tempat makan",
	type: "Point",
	attributes: ['peringkat', 'nama', 'keterangan']
});

var kosLayer = new ol.layer.Vector({
	name: "kosLayer",
	source: kosSource,
	style: function (feature, zl){
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
				color: '#ff3333'
            }),
			stroke: new ol.style.Stroke({
				color: '#aaa',
				width: 1
			})
			})
		})
		return style;
		}
});

var favoritLayer = new ol.layer.Vector({
	name: "favoritLayer",
	source: favoritSource,
	style: function(feature, zl) {
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
				stroke: new ol.style.Stroke({
					color: '#aaa',
					width: 1,
				}),
				fill: new ol.style.Fill({
					color: '#aaffbb'
				})
			})
		});
		return style;
	}
});

var osmLayer = new ol.layer.Tile({
	source: new ol.source.OSM({  //karena ingin mencari hotspot wilayah usaha, di basemap ga boleh ada poi usaha.
								// jadi harus bikin patokan non-wilayah usaha.
		url: 'http://a.tile2.opencyclemap.org/transport/{z}/{x}/{y}.png',
		//url: 'https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}.png',
		//attributions: ol.source.OSM.ATTRIBUTION
	})
	
	//source: new ol.source.OSM()
});

var surveyLayer = new ol.layer.Tile({
	source: new ol.source.TileImage({
		url: 'basemap/{z}/{x}/{y}.png'
	})
});

var minx = ol.proj.transform([106.81, -6.375], 'EPSG:4326', 'EPSG:3857');
var maxx = ol.proj.transform([106.844, -6.355], 'EPSG:4326', 'EPSG:3857');

var map = new ol.Map ({
	target : "map",
	layers : [surveyLayer, favoritLayer, kosLayer],
	view : new ol.View({
		minZoom: 14,
		maxZoom: 19,
		zoom: 14,
		center: ol.proj.transform([106.827, -6.365], 'EPSG:4326', 'EPSG:3857'),
		extent: [minx[0],minx[1],maxx[0],maxx[1]]
	})
});

function getSourceGeoJSON(source) {
	var gj = new ol.format.GeoJSON(); //kasih proyeksi nanti..
	return gj.writeFeatures(source.getFeatures());
}

var container = document.getElementById("popup");
var overlay = new ol.Overlay(/** @type {olx.OverlayOptions} */ ({
	element: container,
	autoPan: true,
	autoPanAnimation: {
		duration: 250
	}
}));

map.addOverlay(overlay);

$("#popup-closer").on("click", function(){	
	//alert('kli');
	selectInteraction.dispatchEvent({
		type: "select",
		deselected: selectInteraction.getFeatures().getArray(),
		selected: []
	});
	selectInteraction.getFeatures().clear();
});


/********************
 * map related done *
 ********************/

var selectInteraction = new ol.interaction.Select({  //buka editor atribut apabila fitur di klik.
	layers: [kosLayer, favoritLayer],
	toggleCondition: ol.events.condition.never, // disable multiple selection.
	//filter: defaultSelectFilterFunction
});


selectInteraction.on('select', function(evt){
	
	console.log(evt.selected.length+" "+evt.deselected.length);
	
	if(evt.selected.length==1){
		var feature = evt.selected[0];
		var layerName = feature.get("layerName"); //unik di aplikasi ini aja.. karena yang buat juga pengguna (bukan fitur hasil import).
		//console.log(feature);
		//console.log(layerName);
		
		var sourceName = feature.get("sourceName");
		var source = getSourceByName(sourceName);
		
		if(evt.deselected.length==0){
			//openAttributeEditorForm(source, feature);
			$(container).css("opacity",0);
			openAttributeOverlay(source, feature, source.getProperties()['name']);
			overlay.setPosition(feature.getGeometry().getCoordinates());
			$(container).animate({opacity: 1},100, "swing", function(){});
			//$(container).fadeIn(200);		
		}else if(evt.deselected.length >= 1) {
			$(container).animate({opacity: 0},100, "swing", function(){	
				overlay.setPosition(undefined);
				openAttributeOverlay(source, feature);
				$(container).animate({opacity: 1},100, "swing", function(){	
					overlay.setPosition(evt.selected[0].getGeometry().getCoordinates());
				});
			});
		}
	}else{
		closeOverlay();
	}
});

function openAttributeOverlay (source, feature, msg) {
	$("#popup-title").html(msg);
	var containerHtml = $("#popup-content");
	containerHtml.empty();
	var id = feature.getId();
	var attributes = source.getProperties()['attributes']; 
	var props = feature.getProperties();
	console.log(props);
	var table = $("<table></table>");
	table.css("width","100%");
	table.append("<br />");	
	for(var i=0; i<attributes.length; i++){
		var row = $("<tr></tr>");
		row.append("<td style='font-weight:bold;'>"+attributes[i]+"</td>");
		var value = props[attributes[i]];
		if( value == "") {
			value = "-"
		}
		row.append("<td><div>"+value+"</div></td>");
		table.append(row);
	}
	containerHtml.append(table);
	containerHtml.append("<br />");

	var buttonEdit = $('<p><button class="ui-button ui-widget ui-corner-all"><span class="ui-icon ui-icon-pencil" style="zoom: 100%;"></span> Edit</button></p>');
	buttonEdit.css("width","100%");
	buttonEdit.css("text-align","right");
	buttonEdit.css("margin","0");
	buttonEdit.on("click", function(){
		openAttributeEditorForm(source, feature);
	});
	containerHtml.append(buttonEdit);
}

function closeOverlay(){
	$(container).animate({opacity: 0},100, "swing", function(){	
			overlay.setPosition(undefined);
	});
	selectInteraction.getFeatures().clear();
}

function getSourceByName(sourceName) {
	var source;
	map.getLayers().forEach( function (el, index, array){	/* cari layer */
		var sourceData = el.getSource();
		var variableName = sourceData.getProperties()['variableName'];
		//console.log(variableName);
		if(variableName == sourceName) {			
			source = sourceData;
		}
	});
	return source;
}

map.addInteraction(selectInteraction);

noEdit();
var currentDrawInteraction;


function noEdit() {
	$(".draw").prop('disabled', false);	
	map.removeInteraction(currentDrawInteraction);
	currentDrawInteraction = null;
}

function draw(attributDefault, defaultValue, source, callback) { //dari html manggil variabel langsung.
	
	selectInteraction.getFeatures().clear();
	
	var props = source.getProperties();
	currentDrawInteraction = new ol.interaction.Draw({		/* tambahkan attribut default pada saat drawend */
		source: source,
		type: source.getProperties()['type']
	});
	
	//map.removeInteraction(selectInteraction);
	
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
			closeOverlay();
			openAttributeEditorForm(source, featureHasil, callback);
		}, 100); //memastikan kalau atributnya sudah terpasang ketika membuka form ini.
		map.removeInteraction(currentDrawInteraction);
		callback("drawend");
	});
		
	map.addInteraction(currentDrawInteraction); /* tambahkan interaction sesuai dengan source */
	//map.addInteraction(snapInteraction);
	closeOverlay();
};


function openAttributeEditorForm (source, feature, callback, msg) {
	map.removeInteraction(selectInteraction);	
	
	closeOverlay();
	
	/* populate the form */
	var formDialog;
	var formHtml;
	//var feature = source.getFeatureById(id);
	var id = feature.getId();
	//console.log(feature);
	
	if (source == kosSource) {
		formDialog = $("#kosLayerAttribute");
		//formHtml = $("#kosLayerAttribute input, #kosLayerAttribute textarea");
		formHtml = formDialog.find("input, textarea");
	} else /*if (layer == favoritSource)*/{
		//dielse aja..
		formDialog = $("#makanFavoritAttribute");
		$("#keterangan").html("Favorit #"+feature.getProperties()["peringkat"]);
		formHtml = formDialog.find("input, textarea");
	}
		
	
	formHtml.each(function (i, e) {
		//formHtml.on("input", updateAttribute(e, layer.getSource(), id)); //ternyata jquery belom dukung ini.. jadi pake yang dibawah..
		$(e).attr("oninput", "updateAttribute(this, "+source.getProperties()["variableName"]+", \""+id+"\")");
		$(e).val("");
		if(feature != null) { //jika baru dibuat masih null..
			var props = feature.getProperties();
			var name = $(e).attr("name");
			$(e).val(props[name]);
		}
	});
	
	if(typeof callback === "undefined") {
		//console.log("callback undefined");
	}else {
		formDialog.on("dialogclose", function(evt){
			evt.preventDefault();
			callback("finish");
			formDialog.off("dialogclose");
			formDialog.on("dialogclose", defaultDialogClose);
		});
	}
	formDialog.dialog("open");
}

function updateAttribute(input, source, featureId) {
	var inputForm = $(input);
	var feature = source.getFeatureById(featureId);
	var propBaru = {};
	var attributeKey = inputForm.attr('name');
	
	propBaru[attributeKey] = inputForm.val();
	
	//var gj = new ol.format.GeoJSON();
	//console.log(gj.writeFeatures(source.getFeatures()));
	feature.setProperties(propBaru);	
	console.log(feature.getProperties());

}

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

/*******************
 * LOGIC APPLIKASI *
 *******************/

var defaultDialogClose = function(event, ui) {
	map.addInteraction(selectInteraction);
	closeOverlay();
	selectInteraction.getFeatures().clear();
}

$("#kosLayerAttribute").dialog({
	autoOpen: false,
	height: "auto",
	resizable : false,
	modal: true,
	close: defaultDialogClose,
	show: {
		effect: "fade",
		duration: 300
	},
	hide: {
		effect: "fade",
		duration: 300
	},
	buttons: {
		OK: function() {
			$( this ).dialog( "close" );
		}
	}
});
$("#makanFavoritAttribute").dialog({
	autoOpen: false,
	height: "auto",
	resizable : false,
	modal: true,
	close: defaultDialogClose,
	show: {
		effect: "fade",
		duration: 300
	},
	hide: {
		effect: "fade",
		duration: 300
	},
	buttons: {
		OK: function() {
			$( this ).dialog( "close" );
		}
	}
});

var kosIdleMsg = "Klik tombol di samping untuk menambahkan tempat tinggal anda di peta.";
var kosDrawMsg = "Temukan dan klik lokasi tempat tinggal anda di peta...";
var fav1IdleMsg = "Dengan tombol yang sama, tambahkan tempat makan paling favorit (#1) pilihan Anda yang ada di sekitar UI.";
var fav1DrawMsg = "Klik di peta...";
var fav2IdleMsg = "Tempat makan favorit kedua (#2)?";
var fav2DrawMsg = "Klik di peta...";
var fav3IdleMsg = "Tempat makan avorit ketiga (#3)?";
var fav3DrawMsg = "Klik di peta...";
var selesaiMsg = "Klik pada fitur yang telah dibuat untuk meninjau keterangan.";

function kosIdle (){
	console.log("idle!");
	editInfoText(kosIdleMsg);
	$("#tmain").off("click");
	$("#tmain").on("click", function(){
		kosDraw();
	});
}

function kosDraw (){
	console.log("draw!");
	editInfoText(kosDrawMsg);

	$("#tmain").addClass("active");
	
	$("#tmain").off("click");	
	$("#tmain").on("click", function(){
		kosCancel();
	});
	
	draw('id','1',kosSource,kosFinish);	
}

function kosCancel (){
	noEdit();
	$("#tmain").removeClass("active");
	console.log("cancel :(");
	kosIdle();
}

function kosFinish (msg){
	//console.log("kos finish "+msg);
	if(msg == "drawend") {
		console.log("attribut!");
		$("#tmain").removeClass("active");
	}else if(msg == "finish") {
		$("#tmain").off("click");
		console.log("FINISH!");
		fav1Idle();
	}
};

function fav1Idle (){
	console.log("idle!");
	editInfoText(fav1IdleMsg);

	$("#tmain").off("click");
	$("#tmain").on("click", function(){
		fav1Draw();
	});
}

function fav1Draw (){
	console.log("draw!");
	editInfoText(fav1DrawMsg);

	$("#tmain").addClass("active");
	
	$("#tmain").off("click");	
	$("#tmain").on("click", function(){
		fav1Cancel();
	});
	
	draw('peringkat','1',favoritSource,fav1Finish);	
}

function fav1Cancel (){
	noEdit();
	$("#tmain").removeClass("active");
	console.log("cancel :(");
	fav1Idle();
}

function fav1Finish (msg){
	//console.log("kos finish "+msg);
	if(msg == "drawend") {
		console.log("attribut!");
		$("#tmain").removeClass("active");
	}else if(msg == "finish") {
		$("#tmain").off("click");
		console.log("FINISH!");
		fav2Idle();
	}
};

function fav2Idle (){
	console.log("idle!");
	editInfoText(fav2IdleMsg);

	$("#tmain").off("click");
	$("#tmain").on("click", function(){
		fav2Draw();
	});
}

function fav2Draw (){
	console.log("draw!");
		editInfoText(fav2DrawMsg);

	$("#tmain").addClass("active");
	
	$("#tmain").off("click");	
	$("#tmain").on("click", function(){
		fav2Cancel();
	});
	
	draw('peringkat','2',favoritSource,fav2Finish);	
}

function fav2Cancel (){
	noEdit();
	$("#tmain").removeClass("active");
	console.log("cancel :(");
	fav2Idle();
}

function fav2Finish (msg){
	//console.log("kos finish "+msg);
	if(msg == "drawend") {
		console.log("attribut!");
		$("#tmain").removeClass("active");
	}else if(msg == "finish") {
		$("#tmain").off("click");
		console.log("FINISH!");
		fav3Idle();
	}
};

function fav3Idle (){
	console.log("idle!");
	editInfoText(fav3IdleMsg);

	$("#tmain").off("click");
	$("#tmain").on("click", function(){
		fav3Draw();
	});
}

function fav3Draw (){
	console.log("draw!");
	editInfoText(fav3DrawMsg);

	$("#tmain").addClass("active");
	
	$("#tmain").off("click");	
	$("#tmain").on("click", function(){
		fav3Cancel();
	});
	
	draw('peringkat','3',favoritSource,fav3Finish);	
}

function fav3Cancel (){
	noEdit();
	$("#tmain").removeClass("active");
	console.log("cancel :(");
	fav3Idle();
}

function fav3Finish (msg){
	//console.log("kos finish "+msg);
	if(msg == "drawend") {
		console.log("attribut!");
		$("#tmain").removeClass("active");
	}else if(msg == "finish") {
		$("#tmain").off("click");
		console.log("FINISH! bgt..");
		selesai();
	}
};

function selesai () {
	editInfoText(selesaiMsg);

}

/* mulai aplikasi */
kosIdle();

var waktuMulaiServer;

var tmain_isPressed = false;
var tahapan = 0;

function editInfoText(msg){
	$("#informasi").fadeOut(150, function(){
		$("#informasi").html("<p>"+msg+"</p>");
		$("#informasi").css("background-color", "rgba(256,256,0,0.6)");
		$("#informasi").fadeIn(150, function(){
			$("#informasi").animate({"background-color":"rgba(256,256,256,0.6)"}, 300);
		});
	});
}

/*
window.onbeforeunload = function(evt) {
    var message = 'Apakah mau keluar?';
    if (typeof evt == 'undefined') {
        evt = window.event;
    }
    if (evt) {
        evt.returnValue = message;
    }
    return message;
}
*/

