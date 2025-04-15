import { Controller, Get, Param, Query } from '@nestjs/common';
import { StoreService } from '../store/store.service';

@Controller('store')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Get()
  getAllStores() {
    return this.storeService.getAllStores();
  }

  @Get('cep/:cep')
  async findByCep(@Param('cep') cep: string) {
    return this.storeService.findByCep(cep);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.storeService.getStoreById(id);
  }

  @Get('state/:state')
  getByState(@Param('state') state: string) {
    return this.storeService.getStoresByState(state);
  }
}
