import { Controller, Get, Post, Req, Res, Body, Patch, Param, Delete, UseGuards, HttpStatus  } from '@nestjs/common';
import { MessageService } from '../services/message.service';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}


}
