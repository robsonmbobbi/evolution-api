import { SendTextDto } from '@api/dto/sendMessage.dto';
import { WAMonitoringService } from '@api/services/monitor.service';
import * as amqp from 'amqplib/callback_api';

export class SendMessageRabbitMQ {
  constructor(private readonly waMonitor: WAMonitoringService) {}

  public async listen(): Promise<void> {
    await new Promise((f) => setTimeout(f, 120000));

    amqp.connect('amqp://localhost', (error, connection) => {
      if (error) {
        throw error;
      }

      connection.createChannel((channelError, channel) => {
        if (channelError) {
          throw channelError;
        }

        const queueName = 'evolution-send';
        channel.assertQueue(queueName, { durable: false, autoDelete: true });

        channel.consume(queueName, async (message) => {
          try {
            const messageJson = JSON.parse(message.content.toString());
            const data = new SendTextDto();
            data.text = messageJson.text;
            data.number = messageJson.number;

            await this.waMonitor.waInstances[messageJson.instance].textMessage(data);
          } catch {
            /* empty */
          }
        });
      });
    });
  }
}
