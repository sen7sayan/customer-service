import { Controller,Post ,Body, HttpCode, HttpStatus, Get, UseGuards, Req} from "@nestjs/common";
import {CustomerService} from './customer.service';
import { CreateCustomerDto } from "./dto/create-customer.dto";
import { LoginDto } from "./dto/login-customer.dto";
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('customer')
export class CustomerController{
    constructor(private readonly customerService: CustomerService){}
    @Post()
    create(@Body() dto: CreateCustomerDto){
        return this.customerService.create(dto);
    }

    @HttpCode(HttpStatus.OK) 
    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        return await this.customerService.login(loginDto);
    }
    @UseGuards(JwtAuthGuard)
    @Get('/profile')
    async getProfile(@Req() req) {
        // req.user comes from JwtStrategy validate method
        const userId = req.user.id;
        return this.customerService.getProfile(userId);
    }
}