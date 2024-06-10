export type ActivationIdentifier = 'linear' | 'relu' | 'sigmoid' | 'tanh' | 'softmax';

export const activations: Record<string, string> = {
  "Linear": "linear",
  "ReLU": "relu",
  "Sigmoid": "sigmoid",
  "Softmax": "softmax",
  "Tanh": "tanh",
};

export const validActivations = Object.keys(activations);

export function validActivation(value: string): value is keyof typeof activations {
  return validActivations.includes(value);
}