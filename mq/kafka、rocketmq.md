rocketmq和kafka的不同

###  数据可靠性

- RocketMQ支持异步实时刷盘，同步刷盘，同步Replication，异步Replication
- Kafka使用异步刷盘方式，异步Replication

> 总结：RocketMQ的同步刷盘在单机可靠性上比Kafka更高，不会因为操作系统Crash，导致数据丢失。 同时同步Replication也比Kafka异步Replication更可靠，数据完全无单点。另外Kafka的Replication以topic为单位，支持主机宕机，备机自动切换，但是这里有个问题，由于是异步Replication，那么切换后会有数据丢失，同时Leader如果重启后，会与已经存在的Leader产生数据冲突。开源版本的RocketMQ不支持Master宕机，Slave自动切换为Master



###  性能对比

- [Kafka单机写入TPS约在百万条/秒，消息大小10个字节](http://engineering.linkedin.com/kafka/benchmarking-apache-kafka-2-million-writes-second-three-cheap-machines)
- RocketMQ单机写入TPS单实例约7万条/秒，单机部署3个Broker，可以跑到最高12万条/秒，消息大小10个字节

> 总结：Kafka的TPS跑到单机百万，主要是由于Producer端将多个小消息合并，批量发向Broker。

RocketMQ为什么没有这么做？

1. Producer通常使用Java语言，缓存过多消息，GC是个很严重的问题
2. Producer调用发送消息接口，消息未发送到Broker，向业务返回成功，此时Producer宕机，会导致消息丢失，业务出错
3. Producer通常为分布式系统，且每台机器都是多线程发送，我们认为线上的系统单个Producer每秒产生的数据量有限，不可能上万。
4. 缓存的功能完全可以由上层业务完成。

### 

###  单机支持的队列数

- Kafka单机超过64个队列/分区，Load会发生明显的飙高现象，队列越多，load越高，发送消息响应时间变长
- RocketMQ单机支持最高5万个队列，Load不会发生明显变化

队列多有什么好处？

1. 单机可以创建更多Topic，因为每个Topic都是由一批队列组成
2. Consumer的集群规模和队列数成正比，队列越多，Consumer集群可以越大



### 消息投递实时性

- Kafka使用短轮询方式，实时性取决于轮询间隔时间
- RocketMQ使用长轮询，同Push方式实时性一致，消息的投递延时通常在几个毫秒。



###  消费失败重试

- Kafka消费失败不支持重试
- RocketMQ消费失败支持定时重试，每次重试间隔时间顺延

> 总结：例如充值类应用，当前时刻调用运营商网关，充值失败，可能是对方压力过多，稍后在调用就会成功，如支付宝到银行扣款也是类似需求。
>
> 这里的重试需要可靠的重试，即失败重试的消息不因为Consumer宕机导致丢失。



###  严格的消息顺序

- Kafka支持消息顺序，但是一台Broker宕机后，就会产生消息乱序
- RocketMQ支持严格的消息顺序，在顺序消息场景下，一台Broker宕机后，发送消息会失败，但是不会乱序

> Mysql Binlog分发需要严格的消息顺序



###  定时消息

- Kafka不支持定时消息
- RocketMQ支持两类定时消息
  - 开源版本RocketMQ仅支持定时Level
  - 阿里云ONS支持定时Level，以及指定的毫秒级别的延时时间



###  消息查询

- Kafka不支持消息查询
- RocketMQ支持根据Message Id查询消息，也支持根据消息内容查询消息（发送消息时指定一个Message Key，任意字符串，例如指定为订单Id）

> 总结：消息查询对于定位消息丢失问题非常有帮助，例如某个订单处理失败，是消息没收到还是收到处理出错了。



###  消息回溯

- Kafka理论上可以按照Offset来回溯消息
- RocketMQ支持按照时间来回溯消息，精度毫秒，例如从一天之前的某时某分某秒开始重新消费消息

> 总结：典型业务场景如consumer做订单分析，但是由于程序逻辑或者依赖的系统发生故障等原因，导致今天消费的消息全部无效，需要重新从昨天零点开始消费，那么以时间为起点的消息重放功能对于业务非常有帮助。



###  消费并行度

- Kafka的消费并行度依赖Topic配置的分区数，如分区数为10，那么最多10台机器来并行消费（每台机器只能开启一个线程），或者一台机器消费（10个线程并行消费）。即消费并行度和分区数一致。
- RocketMQ消费并行度分两种情况
  - 顺序消费方式并行度同Kafka完全一致
  - 乱序方式并行度取决于Consumer的线程数，如Topic配置10个队列，10台机器消费，每台机器100个线程，那么并行度为1000。



###  Broker端消息过滤

- Kafka不支持Broker端的消息过滤
- RocketMQ支持两种Broker端消息过滤方式
  - 根据Message Tag来过滤，相当于子topic概念
  - 向服务器上传一段Java代码，可以对消息做任意形式的过滤，甚至可以做Message Body的过滤拆分。