[![6f96nP.png](https://s4.ax1x.com/2021/03/19/6f96nP.png)](https://imgtu.com/i/6f96nP)



- Partition：Topic 是一个逻辑的概念，它可以细分为多个分区，每个分区只属于单个主题。同一个主题下不同分区包含的消息是不同的，分区在存储层面可以看作一个可追加的日志（Log）文件，消息在被追加到分区日志文件的时候都会分配一个特定的偏移量（offset）。
- Replication：副本，是 Kafka 保证数据高可用的方式，Kafka 同一 Partition 的数据可以在多 Broker 上存在多个副本，通常只有主副本对外提供读写服务，当主副本所在 broker 崩溃或发生网络一场，Kafka 会在 Controller 的管理下会重新选择新的 Leader 副本对外提供读写服务。
- Record：实际写入 Kafka 中并可以被读取的消息记录。每个 record 包含了 key、value 和 timestamp。



**Kafka 是推模式还是拉模式，推拉的区别是什么？**

> Kafka Producer 向 Broker 发送消息使用 Push 模式，Consumer 消费采用的 Pull 模式。拉取模式，让 consumer 自己管理 offset，可以提供读取性能



**Kafka 是否支持读写分离？**

> 不支持，只有 Leader 对外提供读写服务



**Kafka producer 参数**

- batch.num.messages

  > 默认值：200，每次批量消息的数量，只对 asyc 起作用。

- request.required.acks

  > 默认值：0，0 表示 producer 毋须等待 leader 的确认，1 代表需要 leader 确认写入它的本地 log 并立即确认，-1 代表所有的备份都完成后确认。只对 async 模式起作用，这个参数的调整是数据不丢失和发送效率的 tradeoff，如果对数据丢失不敏感而在乎效率的场景可以考虑设置为 0，这样可以大大提高 producer 发送数据的效率。

- request.timeout.ms

  > 默认值：10000，确认超时时间。

- partitioner.class

  > 默认值：kafka.producer.DefaultPartitioner，必须实现 kafka.producer.Partitioner，根据 Key 提供一个分区策略。*有时候我们需要相同类型的消息必须顺序处理，这样我们就必须自定义分配策略，从而将相同类型的数据分配到同一个分区中。*

- producer.type

  > 默认值：sync，指定消息发送是同步还是异步。异步 asyc 成批发送用 kafka.producer.AyncProducer， 同步 sync 用 kafka.producer.SyncProducer。同步和异步发送也会影响消息生产的效率。

- compression.topic

  > 默认值：none，消息压缩，默认不压缩。其余压缩方式还有，"gzip"、"snappy"和"lz4"。对消息的压缩可以极大地减少网络传输量、降低网络 IO，从而提高整体性能。

- compressed.topics

  > 默认值：null，在设置了压缩的情况下，可以指定特定的 topic 压缩，未指定则全部压缩。

- message.send.max.retries

  > 默认值：3，消息发送最大尝试次数。

- retry.backoff.ms

  > 默认值：300，每次尝试增加的额外的间隔时间。

- topic.metadata.refresh.interval.ms

  > 默认值：600000，定期的获取元数据的时间。当分区丢失，leader 不可用时 producer 也会主动获取元数据，如果为 0，则每次发送完消息就获取元数据，不推荐。如果为负值，则只有在失败的情况下获取元数据。

- queue.buffering.max.ms

  > 默认值：5000，在 producer queue 的缓存的数据最大时间，仅仅 for asyc。

- queue.buffering.max.message

  > 默认值：10000，producer 缓存的消息的最大数量，仅仅 for asyc。

- queue.enqueue.timeout.ms

  > 默认值：-1，0 当 queue 满时丢掉，负值是 queue 满时 block, 正值是 queue 满时 block 相应的时间，仅仅 for asyc。



#### Kafka consumer 参数

- bootstrap.servers：连接 broker 地址，`host：port` 格式。
- group.id：消费者隶属的消费组。
- key.deserializer：与生产者的`key.serializer`对应，key 的反序列化方式。
- value.deserializer：与生产者的`value.serializer`对应，value 的反序列化方式。
- session.timeout.ms：coordinator 检测失败的时间。默认 10s 该参数是 Consumer Group 主动检测 （组内成员 comsummer) 崩溃的时间间隔，类似于心跳过期时间。
- auto.offset.reset：该属性指定了消费者在读取一个没有偏移量后者偏移量无效（消费者长时间失效当前的偏移量已经过时并且被删除了）的分区的情况下，应该作何处理，默认值是 latest，也就是从最新记录读取数据（消费者启动之后生成的记录），另一个值是 earliest，意思是在偏移量无效的情况下，消费者从起始位置开始读取数据。
- enable.auto.commit：否自动提交位移，如果为`false`，则需要在程序中手动提交位移。对于精确到一次的语义，最好手动提交位移
- fetch.max.bytes：单次拉取数据的最大字节数量
- max.poll.records：单次 poll 调用返回的最大消息数，如果处理逻辑很轻量，可以适当提高该值。但是`max.poll.records`条数据需要在在 session.timeout.ms 这个时间内处理完 。默认值为 500
- request.timeout.ms：一次请求响应的最长等待时间。如果在超时时间内未得到响应，kafka 要么重发这条消息，要么超过重试次数的情况下直接置为失败。





**什么时候 rebalance？**

这也是经常被提及的一个问题。rebalance 的触发条件有三种：

- 组成员发生变更（新 consumer 加入组、已有 consumer 主动离开组或已有 consumer 崩溃了——这两者的区别后面会谈到）
- 订阅主题数发生变更
- 订阅主题的分区数发生变更



**如何进行组内分区分配？**

Kafka 默认提供了两种分配策略：Range 和 Round-Robin。当然 Kafka 采用了可插拔式的分配策略，你可以创建自己的分配器以实现不同的分配策略。



**什么是 AR，ISR？**

> AR：Assigned Replicas。AR 是主题被创建后，分区创建时被分配的副本集合，副本个 数由副本因子决定。ISR：In-Sync Replicas。Kafka 中特别重要的概念，指代的是 AR 中那些与 Leader 保 持同步的副本集合。在 AR 中的副本可能不在 ISR 中，但 Leader 副本天然就包含在 ISR 中。关于 ISR，还有一个常见的面试题目是如何判断副本是否应该属于 ISR。目前的判断 依据是：Follower 副本的 LEO 落后 Leader LEO 的时间，是否超过了 Broker 端参数 replica.lag.time.max.ms 值。如果超过了，副本就会被从 ISR 中移除。



**Kafka 中的 HW 代表什么？**

> 高水位值 (High watermark)。这是控制消费者可读取消息范围的重要字段。一 个普通消费者只能“看到”Leader 副本上介于 Log Start Offset 和 HW（不含）之间的 所有消息。水位以上的消息是对消费者不可见的。





