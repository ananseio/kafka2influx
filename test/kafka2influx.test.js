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

const expect = require('chai').expect;
const bunyan = require('bunyan');
const influx = require('influx');
const os = require('os');

const KafkaStream = require('bunyan-nokafka');
const Kafka2Influx = require('../kafka2influx');

const connectionString = '127.0.0.1:9092';
const groupId = 'kafka2influx-test';
const username = 'username';
const password = 'password';
const database = 'kafka2influx_testdb';
const host = 'localhost';

const kafkaTopic = 'kafka2influx_bunyanLogs';
const influxSeries = 'kafka2influx_bunyanLogs';

const bunyanLoggerName = 'kafka2influx-test';

const logger = bunyan.createLogger({
  name: bunyanLoggerName,
  streams: [
    {
      level: 'info',
      type: 'file',
      path: 'unittest.log',
    },
  ],
  serializers: {
    err: bunyan.stdSerializers.err,
  },
});

describe('Kafka2Influx', () => {
  let k2i;
  before(() => {
    const kafkaStream = new KafkaStream({
      topic: kafkaTopic,
      kafkaOpts: {
        connectionString,
        partitioner: KafkaStream.roundRobinPartitioner(),
      },
    });

    kafkaStream.once('ready', () => {
      logger.addStream({
        level: bunyan.INFO,
        stream: kafkaStream,
      });
    });

    kafkaStream.on('error', (err) => {
      expect(err).to.not.exist;
    });
  });

  it('should be able to construct with proper options', () => {
    try {
      const kafka2influx = new Kafka2Influx({
        influxdbOpts: {
          username,
          password,
          database,
          host,
        },
        options: {
          kafkaTopic,
          influxSeries,
          transformFn: Kafka2Influx.BunyanLogTransformer,
        },
      });
      expect(kafka2influx).to.not.exist;
    } catch (err) {
      expect(err).to.exist;
      expect(err).to.be.an.instanceof(Error);
      expect(err).to.have.deep.property('message', 'Kafka options must be provided');
    }
    try {
      const kafka2influx = new Kafka2Influx({
        kafkaOpts: {
          connectionString,
          groupId,
        },
        options: {
          kafkaTopic,
          influxSeries,
          transformFn: Kafka2Influx.BunyanLogTransformer,
        },
      });
      expect(kafka2influx).to.not.exist;
    } catch (err) {
      expect(err).to.exist;
      expect(err).to.be.an.instanceof(Error);
      expect(err).to.have.deep.property('message', 'InfluxDB options must be provided');
    }
    try {
      const kafka2influx = new Kafka2Influx({
        kafkaOpts: {
          connectionString,
          groupId,
        },
        influxdbOpts: {
          username,
          password,
          database,
          host,
        },
      });
      expect(kafka2influx).to.not.exist;
    } catch (err) {
      expect(err).to.exist;
      expect(err).to.be.an.instanceof(Error);
      expect(err).to.have.deep.property('message', 'Kafka2Influx options must be provided');
    }
    try {
      const kafka2influx = new Kafka2Influx({
        kafkaOpts: {
          connectionString,
        },
        influxdbOpts: {
          username,
          password,
          database,
          host,
        },
        options: {
          kafkaTopic,
          influxSeries,
          transformFn: Kafka2Influx.BunyanLogTransformer,
        },
      });
      expect(kafka2influx).to.not.exist;
    } catch (err) {
      expect(err).to.exist;
      expect(err).to.be.an.instanceof(Error);
      expect(err).to.have.deep.property('message', 'Kafka options must have a groupId string');
    }
    try {
      const kafka2influx = new Kafka2Influx({
        kafkaOpts: {
          connectionString,
          groupId,
        },
        influxdbOpts: {
          username,
          password,
          database,
        },
        options: {
          kafkaTopic,
          influxSeries,
          transformFn: Kafka2Influx.BunyanLogTransformer,
        },
      });
      expect(kafka2influx).to.not.exist;
    } catch (err) {
      expect(err).to.exist;
      expect(err).to.be.an.instanceof(Error);
      expect(err).to.have.deep.property('message', 'InfluxDB options must have host string');
    }
    try {
      const kafka2influx = new Kafka2Influx({
        kafkaOpts: {
          connectionString,
          groupId,
        },
        influxdbOpts: {
          password,
          database,
          host,
        },
        options: {
          kafkaTopic,
          influxSeries,
          transformFn: Kafka2Influx.BunyanLogTransformer,
        },
      });
      expect(kafka2influx).to.not.exist;
    } catch (err) {
      expect(err).to.exist;
      expect(err).to.be.an.instanceof(Error);
      expect(err).to.have.deep.property('message', 'InfluxDB options must have username string');
    }
    try {
      const kafka2influx = new Kafka2Influx({
        kafkaOpts: {
          connectionString,
          groupId,
        },
        influxdbOpts: {
          username,
          database,
          host,
        },
        options: {
          kafkaTopic,
          influxSeries,
          transformFn: Kafka2Influx.BunyanLogTransformer,
        },
      });
      expect(kafka2influx).to.not.exist;
    } catch (err) {
      expect(err).to.exist;
      expect(err).to.be.an.instanceof(Error);
      expect(err).to.have.deep.property('message', 'InfluxDB options must have password string');
    }
    try {
      const kafka2influx = new Kafka2Influx({
        kafkaOpts: {
          connectionString,
          groupId,
        },
        influxdbOpts: {
          username,
          password,
          host,
        },
        options: {
          kafkaTopic,
          influxSeries,
          transformFn: Kafka2Influx.BunyanLogTransformer,
        },
      });
      expect(kafka2influx).to.not.exist;
    } catch (err) {
      expect(err).to.exist;
      expect(err).to.be.an.instanceof(Error);
      expect(err).to.have.deep.property('message', 'InfluxDB options must have database string');
    }
    try {
      const kafka2influx = new Kafka2Influx({
        kafkaOpts: {
          connectionString,
          groupId,
        },
        influxdbOpts: {
          username,
          password,
          database,
          host,
        },
        options: {
          influxSeries,
          transformFn: Kafka2Influx.BunyanLogTransformer,
        },
      });
      expect(kafka2influx).to.not.exist;
    } catch (err) {
      expect(err).to.exist;
      expect(err).to.be.an.instanceof(Error);
      expect(err).to.have.deep.property('message', 'Kafka2Influx options must have a kafka topic');
    }
    try {
      const kafka2influx = new Kafka2Influx({
        kafkaOpts: {
          connectionString,
          groupId,
        },
        influxdbOpts: {
          username,
          password,
          database,
          host,
        },
        options: {
          kafkaTopic,
          transformFn: Kafka2Influx.BunyanLogTransformer,
        },
      });
      expect(kafka2influx).to.exist;
    } catch (err) {
      expect(err).to.exist;
      expect(err).to.be.an.instanceof(Error);
      expect(err).to.have.deep.property('message', 'Kafka2Influx options must have a influxdb series');
    }
    try {
      const kafka2influx = new Kafka2Influx({
        kafkaOpts: {
          connectionString,
          groupId,
        },
        influxdbOpts: {
          username,
          password,
          database,
          host,
        },
        options: {
          kafkaTopic,
          influxSeries,
        },
      });
      expect(kafka2influx).to.not.exist;
    } catch (err) {
      expect(err).to.exist;
      expect(err).to.be.an.instanceof(Error);
      expect(err).to.have.deep.property('message', 'Kafka2Influx options must have a message transformation function');
    }
  });

  it('should be able to construct with proper options', (done) => {
    const kafka2influx = new Kafka2Influx({
      kafkaOpts: {
        connectionString,
        groupId,
      },
      influxdbOpts: {
        username,
        password,
        database,
        host,
      },
      options: {
        kafkaTopic,
        influxSeries,
        transformFn: Kafka2Influx.BunyanLogTransformer,
      },
    });
    expect(kafka2influx).to.exist;

    kafka2influx.once('ready', () => {
      k2i = kafka2influx;
      done();
    });
  });

  it('should be able to drain kafka topic and write to influx properly', (done) => {
    k2i.once('error', (err) => {
      expect(err).to.not.exist;
      done(err);
    });

    k2i.once('response', () => {
      k2i.influx.query(`SELECT * FROM ${influxSeries} WHERE time > now() - 5s AND "name" = '${bunyanLoggerName}' AND hostname='${os.hostname()}' AND pid = '${process.pid}' AND level = '30'`,
        (err, results) => {
          if (err) {
            done(err);
          } else {
            expect(results).to.have.deep.property('[0][0].msg', 'test');
            expect(results).to.have.deep.property('[0][1].msg', 'test2');
            done();
          }
        });
    });

    logger.info('test');
    logger.info('test2');
  });
});
