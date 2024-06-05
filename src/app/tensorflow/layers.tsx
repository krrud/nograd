import * as tf from '@tensorflow/tfjs';


type ActivationIdentifier = 'linear' | 'relu' | 'sigmoid' | 'softmax' | 'tanh' | 'mish';  // Extend as needed
type InitializerIdentifier = string; // TODO: Replace with specific type definition
type Initializer = any; // TODO: Replace with specific type definition
type ConstraintIdentifier = string; // TODO: Replace with specific type definition
type Constraint = any; // TODO: Replace with specific type definition
type RegularizerIdentifier = string; // TODO: Replace with specific type definition
type Regularizer = any; // TODO: Replace with specific type definition
type DataType = 'float32' | 'int32' | 'bool' | 'complex64' | 'string';
type Tensor = any; // TODO: Replace with specific type definition
type Shape = number[];


export interface LayerArgs {
    inputShape?: Shape;
    batchInputShape?: Shape;
    batchSize?: number;
    dtype?: DataType;
    name?: string;
    trainable?: boolean;
    weights?: Tensor[];
    inputDType?: DataType;
}

export interface DenseLayerArgs extends LayerArgs {
    units: number;
    activation?: ActivationIdentifier;
    useBias?: boolean;
    kernelInitializer?: InitializerIdentifier | Initializer;
    biasInitializer?: InitializerIdentifier | Initializer;
    inputDim?: number;
    kernelConstraint?: ConstraintIdentifier | Constraint;
    biasConstraint?: ConstraintIdentifier | Constraint;
    kernelRegularizer?: RegularizerIdentifier | Regularizer;
    biasRegularizer?: RegularizerIdentifier | Regularizer;
    activityRegularizer?: RegularizerIdentifier | Regularizer;
}

export function dense(args: DenseLayerArgs) {
  return tf.layers.dense({
    units: args.units,
    inputShape: args.inputShape,
    batchSize: args.batchSize,
    activation: args.activation,
    name: args.name,
    trainable: args.trainable,
    dtype: args.dtype,
  });
}
