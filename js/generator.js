export function onsetText(textToProcess) {
    const text_sentences = textToProcess.split(". ");
    const count_sentences = text_sentences.length;

    let finalHTML = "";

    for (let i = 0; i < count_sentences; i++) {
        let current_sentence = text_sentences[i].trim();
        if (!current_sentence) continue;

        if (current_sentence.endsWith(".")) {
            current_sentence = current_sentence.slice(0, -1);
        }

        if (i === 0 || i === count_sentences - 1) {
            finalHTML += current_sentence + ". ";
        } else {
            const words = current_sentence.split(/\s+/);

            const process_word = words.map((word, wordIndex) => {
                const cleanWord = word.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "");

                if (wordIndex % 2 === 1 && cleanWord.length > 1) {
                    const keepcount = Math.floor(cleanWord.length / 2);

                    const toKeep = cleanWord.substring(0, keepcount);
                    const toHide = cleanWord.substring(keepcount);

                    const prefix = word.substring(0, word.indexOf(cleanWord));
                    const suffix = word.substring(word.indexOf(cleanWord) + cleanWord.length);
                    const maxLength = 20;
                    const maxWidth = 10;

                    return `<span class="processed">${prefix}${toKeep}<input type="text" autocorrect="off" autocapitalize="none" spellcheck="false" class="test-input" data-answer="${toHide}" maxlength="${maxLength}" style="width: ${maxWidth}ch;">${suffix}</span>`;
                }
                return word;
            });

            finalHTML += process_word.join(" ") + ". ";
        }
    }

    return finalHTML.trim();
}