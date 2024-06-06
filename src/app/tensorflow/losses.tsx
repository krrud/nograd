export const losses: Record<string, string> = {
    "MSE": "meanSquaredError",
    "CatCross": "categoricalCrossentropy",
    "BinCross": "binaryCrossentropy",
    "MAE": "meanAbsoluteError",
    "MAPE": "meanAbsolutePercentageError",
    "MSLE": "meanSquaredLogarithmicError",
};
export const validLosses = Object.keys(losses);
export function validLoss(value: string): value is keyof typeof losses {
    return validLosses.includes(value);
}