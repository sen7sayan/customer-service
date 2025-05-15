import { Controller,Post ,Body, HttpCode, HttpStatus, Get, UseGuards, Req, UnauthorizedException, Param, Query} from "@nestjs/common";
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

    @Post('order')
    async createOrder(@Body() orderData: any, @Req() req: any) {
        const authHeader = req.headers['authorization'] || '';
        if (!authHeader) {
            throw new UnauthorizedException('Token missing');
        }
        return this.customerService.placeOrder({authHeader, ...orderData});
    }


    @Get('order/:id')
    async getOrder(@Req() req: any , @Param('id') id: string,) {
          console.log(id)
        const authHeader = req.headers['authorization'] || '';
        if (!authHeader) {
            throw new UnauthorizedException('Token missing');
        }
        return this.customerService.singleOrder({authHeader,id});
    }


    @Get('orders')
async getTotalOrder(
  @Req() req: any,
  @Query('page') page = '1',
  @Query('limit') limit = '10',
) {
  const authHeader = req.headers['authorization'] || '';
  if (!authHeader) {
    throw new UnauthorizedException('Token missing');
  }

  // Convert to numbers
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);

  return this.customerService.totalOrder({
    authHeader,
    page: pageNumber,
    limit: limitNumber,
  });
}


    
}