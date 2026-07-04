const SUPABASE_URL = "https://mxscxbnfoflmyommmvkw.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_UywRzzKorhm2e27LVhB1yg_tguBQc21";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentWords = [];
let currentIndex = 0;
let correctCount = 0;

window.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const articleSlug = urlParams.get('slug');

    if (!articleSlug) {
        document.getElementById('article-title').innerText = "url потерялся, маякните пожалуйста мне в тг";
        return;
    }

    try {
        const { data: allArticles, error: articleError } = await supabaseClient
            .rpc('get_public_articles');

        if (articleError || !allArticles) {
            document.getElementById('article-title').innerText = "Ошибка загрузки данных из базы.";
            return;
        }

        const article = allArticles.find(art => art.slug === articleSlug);

        if (!article) {
            document.getElementById('article-title').innerText = "Ошибка: статья не найдена в базе.";
            return;
        }

        document.getElementById('article-title').innerText = article.title;
        document.getElementById('theorie-section').innerHTML = marked.parse(article.content);

        const { data: words, error: wordsError } = await supabaseClient
            .from('article_words')
            .select('word, gender, exercise_type, options')
            .eq('article_id', article.id);

        if (!wordsError && words && words.length > 0) {
            currentWords = words;
            
            document.getElementById('exercise-section').style.display = "block";
            
            initTrainer();
        }

    } catch (err) {
        console.error("Сбой загрузки на странице статьи:", err);
    }
});

function initTrainer() {
    if (currentIndex >= currentWords.length) {
        showResults();
        return;
    }
}
function renderButtons(item, container){
    ['der','die','das'].forEach(g => {
    const btn = document.createElement('button');
    btn.innerText = g.toUpperCase();
    btn.style.margin = '5px'; btn.style.padding = '10px 20px';

    btn.addEventListener('click', () => {
        const isCorrect = g === item.gender.toLowerCase().trim();
        btn.style.backgroundColor = isCorrect ? '#378649ff' : '#b63541ff';
        if (isCorrect) correctCount++;
        finishQuestion();
    });
    container.appendChild(btn);
});}

function renderInput(item, container) {
    const input = document.createElement('input');
    input.type = 'text';
    input.style.padding = '10px'; input.style.fontSize = '18px';

    const checkBtn = document.createElement('button');
    checkBtn.innerText = 'Проверить';
    checkBtn.style.padding = '10px 20px'; checkBtn.style.marginLeft = '10px';

    checkBtn.addEventListener('click', () => {
        const isCorrect = input.value.trim().toLowerCase() === item.gender.toLowerCase().trim();
        input.style.backgroundColor = isCorrect ? '#378649ff' : '#b63541ff';

        if (isCorrect) correctCount++;
        if (!isCorrect) {
            const tip = document.createElement('p');
            tip.innerText = `Правильный ответ: ${item.gender}`;
            tip.style.color = '#b63541ff';
            container.appendChild(tip);
        }
        input.disabled = true; checkBtn.disabled = true;
        finishQuestion();
    });
    container.appendChild(input);
    container.appendChild(checkBtn);
    input.focus();
}

function renderMultiple(item, container) {
    if (!item.options) return;
    item.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.innerText = opt;
        btn.style.margin = '5px'; btn.style.padding = '10px 20px';
        
        btn.addEventListener('click', () => {
            const isCorrect = opt === item.gender;
            btn.style.backgroundColor = isCorrect ? '#378649ff' : '#b63541ff';
            if (isCorrect) correctCount++;
            finishQuestion();
        });
        container.appendChild(btn);
    });
}

function finishQuestion() {
    document.getElementById('next-btn').style.display = 'inline-block';
}

document.getElementById('next-btn').addEventListener('click', () => {
    currentIndex++; 
    initTrainer();
});

function showResults() {
    const percent = Math.round((correctCount / currentWords.length) * 100);
    document.getElementById('exercise-section').innerHTML = `
        <div style="text-align: center; padding: 20px; background: #e2e2e2; border-radius: 8px;">
            <h2>Упражнение завершено!</h2>
            <p style="font-size: 20px; margin: 15px 0;">Ваш результат: <strong>${correctCount}</strong> из <strong>${currentWords.length}</strong> фраз (${percent}%)</p>
            <button onclick="window.location.reload()" style="padding: 10px 20px; background: #2E2828; color: #fff; border: none; cursor: pointer;">Повторить</button>
        </div>
    `;
}
