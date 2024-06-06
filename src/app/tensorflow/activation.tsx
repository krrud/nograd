// export enum Activation {
//   RELU = "relu",
//   SIGMOID = "sigmoid",
//   TANH = "tanh",
//   SOFTMAX = "softmax",
//   LINEAR = "linear",
//   NONE = "none",
// }



// export namespace Activation {
//   export function isValid(value: string): value is Activation {
//     return Object.values(Activation).includes(value as Activation);
//   }

//   export function getOptions(): string[] {
//     const options = Object.values(Activation).filter(item => typeof item === 'string');
//     return options as string[];
//   }
  
//   export function get(value: string): Activation {
//     if (!isValid(value)) {
//       throw new Error(`Invalid activation function: ${value}`);
//     }
//     return value as Activation;
//   }
// }

export type ActivationIdentifier = 'linear' | 'relu' | 'sigmoid' | 'tanh' | 'softmax';

export const activations: Record<string, string> = {
  "Linear": "linear",
  "ReLU": "relu",
  "Sigmoid": "sigmoid",
  "Softmax": "softmax",
  "Tanh": "tanh",
};
export const validActivations = Object.keys(activations);