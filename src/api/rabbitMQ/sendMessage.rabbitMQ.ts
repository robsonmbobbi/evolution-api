import { SendTextDto } from '@api/dto/sendMessage.dto';
import { WAMonitoringService } from '@api/services/monitor.service';
import * as amqp from 'amqplib/callback_api';

export class SendMessageRabbitMQ {
  constructor(private readonly waMonitor: WAMonitoringService) {}

  public listen(): void {
    amqp.connect('amqp://localhost', (error, connection) => {
      if (error) {
        throw error;
      }

      connection.createChannel((channelError, channel) => {
        if (channelError) {
          throw channelError;
        }

        const queueName = 'evolution-send';
        channel.assertQueue(queueName, { durable: false });

        channel.consume(queueName, async (message) => {
          try {
            const messageJson = JSON.parse(message.content.toString());
            const data = new SendTextDto();
            data.text = messageJson.text;
            data.number = messageJson.number;

            /*if (this.waMonitor.waInstances[messageJson.instance].connectionStatus.State == 'close') {
              return;
            }

            while (this.waMonitor.waInstances[messageJson.instance].connectionStatus.State == 'connecting');*/

            await this.waMonitor.waInstances[messageJson.instance].textMessage(data);
          } catch {
            /* empty */
          }
        });
      });
    });
  }
}
