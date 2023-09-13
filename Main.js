function getCitationPatterns(style) {
    // Define patterns object
    let patterns = {
        citation: /()/g,
        reference: /^()/gm
    };

    if (style === "APA") {
        patterns.citation = new RegExp("(?<original>(?:(?:\(|\; ?)(?<author>(?=[^\n\(]*,[0-9 ]*[^\(\)]*\))(?!:[^\n\(\)\[\]]+\[.*\].*(?:\d{4}[a-z]?|[ns]\.\s?d\.|\d{4}[-–]\d{4}|\d{4}\, ?\w+ \d{1,2}))[^\n\(\)]*?(?:\b\p{Lu}[\p{Ll} \_0-9]+\b,\s+(?:\p{Lu}\.){1,3}\s+(?:(?:&|,|\.\.\.|)\s*)?)*(?:\((?:Eds?\.|Trad\.|Comp\.).*\))?)(?:,? ?(?<year>(?:\d{4}[a-z]?(?:, ?)?)+))(?:[, ]*pp?\.[\s]*(?<page>\d+[\-–]?\d*))?(?:, para\.[\s]*(?<paragraph>\d+))?))|(?:(?<pre>(?:[\p{Ll} \_0-9]*)( [\w]{1,6} )?)(?=\.?\p{Lu}\w+)(?<author1>(?<a1>(?:[^\n\(\)\.0-9]+)|(?:(?:[A-Z]\.\s?)?\b\p{Lu}[\p{Ll} \_0-9]+\b\s*et al\.? ?))?(?<a2>\b\p{Lu}[\p{Ll} \_0-9]+\b,\s+(?:\p{Lu}\.){1,3}\s+(?:(?:&|,|\.\.\.|)\s*)?)*(?:\((?:Eds?\.|Trad\.|Comp\.).*\))?)(\((?<year1>(?:\d{4}[a-z]?(?:, ?)?)+)\)))", "gmi"); // Insert your complex regex here
        patterns.reference = new RegExp("^\\w+,\\s\\w+\\.", "gm");
    }

    return patterns;
}

function processDocx(fileInput) {
    let reader = new FileReader();

    reader.onload = function(event) {
        mammoth.extractRawText({ arrayBuffer: event.target.result })
            .then(displayResult)
            .catch(handleError);
    };

    reader.readAsArrayBuffer(fileInput.files[0]);
}

function displayResult(result) {
    const text = result.value;
    const style = document.getElementById("refStyle").value;
    checkReferences(text, style);
}

function handleError(err) {
    console.error(err);
    alert("Error processing the document.");
}

function checkReferences(text, style) {
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

document.getElementById("docxFile").addEventListener("change", function() {
    processDocx(this);
});

