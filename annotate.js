// ToDo

// Translations
let params = new URLSearchParams(document.location.search);
let lang = params.get("lang");
if (lang != null) {
  l10n = lang;
}
var en = ({
  "Please enter the Passphrase:": "Please enter the Passphrase:",
  "Or leave it empty": "Or leave it empty",
  "Submit": "Submit",
  "Empty note removed!": "Empty note removed!",
  "Remove": "Remove",
  "Edit": "Edit",
  "Do you want to delete this note?": "Do you want to delete this note?",
  "Finish (Save) editing the previous note to create a new one!": "Finish (Save) editing the previous note to create a new one!",
  "Finish (Save) editing the previous note to edit another!": "Finish (Save) editing the previous note to edit another!",
  "Don't forget to save.": "Don't forget to save."
});
var nl = ({
  "Please enter the Passphrase:": "Voer de wachtwoordzin in:",
  "Or leave it empty": "Of laat het leeg",
  "Submit": "Versturen",
  "Empty note removed!": "Lege aantekening verwijderd!",
  "Remove": "Verwijderen",
  "Edit": "Bewerken",
  "Do you want to delete this note?": "Wil je deze notitie verwijderen?",
  "Finish (Save) editing the previous note to create a new one!": "Werk het aanpassen (Opslaan) van de vorige notitie af om een nieuwe aan te maken!",
  "Finish (Save) editing the previous note to edit another!": "Werk het aanpassen (Opslaan) van de vorige notitie af om een andere aan te passen!",
  "Don't forget to save.": "Vergeet niet op te slaan."
});
Object.assign(translate.en, en);
Object.assign(translate.nl, nl);
let passphraseDialogEl = document.getElementById("passphraseDialog");
if (passphraseDialogEl != null) { 
  passphraseDialogEl.firstElementChild.innerHTML = translate[l10n][passphraseDialogEl.firstElementChild.innerHTML];
  let passphraseInputEl = document.getElementById("passphraseInput");
  passphraseInputEl.placeholder = translate[l10n][passphraseInputEl.placeholder];
  passphraseConfirmEl = document.getElementById("confirmBtn");
  passphraseConfirmEl.innerHTML = translate[l10n][passphraseConfirmEl.innerHTML];
}
// End of translations
function createSelectionFromPoint(startX, startY, endX, endY) {
    var doc = document;
    var start, end, range = null;
    if (typeof doc.caretPositionFromPoint != "undefined") {
        start = doc.caretPositionFromPoint(startX, startY);
        end = doc.caretPositionFromPoint(endX, endY);
        range = doc.createRange();
        range.setStart(start.offsetNode, start.offset);
        range.setEnd(end.offsetNode, end.offset);
    } else if (typeof doc.caretRangeFromPoint != "undefined") {
        start = doc.caretRangeFromPoint(startX, startY);
        end = doc.caretRangeFromPoint(endX, endY);
        range = doc.createRange();
        range.setStart(start.startContainer, start.startOffset);
        range.setEnd(end.startContainer, end.startOffset);
    }
    if (range !== null && typeof window.getSelection != "undefined") {
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    } else if (typeof doc.body.createTextRange != "undefined") {
        range = doc.body.createTextRange();
        range.moveToPoint(startX, startY);
        var endRange = range.duplicate();
        endRange.moveToPoint(endX, endY);
        range.setEndPoint("EndToEnd", endRange);
        range.select();
    }
}
function save(event) {
  if (window.location.href.indexOf("github.io") != -1) { // Github Pages don't support PHP
    var elemDiv = document.createElement('div');
    elemDiv.style.cssText = 'color: red; font-weight: bold;';
    document.body.appendChild(elemDiv);
    elemDiv.innerHTML = 'Github pages do not support PHP, use the demo at <a href="https://annotate.pindanet.be/" target="_blank">annotate.pindanet.be</a>.';
  }
// get content editor
  let editorToolbar = event.target;
  while (editorToolbar.className != "contentEditableToolbar") {
    editorToolbar = editorToolbar.parentElement;
  }
  let editorEl = editorToolbar.parentElement.querySelectorAll('div[contentEditable]')[0]; 
  let content = editorEl.innerHTML;
// get passphrase
  let passphrase = editorToolbar.querySelectorAll('.passphrase')[0].value;
// remove texteditor
  document.getElementById("annotateText" + activeEditorAtTextPosition).remove();
// Edited annotation
  if (document.getElementById("annotateEdit" + activeEditorAtTextPosition)) {
    document.getElementById("annotateEdit" + activeEditorAtTextPosition).id = "annotateText" + activeEditorAtTextPosition;
    if (content.length == 0) {
      alert(translate[l10n]["Empty note removed!"]);
      deleteAnnotation(activeEditorAtTextPosition);
      activeEditorAtTextPosition = 0;
      return;
    }
  } else { // New annotation
    if (content.length == 0) {
      alert(translate[l10n]["Empty note removed!"]);
      document.getElementById("annotation" + activeEditorAtTextPosition).remove();
      activeEditorAtTextPosition = 0;
      refreshAnnotations();
      return;
    }
  }
  let annotateTextEl = document.getElementById('annotateText' + activeEditorAtTextPosition);
  if (annotateTextEl == null) {
    annotateTextEl = document.createElement("div");
    annotateTextEl.id = "annotateText" + activeEditorAtTextPosition;
    document.body.appendChild(annotateTextEl);
  }
  annotateTextEl.classList.add("annotationText");
  annotateTextEl.style.position = "absolute";
  annotateTextEl.style.display = "";
  annotateTextEl.innerHTML = content;
  addCancelButton(annotateTextEl);
  addEditButton(annotateTextEl);

  let blob = new Blob([content], {type:"text/html"});
  var formData = new FormData();
  formData.append('blobHTML', blob);
  formData.append('passphrase', passphrase);
  formData.append('page', getPageName(window.location.pathname) + l10n);
  formData.append('textpos', activeEditorAtTextPosition);
// send text to server
  const xhttp = new XMLHttpRequest();
  xhttp.onload = function() {
    refreshAnnotations();
  }
  xhttp.open("POST", saveScript);
  xhttp.send(formData);

  activeEditorAtTextPosition = 0;
}
let activeEditorAtTextPosition = 0;
function annotate(event) {
  if (event.ctrlKey) {
    event.preventDefault();
    if (activeEditorAtTextPosition != 0) {
      alert(translate[l10n]["Finish (Save) editing the previous note to create a new one!"]);
      return;
    }
    createSelectionFromPoint(event.clientX, event.clientY, event.clientX, event.clientY);
    newNode = document.createElement("span");
    newNode.className = "annotation";
    range = window.getSelection().getRangeAt(0);
    range.insertNode(newNode);
  // get annotable element
    let annotatableEl = event.target;
    while (annotatableEl.className.indexOf("annotatable") == -1) {
      annotatableEl = annotatableEl.parentElement;
    }
    activeEditorAtTextPosition = getCaretIndex(annotatableEl);
    newNode.id = "annotation" + activeEditorAtTextPosition;
  
    let texteditorEl = document.getElementById("texteditor").cloneNode(true);
    editHistory[1] = [];
    let contentEditableEl = texteditorEl.querySelectorAll('div[contentEditable]')[0];
    observer.observe(contentEditableEl, config);
    editHistory[1].push(['editHTML', contentEditableEl.innerHTML, 0]);
  
    document.body.appendChild(texteditorEl); 
    texteditorEl.id = "annotateText" + activeEditorAtTextPosition;
    texteditorEl.classList.add("annotationText");
    texteditorEl.style.display = "";
    texteditorEl.style.position = "absolute";
    texteditorEl.style.top = parseInt(newNode.getBoundingClientRect().top - texteditorEl.getBoundingClientRect().height) + "px";
    contentEditableEl.setAttribute("placeholder", translate[l10n]["Don't forget to save."]);
    contentEditableEl.focus();
    contentEditableEl.innerHTML = "";
  // Detect-when-the-contenteditable editor-element-height-changes
    new ResizeObserver(changes => {
        if (changes[0].contentRect.height > 0) {
          refreshAnnotations();
        }
    }).observe(contentEditableEl);
  }
}
function getPageName(url) {
  var index = url.lastIndexOf("/") + 1;
  var filenameWithExtension = url.substr(index);
  var filename = filenameWithExtension.split(".")[0];
  if (filename == "") {
    return "index";
  } else {
    return filename;
  }
}
function refreshAnnotations() {
  // Reset Annotation positions
  let annotations = document.getElementsByClassName('annotation');
  for (var i = 0; i < annotations.length; i++) {
    annotations[i].style.height = "";
	}
	// Set Annotations positions
//  setTimeout(() => { positionAnnotations(); }, 1);
  positionAnnotations();
}
function positionAnnotations() {
  let annotations = document.getElementsByClassName('annotationText');
// sort annotations
  items = Array.prototype.slice.call(annotations);
  items.sort(function(a, b){
    return parseInt(a.id.substring(12)) - parseInt(b.id.substring(12));
  });
  let heightAnnotation = [ 0 ];
  let topText = [ 0 ];
  let heightCum = 0;
  for (var i = 0; i < items.length; i++) {
    let iElId = "annotation" + items[i].id.substring(12);
    topText[i] = parseInt(document.getElementById(iElId).getBoundingClientRect().top);
    if (i > 0) {
      heightCum += heightAnnotation[i - 1];
      topText[i] += heightCum;
    }
    heightAnnotation[i] = parseInt(getComputedStyle(items[i]).height); //parseInt(items[i].getBoundingClientRect().height);
  }
// check on same line
  for (var i = items.length - 1; i > 0; i--) {
    if (topText[i - 1] + heightAnnotation[i - 1] == topText[i]) {
      heightAnnotation[i - 1] += heightAnnotation[i];
    }
  }
  for (var i = 0; i < items.length; i++) {
	  let textPos = items[i].id.substring(12);
	  let anEl = document.getElementById("annotation" + textPos);
    items[i].style.top = topText[i] + "px";
    anEl.style.height = heightAnnotation[i] + "px";
	}
}
function editAnnotation(event) {
  event.preventDefault();
  if (activeEditorAtTextPosition != 0) {
    alert(translate[l10n]["Finish (Save) editing the previous note to edit another!"]);
    return;
  }
  activeEditorAtTextPosition = event.target.id.substring(8);

  document.getElementById("annotateText" + activeEditorAtTextPosition).style.display = "none"; 
  document.getElementById("annotateText" + activeEditorAtTextPosition).classList.remove("annotationText");
  document.getElementById("annoCancel" + activeEditorAtTextPosition).remove();
  document.getElementById("annoEdit" + activeEditorAtTextPosition).remove();
  document.getElementById("annotateText" + activeEditorAtTextPosition).id = "annotateEdit" + activeEditorAtTextPosition; 

  let texteditorEl = document.getElementById("texteditor").cloneNode(true);
  editHistory[1] = [];
  let contentEditableEl = texteditorEl.querySelectorAll('div[contentEditable]')[0];
  observer.observe(contentEditableEl, config);
  editHistory[1].push(['editHTML', contentEditableEl.innerHTML, 0]);
  
  document.body.appendChild(texteditorEl); 
  texteditorEl.id = "annotateText" + activeEditorAtTextPosition;
  texteditorEl.classList.add("annotationText");
  texteditorEl.style.display = "";
  texteditorEl.style.position = "absolute";
  texteditorEl.style.top = parseInt(document.getElementById("annotation" + activeEditorAtTextPosition).getBoundingClientRect().top - texteditorEl.getBoundingClientRect().height) + "px";
  contentEditableEl.setAttribute("placeholder", translate[l10n]["Don't forget to save."]);
  contentEditableEl.focus();
  contentEditableEl.innerHTML = document.getElementById("annotateEdit" + activeEditorAtTextPosition).innerHTML;
// Detect-when-the-contenteditable editor-element-height-changes
  new ResizeObserver(changes => {
      if (changes[0].contentRect.height > 0) {
        refreshAnnotations();
      }
  }).observe(contentEditableEl);
}
function deleteAnnotation(textPos) {
  document.getElementById("annotation" + textPos).remove();
  document.getElementById("annotateText" + textPos).remove();
  let formData = new FormData();
  formData.append('page', getPageName(window.location.pathname) + l10n);
  formData.append('textpos', textPos);
  // load annotations from server
  const xhttp = new XMLHttpRequest();
  xhttp.onload = function() {
    refreshAnnotations();
  };
  xhttp.open("POST", "remove.php");
  xhttp.send(formData);
}
function removeAnnotation(event) {
  if (confirm(translate[l10n]["Do you want to delete this note?"]) == true) {
    let textPos = event.target.id.substring(10);
    deleteAnnotation(textPos);
  }
}
function addCancelButton(annotateTextEl) {
  let textPos = annotateTextEl.id.substring(12);
  cancelEl = document.createElement("img");
  cancelEl.className = "annobutton";
  cancelEl.id = "annoCancel" + textPos;
  cancelEl.src = "buttons/cancel.svg";
  cancelEl.width = "15";
  cancelEl.height = "15";
  cancelEl.title = translate[l10n]["Remove"];
  cancelEl.onclick = function(event){removeAnnotation(event)};
  annotateTextEl.appendChild(cancelEl);
}
function addEditButton(annotateTextEl) {
  let textPos = annotateTextEl.id.substring(12);
  buttonEl = document.createElement("img");
  buttonEl.className = "annobutton";
  buttonEl.id = "annoEdit" + textPos;
  buttonEl.src = "buttons/pencil.svg";
  buttonEl.width = "15";
  buttonEl.height = "15";
  buttonEl.style.marginRight = "15px";
  buttonEl.title = translate[l10n]["Edit"];
  buttonEl.onclick = function(event){editAnnotation(event)};
  annotateTextEl.appendChild(buttonEl);
}
function load(files, index) {
  let formData = new FormData();
  formData.append('passphrase', passphraseDialog.returnValue);
  formData.append('page', getPageName(window.location.pathname) + l10n);
  formData.append('file', files[index]);
  // load annotations from server
  const xhttp = new XMLHttpRequest();
  xhttp.onload = function() {
    let textPos = parseInt(getPageName(files[index]));
    annotateTextEl = document.createElement("div");
    annotateTextEl.className = "annotationText";
    annotateTextEl.id = "annotateText" + textPos;
    document.body.appendChild(annotateTextEl);

    annotateTextEl.style.position = "absolute";
    annotateTextEl.innerHTML = this.responseText;

    addCancelButton(annotateTextEl);
    addEditButton(annotateTextEl);

    setCaretPosition(document.getElementsByClassName('annotatable')[0], textPos);
    newNode = document.createElement("span");
    newNode.className = "annotation";
    newNode.id = "annotation" + textPos;
    range = window.getSelection().getRangeAt(0);
    range.insertNode(newNode);
    if (++index < files.length) {
      load(files, index);
    } else {
      setTimeout(() => { positionAnnotations(); }, 1);
    }
  };
  xhttp.open("POST", "load.php");
  xhttp.send(formData);
}
function askPassphrase() {
  // get passphrase
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog
  passphraseDialog = document.getElementById('passphraseDialog'); 
  passphraseDialog.showModal();
  passphraseDialog.addEventListener('close', (e) => {
    document.body.querySelectorAll('.passphrase')[0].value = passphraseDialog.returnValue;
    document.body.querySelectorAll('.passphrase')[0].style.display = "none";
    let formData = new FormData();
    formData.append('page', getPageName(window.location.pathname) + l10n);
    // load annotations from server
    const xhttp = new XMLHttpRequest();
    xhttp.onload = function() {
      let files = JSON.parse(this.responseText);
        if (files.length > 0) {
          load(files, 0);
        }
    }
    xhttp.open("POST", "dir.php");
    xhttp.send(formData);
  });
  passphraseDialog.querySelector('#confirmBtn').addEventListener('click', (event) => {
    event.preventDefault(); // We don't want to submit this fake form
    passphraseDialog.close(passphraseDialog.querySelector('#passphraseInput').value); // Have to send the input value here.
  });
}
window.onresize = refreshAnnotations;
