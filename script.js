const inputArea = document.querySelector("#text-input"), outputArea = document.querySelector("#text-output"), submitBtn = document.querySelector("#submit-text"), resetBtn = document.querySelector("#reset-text"), newText = [];

//----------------- get text from .text-input -----------------
function getInputText() {
	var inputText = inputArea.value, inputLines = inputText.split(/\r?\n/), ruleNum = 0, props = [], mediaOpen = false, ruleOpen = false, indentLevel = 0;

	for (var i = 0; i < inputLines.length; i++) {
		let line = inputLines[i].trim(), lineStart = line.charAt(0), lineEnd = line.charAt(line.length - 1), newLine = [];

		if (line.length > 0) { // Line not blank
			if (lineEnd.includes("}") == false && lineEnd.includes("{") == false) { // PROPERTY or VARIABLE -----------------------
				if (lineEnd !== ";") {
					console.warn("Incorrect syntax, no ; at end of line " + i + "(" + line + ")");
				}
				if (/^-/.test(line) == false) { // Normal Property
					newLine[3] = "prop";
				} else {
					let patt;
					if (/^--/.test(line) == false) { // Prefixed Property
						patt = /^-[a-z]+-/i;
						newLine[3] = "prefix" + line.match(patt);
						line = line.replace(patt, "");
					} else { // Variable
						line = line.replace(/^--/, "");
						newLine[3] = "var";
					}
				}
				newLine[1] = line; // Add line to newLine array
				newLine[2] = indentLevel; // intent level into newLine array
				// newLine[0] = line.match(/^[^:]+:/i)[0];
				newLine[0] = line.substring(0, line.search(/:/i));
				props.push(newLine); // Push newLine array to end of props array

			} else if (lineEnd == "{") { // RULE -----------------------
				if (lineStart !== "@") { // Normal Rule
					ruleOpen = true;
					newLine[3] = "ruleOpen";
					ruleNum ++;
				} else { // Media Query
					mediaOpen = true;
					newLine[3] = "qryOpen";
				}
				newLine[1] = line; // Add line to newLine array
				newLine[2] = indentLevel; // intent level into newLine array
				newText.push(newLine);
				indentLevel ++;

			} else if (lineStart == "}") { // CLOSING LINE -----------------------
				if (ruleOpen == true) { //close open rule
					ruleOpen = false;
					if (props.length > 0) { //props array is populated
						props = sortProperties(props); //sort props array
						// props = props.sort();
						for (let p = 0; p < props.length; p++) {
							newText.push(props[p]);
						}
						props = [];
					} else {
						console.error("No properties found for ruleNum: " + ruleNum);
					}
					newLine[3] = "ruleClose";
				} else if (mediaOpen == true) { //close open media qry
					mediaOpen = false; //close media query
					newLine[3] = "qryClose";
				} else { //no open rule or media qry
					console.warn(line + " is an UNKNOWN CLOSE.");
				}
				indentLevel --;

				newLine[1] = line; // Add line to newLine array
				newLine[2] = indentLevel; // intent level into newLine array
				newText.push(newLine); //push closing tag
			}
		}
	} // END FOR LOOP
	if (newText.length > 0) {
		console.log(ruleNum + " rules found.");
		inputArea.setAttribute("placeholder", "Copy your CSS here.");
		return populateOutput(newText);

	} else {
		console.warn("newText is empty!");
		inputArea.setAttribute("placeholder", "You need to input your CSS code here before submitting.");
		return "";
	}
} //END getInputText

//---------- SORT PRPERTIES ----------
function sortProperties(props) {
	var stnd = [], prfx = [], vars = [];

	props.forEach((item, i) => {
		if (item[3] == "prop") {
			stnd.push(props[i]);
			console.log("Property type = " + item[3] + " :: added to stnd.");
		} else if (/^prefix/i.test(item[3])) {
			prfx.push(props[i]);
			console.log("Property type = " + item[3] + " :: added to prfx.");
		} else {
			vars.push(props[i]);
			console.log("Property type = " + item[3] + " :: added to vars.");
		}
	});

	if (prfx.length == 0 && vars.length == 0) { // Nothing in the prefix or variable array
		console.log("No Prefixes or variables found");
		propsSorted = props.slice().sort();

	} else { // Prefix array is populated

		var propsSorted = [];
		if (vars.length !== 0) { // If variables exist add them first
			console.log("Variables exist");
			vars.sort();
			vars.forEach((item) => {
				propsSorted.push(item);
			});
		}

		if (prfx.length !== 0) { // If prefix vales exist
			console.log("Prefixes exist");
			var prfxDesc = [];

			prfx.sort();
			stnd.sort();

			for (let i = 0; i < prfx.length; i++) {
				console.log("Prefix: " + prfx[i][0]);
				prfxDesc.push(prfx[i][0]);
			}

			stnd.forEach((item) => {
				if (prfxDesc.indexOf(item[0]) == -1) { // Doesn't have a prefix
					console.log("Property = " + item[0] + " doesn't have a prefix.");
					propsSorted.push(item);
				} else { // Has a prefix
					console.log("Property = " + item[0] + " has a prefix at index " + prfxDesc.indexOf(item[0]));
					propsSorted.push(item);
					let prfxIndexes = getAllIndexes(prfxDesc, item[0]);
					for (let i = 0; i < prfxIndexes.length; i++) {
						propsSorted.push(prfx[prfxIndexes[i]]);
					}
				}
			});

		} else { // Add the props to the sorted array
			stnd = stnd.sort();
			stnd.forEach((item) => {
				propsSorted.push(item);
			});
		}
	}
	//cycle through prop array and compare to prefix array
	//if match exists add matching prefixes after props

	return propsSorted; // Return the sorted properties
}

function getAllIndexes(arr, val) {
	var indexes = [], i = -1;
	while ((i = arr.indexOf(val, i+1)) != -1) {
		indexes.push(i);
	}
	return indexes;
}

function setIndent (level) {
	var ind = "";
	for (var i = 0; i < level; i++) {
		ind = ind + "\t";
	}
	return ind;
}

//----------------- submit text to .text.textOutput -----------------
function populateOutput(txt) {
	var newText = "";
	outputArea.value = newText;
	for (var i = 0; i < txt.length; i++) {
		if (i == 0) {
			newText = txt[i][1];
		} else {
			if (/^prefix/i.test(txt[i][3]) == false && txt[i][3] !== "var") {
				newText = newText + "\n" + setIndent(txt[i][2]) + txt[i][1];
			} else if (/^prefix/i.test(txt[i][3])) {
				let prfx = txt[i][3].replace(/^prefix/i, "");
				newText = newText + "\n" + setIndent(txt[i][2]) + prfx + txt[i][1];
			} else {
				newText = newText + "\n" + setIndent(txt[i][2]) + "--" + txt[i][1];
			}
		}
	}
	return newText;
} // END populateOutput

//-------------------- SUBMIT BUTTON --------------------
function submitButton() {
	outputArea.value = "";
	newText.splice(0, newText.length);
	outputArea.value = getInputText();
	outputArea.focus();
	outputArea.select();
	document.execCommand("copy");
	alert("Result copied to clipboard.");
}

//----------------- RESET BUTTON -----------------
function resetPage() {
	inputArea.value = "";
	outputArea.value = "";
	newText.splice(0, newText.length);
	inputArea.focus();
}

//----------------- Listen for button clicks -----------------
submitBtn.addEventListener("click", submitButton, false);
resetBtn.addEventListener("click", resetPage, false);

//
// jQuery(document).ready(function($) {
// 	// Target all classed with ".lined"
//
// 	$(".lined").linedtextarea();
//
// 	$(".lined").on("keyup mouseup", function() {
// 		colorLine(this, getCursorLocation(this));
//
// 	});
//
// 	function getCursorLocation(textarea) {
// 		var curLine = textarea.value.substring(0, textarea.selectionStart).split("\n"), row = curLine.length;
// 		// var col = curLine[curLine.length-1].length;
// 		// $("#indicator").html(row + ":" + col);
// 		return row;
// 	}
//
// 	function colorLine(textarea, row) {
// 		var lineWrap = $(textarea).parents(".linedwrap");
// 		var lines = $(lineWrap).find(".lineno");
// 		for (var i = 0; i < lines.length; i++) {
// 			if (i + 1 !== row) {
// 				$(lines[i]).removeClass("lineselect");
// 			} else {
// 				$(lines[i]).addClass("lineselect");
// 			}
// 		}
// 	}
//
// });
