document.addEventListener("DOMContentLoaded", () => {
    const generateButton = document.getElementById("generate-btn");
    const chartContainer = document.getElementById("chart");
    const signalResult = document.getElementById("signal-result");
    const signalTime = document.getElementById("signal-time");

    let signalUpdateTimeout = null;
    let candleUpdateInterval = null;

    generateButton.addEventListener("click", () => {
        generateButton.disabled = true;
        generateButton.textContent = "Ожидайте...";

        if (signalUpdateTimeout) clearTimeout(signalUpdateTimeout);
        if (candleUpdateInterval) clearInterval(candleUpdateInterval);

        signalUpdateTimeout = setTimeout(() => {
            generateButton.disabled = false;
            generateButton.textContent = "Получить сигнал";

            const currencyPair = document.getElementById("currency-pair").value;
            const timeframe = document.getElementById("timeframe").value.replace(/[^0-9]/g, '');

            const isBuy = Math.random() > 0.5;
            const accuracy = (Math.random() * 10 + 85).toFixed(2);
            const now = new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

            const language = document.getElementById("language").value;
            const signalDetails = `
                <div class="signal-details">
                    <div class="signal-pair">${currencyPair}</div>
                    <div class="signal-direction ${isBuy ? "green" : "red"}">
                        ${isBuy ? translations[language].buy : translations[language].sell}
                    </div>
                    <div class="signal-timeframe">${translations[language].timeframe}: ${timeframe}</div>
                    <div class="signal-probability">${translations[language].accuracy}: ${accuracy}%</div>
                </div>
            `;
            signalResult.innerHTML = signalDetails;
            signalTime.textContent = now;

            renderChart(chartContainer, isBuy, parseInt(timeframe) * 60 * 1000);
        }, 3000);
    });
});

const translations = {
    ru: {
        logoText: "Торговый сигнал",
        currencyLabel: "Инструмент",
        timeframeLabel: "Время",
        generateButton: "Получить сигнал",
        signalTitle: "Сигнал",
        signalPlaceholder: "Нажмите 'Получить сигнал'",
        chartTitle: "Проанализированный график на валютную пару",
        languageLabel: "Язык",
        timeframes: ["1 минута", "3 минут", "5 минут"],
        buy: "Покупка",
        sell: "Продажа",
        timeframe: "Таймфрейм",
        accuracy: "Точность"
    },
    en: {
        logoText: "Trade Signal",
        currencyLabel: "Instrument",
        timeframeLabel: "Time",
        generateButton: "Get Signal",
        signalTitle: "Signal",
        signalPlaceholder: "Click 'Get Signal'",
        chartTitle: "Analyzed chart for a currency pair",
        languageLabel: "Language",
        timeframes: ["1 minute", "3 minutes", "5 minutes"],
        buy: "Buy",
        sell: "Sell",
        timeframe: "Timeframe",
        accuracy: "Accuracy"
    },
    uz: {
        logoText: "Savdo Signali",
        currencyLabel: "Asbob",
        timeframeLabel: "Vaqt",
        generateButton: "Signal Olish",
        signalTitle: "Signal",
        signalPlaceholder: "Signal Olish uchun bosing",
        chartTitle: "Valyuta juftligi uchun tahlil qilingan diagramma",
        languageLabel: "Til",
        timeframes: ["1 daqiqa", "3 daqiqa", "5 daqiqa"],
        buy: "Sotib olish",
        sell: "Sotish",
        timeframe: "Vaqt oralig'i",
        accuracy: "Aniqlik"
    }
};

function changeLanguage() {
    const language = document.getElementById("language").value;

    document.getElementById("logo-text").textContent = translations[language].logoText;
    document.getElementById("currency-label").textContent = translations[language].currencyLabel;
    document.getElementById("timeframe-label").textContent = translations[language].timeframeLabel;
    document.getElementById("generate-btn").textContent = translations[language].generateButton;
    document.getElementById("signal-title").textContent = translations[language].signalTitle;
    document.getElementById("signal-result").querySelector(".signal-placeholder").textContent = translations[language].signalPlaceholder;
    document.getElementById("chart-title").textContent = translations[language].chartTitle;
    document.querySelector('.language-selector label').textContent = translations[language].languageLabel;

    const timeframeSelect = document.getElementById("timeframe");
    const timeframes = translations[language].timeframes;

    timeframeSelect.innerHTML = "";

    timeframes.forEach(timeframe => {
        const option = document.createElement("option");
        option.textContent = timeframe;
        timeframeSelect.appendChild(option);
    });
}

function renderChart(container, isBuy, duration) {
    container.innerHTML = "";
    const width = container.clientWidth;
    const height = container.clientHeight;
    const margin = { top: 10, right: 30, bottom: 30, left: 50 };

    const svg = d3.select(container)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const totalCandles = 30;
    const initialPrice = 100 + Math.random() * 20;
    let currentPrice = initialPrice;
    const trendDirection = isBuy ? 1 : -1;
    const stepTrend = trendDirection * (10 + Math.random() * 5) / totalCandles;
    let candlesDrawn = 0;

    const data = Array.from({ length: totalCandles }, (_, i) => {
        const open = currentPrice;
        const noise = (Math.random() - 0.5) * 2;
        const close = open + stepTrend + noise;
        const high = Math.max(open, close) + Math.random();
        const low = Math.min(open, close) - Math.random();
        currentPrice = close;
        return { time: i + 1, open, close, high, low };
    });

    const x = d3.scaleBand()
        .domain(data.map(d => d.time))
        .range([0, width - margin.left - margin.right])
        .padding(0.2);

    const y = d3.scaleLinear()
        .domain([d3.min(data, d => d.low) - 5, d3.max(data, d => d.high) + 5])
        .range([height - margin.top - margin.bottom, 0]);

    svg.append("g")
        .attr("transform", `translate(0, ${height - margin.top - margin.bottom})`)
        .call(d3.axisBottom(x).tickValues(data.map(d => d.time).filter((_, i) => i % 5 === 0)));

    svg.append("g").call(d3.axisLeft(y));

    candleUpdateInterval = setInterval(() => {
        if (candlesDrawn >= totalCandles) {
            clearInterval(candleUpdateInterval);
            return;
        }

        const d = data[candlesDrawn];
        const candle = svg.append("g")
            .attr("class", "candle")
            .attr("transform", `translate(${x(d.time) + x.bandwidth() / 2}, 0)`);

        // Добавление плавной анимации к линии свечи
        candle.append("line")
            .attr("x1", 0)
            .attr("x2", 0)
            .attr("y1", y(d.open))
            .attr("y2", y(d.open))
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .transition()
            .duration(duration / totalCandles)
            .ease(d3.easeLinear)
            .attr("y1", y(d.high))
            .attr("y2", y(d.low));

        // Добавление плавной анимации к прямоугольнику свечи
        candle.append("rect")
            .attr("x", -x.bandwidth() / 2)
            .attr("y", y(d.open))
            .attr("width", x.bandwidth())
            .attr("height", 0)
            .attr("fill", d.open > d.close ? "#E74C3C" : "#2ECC71")
            .attr("opacity", 0.8)
            .attr("rx", 2)
            .transition()
            .duration(duration / totalCandles)
            .ease(d3.easeLinear)
            .attr("y", d.open > d.close ? y(d.close) : y(d.open))
            .attr("height", Math.abs(y(d.open) - y(d.close)));

        candlesDrawn++;
    }, duration / totalCandles);
}
