const rawText = "Wien ist eine wunderschöne Stadt. Viele Menschen kommen im Sommer hierher. Das ist wunderschön.";

const homePage = document.getElementById("homepage");
const simulationPage = document.getElementById("simulations");

const textContainer = document.getElementById("text-container");

const startBtn = document.getElementById("losgeht_btn");
const navSimBtn = document.getElementById("nav-simulations");
const homeBtn = document.getElementById("toHome");

function showSimulation() {
    homePage.style.display = "none";
    simulationPage.style.display = "block";

    const cTestSim = onsetText(rawText);
    textContainer.innerHTML = cTestSim;
}

function showHomepage() {
    simulationPage.style.display = "none";
    homePage.style.display = "block";
}

startBtn.addEventListener("click", showSimulation);
navSimBtn.addEventListener("click", showSimulation);
homeBtn.addEventListener("click", showHomepage);

function onsetText() {
    const text_sentences = rawText.split(". ");
    const count_sentences = text_sentences.length;
    
    let finalHTML = "";

    for (let i = 0; i < count_sentences; i++){
        let current_sentences = text_sentences[i];

        if (i === 0 || i === count_sentences - 1){
            finalHTML += current_sentences + ". ";
        }

        else {
            const word = current_sentences.split(" ");

            const process_word = word.map((word, wordIndex) => {
                if(wordIndex % 2 === 1 && word.length > 1) {
                    const keepcount = Math.floor(word.length / 2);
                    const missingcount = word.length - keepcount;

                    const toKeep = word.substring(0, keepcount);
                    const toHide = word.substring(keepcount);

                    const toInputWord = Math.max((missingcount*12), 25);

                    return `${toKeep}<input type = "text" class = "test-input" data-answer = "${toHide} maxlength ="${missingcount}" style="width: ${toInputWord}px;">`;
                }
                return word;
            });

            finalHTML +=process_word.join(" ") + ". ";

        }
    }

    return finalHTML;
}