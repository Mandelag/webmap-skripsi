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
	
	draw('id','1', kosSource, kosFinish, kosCancel);	
}

function kosCancel (){
	noEdit();
	$("#tmain").removeClass("active");
	console.log("cancel :(");
	kosIdle();
}

function kosFinish (msg){
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
	editInfoText(favDrawMsg);

	$("#tmain").addClass("active");
	
	$("#tmain").off("click");	
	$("#tmain").on("click", function(){
		fav1Cancel();
	});
	
	draw('peringkat','1',favoritSource,fav1Finish, fav1Cancel);	
}

function fav1Cancel (){
	noEdit();
	$("#tmain").removeClass("active");
	console.log("cancel :(");
	fav1Idle();
}

function fav1Finish (msg){
	if(msg == "drawend") {
		console.log("attribut!");
		$("#tmain").removeClass("active");
	}else if(msg == "finish") {
		$("#tmain").off("click");
		console.log("FINISH!");

		//selesai(); //jump. nanti diganti.
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
	editInfoText(favDrawMsg);

	$("#tmain").addClass("active");
	
	$("#tmain").off("click");	
	$("#tmain").on("click", function(){
		fav2Cancel();
	});
	
	draw('peringkat','2',favoritSource,fav2Finish, fav2Cancel);	
}

function fav2Cancel (){
	noEdit();
	$("#tmain").removeClass("active");
	console.log("cancel :(");
	fav2Idle();
}

function fav2Finish (msg){
	if(msg == "drawend") {
		console.log("attribut!");
		$("#tmain").removeClass("active");
	}else if(msg == "finish") {
		$("#tmain").off("click");
		console.log("FINISH!");
		//selesai(); //temporary
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
	editInfoText(favDrawMsg);

	$("#tmain").addClass("active");
	
	$("#tmain").off("click");	
	$("#tmain").on("click", function(){
		fav3Cancel();
	});
	
	draw('peringkat','3',favoritSource,fav3Finish, fav3Cancel);	
}

function fav3Cancel (){
	noEdit();
	$("#tmain").removeClass("active");
	console.log("cancel :(");
	fav3Idle();
}

function fav3Finish (msg){
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
	
	$("#kosLayerAttribute").dialog("option", "buttons", [{
      text: "OK",
      icons: {
		primary: "ui-icon-check"
	  },
      click: function() {
        $( this ).dialog( "close" );
      }
    }]);
	$("#makanFavoritAttribute").dialog("option", "buttons", [{
      text: "OK",
      icons: {
		primary: "ui-icon-check"
	  },
      click: function() {
        $( this ).dialog( "close" );
      }
    }]);

	
	$("#tmain").html("<span>&gt;</span>");
	$("#tmain").css("background-color", "rgba(0, 256, 0, 0.6)");
	
	$("#tmain").off("click");	
	$("#tmain").on("click", function(evt){
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

/* mulai aplikasi */
kosIdle();
