import { ConflictException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Customer } from "./customer.entity";
import { Repository } from "typeorm";
import { JwtService } from "@nestjs/jwt";
import { CreateCustomerDto } from "./dto/create-customer.dto";
import * as bcrypt from 'bcrypt';

@Injectable()
export class CustomerService{
    constructor(
        @InjectRepository(Customer)
        private customerRepo:Repository<Customer>,
        private jwtService : JwtService,
    ){}

    async create(dto : CreateCustomerDto){
        try {
                const existingCustomer = await this.customerRepo.findOne({
                where : {email:dto.email}
            })
            if(existingCustomer){
                throw new ConflictException({
                    statusCode:409,
                    message: 'Email already register',
                    error: 'conflict'
                })
            }
            const hashedPassword = await bcrypt.hash(dto.password,10);
            const customer = this.customerRepo.create({
                ...dto,
                password:hashedPassword
            })
            const savedCustomer = await this.customerRepo.save(customer);
            const payload = {
                id : savedCustomer.id,
                email: savedCustomer.email
            }
            const token = this.jwtService.sign(payload);
            return {
                statusCode: 201,
                message: "Account created successfully",
                data: {
                    access_token : token
                }
            }
        } catch (error) {
                    if (error instanceof ConflictException) {
            throw new ConflictException({
            statusCode: 409,
            message: 'Email already registered',
            error: 'Conflict',
            });
        }

        throw new InternalServerErrorException({
            statusCode: 500,
            message: 'Failed to create customer',
            error: 'Internal Server Error',
        });
                }
    }





    async login(dto: { email: string; password: string }) {
        try {
            const customer = await this.customerRepo.findOne({
            where: { email: dto.email },
            select: ['id', 'email', 'password'], 
            });

            if (!customer) {
            throw new UnauthorizedException('Invalid credentials');
            }

            // Compare password
            const isPasswordValid = await bcrypt.compare(dto.password, customer.password);
            if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
            }

            // Generate JWT token payload
            const payload = {
            id: customer.id,
            email: customer.email,
            };

            const token = this.jwtService.sign(payload);

            return {
            statusCode: 200,
            message: 'Login successful',
            data: {
                access_token: token,
            },
            };
        } catch (error) {
            if (error instanceof UnauthorizedException) {
            throw error;
            }
            throw new InternalServerErrorException('Failed to login');
        }
            }


        async getProfile(userId: string) {
            const customer = await this.customerRepo.findOne({
                where: { id: userId },
                select: ['name', 'email', 'phone', 'address'],
            });

            if (!customer) {
                throw new NotFoundException('Customer not found');
            }

            return customer;
            }
}