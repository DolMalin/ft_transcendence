import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Avatar } from "../entities/avatar.entity";
import { Repository } from "typeorm";

@Injectable()
export class AvatarService {
	constructor(
		@InjectRepository(Avatar)
		private avatarRepository: Repository<Avatar>,
	) {}

	async create(dataBuffer: Buffer, filename: string) {
		const newAvatar = await this.avatarRepository.create({
			filename,
			data: dataBuffer
		})
		await this.avatarRepository.save(newAvatar)
		return newAvatar
	}

	async getAvatarById(id: string) {
		const avatar = await this.avatarRepository.findOneBy({id})
		if (!avatar)
			throw new NotFoundException()
		return avatar
	}
}