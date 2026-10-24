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
import { Public } from '../auth/public.decorator';
import { Roles } from '../auth/roles.decorator';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductController {
  constructor(private productService: ProductService) {}

  @Get()
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
  getImages(@Param('id') id: string) {
    return this.productService.getImages(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findById(id);
  }

  @Roles('ADMIN')
  @Post()
  @UseInterceptors(FileInterceptor('image', { limits: { fileSize: 5 * 1024 * 1024 } }))
  create(
    @Body() dto: CreateProductDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.productService.create(dto, file);
  }

  @Roles('ADMIN')
  @Patch(':id')
  @Put(':id')
  @UseInterceptors(FileInterceptor('image', { limits: { fileSize: 5 * 1024 * 1024 } }))
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.productService.update(id, dto, file);
  }

  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.remove(id);
  }

  @Roles('ADMIN')
  @Post(':id/images')
  @UseInterceptors(FilesInterceptor('files', 20))
  uploadImages(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.productService.uploadImages(id, files);
  }
}
