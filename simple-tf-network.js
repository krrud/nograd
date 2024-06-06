// Import TensorFlow.js library
import * as tf from '@tensorflow/tfjs';

// Define the input layer with a shape of [input_features]. 
// For instance, if your input has 10 features, shape would be [10].
const input = tf.input({shape: [10]});

// Define the first dense layer
const dense1 = tf.layers.dense({units: 32, activation: 'relu'}).apply(input);

// Define the second dense layer
const dense2 = tf.layers.dense({units: 10, activation: 'softmax'}).apply(dense1);

// Create the model using tf.model by specifying the inputs and outputs
const model = tf.model({inputs: input, outputs: dense2});

// Compile the model with an optimizer, loss function, and metrics for evaluation
model.compile({
  optimizer: 'adam',
  loss: 'categoricalCrossentropy',
  metrics: ['accuracy']
});

// Log the summary of the model to see the structure
model.summary();



// MULTI HEAD ATTN

import * as tf from '@tensorflow/tfjs';

// Define the custom MultiHeadAttention layer
class MultiHeadAttention extends tf.layers.Layer {
  constructor(numHeads, dModel, name = 'multi_head_attention') {
    super({ name: name });
    this.numHeads = numHeads;
    this.dModel = dModel;
    this.dHead = dModel / numHeads;
  }

  build(inputShape) {
    this.Wq = this.addWeight('Wq', [this.dModel, this.dModel], 'float32', tf.initializers.glorotUniform());
    this.Wk = this.addWeight('Wk', [this.dModel, this.dModel], 'float32', tf.initializers.glorotUniform());
    this.Wv = this.addWeight('Wv', [this.dModel, this.dModel], 'float32', tf.initializers.glorotUniform());
    this.Wo = this.addWeight('Wo', [this.dModel, this.dModel], 'float32', tf.initializers.glorotUniform());
  }

  splitHeads(x, batchSize) {
    const reshaped = tf.reshape(x, [batchSize, -1, this.numHeads, this.dHead]);
    return tf.transpose(reshaped, [0, 2, 1, 3]);
  }

  scaledDotProductAttention(q, k, v) {
    const matmulQK = tf.matMul(q, k, false, true);
    const dk = tf.scalar(Math.sqrt(this.dHead));
    const scaledQK = tf.div(matmulQK, dk);
    const softmaxQK = tf.softmax(scaledQK);
    return tf.matMul(softmaxQK, v);
  }

  call(inputs, training = false) {
    const [query, key, value] = inputs;
    const batchSize = query.shape[0];

    // Linear transformations
    let Q = tf.dot(query, this.Wq.read());
    let K = tf.dot(key, this.Wk.read());
    let V = tf.dot(value, this.Wv.read());

    // Split into multiple heads
    Q = this.splitHeads(Q, batchSize);
    K = this.splitHeads(K, batchSize);
    V = this.splitHeads(V, batchSize);

    // Scaled dot-product attention
    const attention = this.scaledDotProductAttention(Q, K, V);

    // Concatenate heads
    const concatenated = tf.transpose(attention, [0, 2, 1, 3]);
    const reshaped = tf.reshape(concatenated, [batchSize, -1, this.dModel]);

    // Final linear transformation
    return tf.dot(reshaped, this.Wo.read());
  }
}

// Example usage
const numHeads = 8;
const dModel = 512;

const inputs = tf.input({ shape: [10, 512] });
const query = inputs;
const key = inputs;
const value = inputs;

const multiHeadAttention = new MultiHeadAttention(numHeads, dModel);
const output = multiHeadAttention.apply([query, key, value]);

const model2 = tf.model({ inputs: inputs, outputs: output });
model.summary();

