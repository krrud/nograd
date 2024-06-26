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

// Generate random input data and one-hot encoded labels
const numExamples = 100;
const xs = tf.randomNormal([numEntries, 10]);
const labels = tf.tidy(() => tf.oneHot(tf.util.createShuffledIndices(numExamples).map(i => i % 10), 10));

model.fit(xs, labels, {
  epochs: 10,
  callbacks: {
    onEpochEnd: (epoch, logs) => {
      console.log(`Epoch ${epoch + 1}: Loss = ${logs.loss}, Accuracy = ${logs.acc}`);
    }
  }
}).then(info => {
  console.log('Training finished', info);
}).catch(err => {
  console.error('Error during training', err);
});



// MULTI HEAD ATTN

import * as tf from '@tensorflow/tfjs';
import { get } from 'http';

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
    let Q = tf.matMul(query, this.Wq.read());
    let K = tf.matMul(key, this.Wk.read());
    let V = tf.matMul(value, this.Wv.read());
  
    // Split heads
    Q = this.splitHeads(Q, batchSize);
    K = this.splitHeads(K, batchSize);
    V = this.splitHeads(V, batchSize);
  
    // Scaled dot-product attention
    const attentionHeads = this.scaledDotProductAttention(Q, K, V);
    let attentionOutput = tf.reshape(attentionHeads, [batchSize, -1, this.dModel]);
  
    // Final linear transformation
    return tf.matMul(attentionOutput, this.Wo.read());
  }
}
