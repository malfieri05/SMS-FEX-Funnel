// Utility to parse Eagle Select CSVs and get a quote
// NOTE: These rates are used for ALL STATES (not just Michigan)
// The tables for Michigan are the national default for quoting.

// New function to parse the final expense CSV data
function parseFinalExpenseCSV(csvData: string) {
  const lines = csvData.trim().split('\n');
  const headers = lines[0].split(',');
  return lines.slice(1).map(line => {
    const values = line.split(',');
    const row: Record<string, string> = {};
    headers.forEach((h, i) => row[h] = values[i]);
    return row;
  });
}

// Import the new final expense data
const finalExpenseCSV = `Gender,Age,Health Tier,Coverage Amount,Monthly Premium ($)
Male,50,Eagle Select 1,21000,70.82
Male,50,Eagle Select 1,22000,78.64
Male,50,Eagle Select 1,23000,86.46
Male,50,Eagle Select 1,24000,94.28
Male,50,Eagle Select 1,25000,102.1
Male,50,Eagle Select 1,26000,109.92
Male,50,Eagle Select 1,27000,117.74
Male,50,Eagle Select 1,28000,125.56
Male,50,Eagle Select 1,29000,133.38
Male,50,Eagle Select 1,30000,141.2
Male,50,Eagle Select 1,31000,149.02
Male,50,Eagle Select 1,32000,156.84
Male,50,Eagle Select 1,33000,164.66
Male,50,Eagle Select 1,34000,172.48
Male,50,Eagle Select 1,35000,180.3
Male,50,Eagle Select 1,36000,188.12
Male,50,Eagle Select 1,37000,195.94
Male,50,Eagle Select 1,38000,203.76
Male,50,Eagle Select 1,39000,211.58
Male,50,Eagle Select 1,40000,219.4
Male,60,Eagle Select 1,21000,86.38
Male,60,Eagle Select 1,22000,90.31
Male,60,Eagle Select 1,23000,94.24
Male,60,Eagle Select 1,24000,98.17
Male,60,Eagle Select 1,25000,102.1
Male,60,Eagle Select 1,26000,106.03
Male,60,Eagle Select 1,27000,109.96
Male,60,Eagle Select 1,28000,113.89
Male,60,Eagle Select 1,29000,117.82
Male,60,Eagle Select 1,30000,121.75
Male,60,Eagle Select 1,31000,125.68
Male,60,Eagle Select 1,32000,129.61
Male,60,Eagle Select 1,33000,133.54
Male,60,Eagle Select 1,34000,137.47
Male,60,Eagle Select 1,35000,141.4
Male,60,Eagle Select 1,36000,145.33
Male,60,Eagle Select 1,37000,149.26
Male,60,Eagle Select 1,38000,153.19
Male,60,Eagle Select 1,39000,157.12
Male,60,Eagle Select 1,40000,161.05
Male,70,Eagle Select 1,21000,155.92
Male,70,Eagle Select 1,22000,159.85
Male,70,Eagle Select 1,23000,163.78
Male,70,Eagle Select 1,24000,167.71
Male,70,Eagle Select 1,25000,171.64
Male,70,Eagle Select 1,26000,175.57
Male,70,Eagle Select 1,27000,179.5
Male,70,Eagle Select 1,28000,183.43
Male,70,Eagle Select 1,29000,187.36
Male,70,Eagle Select 1,30000,191.29
Male,70,Eagle Select 1,31000,195.22
Male,70,Eagle Select 1,32000,199.15
Male,70,Eagle Select 1,33000,203.08
Male,70,Eagle Select 1,34000,207.01
Male,70,Eagle Select 1,35000,210.94
Male,70,Eagle Select 1,36000,214.87
Male,70,Eagle Select 1,37000,218.8
Male,70,Eagle Select 1,38000,222.73
Male,70,Eagle Select 1,39000,226.66
Male,70,Eagle Select 1,40000,230.59
Female,50,Eagle Select 1,21000,60.82
Female,50,Eagle Select 1,22000,68.64
Female,50,Eagle Select 1,23000,76.46
Female,50,Eagle Select 1,24000,84.28
Female,50,Eagle Select 1,25000,92.1
Female,50,Eagle Select 1,26000,99.92
Female,50,Eagle Select 1,27000,107.74
Female,50,Eagle Select 1,28000,115.56
Female,50,Eagle Select 1,29000,123.38
Female,50,Eagle Select 1,30000,131.2
Female,50,Eagle Select 1,31000,139.02
Female,50,Eagle Select 1,32000,146.84
Female,50,Eagle Select 1,33000,154.66
Female,50,Eagle Select 1,34000,162.48
Female,50,Eagle Select 1,35000,170.3
Female,50,Eagle Select 1,36000,178.12
Female,50,Eagle Select 1,37000,185.94
Female,50,Eagle Select 1,38000,193.76
Female,50,Eagle Select 1,39000,201.58
Female,50,Eagle Select 1,40000,209.4
Female,60,Eagle Select 1,21000,84.42
Female,60,Eagle Select 1,22000,88.84
Female,60,Eagle Select 1,23000,93.26
Female,60,Eagle Select 1,24000,97.68
Female,60,Eagle Select 1,25000,102.1
Female,60,Eagle Select 1,26000,106.52
Female,60,Eagle Select 1,27000,110.94
Female,60,Eagle Select 1,28000,115.36
Female,60,Eagle Select 1,29000,119.78
Female,60,Eagle Select 1,30000,124.2
Female,60,Eagle Select 1,31000,128.62
Female,60,Eagle Select 1,32000,133.04
Female,60,Eagle Select 1,33000,137.46
Female,60,Eagle Select 1,34000,141.88
Female,60,Eagle Select 1,35000,146.3
Female,60,Eagle Select 1,36000,150.72
Female,60,Eagle Select 1,37000,155.14
Female,60,Eagle Select 1,38000,159.56
Female,60,Eagle Select 1,39000,163.98
Female,60,Eagle Select 1,40000,168.4
Female,70,Eagle Select 1,21000,152.32
Female,70,Eagle Select 1,22000,157.15
Female,70,Eagle Select 1,23000,161.98
Female,70,Eagle Select 1,24000,166.81
Female,70,Eagle Select 1,25000,171.64
Female,70,Eagle Select 1,26000,176.47
Female,70,Eagle Select 1,27000,181.3
Female,70,Eagle Select 1,28000,186.13
Female,70,Eagle Select 1,29000,190.96
Female,70,Eagle Select 1,30000,195.79
Female,70,Eagle Select 1,31000,200.62
Female,70,Eagle Select 1,32000,205.45
Female,70,Eagle Select 1,33000,210.28
Female,70,Eagle Select 1,34000,215.11
Female,70,Eagle Select 1,35000,219.94
Female,70,Eagle Select 1,36000,224.77
Female,70,Eagle Select 1,37000,229.6
Female,70,Eagle Select 1,38000,234.43
Female,70,Eagle Select 1,39000,239.26
Female,70,Eagle Select 1,40000,244.09`;

const finalExpenseRates = parseFinalExpenseCSV(finalExpenseCSV);

// Function to get quote from the new final expense data
export function getFinalExpenseQuote(gender: 'male' | 'female', age: number, coverage: number): string | null {
  const genderStr = gender === 'male' ? 'Male' : 'Female';
  const ageStr = age.toString();
  
  // Find exact match first
  const exactMatch = finalExpenseRates.find(row => 
    row.Gender === genderStr && 
    row.Age === ageStr && 
    row['Coverage Amount'] === coverage.toString()
  );
  
  if (exactMatch) {
    return exactMatch['Monthly Premium ($)'];
  }
  
  // If no exact match, find the closest coverage amounts for interpolation
  const ageMatches = finalExpenseRates.filter(row => 
    row.Gender === genderStr && 
    row.Age === ageStr
  );
  
  if (ageMatches.length === 0) return null;
  
  // Sort by coverage amount
  ageMatches.sort((a, b) => parseInt(a['Coverage Amount']) - parseInt(b['Coverage Amount']));
  
  // Find the two closest coverage amounts
  let lower: Record<string, string> | null = null;
  let upper: Record<string, string> | null = null;
  
  for (let i = 0; i < ageMatches.length - 1; i++) {
    const currentCoverage = parseInt(ageMatches[i]['Coverage Amount']);
    const nextCoverage = parseInt(ageMatches[i + 1]['Coverage Amount']);
    
    if (coverage >= currentCoverage && coverage <= nextCoverage) {
      lower = ageMatches[i];
      upper = ageMatches[i + 1];
      break;
    }
  }
  
  if (!lower || !upper) return null;
  
  // Linear interpolation
  const lowerCoverage = parseInt(lower['Coverage Amount']);
  const upperCoverage = parseInt(upper['Coverage Amount']);
  const lowerPremium = parseFloat(lower['Monthly Premium ($)']);
  const upperPremium = parseFloat(upper['Monthly Premium ($)']);
  
  const interpolated = lowerPremium + ((coverage - lowerCoverage) / (upperCoverage - lowerCoverage)) * (upperPremium - lowerPremium);
  return interpolated.toFixed(2);
}

const maleCSV = `AGE,5000,10000,15000,20000
60,23.46,43.12,62.78,82.44
61,24.68,45.56,66.44,87.32
62,25.90,48.00,70.11,92.21
63,26.92,50.05,73.17,96.29
64,27.94,52.09,76.23,100.38
65,28.98,54.15,79.33,104.50
66,30.44,57.08,83.72,110.36
67,31.90,60.00,88.10,116.20
68,33.39,62.98,92.57,122.16
69,35.38,66.96,98.54,130.12
70,37.37,70.94,104.50,138.07
71,39.64,75.47,111.30,147.13
72,41.90,80.00,118.10,156.20
73,44.75,85.70,126.65,167.60
74,47.60,91.40,135.20,179.00
75,50.45,97.10,143.75,190.40
76,54.18,104.55,154.93,205.30
77,57.90,112.00,166.09,220.19
78,61.86,119.59,177.32,235.05
79,65.83,127.18,188.54,249.90
80,69.79,135.78,201.78,267.77`;

const femaleCSV = `AGE,5000,10000,15000,20000
60,19.32,34.84,50.35,65.87
61,20.11,36.42,52.73,69.05
62,20.90,38.00,55.10,72.20
63,21.50,39.21,56.91,74.61
64,22.11,40.41,58.72,77.03
65,22.71,41.63,60.54,79.46
66,23.71,43.61,63.52,83.43
67,24.70,45.60,66.50,87.40
68,25.95,48.11,70.26,92.42
69,27.21,50.62,74.02,97.43
70,28.47,53.13,77.80,102.47
71,29.80,55.79,81.79,113.11
72,31.13,58.45,85.78,113.11
73,33.45,63.10,92.75,122.40
74,35.77,67.74,99.72,131.69
75,38.10,72.40,106.70,141.00
76,40.87,77.95,115.02,152.10
77,43.65,83.50,123.34,163.19
78,46.13,88.46,130.80,173.13
79,48.62,93.43,138.25,183.07
80,51.11,98.42,145.73,193.04`;

function parseCSV(csv: string) {
  const lines = csv.trim().split('\n');
  const headers = lines[0].split(',');
  return lines.slice(1).map(line => {
    const values = line.split(',');
    const row: Record<string, string> = {};
    headers.forEach((h, i) => row[h] = values[i]);
    return row;
  });
}

const maleRates = parseCSV(maleCSV);
const femaleRates = parseCSV(femaleCSV);

// Corebridge rates for Select 3 (from user image)
const select3Male = [
  { AGE: 50, 5000: 31.43, 10000: 60.85, 15000: 90.27, 20000: 119.7, 25000: 149.12 },
  { AGE: 51, 5000: 31.9, 10000: 61.79, 15000: 91.69, 20000: 121.58, 25000: 151.48 },
  { AGE: 52, 5000: 32.28, 10000: 62.87, 15000: 93.52, 20000: 124.16, 25000: 154.8 },
  { AGE: 53, 5000: 32.91, 10000: 63.81, 15000: 94.71, 20000: 135.14, 25000: 168.43 },
  { AGE: 54, 5000: 33.45, 10000: 64.9, 15000: 96.35, 20000: 141.51, 25000: 176.39 },
  { AGE: 55, 5000: 34.36, 10000: 66.72, 15000: 99.08, 20000: 145.68, 25000: 183.72 },
  { AGE: 56, 5000: 35.33, 10000: 68.65, 15000: 101.98, 20000: 151.42, 25000: 193.47 },
  { AGE: 57, 5000: 36.43, 10000: 70.37, 15000: 104.56, 20000: 154.12, 25000: 198.64 },
  { AGE: 58, 5000: 36.95, 10000: 71.91, 15000: 106.88, 20000: 158.51, 25000: 197.84 },
  { AGE: 59, 5000: 38.05, 10000: 74.09, 15000: 110.14, 20000: 162.51, 25000: 202.84 },
  { AGE: 60, 5000: 38.05, 10000: 74.09, 15000: 110.14, 20000: 162.51, 25000: 202.84 },
  { AGE: 61, 5000: 40.62, 10000: 79.25, 15000: 117.87, 20000: 174.58, 25000: 217.67 },
  { AGE: 62, 5000: 43.82, 10000: 84.44, 15000: 125.06, 20000: 186.11, 25000: 231.06 },
  { AGE: 63, 5000: 45.7, 10000: 89.4, 15000: 133.11, 20000: 196.72, 25000: 245.48 },
  { AGE: 64, 5000: 49.02, 10000: 98.83, 15000: 146.64, 20000: 217.01, 25000: 271.07 },
  { AGE: 65, 5000: 50.42, 10000: 102.93, 15000: 153.4, 20000: 226.26, 25000: 282.27 },
  { AGE: 66, 5000: 52.47, 10000: 106.5, 15000: 159.75, 20000: 234.21, 25000: 291.92 },
  { AGE: 67, 5000: 53.92, 10000: 109.84, 15000: 163.76, 20000: 241.31, 25000: 301.14 },
  { AGE: 68, 5000: 55.92, 10000: 109.84, 15000: 163.76, 20000: 241.31, 25000: 301.14 },
  { AGE: 69, 5000: 57.9, 10000: 112.33, 15000: 168.51, 20000: 247.66, 25000: 309.84 },
  { AGE: 70, 5000: 58.68, 10000: 115.36, 15000: 172.04, 20000: 253.35, 25000: 316.19 },
  { AGE: 71, 5000: 62.21, 10000: 122.73, 15000: 183.24, 20000: 269.51, 25000: 337.04 },
  { AGE: 72, 5000: 63.98, 10000: 136.34, 15000: 203.51, 20000: 299.12, 25000: 373.4 },
  { AGE: 73, 5000: 74.04, 10000: 146.08, 15000: 218.11, 20000: 320.36, 25000: 399.94 },
  { AGE: 74, 5000: 78.6, 10000: 154.03, 15000: 230.15, 20000: 337.55, 25000: 421.73 },
  { AGE: 75, 5000: 82.47, 10000: 162.95, 15000: 243.62, 20000: 357.15, 25000: 445.94 },
  { AGE: 76, 5000: 86.37, 10000: 169.65, 15000: 253.11, 20000: 373.12, 25000: 465.91 },
  { AGE: 77, 5000: 109.5, 10000: 217, 15000: 324.51, 20000: 451.53, 25000: 563.91 },
  { AGE: 78, 5000: 112.9, 10000: 223.83, 15000: 334.71, 20000: 451.93, 25000: 564.49 },
  { AGE: 79, 5000: 113.13, 10000: 224.25, 15000: 335.86, 20000: 452.96, 25000: 565.62 },
  { AGE: 80, 5000: 113.36, 10000: 224.71, 15000: 336.07, 20000: 452.9, 25000: 565.62 },
];

const select3Female = [
  { AGE: 50, 5000: 21.94, 10000: 41.88, 15000: 61.81, 20000: 81.81, 25000: 107.98 },
  { AGE: 51, 5000: 22.14, 10000: 42.88, 15000: 63.31, 20000: 83.91, 25000: 115.93 },
  { AGE: 52, 5000: 22.94, 10000: 44, 15000: 65.08, 20000: 98.58, 25000: 120.75 },
  { AGE: 53, 5000: 24.36, 10000: 46.71, 15000: 69.07, 20000: 103.53, 25000: 128.92 },
  { AGE: 54, 5000: 25.38, 10000: 48.76, 15000: 72.15, 20000: 108.02, 25000: 134.52 },
  { AGE: 55, 5000: 26.24, 10000: 50.75, 15000: 75.01, 20000: 112.03, 25000: 140.54 },
  { AGE: 56, 5000: 27.33, 10000: 52.67, 15000: 78, 20000: 116.51, 25000: 145.14 },
  { AGE: 57, 5000: 28.1, 10000: 53.86, 15000: 80.66, 20000: 120.68, 25000: 150.54 },
  { AGE: 58, 5000: 28.95, 10000: 55.89, 15000: 83.24, 20000: 123.61, 25000: 154 },
  { AGE: 59, 5000: 30.74, 10000: 58.61, 15000: 86.16, 20000: 129.49, 25000: 161.36 },
  { AGE: 60, 5000: 30.3, 10000: 58.61, 15000: 86.16, 20000: 129.49, 25000: 161.36 },
  { AGE: 61, 5000: 32, 10000: 62.17, 15000: 92.25, 20000: 137.28, 25000: 171.1 },
  { AGE: 62, 5000: 33.08, 10000: 64.85, 15000: 95.08, 20000: 143.72, 25000: 180.1 },
  { AGE: 63, 5000: 35.12, 10000: 68.23, 15000: 101.34, 20000: 150.49, 25000: 187.61 },
  { AGE: 64, 5000: 39.01, 10000: 71.37, 15000: 107.32, 20000: 159.19, 25000: 198.51 },
  { AGE: 65, 5000: 40.42, 10000: 72.17, 15000: 113.02, 20000: 167.45, 25000: 208.81 },
  { AGE: 66, 5000: 40.33, 10000: 78.61, 15000: 116.07, 20000: 171.08, 25000: 214.01 },
  { AGE: 67, 5000: 42.03, 10000: 82.06, 15000: 122.05, 20000: 180.64, 25000: 225.32 },
  { AGE: 68, 5000: 44.04, 10000: 85.43, 15000: 126.81, 20000: 186.02, 25000: 233.07 },
  { AGE: 69, 5000: 44.04, 10000: 85.43, 15000: 126.81, 20000: 186.02, 25000: 233.07 },
  { AGE: 70, 5000: 44.74, 10000: 87.47, 15000: 130.2, 20000: 192.47, 25000: 240.03 },
  { AGE: 71, 5000: 47.04, 10000: 93.15, 15000: 138.61, 20000: 204.51, 25000: 255.22 },
  { AGE: 72, 5000: 53.17, 10000: 104.21, 15000: 155.51, 20000: 229.42, 25000: 286.1 },
  { AGE: 73, 5000: 57.11, 10000: 112.42, 15000: 168.33, 20000: 246.5, 25000: 307.62 },
  { AGE: 74, 5000: 60.7, 10000: 118.62, 15000: 177.38, 20000: 261.81, 25000: 327.39 },
  { AGE: 75, 5000: 63.78, 10000: 124.95, 15000: 187.94, 20000: 276.47, 25000: 340.09 },
  { AGE: 76, 5000: 69, 10000: 135.14, 15000: 202.5, 20000: 295.97, 25000: 359.21 },
  { AGE: 77, 5000: 81.83, 10000: 161.66, 15000: 241.49, 20000: 354.32, 25000: 442.4 },
  { AGE: 78, 5000: 97.5, 10000: 193, 15000: 288.51, 20000: 422.74, 25000: 527.92 },
  { AGE: 79, 5000: 104.21, 10000: 206.42, 15000: 308.62, 20000: 447.41, 25000: 558.76 },
  { AGE: 80, 5000: 104.21, 10000: 206.42, 15000: 308.62, 20000: 447.41, 25000: 558.76 },
];

// Eagle Select 2 (Male) rates for all states (from user)
const select2Male = [
  { AGE: 60, 5000: 29.46, 10000: 55.13, 15000: 80.79, 20000: 106.46 },
  { AGE: 61, 5000: 31.10, 10000: 58.38, 15000: 85.18, 20000: 112.26 },
  { AGE: 62, 5000: 32.74, 10000: 61.63, 15000: 89.57, 20000: 118.06 },
  { AGE: 63, 5000: 34.38, 10000: 64.88, 15000: 93.96, 20000: 123.86 },
  { AGE: 64, 5000: 36.04, 10000: 68.14, 15000: 98.34, 20000: 129.66 },
  { AGE: 65, 5000: 37.10, 10000: 70.40, 15000: 103.71, 20000: 137.01 },
  { AGE: 66, 5000: 38.66, 10000: 73.30, 15000: 107.64, 20000: 141.14 },
  { AGE: 67, 5000: 40.22, 10000: 76.20, 15000: 111.57, 20000: 145.27 },
  { AGE: 68, 5000: 41.78, 10000: 79.10, 15000: 115.50, 20000: 149.40 },
  { AGE: 69, 5000: 43.34, 10000: 82.00, 15000: 119.43, 20000: 153.53 },
  { AGE: 70, 5000: 48.70, 10000: 93.59, 15000: 138.49, 20000: 183.39 },
  { AGE: 71, 5000: 51.29, 10000: 98.77, 15000: 146.25, 20000: 194.67 },
  { AGE: 72, 5000: 53.88, 10000: 103.95, 15000: 154.01, 20000: 205.95 },
  { AGE: 73, 5000: 56.47, 10000: 109.13, 15000: 161.77, 20000: 217.23 },
  { AGE: 74, 5000: 59.06, 10000: 114.31, 15000: 169.53, 20000: 228.51 },
  { AGE: 75, 5000: 69.05, 10000: 134.29, 15000: 199.54, 20000: 264.78 },
  { AGE: 76, 5000: 71.88, 10000: 139.41, 15000: 207.34, 20000: 276.08 },
  { AGE: 77, 5000: 74.71, 10000: 144.53, 15000: 215.14, 20000: 287.38 },
  { AGE: 78, 5000: 77.54, 10000: 149.65, 15000: 222.94, 20000: 298.68 },
  { AGE: 79, 5000: 80.27, 10000: 154.77, 15000: 230.72, 20000: 309.98 },
  { AGE: 80, 5000: 97.50, 10000: 191.20, 15000: 284.90, 20000: 267.77 },
];

// Eagle Select 2 (Female) rates for all states (from user, interpolated)
const select2Female = [
  { AGE: 60, 5000: 23.75, 10000: 43.69, 15000: 63.64, 20000: 83.58 },
  { AGE: 61, 5000: 25.16, 10000: 46.22, 15000: 67.04, 20000: 87.86 },
  { AGE: 62, 5000: 26.57, 10000: 48.75, 15000: 70.44, 20000: 92.14 },
  { AGE: 63, 5000: 27.98, 10000: 51.28, 15000: 73.84, 20000: 96.42 },
  { AGE: 64, 5000: 29.39, 10000: 53.81, 15000: 77.24, 20000: 100.70 },
  { AGE: 65, 5000: 28.80, 10000: 53.80, 15000: 78.80, 20000: 103.80 },
  { AGE: 66, 5000: 30.71, 10000: 57.01, 15000: 83.14, 20000: 109.27 },
  { AGE: 67, 5000: 32.62, 10000: 60.22, 15000: 87.48, 20000: 114.74 },
  { AGE: 68, 5000: 34.53, 10000: 63.43, 15000: 91.82, 20000: 120.21 },
  { AGE: 69, 5000: 36.44, 10000: 66.64, 15000: 96.16, 20000: 125.68 },
  { AGE: 70, 5000: 36.74, 10000: 69.67, 15000: 102.61, 20000: 135.55 },
  { AGE: 71, 5000: 40.14, 10000: 76.05, 15000: 111.34, 20000: 146.63 },
  { AGE: 72, 5000: 43.54, 10000: 82.43, 15000: 120.07, 20000: 157.71 },
  { AGE: 73, 5000: 46.94, 10000: 88.81, 15000: 128.80, 20000: 168.79 },
  { AGE: 74, 5000: 50.34, 10000: 95.19, 15000: 137.53, 20000: 179.87 },
  { AGE: 75, 5000: 51.49, 10000: 99.19, 15000: 146.88, 20000: 194.58 },
  { AGE: 76, 5000: 57.05, 10000: 109.03, 15000: 161.64, 20000: 214.25 },
  { AGE: 77, 5000: 62.61, 10000: 118.87, 15000: 176.40, 20000: 233.92 },
  { AGE: 78, 5000: 68.17, 10000: 128.71, 15000: 191.16, 20000: 253.59 },
  { AGE: 79, 5000: 72.73, 10000: 139.74, 15000: 207.21, 20000: 274.68 },
  { AGE: 80, 5000: 77.29, 10000: 150.77, 15000: 224.26, 20000: 297.75 },
];

export function getNationalQuote(gender: 'male' | 'female', age: number, coverage: number, tier: 'select1' | 'select2' | 'select3' = 'select1'): string | null {
  // For higher coverage amounts ($21,000-$40,000), try the new final expense data first
  if (coverage >= 21000 && coverage <= 40000) {
    const finalExpenseQuote = getFinalExpenseQuote(gender, age, coverage);
    if (finalExpenseQuote) {
      return finalExpenseQuote;
    }
    // If no final expense quote available, fall back to existing system
  }
  
  if (tier === 'select2') {
    const table = gender === 'male' ? select2Male : select2Female;
    const row = table.find(r => Number(r.AGE) === age);
    if (!row) return null;
    const coverages = [5000, 10000, 15000, 20000];
    if (coverages.includes(coverage)) {
      return row[String(coverage)]?.toFixed(2) || null;
    }
    // Linear interpolation for in-between values
    let lower = 5000, upper = 20000;
    for (let i = 0; i < coverages.length - 1; i++) {
      if (coverage > coverages[i] && coverage < coverages[i + 1]) {
        lower = coverages[i];
        upper = coverages[i + 1];
        break;
      }
    }
    const lowerVal = row[String(lower)];
    const upperVal = row[String(upper)];
    if (lowerVal === undefined || upperVal === undefined) return null;
    const interpolated = lowerVal + ((coverage - lower) / (upper - lower)) * (upperVal - lowerVal);
    return interpolated.toFixed(2);
  }
  if (tier === 'select3') {
    const table = gender === 'male' ? select3Male : select3Female;
    const row = table.find(r => Number(r.AGE) === age);
    if (!row) return null;
    const coverages = [5000, 10000, 15000, 20000, 25000];
    if (coverages.includes(coverage)) {
      return row[String(coverage)]?.toFixed(2) || null;
    }
    // Linear interpolation for in-between values
    let lower = 5000, upper = 25000;
    for (let i = 0; i < coverages.length - 1; i++) {
      if (coverage > coverages[i] && coverage < coverages[i + 1]) {
        lower = coverages[i];
        upper = coverages[i + 1];
        break;
      }
    }
    const lowerVal = row[String(lower)];
    const upperVal = row[String(upper)];
    if (lowerVal === undefined || upperVal === undefined) return null;
    const interpolated = lowerVal + ((coverage - lower) / (upper - lower)) * (upperVal - lowerVal);
    return interpolated.toFixed(2);
  }
  const table = gender === 'male' ? maleRates : femaleRates;
  const row = table.find(r => Number(r.AGE) === age);
  if (!row) return null;
  const coverages = [5000, 10000, 15000, 20000];
  if (coverages.includes(coverage)) {
    return row[String(coverage)] || null;
  }
  // Linear interpolation for in-between values
  let lower = 5000, upper = 20000;
  for (let i = 0; i < coverages.length - 1; i++) {
    if (coverage > coverages[i] && coverage < coverages[i + 1]) {
      lower = coverages[i];
      upper = coverages[i + 1];
      break;
    }
  }
  const lowerVal = parseFloat(row[String(lower)]);
  const upperVal = parseFloat(row[String(upper)]);
  const interpolated = lowerVal + ((coverage - lower) / (upper - lower)) * (upperVal - lowerVal);
  return interpolated.toFixed(2);
}

// Cash value tables for $5,000 coverage, age 60, from Americo PDF
const cashValues = {
  select1: [
    { year: 1, age: 61, value: 0 },
    { year: 2, age: 62, value: 17 },
    { year: 3, age: 63, value: 132 },
    { year: 4, age: 64, value: 249 },
    { year: 5, age: 65, value: 369 },
    { year: 10, age: 70, value: 1010 },
    { year: 15, age: 75, value: 1697 },
    { year: 20, age: 80, value: 2390 },
    { year: 40, age: 100, value: 4481 },
    { year: 60, age: 120, value: 5000 },
  ],
  select2: [
    { year: 1, age: 61, value: 0 },
    { year: 2, age: 62, value: 17 },
    { year: 3, age: 63, value: 132 },
    { year: 4, age: 64, value: 249 },
    { year: 5, age: 65, value: 369 },
    { year: 10, age: 70, value: 1010 },
    { year: 15, age: 75, value: 1697 },
    { year: 20, age: 80, value: 2390 },
    { year: 40, age: 100, value: 4481 },
    { year: 60, age: 120, value: 5000 },
  ],
  select3: [
    { year: 1, age: 61, value: 0 },
    { year: 2, age: 62, value: 89 },
    { year: 3, age: 63, value: 207 },
    { year: 4, age: 64, value: 327 },
    { year: 5, age: 65, value: 449 },
    { year: 10, age: 70, value: 1091 },
    { year: 15, age: 75, value: 1764 },
    { year: 20, age: 80, value: 2432 },
    { year: 40, age: 100, value: 4481 },
    { year: 60, age: 120, value: 5000 },
  ],
};

export function getCashValueTable(tier: 'select1' | 'select2' | 'select3') {
  return cashValues[tier];
} 