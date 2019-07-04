//=================================//
//*********************************//
//------Auhtor:  Hunter Dubbs------//
//*********************************//
//-This program takes image files--//
//-resizes them, puts them on an---//
//-appropriately sized canvas,-----//
//applies a border, and exports it.//
//=================================//


//set units to inches
var oldUnitConfig = preferences.rulerUnits;
preferences.rulerUnits = Units.INCHES;

//configuration variables

var canvasHeight, canvasWidth, imageHeight, imageWidth, resolution, fileFormat, signature, destination;
var images = [];
var executed;

//initial dialog with run options
//setup window
var runDialog = new Window('dialog', 'Create Final Prints');
runDialog.frameLocation = [100, 100];
runDialog.bounds = [100, 100, 600, 400];
//window components
runDialog.imageSelection = runDialog.add('panel', [20, 10, 480, 65], 'Image Selection');
runDialog.imageSelection.selectionLabel = runDialog.imageSelection.add('statictext', [20, 20, 140, 40], 'Select Images');
runDialog.imageSelection.selectionButton = runDialog.imageSelection.add('button', [155, 20, 210, 40], 'Browse');
runDialog.imageSelection.selectionSummary = runDialog.imageSelection.add('statictext', [235, 20, 430, 40], 'No Images Selected');
runDialog.sizeConfig = runDialog.add('panel', [20, 75, 480, 230], 'Image Output Size');
runDialog.sizeConfig.canvasHeightLabel = runDialog.sizeConfig.add('statictext', [20, 20, 140, 40], 'Canvas Height (Inches)');
runDialog.sizeConfig.canvasHeightInput = runDialog.sizeConfig.add('edittext', [145, 20, 210, 40], '8.5');
runDialog.sizeConfig.canvasWidthLabel = runDialog.sizeConfig.add('statictext', [235, 20, 360, 40], 'Canvas Width (Inches)');
runDialog.sizeConfig.canvasWidthInput = runDialog.sizeConfig.add('edittext', [365, 20, 430, 40], '11');
runDialog.sizeConfig.imageHeightLabel = runDialog.sizeConfig.add('statictext', [20, 50, 140, 70], 'Image Height (Inches)');
runDialog.sizeConfig.imageHeightInput = runDialog.sizeConfig.add('edittext', [145, 50, 210, 70], '6');
runDialog.sizeConfig.imageWidthLabel = runDialog.sizeConfig.add('statictext', [235, 50, 360, 70], 'Image Width (Inches)');
runDialog.sizeConfig.imageWidthInput = runDialog.sizeConfig.add('edittext', [365, 50, 430, 70], '9');
runDialog.sizeConfig.outputPresetLabel = runDialog.sizeConfig.add('statictext', [20, 80, 55, 100], 'Preset');
runDialog.sizeConfig.outputPresetInput = runDialog.sizeConfig.add('dropdownlist', [60, 80, 210, 100]);
runDialog.sizeConfig.outputPresetInput.add('item', '8.5 x 11 - Landscape');
runDialog.sizeConfig.outputPresetInput.add('item', '8.5 x 11 - Potrait');
runDialog.sizeConfig.outputPresetInput.add('item', '11 x 14 - Landscape');
runDialog.sizeConfig.outputPresetInput.add('item', '11 x 14 - Potrait');
runDialog.sizeConfig.outputPresetInput.selection = 0;
runDialog.sizeConfig.imageResolutionLabel = runDialog.sizeConfig.add('statictext', [235, 80, 360, 100], 'Image Resolution (DPI)');
runDialog.sizeConfig.imageResolutionInput = runDialog.sizeConfig.add('edittext', [365, 80, 430, 100], '150');
runDialog.sizeConfig.signatureLabel = runDialog.sizeConfig.add('statictext', [20, 110, 90, 130], 'Photographer');
runDialog.sizeConfig.signatureInput = runDialog.sizeConfig.add('edittext', [95, 110, 140, 130], '');
runDialog.sizeConfig.destinationLabel = runDialog.sizeConfig.add('statictext', [150, 110, 240, 130], 'Destination Folder');
runDialog.sizeConfig.destinationInput = runDialog.sizeConfig.add('edittext', [245, 110, 370, 130], '~/Pictures');
runDialog.sizeConfig.destinationButton = runDialog.sizeConfig.add('button', [375, 110, 430, 130], 'Browse');
runDialog.windowButtons = runDialog.add('panel', [20, 240, 480, 285], 'Options');
runDialog.windowButtons.okButton = runDialog.windowButtons.add('button', [250, 5, 350, 25], 'OK');
runDialog.windowButtons.cancelButton = runDialog.windowButtons.add('button', [350, 5, 450, 25], 'Cancel');
runDialog.windowButtons.outputFormatLabel = runDialog.windowButtons.add('statictext', [20, 5, 95, 25], 'Output Format');
runDialog.windowButtons.outputFormatInput = runDialog.windowButtons.add('dropdownlist', [100, 5, 230, 25]);
runDialog.windowButtons.outputFormatInput.add('item', 'JPEG (*.JPG)');
runDialog.windowButtons.outputFormatInput.add('item', 'PNG (*.PNG)');
runDialog.windowButtons.outputFormatInput.add('item', 'Photoshop (*.PSD)');
runDialog.windowButtons.outputFormatInput.selection = 0;
//assign callback methods
runDialog.imageSelection.selectionButton.onClick = function () {openFileBrowser();};
runDialog.sizeConfig.outputPresetInput.onChange = function (){updateSizeValues();};
runDialog.windowButtons.okButton.onClick = function (){runOperation();};
runDialog.windowButtons.cancelButton.onClick = function (){cancelOperation();};
runDialog.sizeConfig.destinationButton.onClick = function (){openFolderBrowser();};
runDialog.update();
runDialog.show();

//define event callback methods
function runOperation() {
	setConfig();
	createPrints();
	runDialog.close();
}

function cancelOperation() {
	runDialog.close();
}

function openFolderBrowser(){
	runDialog.sizeConfig.destinationInput.text = Folder.selectDialog('Select File Destination');
}

function openFileBrowser(){
	images = File.openDialog('Select images', 'All files:*.*', true);
	runDialog.imageSelection.selectionSummary.text = images.length + ' Image(s) Selected';
}

//this does not seem to work with addEventListener, so the callback method is used
function updateSizeValues(){
	switch (runDialog.sizeConfig.outputPresetInput.selection.index){
		case 0:
			setSizeValues(8.5, 11, 6, 9, 150);
			break;
		case 1:
			setSizeValues(11, 8.5, 9, 6, 150);
			break;
		case 2:
			setSizeValues(11, 14, 8, 12, 150);
			break;
		case 3:
			setSizeValues(14, 11, 12, 8, 150);
			break;
	}
}

// //disable dialogs during execution
displayDialogs = DialogModes.NO;

function setSizeValues(canvasHeightParam, canvasWidthParam, imageHeightParam, imageWidthParam, resolutionParam){
	runDialog.sizeConfig.canvasHeightInput.text = canvasHeightParam;
	runDialog.sizeConfig.canvasWidthInput.text = canvasWidthParam;
	runDialog.sizeConfig.imageHeightInput.text = imageHeightParam;
	runDialog.sizeConfig.imageWidthInput.text = imageWidthParam;
	runDialog.sizeConfig.imageResolutionInput.text = resolutionParam;
}

function setConfig(){
	//image variable is set when it is selected in file browser
	canvasHeight = runDialog.sizeConfig.canvasHeightInput.text;
	canvasWidth = runDialog.sizeConfig.canvasWidthInput.text;
	imageHeight = runDialog.sizeConfig.imageHeightInput.text;
	imageWidth = runDialog.sizeConfig.imageWidthInput.text;
	resolution = runDialog.sizeConfig.imageResolutionInput.text;
	destination = runDialog.sizeConfig.destinationInput.text;
	signature = runDialog.sizeConfig.signatureInput.text;
	switch (runDialog.windowButtons.outputFormatInput.selection.index){
		case 0:
			fileFormat = '.jpg';
			break;
		case 1:
			fileFormat = '.png';
			break;
		case 2:
			fileFormat = '.psd';
			break;
	}
}

function createPrints(){
	if (!executed){
		executed = true;
		for(var i = 0; i < images.length; i++){
			//open image and make duplicate
			var img = app.open(images[i]);
			var tempImg = img.duplicate(images[i].displayName + '_temp');
			//the image might not have the same aspect ratio as the configuration
			//scale relative to configured shorter side
			if(imageWidth < imageHeight){
				imageWidth = imageWidth / img.width * img.width;
				imageHeight = imageWidth / img.width * img.height;
			}else{
				imageHeight = imageHeight / img.height * img.height;
				imageWidth = imageHeight / img.height * img.width;
			}
			tempImg.resizeImage(new UnitValue(imageWidth, 'inches'), new UnitValue(imageHeight, 'inches'), resolution, ResampleMethod.AUTOMATIC);
			//put border on image
			tempImg.selection.selectAll();
			tempImg.selection.stroke(app.foregroundColor, 2, StrokeLocation.INSIDE, ColorBlendMode.NORMAL, 100, false);
			tempImg.selection.deselect();
			//the opened image may be a PSD with multiple layers, so flatten them to be safe
			tempImg.flatten();
			var finalImg = app.documents.add(new UnitValue(canvasWidth, 'inches'), new UnitValue(canvasHeight, 'inches'), 150, images[i].displayName + '_print');
			app.activeDocument = finalImg;
			//put border on canvas
			finalImg.selection.selectAll();
			finalImg.selection.stroke(app.foregroundColor, 2, StrokeLocation.INSIDE, ColorBlendMode.NORMAL, 100, false);
			finalImg.selection.deselect();
			//move image to final print
			app.activeDocument = tempImg;
			var imgInsert = tempImg.activeLayer.duplicate(finalImg);
			app.activeDocument = finalImg;
			//center the image
			finalImg.activeLayer.translate(new UnitValue((canvasWidth - imageWidth) / 2, 'inches'), new UnitValue((canvasHeight - imageHeight) / 2, 'inches'));
			//put signature in bottom right
			var signatureLayer = finalImg.artLayers.add();
			signatureLayer.kind = LayerKind.TEXT;
			signatureLayer.textItem.contents = signature;
			signatureLayer.textItem.fauxBold = true;
			signatureLayer.textItem.size = new UnitValue(14, 'pt');
			var textPos = signatureLayer.bounds;
			textPos[0] = (canvasWidth - (canvasWidth - imageWidth) / 2 - textPos[2]);
			textPos[1] = (canvasHeight - (canvasHeight - imageHeight) / 2) - textPos[1] - 0.1;
			signatureLayer.translate(new UnitValue(-textPos[0], 'inches'), new UnitValue(-textPos[1], 'inches'));
			//flatten image if it's not being saved as a .psd'
			if(fileFormat != '.psd'){
				finalImg.flatten();
			}
			if(fileFormat == '.psd'){
				var psdSaveConfig = new PhotoshopSaveOptions();
				psdSaveConfig.layers = true;
				finalImg.saveAs(new File(destination + '/' + images[i].displayName.substr(0, images[i].displayName.lastIndexOf('.')) + '_print' + fileFormat), psdSaveConfig, true, Extension.LOWERCASE);
			}else if(fileFormat == '.jpg'){
				var jpgSaveConfig = new JPEGSaveOptions();
				jpgSaveConfig.quality = 12;
				finalImg.saveAs(new File(destination + '/' + images[i].displayName.substr(0, images[i].displayName.lastIndexOf('.')) + '_print' + fileFormat), jpgSaveConfig, true, Extension.LOWERCASE);
			}else if(fileFormat == '.png'){
				var pngSaveConfig = new PNGSaveOptions();
				pngSaveConfig.compression = 0;
				finalImg.saveAs(new File(destination + '/' + images[i].displayName.substr(0, images[i].displayName.lastIndexOf('.')) + '_print' + fileFormat), pngSaveConfig, true, Extension.LOWERCASE);
			}
			//clean up and close images
			img.close(SaveOptions.DONOTSAVECHANGES);
			tempImg.close(SaveOptions.DONOTSAVECHANGES);
			finalImg.close(SaveOptions.DONOTSAVECHANGES);
		}
		//notify user that the process has finished
		alert('Process successful! ' + images.length + ' image(s) were created at ' + destination);
		//reset global config		
		displayDialogs = DialogModes.YES;
		preferences.rulerUnits = oldUnitConfig;
	}
}

