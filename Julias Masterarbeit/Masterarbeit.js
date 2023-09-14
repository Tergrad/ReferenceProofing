function markReference(referenceElement) {
    if (referenceElement.classList.contains("checked")) {
        referenceElement.classList.remove("checked");
    } else {
        referenceElement.classList.add("checked");
    }
}

console.log("[Script Start]");

document.querySelector(".ActivateButton").addEventListener("click", function() {
    console.log("[Check References Button Clicked]");

    const fileInput = document.getElementById("docxFile");
    const referencesFileInput = document.getElementById("referencesFile");

    if (fileInput.files.length && referencesFileInput.files.length) {
        // Check file type
        if (fileInput.files[0].type !== "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || referencesFileInput.files[0].type !== "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
            alert("Please upload valid .docx files.");
            return;
        }

        processDocx(fileInput, true); // true indicates it's the main document
        processDocx(referencesFileInput, false); // false indicates it's the reference document
    } else {
        console.log("[Document(s) Not Selected]");
        alert("Please select the necessary document(s) first.");
    }
});

function processDocx(fileInput, isMainDoc) {
    console.log(isMainDoc ? "[Processing Main DOCX]" : "[Processing References DOCX]");
    let reader = new FileReader();

    // Print the file size
    console.log("[File Size]:", fileInput.files[0].size / 1024, "KB");

    reader.onload = function(event) {
        console.log("[File Reader Onload]");
        try {
            mammoth.extractRawText({ arrayBuffer: event.target.result })
            .then(function(result) {
                if (isMainDoc) {
                    // Process the main document
                    console.log("[Mammoth Text Extraction Success - Main DOCX]");
                    displayResult(result);
                } else {
                    // Process the references document
                    console.log("[Mammoth Text Extraction Success - References DOCX]");
                    displayReferences(result);
                }
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
    checkReferences(text);
}   



function displayReferences(result) {
    const text = result.value;
    const referencesContainer = document.getElementById("referenceList");
    referencesContainer.innerHTML = ''; // Clear old references

    const references = text.split(/\n+/); // Assuming each reference is separated by a newline
    references.forEach((ref, index) => {
        let li = document.createElement('li');

        let checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = 'ref-' + index;
        checkbox.onclick = function() {
            li.classList.toggle('checked');
        };

        let label = document.createElement('label');
        label.htmlFor = 'ref-' + index;
        label.innerText = ref;

        li.appendChild(checkbox);
        li.appendChild(label);
        referencesContainer.appendChild(li);
    });
}



function handleError(err) {
    console.log("[Error Handler]:", err);
    alert("Error processing the document.");
}




function getSurroundingSentences(text, index, citation) {
    const sentences = text.split(/(?<=[.?!])\s+/); // Split by sentence end and space.
    let position = sentences.findIndex(sentence => sentence.includes(text.substring(index, index + 20)));
    
    if (position === -1) return ""; // Not found

    let start = Math.max(0, position - 2);
    let end = Math.min(sentences.length, position + 3);
    let surroundingSentences = sentences.slice(start, end);

    // Highlight the citation in the context.
    surroundingSentences[position - start] = surroundingSentences[position - start].replace(citation, `<strong>${citation}</strong>`);

    return surroundingSentences.join(" ");
}





function checkReferences(text) {
    console.log("[Checking References]");
    const allDetectedContainer = document.getElementById("allDetected");
    allDetectedContainer.innerHTML = '';

    const citationPattern = /\(.*?\)/g;

    try {
        console.time("CitationMatching");
        const inTextCitations = [...text.matchAll(citationPattern)]
        .map(match => ({
            citation: match[0],
            index: match.index
        }))
        .flatMap(({citation, index}) => {
            const splitCitations = citation.split(';').map(c => c.trim());  // Split and flatten
            return splitCitations.map(cit => ({
                citation: cit,
                index
            }));
        });

        console.log("[In-Text Citations Found]:", inTextCitations.length);

        // Display all detected citations on the UI
        allDetectedContainer.innerHTML = '';
        inTextCitations.forEach(({citation, index}) => {
            let div = document.createElement('div');
            
            let checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = 'citation-' + index;
            checkbox.onclick = function() {
                div.classList.toggle('checked');
            };

            let label = document.createElement('label');
            label.htmlFor = 'citation-' + index;
            label.innerText = citation;

            // Extract surrounding sentences
            let surroundingSentences = getSurroundingSentences(text, index);
            label.title = surroundingSentences; // This creates the tooltip

            div.appendChild(checkbox);
            div.appendChild(label);
            allDetectedContainer.appendChild(div);
        });
    } catch (error) {
        console.error("[Error in checkReferences]:", error);
        alert("Error checking references.");
    }
}
