/*
 * App Logic
 * 
 */
var jumlah_tempat_makan = 3;
var kosIdleMsg = "Gunakan tombol '+' di kanan bawah untuk menandai lokasi tempat tinggal sementara anda.";
var kosDrawMsg = "Temukan dan klik lokasi tempat tinggal anda di peta...";
var fav1IdleMsg = "Dengan tombol yang sama, tambahkan tempat makan favorit anda di Kukusan.<br/><br/>"+
					"<span id='kriteria-tm'>Kriteria tempat makan:</span><br />"+
					"  1. Berada di dalam bangunan permanen.<br />"+
					"  2. Berada di luar tempat tinggal sementara.";
var favDrawMsg = "Klik di peta...";
var fav2IdleMsg = "Tempat makan favorit (2/"+jumlah_tempat_makan+")? <br/><br/>"+
					"<span id='kriteria-tm'>Kriteria tempat makan:</span><br />"+
					"  1. Berada di dalam bangunan permanen.<br />"+
					"  2. Berada di luar tempat tinggal sementara.";
var fav3IdleMsg = "Tempat makan favorit (3/"+jumlah_tempat_makan+")? <br/><br/>"+
					"<span id='kriteria-tm'>Kriteria tempat makan:</span><br />"+
					"  1. Berada di dalam bangunan permanen.<br />"+
					"  2. Berada di luar tempat tinggal sementara.";
var selesaiMsg = "Input data selesai. Klik tombol '>' untuk lanjut ke tahap akhir, atau klik pada fitur yang telah ditandai di atas peta untuk meninjau kembali isian.";
log.koscancel = 0;
log.tm1cancel = 0;
log.tm2cancel = 0;
log.tm3cancel = 0;
log.revisiKos = 0;
log.revisiTm  = 0;
var date = new Date();


function kosIdle (){
	log.kos1 = Math.round(date.getTime()/1000);
	console.log("idle!");
	editInfoText(kosIdleMsg);
	$("#tmain").off("click");
	$("#tmain").on("click", function(){
		kosDraw();
	});
}

function kosDraw (){
	log.kos2 = Math.round(date.getTime()/1000);
	console.log("draw!");
	editInfoText(kosDrawMsg);
	$("#tmain").addClass("active");
	
	$("#tmain").off("click");	
	$("#tmain").on("click", function(){
		kosCancel();
	});
	
	draw('id','1', kosSource, kosFinish, kosCancel);	
}

function kosCancel (){
	log.koscancel++;
	noEdit();
	$("#tmain").removeClass("active");
	console.log("cancel :(");
	kosIdle();
}

function kosFinish (msg){
	if(msg == "drawend") {
		log.kos3 = Math.round(date.getTime()/1000);
		console.log("attribut!");
		$("#tmain").removeClass("active");
	}else if(msg == "finish") {
		log.kos4 = Math.round(date.getTime()/1000);
		$("#tmain").off("click");
		console.log("FINISH!");
		fav1Idle();
	}
};

function fav1Idle (){
	log.tm11 = Math.round(date.getTime()/1000);;
	console.log("idle!");
	editInfoText(fav1IdleMsg);

	$("#tmain").off("click");
	$("#tmain").on("click", function(){
		fav1Draw();
	});
}

function fav1Draw (){
	log.tm12 = Math.round(date.getTime()/1000);;
	console.log("draw!");
	editInfoText(favDrawMsg);

	$("#tmain").addClass("active");
	
	$("#tmain").off("click");	
	$("#tmain").on("click", function(){
		fav1Cancel();
	});
	
	draw('peringkat','1',favoritSource,fav1Finish, fav1Cancel);	
}

function fav1Cancel (){
	log.tm1cancel++;
	noEdit();
	$("#tmain").removeClass("active");
	console.log("cancel :(");
	fav1Idle();
}

function fav1Finish (msg){
	if(msg == "drawend") {
		log.tm13 = Math.round(date.getTime()/1000);;
		console.log("attribut!");
		$("#tmain").removeClass("active");
	}else if(msg == "finish") {
		log.tm14 = Math.round(date.getTime()/1000);;
		$("#tmain").off("click");
		console.log("FINISH!");

		//selesai(); //jump. nanti diganti.
		fav2Idle();
	}
};

function fav2Idle (){
	log.tm21 = Math.round(date.getTime()/1000);;
	console.log("idle!");
	editInfoText(fav2IdleMsg);

	$("#tmain").off("click");
	$("#tmain").on("click", function(){
		fav2Draw();
	});
}

function fav2Draw (){
	log.tm22 = Math.round(date.getTime()/1000);;
	console.log("draw!");
	editInfoText(favDrawMsg);

	$("#tmain").addClass("active");
	
	$("#tmain").off("click");	
	$("#tmain").on("click", function(){
		fav2Cancel();
	});
	
	draw('peringkat','2',favoritSource,fav2Finish, fav2Cancel);	
}

function fav2Cancel (){
	log.tm2cancel++;
	noEdit();
	$("#tmain").removeClass("active");
	console.log("cancel :(");
	fav2Idle();
}

function fav2Finish (msg){
	if(msg == "drawend") {
		log.tm23 = Math.round(date.getTime()/1000);;
		console.log("attribut!");
		$("#tmain").removeClass("active");
	}else if(msg == "finish") {
		log.tm24 = Math.round(date.getTime()/1000);;
		$("#tmain").off("click");
		console.log("FINISH!");
		//selesai(); //temporary
		fav3Idle();
	}
};

function fav3Idle (){
	log.tm31 = Math.round(date.getTime()/1000);;
	console.log("idle!");
	editInfoText(fav3IdleMsg);

	$("#tmain").off("click");
	$("#tmain").on("click", function(){
		fav3Draw();
	});
}

function fav3Draw (){
	log.tm32 = Math.round(date.getTime()/1000);;
	console.log("draw!");
	editInfoText(favDrawMsg);

	$("#tmain").addClass("active");
	
	$("#tmain").off("click");	
	$("#tmain").on("click", function(){
		fav3Cancel();
	});
	
	draw('peringkat','3',favoritSource,fav3Finish, fav3Cancel);	
}

function fav3Cancel (){
	log.tm3cancel++;
	noEdit();
	$("#tmain").removeClass("active");
	console.log("cancel :(");
	fav3Idle();
}

function fav3Finish (msg){
	if(msg == "drawend") {
		log.tm33 = Math.round(date.getTime()/1000);;
		console.log("attribut!");
		$("#tmain").removeClass("active");
	}else if(msg == "finish") {
		log.tm34 = Math.round(date.getTime()/1000);;
		$("#tmain").off("click");
		console.log("FINISH! bgt..");
		selesai();
	}
};

function selesai () {
	log.finish = Math.round(date.getTime()/1000);;
	logBrowserData();
	editInfoText(selesaiMsg);
	
	$("#kosLayerAttribute").dialog("option", "buttons", [{
      text: "OK",
      icons: {
		primary: "ui-icon-check"
	  },
      click: function() {
        $( "#zubmit" ).trigger("click");
        log.revisiKos++;
      }
    }]);
	$("#makanFavoritAttribute").dialog("option", "buttons", [{
      text: "OK",
      icons: {
		primary: "ui-icon-check"
	  },
      click: function() {
        $( "#zubmit" ).trigger("click");
        log.revisiTm++;
      }
    }]);

	
	$("#tmain").html("<span>&gt;</span>");
	$("#tmain").css("background-color", "rgba(0, 256, 0, 0.6)");
	
	$("#tmain").off("click");	
	$("#tmain").on("click", function(evt){
		log.id = Math.round(date.getTime()/1000);;
		$("#identitas").dialog("open");
		
	});
	selectInteraction.on('select', defaultSelectFunction);
	map.addInteraction(selectInteraction);
}



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

window.onbeforeunload = function(evt) {
   var message = 'Apakah mau keluar dari aplikasi?\nData yang telah dimasukan akan terhapus.';
    if (typeof evt == 'undefined') {
        evt = window.event;
    }
    if (evt) {
        evt.returnValue = message;
    }
    return message;
}

//mencari korelasi media dengan akurasi spasial
function logBrowserData(){
	log.window = {};
	log.window.location = {};
	log.screen = {};
	log.navigator = {};
	
	//pengaruh layar terhadap akurasi spasial.
	log.window.innerHeight = window.innerHeight;
	log.window.innerWidth = window.innerWidth;
	log.screen.width = screen.width;
	log.screen.height= screen.height;
	log.screen.availWidth = screen.availWidth;
	log.screen.availHeight = screen.availHeight;
	log.screen.colorDepth = screen.colorDepth; //webmap vs kertas (fotokopi)
	log.screen.pixelDepth = screen.pixelDepth;
	
	//referensi
	var str = window.location.href;
	var ref = str.indexOf('?');
	if(ref < 0 ) {
		str = "";
	}else {
		str = str.substring(ref, ref+16);
	}
	log.window.location.href = str;
	
	//Data browser mana yang tidak support
	log.navigator.appName = navigator.appName;
	log.navigator.appCodeName = navigator.appCodeName;
	log.navigator.product = navigator.product;
	log.navigator.appVersion = navigator.appVersion;
	log.navigator.userAgent = navigator.userAgent;
	log.navigator.platform = navigator.platform;
	//log.navigator.language = navigator.language; // mayoritas enUS atau Id..
	//log.navigator.onLine = navigator.onLine;
	//log.navigator.javaEnabled = navigator.javaEnabled; //tidak ada pengaruh
}


/* mulai aplikasi */

//fungsi opsional -> spatial sampling.
if (navigator.geolocation) { 
	navigator.geolocation.getCurrentPosition(function(pos){
		log.loc = {};
		log.loc.lat = pos.coords.latitude;
		log.loc.lon = pos.coords.longitude;
	});
} else {
	//tidak support || tidak diizinkan || karena pakai HTTP.
}

log.start = Math.round(date.getTime()/1000);
kosIdle();
