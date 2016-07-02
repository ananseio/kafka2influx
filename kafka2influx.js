/*
  Copyright 2016 Ananse Limited

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

'use strict';

const EventEmitter = require('events');
const Kafka = require('no-kafka');
const Immutable = require('seamless-immutable');
const influx = require('influx');

function createKafkaConsumer({options, topics, handlerFn}) {
  const consumer = new Kafka.GroupConsumer({ options });
  return consumer.init([{
    strategy: 'RoundRobinStrategy',
    subscriptions: topics,
    handler: handlerFn,
  }])
    .then(() => consumer);
}

class Kafka2Influx extends EventEmitter {
  constructor({kafkaOpts, influxdbOpts, options}) {
    super();
    if (!kafkaOpts) {
      throw new Error('Kafka options must be provided');
    }

    if (!influxdbOpts) {
      throw new Error('InfluxDB options must be provided');
    }

    if (!options) {
      throw new Error('Kafka2Influx options must be provided');
    }

    if (!kafkaOpts.groupId || typeof kafkaOpts.groupId !== 'string') {
      throw new Error('Kafka options must have a groupId string');
    }

    if (!influxdbOpts.host || typeof influxdbOpts.host !== 'string') {
      throw new Error('InfluxDB options must have host string');
    }

    if (!influxdbOpts.username || typeof influxdbOpts.username !== 'string') {
      throw new Error('InfluxDB options must have username string');
    }

    if (!influxdbOpts.password || typeof influxdbOpts.password !== 'string') {
      throw new Error('InfluxDB options must have password string');
    }

    if (!influxdbOpts.database || typeof influxdbOpts.database !== 'string') {
      throw new Error('InfluxDB options must have database string');
    }

    if (!options.kafkaTopic || typeof options.kafkaTopic !== 'string') {
      throw new Error('Kafka2Influx options must have a kafka topic');
    }

    if (!options.influxSeries || typeof options.influxSeries !== 'string') {
      throw new Error('Kafka2Influx options must have a influxdb series');
    }

    if (!options.transformFn || typeof options.transformFn !== 'function') {
      throw new Error('Kafka2Influx options must have a message transformation function');
    }

    this.kafkaOpts = kafkaOpts;
    this.influxdbOpts = influxdbOpts;
    this.options = options;

    this.influx = influx(this.influxdbOpts);

    createKafkaConsumer({
      options: this.kafkaOpts,
      topics: [this.options.kafkaTopic],
      handlerFn: this.getHandlerFn(),
    }).then((consumer) => {
      this.consumer = consumer;
      this.emit('ready');
    });
  }

  getHandlerFn() {
    const self = this;
    return (messageSet, topic, partition) => {
      messageSet.forEach((m) => {
        const message = self.options.transformFn(m.message.value, m.message.key);
        self.influx.writePoint(self.options.influxSeries, message.values, message.tags, (err, response) => {
          self.consumer.commitOffset({ topic, partition, offset: m.offset });
          if (err) {
            self.emit('error', err, m);
          } else {
            self.emit('response', response, m);
          }
        });
      });
    };
  }

  static BunyanLogTransformer(rawMsg) {
    const message = JSON.parse(rawMsg);
    return {
      values: Immutable.from(message).without(['name', 'hostname', 'pid', 'level', 'v', 'widget_type']).set('time', Date.parse(message.time)).asMutable(),
      tags: Immutable.from({
        name: message.name,
        hostname: message.hostname,
        pid: Number(message.pid),
        level: Number(message.level),
        widget_type: message.widget_type || undefined,
      }).asMutable(),
    };
  }
}

module.exports = Kafka2Influx;
