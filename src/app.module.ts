import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CustomerModule } from './customer/cutomer.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from './customer/customer.entity';

@Module({
  imports: [ 
    ConfigModule.forRoot({ isGlobal: true }), // load .env config

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: process.env.DB_port ? +process.env.DB_port : undefined,
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        entities: [Customer],
        synchronize: true,
      }),
    }),

    CustomerModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
