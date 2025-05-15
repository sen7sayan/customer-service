import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Customer } from "./customer.entity";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { CustomerService } from "./customer.service";
import { CustomerController } from "./customer.controller";
import { JwtStrategy } from '../auth/jwt.strategy';
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
    ],
    providers : [CustomerService,JwtStrategy],
    controllers: [CustomerController]
})

export class CustomerModule {}