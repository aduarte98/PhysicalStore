import { Controller, Get, Param } from '@nestjs/common';
import { StoreService } from '../store/store.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Stores')
@Controller('store')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Get()
  @ApiOperation({ summary: 'Obter todas as lojas' })
  @ApiResponse({
    status: 200,
    description: 'Retorna uma lista de todas as lojas',
  })
  getAllStores() {
    return this.storeService.getAllStores();
  }

  @Get('cep/:cep')
  @ApiOperation({ summary: 'Encontrar lojas pelo CEP' })
  @ApiResponse({
    status: 200,
    description: 'Retorna lojas baseadas no CEP fornecido',
  })
  async findByCep(@Param('cep') cep: string) {
    return this.storeService.findByCep(cep);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter loja por ID' })
  @ApiResponse({
    status: 200,
    description: 'Retorna os detalhes de uma loja com base no ID',
  })
  getById(@Param('id') id: string) {
    return this.storeService.getStoreById(id);
  }

  @Get('state/:state')
  @ApiOperation({ summary: 'Obter lojas por estado' })
  @ApiResponse({
    status: 200,
    description: 'Retorna lojas localizadas no estado fornecido',
  })
  getByState(@Param('state') state: string) {
    const normalizedState = state.toUpperCase();
    return this.storeService.getStoresByState(normalizedState);
  }
}
