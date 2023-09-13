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

    if (style === "Julia Masterarbeit") {
        console.log("[Setting Julia Masterarbeit Patterns]");
        patterns.citation = new RegExp("\((vgl\.|s\.\sauch|siehe\shierzu\sz\.B\.)*\s*([\w\s\-]+(?:\/[\w\s\-]+)*(\set\sal\.)?|Anhang\s[\w\.]+,\sAbs\.\s[\d\-,]+)(\s\d{4})*(\,\s[\d\-f]+)*(;\s[\w\s\-\/]+(\set\sal\.)?(\s\d{4})*(\,\s[\d\-f]+)*|;\sAnhang\s[\w\.]+,\sAbs\.\s[\d\-,]+)*\)", "gm");
        patterns.reference = new RegExp("^\\w+,\\s\\w+\\.\\s(\\d{4})", "gm");
        console.log("[Julia Masterarbeit Patterns Set Successfully]");
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



        // Updating Missing References on the UI
        const missingReferencesContainer = document.getElementById("missingReferences");
        missingReferencesContainer.innerHTML = "";
        missingReferences.forEach(ref => {
            const divElement = document.createElement("div");
            divElement.textContent = ref;
            missingReferencesContainer.appendChild(divElement);
        });

        // Updating All Detected Citations on the UI
        const allDetectedContainer = document.getElementById("allDetected");
        allDetectedContainer.innerHTML = "";
        inTextCitations.forEach(citation => {
            const divElement = document.createElement("div");
            divElement.textContent = citation;
            allDetectedContainer.appendChild(divElement);
        });

        const potentialPattern = /\(?[A-Za-z0-9]+, \d{4}\)?/g;
        const potentialMisses = [...text.matchAll(potentialPattern)].map(match => match[0]).filter(cite => !inTextCitations.includes(cite));

        // Updating Potential Misses on the UI
        const potentialMissesContainer = document.getElementById("potentialMisses");
        potentialMissesContainer.innerHTML = "";
        potentialMisses.forEach(miss => {
            const divElement = document.createElement("div");
            divElement.textContent = miss;
            potentialMissesContainer.appendChild(divElement);
        });

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