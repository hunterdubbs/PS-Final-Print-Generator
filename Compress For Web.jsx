//=================================//
//*********************************//
//------Auhtor:  Hunter Dubbs------//
//*********************************//
//-This program takes image files--//
//-and compresses them for use on--//
//-websites using Photoshops save--//
//-for web functionality-----------//
//=================================//

//set units to inches
var oldUnitConfig = preferences.rulerUnits;
preferences.rulerUnits = Units.INCHES;

var destination, quality, size;
var images = [];
var executed;

//main dialog window
var runDialog = new Window('dialog', 'Compress Images for Web', [100, 100, 500, 315]);
//dialog input output panel
runDialog.ioPanel = runDialog.add('panel', [20, 20, 380, 140], 'Input / Output Settings');
runDialog.ioPanel.selectionLabel = runDialog.ioPanel.add('statictext', [20, 20, 110, 40], 'Select Images');
runDialog.ioPanel.selectionButton = runDialog.ioPanel.add('button', [125, 20, 190, 40], 'Browse');
runDialog.ioPanel.selectionSummary = runDialog.ioPanel.add('statictext', [205, 20, 340, 40], 'No Images Selected');
runDialog.ioPanel.destinationLabel = runDialog.ioPanel.add('statictext', [20, 50, 110, 70], 'Destination Folder');
runDialog.ioPanel.destinationButton = runDialog.ioPanel.add('button', [125, 50, 190, 70], 'Browse');
runDialog.ioPanel.destinationInput = runDialog.ioPanel.add('edittext', [205, 50, 340, 70], '~/Pictures');
runDialog.ioPanel.sizeLabel = runDialog.ioPanel.add('statictext', [20, 80, 190, 100], 'Image Dimension Reduction');
runDialog.ioPanel.sizeInput = runDialog.ioPanel.add('dropdownlist', [195, 80, 340, 100]);
runDialog.ioPanel.sizeInput.add('item', '10% Original Size');
runDialog.ioPanel.sizeInput.add('item', '25% Original Size');
runDialog.ioPanel.sizeInput.add('item', '40% Original Size');
runDialog.ioPanel.sizeInput.add('item', '60% Original Size');
runDialog.ioPanel.sizeInput.add('item', '80% Original Size');
runDialog.ioPanel.sizeInput.add('item', 'Original Size');
runDialog.ioPanel.sizeInput.selection = 1;
//dialog options panel
runDialog.optionsPanel = runDialog.add('panel', [20, 150, 380, 195], 'Options');
runDialog.optionsPanel.qualityLabel = runDialog.optionsPanel.add('statictext', [20, 5, 60, 25], 'Quality');
runDialog.optionsPanel.qualityInput = runDialog.optionsPanel.add('dropdownlist', [65, 5, 150, 25]);
runDialog.optionsPanel.qualityInput.add('item', 'Low');
runDialog.optionsPanel.qualityInput.add('item', 'Medium');
runDialog.optionsPanel.qualityInput.add('item', 'High');
runDialog.optionsPanel.qualityInput.add('item', 'Very High');
runDialog.optionsPanel.qualityInput.add('item', 'Maximum');
runDialog.optionsPanel.qualityInput.selection = 0;
runDialog.optionsPanel.okButton = runDialog.optionsPanel.add('button', [170, 5, 260, 25], 'OK');
runDialog.optionsPanel.cancelButton = runDialog.optionsPanel.add('button', [260, 5, 350, 25], 'Cancel');
//button callbacks
runDialog.ioPanel.selectionButton.onClick = function (){fileBrowser();};
runDialog.ioPanel.destinationButton.onClick = function (){folderBroswer();};
runDialog.optionsPanel.okButton.onClick = function (){runOperation();};
runDialog.optionsPanel.cancelButton.onClick = function (){cancelOperation();};

runDialog.show();

//callback methods
function fileBrowser(){
	images = File.openDialog('Select Images', 'All Files:*.*', true);
	runDialog.ioPanel.selectionSummary.text = images.length + ' Image(s) Selected';
}

function folderBroswer(){
	runDialog.ioPanel.destinationInput.text = Folder.selectDialog('Select File Destination');
}

function runOperation(){
	setConfigs();
	processImages();
	runDialog.close();
}

function cancelOperation(){
	runDialog.close();
}

//processing methods
function setConfigs(){
	destination = runDialog.ioPanel.destinationInput.text;
	switch(runDialog.optionsPanel.qualityInput.selection.index){
		case 0:
			quality = 10;
			break;
		case 1:
			quality = 30;
			break;
		case 2:
			quality = 60;
			break;
		case 3:
			quality = 80;
			break;
		case 4:
			quality = 100;
			break;
	}
	switch(runDialog.ioPanel.sizeInput.selection.index){
		case 0:
			size = 0.1;
			break;
		case 1:
			size = 0.25;
			break;
		case 2:
			size = 0.4;
			break;
		case 3:
			size = 0.6;
			break;
		case 4:
			size = 0.8;
			break;
		case 5:
			size = 1;
			break;
	}
}

function processImages(){
	if(!executed){
		executed = true;
		var exportConfig = new ExportOptionsSaveForWeb();
		exportConfig.quality = quality;
		exportConfig.format = SaveDocumentType.JPEG;
		for(var i = 0; i < images.length; i++){
			//open image
			var img = app.open(images[i]);
			//resize image, but ensure that it does not drop below 200px on it's longest side
			var newWidth = new UnitValue(img.width.as('px') * size, 'px');
			var newHeight = new UnitValue(img.height.as('px') * size, 'px');
			if(img.width > img.height){
				if(newWidth.as('px') < 200){
					newWidth = new UnitValue(200, 'px');
					newHeight = new UnitValue(img.height.as('px') * newWidth.as('px') / img.width.as('px'), 'px');
				}
			}else{
				if(newHeight.as('px') < 200){
					newHeight = new UnitValue(200, 'px');
					newWidth = new UnitValue(img.width.as('px') * newHeight.as('px') / img.height.as('px'), 'px');
				}
			}
			img.resizeImage(newWidth, newHeight, 96, ResampleMethod.AUTOMATIC);
			//export image
			img.exportDocument(new File(destination + '/' + images[i].displayName.substr(0, images[i].displayName.lastIndexOf('.')) + '_web.jpg'), ExportType.SAVEFORWEB, exportConfig);
			img.close(SaveOptions.DONOTSAVECHANGES);
		}
		//notify user that the process has finished
		alert('Process successful! ' + images.length + ' images(s) were created at ' + destination);
		//reset global config
		preferences.rulerUnits = oldUnitConfig;
	}
}