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
        patterns.citation = new RegExp("\\((\\w+)\\s(\\d{4})(?:,\\s(\\d+))?\\)", "gm");
        patterns.reference = new RegExp("^\\w+,\\s\\w+\\.", "gm");
        console.log("[APA Patterns Set Successfully]");
    } else {
        console.error("Unrecognized style:", style);
        throw new Error("Unrecognized citation style provided.");
    }

    console.log("[Returning Patterns for]:", style);
    return patterns;
}


function processDocx(fileInput) {
    console.log("[Processing DOCX]");
    let reader = new FileReader();

    console.log("[File Size]:", fileInput.files[0].size / 1024, "KB");  // Log the size of the file for diagnostic purposes.

    reader.onload = function(event) {
        console.log("[File Reader Onload]");
        try {
            mammoth.extractRawText({ arrayBuffer: event.target.result })
                .then(function(result) {
                    console.log("[Mammoth Text Extraction Success]");
                    console.log("Extracted text:", result.value.substring(0, 100) + "..."); // Logging only a snippet of the extracted text for readability.
                    displayResult(result);
                })
                .catch(function(err) {
                    console.log("[Mammoth Text Extraction Error]:", err);
                    handleError(err);
                });
        } catch (error) {
            console.error("[Error in reader.onload]:", error);
        }
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

    // Logging the patterns for diagnostic purposes.
    console.log("[Patterns]:", patterns);

    try {
        console.time("CitationMatching");
        const inTextCitations = [...text.matchAll(patterns.citation)].map(match => match[0]);
        console.timeEnd("CitationMatching");

        console.log("[In-Text Citations Found]:", inTextCitations.length);

        console.time("ReferenceMatching");
        const referenceList = [...text.matchAll(patterns.reference)].map(match => match[0]);
        console.timeEnd("ReferenceMatching");

        console.log("[References Found]:", referenceList.length);

        console.log("[Preparing to Display Missing References]");
        const missingReferences = inTextCitations.filter(cite => !referenceList.includes(cite));

        console.log("[Missing References]:", missingReferences);
        document.getElementById("missingReferences").innerText = missingReferences.join(", ");

        console.log("[All Detected Citations]:", inTextCitations);
        document.getElementById("allDetected").innerText = inTextCitations.join(", ");

        const potentialPattern = /\(?[A-Za-z0-9]+, \d{4}\)?/g;
        const potentialMisses = [...text.matchAll(potentialPattern)].map(match => match[0]).filter(cite => !inTextCitations.includes(cite));

        console.log("[Potential Misses]:", potentialMisses);
        document.getElementById("potentialMisses").innerText = potentialMisses.join(", ");
    } catch (error) {
        console.error("[Error in checkReferences]:", error);
    }

    expandCollapsibles();
}


function expandCollapsibles() {
    const contents = document.querySelectorAll(".results-section .content");
    contents.forEach(content => {
        content.style.maxHeight = "1000px";  // You can adjust this value
    });
}



const collapsibleButtons = document.querySelectorAll(".collapsible");

collapsibleButtons.forEach(button => {
    button.addEventListener("click", function() {
        this.classList.toggle("active");
        const content = this.nextElementSibling;
        if (content.style.maxHeight) {
            content.style.maxHeight = null;
        } else {
            content.style.maxHeight = content.scrollHeight + "px";
        }
    });
});


console.log("[Script End - Event Listeners Waiting]");