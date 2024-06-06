export enum Activation {
  RELU = "relu",
  SIGMOID = "sigmoid",
  TANH = "tanh",
  SOFTMAX = "softmax",
  LINEAR = "linear",
  NONE = "none",
}

export namespace Activation {
  export function isValid(value: string): value is Activation {
    return Object.values(Activation).includes(value as Activation);
  }

  export function getOptions(): string[] {
    const options = Object.values(Activation).filter(item => typeof item === 'string');
    return options as string[];
  }
}