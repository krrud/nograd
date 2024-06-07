export const optimizers: Record<string, string> = {
    "Adam": "adam",
    "SGD": "sgd",
    "RMSProp": "rmsprop",
    "Adadelta": "adadelta",
    "Adamax": "adamax",
};

export const validOptimizers = Object.keys(optimizers);

export function validOptimizer(value: string): value is keyof typeof optimizers {
    return validOptimizers.includes(value);
}