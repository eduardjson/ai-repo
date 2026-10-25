import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Put,
  Param,
  Body,
  Query,
  UseInterceptors,
  UploadedFiles,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { FilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Public } from '../auth/public.decorator';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  ProductDto,
  ProductImageDto,
  ProductListResponseDto,
} from '../dto/product.response';

@ApiTags('products')
@ApiBearerAuth()
@Controller('products')
export class ProductController {
  constructor(private productService: ProductService) {}

  @Get()
  @ApiOkResponse({ type: ProductListResponseDto })
  async findAll(
    @Query('page') page?: string,
    @Query('size') size?: string,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('manufacturer') manufacturer?: string,
  ) {
    const p = Math.max(1, parseInt(page || '1'));
    const s = Math.min(100, Math.max(1, parseInt(size || '20')));
    return this.productService.findAll({ page: p, size: s, search, category, manufacturer });
  }

  @Public()
  @Get(':id/image')
  async getImage(@Param('id') id: string, @Res() res: Response) {
    const { buffer, type } = await this.productService.getImage(id);
    res.setHeader('Content-Type', type);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(buffer);
  }

  @Get(':id/images')
  @ApiOkResponse({ type: ProductImageDto, isArray: true })
  getImages(@Param('id') id: string) {
    return this.productService.getImages(id);
  }

  @Get(':id')
  @ApiOkResponse({ type: ProductDto })
  findOne(@Param('id') id: string) {
    return this.productService.findById(id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('image', { limits: { fileSize: 5 * 1024 * 1024 } }))
  @ApiCreatedResponse({ type: ProductDto })
  create(
    @Body() dto: CreateProductDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.productService.create(dto, file);
  }

  @Patch(':id')
  @Put(':id')
  @UseInterceptors(FileInterceptor('image', { limits: { fileSize: 5 * 1024 * 1024 } }))
  @ApiOkResponse({ type: ProductDto })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.productService.update(id, dto, file);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.remove(id);
  }

  @Post(':id/images')
  @UseInterceptors(FilesInterceptor('files', 20))
  @ApiCreatedResponse({ type: ProductImageDto, isArray: true })
  uploadImages(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.productService.uploadImages(id, files);
  }
}
