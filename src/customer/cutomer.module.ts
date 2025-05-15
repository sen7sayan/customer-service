import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Customer } from "./customer.entity";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { CustomerService } from "./customer.service";
import { CustomerController } from "./customer.controller";
import { JwtStrategy } from '../auth/jwt.strategy';
import { ClientsModule, Transport } from "@nestjs/microservices";

@Module({
    imports:[TypeOrmModule.forFeature([Customer]),
    JwtModule.registerAsync({
        imports : [ConfigModule],
        useFactory : async(configService : ConfigService) =>({
            secret:configService.get<string>('JWT_SECRET'),
            signOptions: {expiresIn: '1d'},

        }),
        inject :[ConfigService]
    }),
    JwtModule.register({}), // your JWT options
    ClientsModule.register([
      {
        name: 'ORDER_SERVICE', // IMPORTANT: must match the injection token
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'order_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
       {
        name: 'VIEW_ORDER_SERVICE', // IMPORTANT: must match the injection token
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'single_order_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
       {
        name: 'ORDER_DETAIL_SERVICE', // IMPORTANT: must match the injection token
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'order_detail_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
    ],
    providers : [CustomerService,JwtStrategy],
    controllers: [CustomerController]
})

export class CustomerModule {}