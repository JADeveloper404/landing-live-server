import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmailService } from 'src/core/email.service';
import { ExcelService } from 'src/core/excel.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private emailService: EmailService,
    private excelService: ExcelService,
  ) {}

  async getAll() {
    let users!: User[];
    try {
      users = await this.userModel.find({}, { _id: 0, __v: 0 }).lean();
    } catch (error) {
      throw new InternalServerErrorException('Problema no controlado');
    }

    return users;
  }

  async create(dataUser: CreateUserDto) {
    try {
      const newUser = new this.userModel(dataUser);
      await newUser.save();
      await this.sendEmail();
    } catch (error) {
      throw new InternalServerErrorException('Problema no controlado');
    }
    return {
      message: 'Usuario creado exitosamente.',
      statusCode: 201,
    };
  }

  async sendEmail() {
    try {
      const users = await this.getAll();
      const excelFile = this.excelService.generateExcel(users);
      await this.emailService.sendMailExcel(excelFile);
    } catch (error) {
      throw new InternalServerErrorException('Problema no controlado');
    }
    return;
  }
}
