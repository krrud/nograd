import * as tf from '@tensorflow/tfjs';

type NestedArray<T> = T[] | NestedArray<T>[];

export interface TensorArgs {
  values: NestedArray<number>;
  shape?: number[];
  dtype?: 'float32' | 'int32' | 'bool' | 'complex64';
}

export type Tensor = tf.Tensor;

export function tensor({values, shape, dtype}: TensorArgs) {
  return tf.tensor(values, shape, dtype);
}