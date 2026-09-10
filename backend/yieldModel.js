const TRAINING_DATA = {
    wheat: [
        { temperature: 24, rainfall: 180, humidity: 58, wind: 8, price: 2100, yield: 3.7 },
        { temperature: 26, rainfall: 240, humidity: 64, wind: 7, price: 2200, yield: 4.1 },
        { temperature: 29, rainfall: 310, humidity: 70, wind: 10, price: 2300, yield: 4.4 },
        { temperature: 33, rainfall: 90, humidity: 50, wind: 12, price: 2050, yield: 3.5 },
        { temperature: 22, rainfall: 280, humidity: 68, wind: 6, price: 2150, yield: 4.0 },
        { temperature: 36, rainfall: 40, humidity: 42, wind: 18, price: 2250, yield: 3.1 },
    ],
    sugarcane: [
        { temperature: 25, rainfall: 500, humidity: 65, wind: 8, price: 3400, yield: 39 },
        { temperature: 28, rainfall: 700, humidity: 72, wind: 10, price: 3600, yield: 44 },
        { temperature: 31, rainfall: 850, humidity: 78, wind: 12, price: 3700, yield: 46 },
        { temperature: 35, rainfall: 260, humidity: 48, wind: 18, price: 3300, yield: 35 },
        { temperature: 27, rainfall: 620, humidity: 70, wind: 7, price: 3500, yield: 42 },
        { temperature: 38, rainfall: 120, humidity: 40, wind: 22, price: 3200, yield: 30 },
    ],
    cotton: [
        { temperature: 25, rainfall: 260, humidity: 58, wind: 8, price: 6500, yield: 2.4 },
        { temperature: 28, rainfall: 420, humidity: 66, wind: 9, price: 6800, yield: 2.8 },
        { temperature: 31, rainfall: 540, humidity: 72, wind: 12, price: 7000, yield: 3.0 },
        { temperature: 35, rainfall: 160, humidity: 48, wind: 18, price: 6200, yield: 2.2 },
        { temperature: 27, rainfall: 380, humidity: 64, wind: 7, price: 6700, yield: 2.7 },
        { temperature: 38, rainfall: 80, humidity: 40, wind: 22, price: 6000, yield: 1.9 },
    ],
};

function features(sample) {
    return [
        1,
        sample.temperature - 30,
        sample.rainfall / 100,
        sample.humidity - 60,
        sample.wind - 10,
        sample.price / 1000,
    ];
}

function solve(matrix, values) {
    const size = values.length;
    const augmented = matrix.map((row, index) => [
        ...row,
        values[index],
    ]);

    for (let column = 0; column < size; column += 1) {
        let pivot = column;
        for (let row = column + 1; row < size; row += 1) {
            if (
                Math.abs(augmented[row][column]) >
                Math.abs(augmented[pivot][column])
            ) {
                pivot = row;
            }
        }

        [augmented[column], augmented[pivot]] = [
            augmented[pivot],
            augmented[column],
        ];

        const divisor = augmented[column][column] || 1e-8;
        for (let item = column; item <= size; item += 1) {
            augmented[column][item] /= divisor;
        }

        for (let row = 0; row < size; row += 1) {
            if (row === column) continue;
            const factor = augmented[row][column];
            for (let item = column; item <= size; item += 1) {
                augmented[row][item] -=
                    factor * augmented[column][item];
            }
        }
    }

    return augmented.map((row) => row[size]);
}

function train(crop) {
    const samples = TRAINING_DATA[crop.toLowerCase()] || [];
    const size = 6;
    const matrix = Array.from({ length: size }, () =>
        Array(size).fill(0)
    );
    const values = Array(size).fill(0);

    samples.forEach((sample) => {
        const row = features(sample);
        for (let column = 0; column < size; column += 1) {
            values[column] += row[column] * sample.yield;
            for (let item = 0; item < size; item += 1) {
                matrix[column][item] += row[column] * row[item];
            }
        }
    });

    return solve(matrix, values);
}

function predictYield(crop, weather, marketPrice) {
    const coefficients = train(crop);
    const prediction = features({
        temperature: weather.temperature,
        rainfall: weather.rainfall * 30,
        humidity: weather.humidity,
        wind: weather.windSpeed,
        price: marketPrice || 0,
    }).reduce(
        (total, value, index) => total + value * coefficients[index],
        0
    );

    return Math.max(0, prediction);
}

module.exports = {
    predictYield,
};
