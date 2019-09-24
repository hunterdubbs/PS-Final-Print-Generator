//We want to set the default units to inches for now, but
//we want to put it back to the previous setting afterwards.
var oldUnitConfig = preferences.rulerUnits;
preferences.rulerUnits = Units.INCHES;

//array to hold File objects of selected images
var images = [];

//create script window
var runDialog = new Window('dialog', 'APP Demo');
runDialog.frameLocation = [100, 100];
runDialog.bounds = [100, 100, 400, 300];

//break window into panels
runDialog.imageSelection = runDialog.add('panel', [20, 10, 280, 65], 'Image Selection');
runDialog.options = runDialog.add('panel', [20, 75, 280, 130], 'Options');
runDialog.windowButtons = runDialog.add('panel', [20, 140, 280, 185], 'Options');

//button to select images
runDialog.imageSelection.selectionLabel = runDialog.imageSelection.add('statictext', [80, 15, 240, 35], 'Select Images');
runDialog.imageSelection.selectionButton = runDialog.imageSelection.add('button', [20, 15, 75, 35], 'Browse');

//options
runDialog.options.borderWidthLabel = runDialog.options.add('statictext', [20, 15, 90, 35], 'Border Width');
runDialog.options.borderWidthInput = runDialog.options.add('edittext', [95, 15, 125, 35], '5');

//ok and cancel buttons
runDialog.windowButtons.okButton = runDialog.windowButtons.add('button', [50, 5, 150, 25], 'OK');
runDialog.windowButtons.cancelButton = runDialog.windowButtons.add('button', [150, 5, 250, 25], 'Cancel');

//callback methods assign the method that is called when a button is clicked
runDialog.imageSelection.selectionButton.onClick = function(){openFileBrowswer();};
runDialog.windowButtons.okButton.onClick = function(){processImages();};

//display the window
runDialog.show();

// //disable dialogs during execution
displayDialogs = DialogModes.NO;

function openFileBrowswer(){
	//calls windows explorer file selector and returns and array of the files
	images = File.openDialog('Select images', 'All files:*.*', true);
	//show in the window that files have been selected
	runDialog.imageSelection.selectionLabel.text = images.length + ' Image(s) Selected';
}

function processImages(){
	//process each image individually
	for(var i = 0; i < images.length; i++){
		//open the image, duplicate it, and close the original
		var img = app.open(images[i]);
		var tempImg = img.duplicate(images[i].displayName + '_temp');
		img.close(SaveOptions.DONOTSAVECHANGES);
		
		//apply the border
		tempImg.selection.selectAll();
		tempImg.selection.stroke(app.foregroundColor, runDialog.options.borderWidthInput.text, StrokeLocation.INSIDE);
		tempImg.selection.deselect();
		
		//save and close the image - saving it as a JPG for now
		tempImg.flatten();
		var jpgSaveConfig = new JPEGSsaveOptions();
		jpgSaveConfig.quality = 12;
		tempImg.saveAs(new File(images[i].path + '/' + images[i].displayName + '_processed.jpg'), jpgSaveConfig, true, Extension.LOWERCASE);
		tempImg.close(SaveOptions.DONOTSAVECHANGES);
	}
	
	runDialog.close();
	alert('Process complete! ' + images.length + ' image(s) were processed');
}

//reset the configs
displayDialogs = DialogModes.YES;
preferences.rulerUnits = oldUnitConfig;