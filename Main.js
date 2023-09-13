console.log("[Script Start]");


// Added event listener for button click
document.querySelector(".ActivateButton").addEventListener("click", function() {
    console.log("[Check References Button Clicked]");
    const fileInput = document.getElementById("docxFile");
    if (fileInput.files.length) {
        processDocx(fileInput);
    } else {
        console.log("[No Document Selected]");
        alert("Please select a document first.");
    }
});



function getCitationPatterns(style) {
    console.log("[Getting Citation Patterns for]", style);
    // Define patterns object
    let patterns = {
        citation: /()/g,
        reference: /^()/gm
    };

    if (style === "APA") {
        console.log("[Setting APA Patterns]");
        patterns.citation = new RegExp("^\\w+,\\s\\w+\\.", "gm"); // Insert your complex regex here
        patterns.reference = new RegExp("^\\w+,\\s\\w+\\.", "gm");
        console.log("[APA Patterns Set Successfully]");
        
    }

    return patterns;
}


// FULL REGEX
// "(?<original>(?:(?:\(|\; ?)(?<author>(?=[^\n\(]*,[0-9 ]*[^\(\)]*\))(?!:[^\n\(\)\[\]]+\[.*\].*(?:\d{4}[a-z]?|[ns]\.\s?d\.|\d{4}[-–]\d{4}|\d{4}\, ?\w+ \d{1,2}))[^\n\(\)]*?(?:\b\p{Lu}[\p{Ll} \_0-9]+\b,\s+(?:\p{Lu}\.){1,3}\s+(?:(?:&|,|\.\.\.|)\s*)?)*(?:\((?:Eds?\.|Trad\.|Comp\.).*\))?)(?:,? ?(?<year>(?:\d{4}[a-z]?(?:, ?)?)+))(?:[, ]*pp?\.[\s]*(?<page>\d+[\-–]?\d*))?(?:, para\.[\s]*(?<paragraph>\d+))?))|(?:(?<pre>(?:[\p{Ll} \_0-9]*)( [\w]{1,6} )?)(?=\.?\p{Lu}\w+)(?<author1>(?<a1>(?:[^\n\(\)\.0-9]+)|(?:(?:[A-Z]\.\s?)?\b\p{Lu}[\p{Ll} \_0-9]+\b\s*et al\.? ?))?(?<a2>\b\p{Lu}[\p{Ll} \_0-9]+\b,\s+(?:\p{Lu}\.){1,3}\s+(?:(?:&|,|\.\.\.|)\s*)?)*(?:\((?:Eds?\.|Trad\.|Comp\.).*\))?)(\((?<year1>(?:\d{4}[a-z]?(?:, ?)?)+)\)))", "gmi"

function processDocx(fileInput) {
    console.log("[Processing DOCX]");
    let reader = new FileReader();

    reader.onload = function(event) {
        console.log("[File Reader Onload]");
        mammoth.extractRawText({ arrayBuffer: event.target.result })
            .then(function(result) {
                console.log("[Mammoth Text Extraction Success]");
                console.log("Extracted text:", result.value); // Diagnostic log
                displayResult(result);
            })
            .catch(function(err) {
                console.log("[Mammoth Text Extraction Error]:", err);
                handleError(err);
            });
    };

    reader.onerror = function(error) {
        console.log("[File Reader Error]:", error);
    };

    reader.readAsArrayBuffer(fileInput.files[0]);
}

function displayResult(result) {
    console.log("[Displaying Result]");
    const text = result.value;
    const style = document.getElementById("refStyle").value;
    checkReferences(text, style);
}

function handleError(err) {
    console.log("[Error Handler]:", err);
    alert("Error processing the document.");
}

function checkReferences(text, style) {
    console.log("[Checking References]");
    const patterns = getCitationPatterns(style);

    const inTextCitations = [...text.matchAll(patterns.citation)].map(match => match[1]);
    const referenceList = [...text.matchAll(patterns.reference)].map(match => match[0]);

    const missingReferences = inTextCitations.filter(cite => !referenceList.includes(cite));

    document.getElementById("missingReferences").innerText = "Missing References: " + missingReferences.join(", ");
    document.getElementById("allDetected").innerText = "All Detected Citations: " + inTextCitations.join(", ");

    const potentialPattern = /\(?[A-Za-z0-9]+, \d{4}\)?/g;
    const potentialMisses = [...text.matchAll(potentialPattern)].map(match => match[0]).filter(cite => !inTextCitations.includes(cite));

    document.getElementById("potentialMisses").innerText = "Potential Misses: " + potentialMisses.join(", ");
}
console.log("[Script End - Event Listeners Waiting]");