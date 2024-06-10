import * as tf from '@tensorflow/tfjs';


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

export function getOptimizer(type: string, learningRate?: number): tf.Optimizer {
    const lr = learningRate || 0.01;
    const mappings: {[key: string]: tf.Optimizer} = {
        "adam": tf.train.adam(lr),
        "sgd": tf.train.sgd(lr),
        "rmsprop": tf.train.rmsprop(lr),
        "adadelta": tf.train.adadelta(lr),
        "adamax": tf.train.adamax(lr),
    }
    return mappings[optimizers[type]];
}