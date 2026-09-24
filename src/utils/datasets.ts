import { Dataset, DatasetFeature } from '../types';

// Deterministic PRNG for reproducible synthetic benchmark data
function pseudoRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// Generate realistic Customer Churn dataset
function generateChurnDataset(): Dataset {
  const rand = pseudoRandom(42);
  const rows: Record<string, number | string>[] = [];
  const count = 450;

  for (let i = 0; i < count; i++) {
    const creditScore = Math.floor(450 + rand() * 400); // 450 - 850
    const age = Math.floor(18 + rand() * 62); // 18 - 80
    const tenure = Math.floor(rand() * 11); // 0 - 10
    const balance = Math.floor(rand() * 160000); // 0 - 160k
    const numProducts = Math.floor(1 + rand() * 3.5); // 1 - 4
    const isActive = rand() > 0.45 ? 1 : 0;
    const estSalary = Math.floor(20000 + rand() * 140000);
    const complaints = rand() > 0.8 ? 1 : 0;

    // Real logistic relationship with noise
    const z = 
      -0.003 * creditScore + 
      0.045 * age - 
      0.15 * tenure + 
      0.000012 * balance + 
      (numProducts > 2 ? 1.2 : -0.6) - 
      0.9 * isActive + 
      1.8 * complaints - 
      1.2;

    const prob = 1 / (1 + Math.exp(-z));
    const churn = rand() < prob ? 1 : 0;

    rows.push({
      id: i + 1,
      credit_score: creditScore,
      age,
      tenure,
      balance,
      num_products: numProducts,
      is_active: isActive,
      estimated_salary: estSalary,
      complaints,
      churn,
    });
  }

  const features: DatasetFeature[] = [
    { name: 'credit_score', type: 'numeric', min: 450, max: 850, mean: 650, std: 95 },
    { name: 'age', type: 'numeric', min: 18, max: 80, mean: 41, std: 12 },
    { name: 'tenure', type: 'numeric', min: 0, max: 10, mean: 5.1, std: 2.8 },
    { name: 'balance', type: 'numeric', min: 0, max: 160000, mean: 76000, std: 45000 },
    { name: 'num_products', type: 'numeric', min: 1, max: 4, mean: 1.6, std: 0.7 },
    { name: 'is_active', type: 'boolean', min: 0, max: 1, mean: 0.55, std: 0.49 },
    { name: 'estimated_salary', type: 'numeric', min: 20000, max: 160000, mean: 98000, std: 38000 },
    { name: 'complaints', type: 'boolean', min: 0, max: 1, mean: 0.19, std: 0.39 },
    { name: 'churn', type: 'boolean', min: 0, max: 1, mean: 0.28, std: 0.45 },
  ];

  return {
    id: 'customer-churn-v1',
    name: 'Enterprise Customer Churn & Risk',
    description: 'Tabular enterprise subscription telemetry with 8 numerical and categorical features predicting customer attrition risk.',
    taskType: 'binary-classification',
    targetColumn: 'churn',
    sampleCount: count,
    features,
    data: rows,
  };
}

// Generate Clinical Metabolic Risk dataset
function generateMedicalDataset(): Dataset {
  const rand = pseudoRandom(1337);
  const rows: Record<string, number | string>[] = [];
  const count = 380;

  for (let i = 0; i < count; i++) {
    const age = Math.floor(21 + rand() * 55);
    const glucose = Math.floor(65 + rand() * 135);
    const bloodPressure = Math.floor(55 + rand() * 65);
    const bmi = +(18.5 + rand() * 24.5).toFixed(1);
    const insulin = Math.floor(15 + rand() * 280);
    const pedigree = +(0.1 + rand() * 1.8).toFixed(2);
    const pregnancies = Math.floor(rand() * 9);

    const z = 
      0.038 * glucose + 
      0.082 * bmi + 
      0.035 * age + 
      0.65 * pedigree + 
      0.003 * insulin - 
      7.2;

    const prob = 1 / (1 + Math.exp(-z));
    const outcome = rand() < prob ? 1 : 0;

    rows.push({
      id: i + 1,
      pregnancies,
      glucose,
      blood_pressure: bloodPressure,
      bmi,
      insulin,
      pedigree,
      age,
      outcome,
    });
  }

  const features: DatasetFeature[] = [
    { name: 'pregnancies', type: 'numeric', min: 0, max: 9, mean: 3.2, std: 2.5 },
    { name: 'glucose', type: 'numeric', min: 65, max: 200, mean: 122, std: 32 },
    { name: 'blood_pressure', type: 'numeric', min: 55, max: 120, mean: 78, std: 14 },
    { name: 'bmi', type: 'numeric', min: 18.5, max: 43.0, mean: 29.4, std: 6.2 },
    { name: 'insulin', type: 'numeric', min: 15, max: 295, mean: 110, std: 68 },
    { name: 'pedigree', type: 'numeric', min: 0.1, max: 1.9, mean: 0.62, std: 0.4 },
    { name: 'age', type: 'numeric', min: 21, max: 76, mean: 42, std: 14 },
    { name: 'outcome', type: 'boolean', min: 0, max: 1, mean: 0.34, std: 0.47 },
  ];

  return {
    id: 'clinical-metabolic-v1',
    name: 'Diagnostic Metabolic Risk Benchmark',
    description: 'Biomarker clinical measurements for predicting high metabolic risk in early health intervention pipelines.',
    taskType: 'binary-classification',
    targetColumn: 'outcome',
    sampleCount: count,
    features,
    data: rows,
  };
}

// Generate California Housing tabular dataset
function generateHousingDataset(): Dataset {
  const rand = pseudoRandom(999);
  const rows: Record<string, number | string>[] = [];
  const count = 400;

  for (let i = 0; i < count; i++) {
    const medInc = +(1.5 + rand() * 9.5).toFixed(2);
    const houseAge = Math.floor(2 + rand() * 48);
    const aveRooms = +(3.2 + rand() * 4.8).toFixed(1);
    const population = Math.floor(300 + rand() * 3200);
    const aveOccup = +(2.0 + rand() * 2.8).toFixed(1);
    const latitude = +(34.0 + rand() * 4.5).toFixed(2);
    const longitude = +(-122.5 + rand() * 4.5).toFixed(2);

    // Calculate score
    const score = medInc * 0.45 - houseAge * 0.01 + aveRooms * 0.15 - (latitude - 37) * 0.05;
    const isHighValue = score > 2.8 ? 1 : 0;

    rows.push({
      id: i + 1,
      med_inc: medInc,
      house_age: houseAge,
      ave_rooms: aveRooms,
      population,
      ave_occup: aveOccup,
      latitude,
      longitude,
      high_value: isHighValue,
    });
  }

  const features: DatasetFeature[] = [
    { name: 'med_inc', type: 'numeric', min: 1.5, max: 11.0, mean: 4.8, std: 2.1 },
    { name: 'house_age', type: 'numeric', min: 2, max: 50, mean: 27, std: 12 },
    { name: 'ave_rooms', type: 'numeric', min: 3.2, max: 8.0, mean: 5.4, std: 1.2 },
    { name: 'population', type: 'numeric', min: 300, max: 3500, mean: 1420, std: 720 },
    { name: 'ave_occup', type: 'numeric', min: 2.0, max: 4.8, mean: 3.1, std: 0.6 },
    { name: 'latitude', type: 'numeric', min: 34.0, max: 38.5, mean: 36.2, std: 1.3 },
    { name: 'longitude', type: 'numeric', min: -122.5, max: -118.0, mean: -120.3, std: 1.4 },
    { name: 'high_value', type: 'boolean', min: 0, max: 1, mean: 0.38, std: 0.48 },
  ];

  return {
    id: 'california-housing-v1',
    name: 'California Regional Housing Valuation',
    description: 'Census block group housing features evaluating regional asset valuations and median income multipliers.',
    taskType: 'binary-classification',
    targetColumn: 'high_value',
    sampleCount: count,
    features,
    data: rows,
  };
}

export const BENCHMARK_DATASETS: Dataset[] = [
  generateChurnDataset(),
  generateMedicalDataset(),
  generateHousingDataset(),
];

export function calculateFeatureStats(dataset: Dataset, featureName: string) {
  const values = dataset.data
    .map((row) => Number(row[featureName]))
    .filter((v) => !isNaN(v));

  if (values.length === 0) return { min: 0, max: 0, mean: 0, std: 0, bins: [] };

  const min = Math.min(...values);
  const max = Math.max(...values);
  const sum = values.reduce((a, b) => a + b, 0);
  const mean = sum / values.length;
  const variance = values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / values.length;
  const std = Math.sqrt(variance);

  // Calculate histogram bins
  const binCount = 8;
  const binWidth = (max - min) / binCount || 1;
  const bins: { range: string; count: number }[] = [];

  for (let i = 0; i < binCount; i++) {
    const start = min + i * binWidth;
    const end = start + binWidth;
    const label = `${start.toFixed(1)}-${end.toFixed(1)}`;
    const count = values.filter((v) => (i === binCount - 1 ? v >= start && v <= end : v >= start && v < end)).length;
    bins.push({ range: label, count });
  }

  return { min, max, mean, std, bins };
}
