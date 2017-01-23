/* v2 */
/* @param stringCallback function(inputHtml, ol.source, featureId); */
function openAttributeEditorForm (source, feature, jQueryForm, stringCallback) {
	var id = feature.getId();
	//var callback = "updateAttribute"; //bisa jadi param..
	
	var cb = callback+"(this, "+source.getProperties()["variableName"]+", \""+id+"\")";
	
	var attribs = source.getProperties()["attributes"];
	for(i=0;i<props.length;i++){
		var attrib = attribs[i];
		var inputEl = jQueryForm.find("[name='"+attrib+"']");
		var inputElSize = inputEl.size();
		
		if(inputElSize == 1 ) { //
			inputEl.attr("oninput", cb);
			inputel.val("");
		} else {  // for checkbox or radio button 
			inputEl.attr("oninput", "alert('not implemented yet')");
		}
	}
	
	return jQueryForm; //formDialog.dialog("open");
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

//there is an updater function that takes an input html elemnt (jquery obj), feature source, and id)
//source HAS A attributeDisplayEditor(feature, updaterFunction) -> jQuery obj.


