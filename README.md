[![Build](https://travis-ci.org/ananseio/kafka2influx.svg)](https://travis-ci.org/ananseio/kafka2influx)
[![Code Climate](https://codeclimate.com/github/ananseio/kafka2influx/badges/gpa.svg)](https://codeclimate.com/github/ananseio/kafka2influx)
[![Test Coverage](https://codeclimate.com/github/ananseio/kafka2influx/badges/coverage.svg)](https://codeclimate.com/github/ananseio/kafka2influx/coverage)
[![License](http://img.shields.io/:license-apache-blue.svg)](http://www.apache.org/licenses/LICENSE-2.0.html)

# Stream Kafka topic into Influx
**kafka2influx** is Kafka Consumer to consume Kafka Topic into influxDB.

## Usage
```
const Kafka2Influx = require('kafka2influx');

const kafka2influx = new Kafka2Influx({
  kafkaOpts: {
    connectionString,
    groupId,    // Mandatory, use the same groupId if you want to use multiple Kafka2Influx to drain the same Kafka topic
  },
  influxdbOpts: {
    username,    // Mandatory
    password,    // Mandatory
    database,    // Mandatory
    host,    // Mandatory
  },
  options: {
    kafkaTopic,    // Mandatory, Kafka Topic to drain
    influxSeries,    // Mandatory, InfluxDB Series to write into
    transformFn: (kafkaMessageValue, kafkaMessaageKey) => {
      return {
        values: {},    // values for InfluxDB point
        tags: {},      // tags for InfluxDB point
      }
    },
  },
});

kafka2influx.once('ready', () => {
  // When ready, Kafka2Influx will start to drain messages
});
```

## Kafka Options
Please refer to [no-kafka producer options](https://www.npmjs.com/package/no-kafka#producer-options)

## InfluxDB Options
Please refer to [influxdb configuration options](https://www.npmjs.com/package/influx#configuration-options)

## Author
Ananse Limited <opensource@ananse.io>

## License: Apache 2.0
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
