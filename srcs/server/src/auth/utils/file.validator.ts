import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common"
import * as fileType from "file-type"

/* according to this documentation `https://www.binishjoshi.com.np/file-type-validator-pipe-in-nestjs/`
/* we assume that we need to 
*/ 
@Injectable()
export class FileTypeValidationPipe implements PipeTransform {
  async transform(value: Express.Multer.File) {
    const { mime } = await fileType.fromBuffer(value.buffer)
    const MIME_TYPES = ["image/jpeg", "image/png", "image/webp"]

    if (!MIME_TYPES.includes(mime)) {
      throw new BadRequestException(
        "The image should be either jpeg, png, or webp."
      )
    }

    return value
  }
}