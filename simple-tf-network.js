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
