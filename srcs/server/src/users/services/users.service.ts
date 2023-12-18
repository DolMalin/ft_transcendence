import { BadRequestException, ConflictException, Inject, Injectable, InternalServerErrorException, NotFoundException, StreamableFile, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { Repository } from 'typeorm'
import { User } from '../entities/user.entity'
import { AvatarService } from './avatar.service';
import { GameState, leaderboardStats } from 'src/game/globals/interfaces';
import { isUUID } from 'class-validator';
import { Readable } from 'stream';

import { Server} from 'socket.io';
import { GameGateway } from 'src/game/gateway/game.gateway';
import { FriendRequest } from '../entities/friendRequest.entity';
import { FriendRequestStatus } from '../entities/friendRequestStatus.type';

@Injectable()
export class UsersService {

  constructor(
		@InjectRepository(User)
		private userRepository: Repository<User>,

    @InjectRepository(FriendRequest)
    private friendRequestRepository: Repository<FriendRequest>,   

    private readonly avatarService: AvatarService,
	) { }

  async create(createUserDto: CreateUserDto) {
    
		const newUser = this.userRepository.create(createUserDto)
    if (!newUser)
      throw new InternalServerErrorException('Database error', {cause: new Error(), description: 'cannot update user'})

		const user = await this.userRepository.save(newUser)
    if (!user)
      throw new InternalServerErrorException('Database error', {cause: new Error(), description: 'cannot update user'})
    
    return user
  }


  findAll() {
    return this.userRepository.find({relations :{
      playedGames: true,
      friends: true,
      sentFriendRequests: true,
      receivedFriendRequests: true
    }});
  }


  
  async findAllUsers() {
    
    let res = await this.userRepository.find()
    if (!res || res === undefined)
      throw new NotFoundException("Users not found", {cause: new Error(), description: "cannot find any users in database"})
    const userList = res.map(user => ({
      id: user.id,
      username: user.username
    }))
    return userList
  }
  
  findOneById(id: string) {
    return this.userRepository.findOneBy({ id })
  }

  findOneByFtId(ftId: number) {
    return this.userRepository.findOneBy({ ftId })
  }

  findOneByUsername(username: string) {
    return this.userRepository.findOneBy({ username })
  }


  findOneWitOptions(options: any) {
    return this.userRepository.findOne(options)
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const result = await this.userRepository.update(id, updateUserDto)
    if (!result)
      throw new InternalServerErrorException('Database error', {cause: new Error(), description: 'cannot update user'})

    const user = await this.findOneById(id)
    return user
  }

  async save(user: User) {
    const newUser = await this.userRepository.save(user)
    if (!newUser)
      throw new InternalServerErrorException('Database error', {cause: new Error(), description: 'cannot update user'}) 
    return newUser

  }

  
  async addAvatar(id: string, dataBuffer: Buffer, filename: string) {
    const avatar = await this.avatarService.create(dataBuffer, filename)
    if (!avatar)
      throw new InternalServerErrorException('Database error', {cause: new Error(), description: 'cannot create avatar'})

    await this.userRepository.update(id, {
      avatarId: avatar.id
    })
    return avatar
  }

  async getAvatar(id: string) {
    
    const user = await this.userRepository.findOneBy({id})

    if (!user)
      throw new NotFoundException('User not found', {cause: new Error(), description: 'the user do not exist in database'})

    const avatar = await this.avatarService.getAvatarById(user.avatarId)

    if (!avatar)
      throw new NotFoundException('Avatar not found', {cause: new Error(), description: 'the avatar do not exist in database (probably not setup yet)'})
    
    return avatar
  }

  blockTarget(user: User, user2: User){
    //TODO
    //check if already block
    // user.blocked.push(user2)
    // console.log('----user in block-----', user)
  }
  async getUserAvatar( res: any, id: string) {

    if(id && !isUUID(id))
      throw new BadRequestException('Invalid id', {cause: new Error(), description: `ID '${id}' is not an UUID`})

    try {
      const avatar = await this.getAvatar(id)
      const stream = Readable.from(avatar?.data)
      
      res.set({
        'Content-Disposition':`inline; filename="${avatar?.filename}"`,
        'Content-Type' :'image'
      })
  
      return new StreamableFile(stream)
    }
    catch (e) {
      throw e
    }
  }


  async remove(id: string) {
    const user = await this.findOneById(id)
    return this.userRepository.remove(user)
  }

  async removeAll() {
    const users = this.findAll();
    (await users).forEach((value) => {
      this.userRepository.remove(value);
    });
  }

  /**
 * @description remove a socket Id from an array of string stored in user entity and update the user
 */
  async removeSocketId(socketId : string, socketIdArray : string[], user : User) {
    user.gameSockets = socketIdArray?.filter((value) => value != socketId)
    const updatedUser = await this.update(user.id, { gameSockets : user.gameSockets})
    if (!updatedUser)
      throw new InternalServerErrorException('Database error', {cause: new Error(), description: 'cannot update user'})
    return updatedUser
  }


  async addGameSocketId(socketId : string, socketIdArray : string[], user : User) {

      if (socketIdArray === null || socketIdArray === undefined)
        socketIdArray = [];
      socketIdArray?.push(socketId);
      user.gameSockets = socketIdArray;
      return (this.update(user.id, {gameSockets : user.gameSockets}));
    }

   async emitToAllSockets(server : Server, socketIdArray : string[], eventName : string, payload : Object) {

    socketIdArray.forEach((socketId) => {
      if (payload === undefined) 
        server.to(socketId).emit(eventName);
      else
        server.to(socketId).emit(eventName, payload);
    });
   }

  // }

  /**
 * @description return an array of objects containing {username, userId,winsAmount, loosesAmount, W/L Ratio} of all users
 */ 
  returnScoreList(){

    function winRatioCalculator(w : number, l : number) {
        
      if (l === 0 && w === 0)
          return (0);
      if (l === 0)
          return (100);

      const ratio = w * 100 / (w + l);
      
      return (Math.trunc(ratio))
    }

    
    // TODO
    return (this.findAll().then((res : User[]) => {
      let scoreList : leaderboardStats[] = []; 

      res?.forEach(async (value) => {

        scoreList.push({username : value.username, id : value.id,winsAmount : value.winsAmount, loosesAmount : value.loosesAmount,
        WLRatio : winRatioCalculator(value.winsAmount, value.loosesAmount)});
      })
      return (scoreList);
    }));
  }
  

  async returnProfile(userId : string) {
    try {
      const user = await this.findOneById(userId);
      if (user === undefined)
        throw new NotFoundException("Users not found", {cause: new Error(), description: "cannot find any users in database"})
      return ({username : user.username, id : user.id, winsAmount : user.winsAmount, loosesAmount : user.loosesAmount})
    }
    catch (err) {
      throw new NotFoundException("Users not found", {cause: new Error(), description: "cannot find any users in database"})
    }
  }

  // ==================================================================== //
  // ============================== FRIENDS =============================
  // ==================================================================== //

  async getRequestSentOrReceived(creator: User, receiver: User) {
    const requestSent = await this.friendRequestRepository
      .createQueryBuilder('friendRequest')
      .leftJoinAndSelect('friendRequest.creator', 'creator')
      .leftJoinAndSelect('friendRequest.receiver', 'receiver')
      .where('friendRequest.creator = :creator', {creator: creator.id})
      .andWhere('friendRequest.receiver = :receiver', {receiver: receiver.id})
      .getOne()
    
    const requestReceived = await this.friendRequestRepository
    .createQueryBuilder('friendRequest')
    .leftJoinAndSelect('friendRequest.creator', 'creator')
    .leftJoinAndSelect('friendRequest.receiver', 'receiver')
    .where('friendRequest.creator = :creator', {creator: receiver.id})
    .andWhere('friendRequest.receiver = :receiver', {receiver: creator.id})
    .getOne()

    if (!requestSent && !requestReceived)
      return undefined
    
    return (requestSent ? requestSent : requestReceived)
  }

  async sendFriendRequest(receiverId: string, creator: User, res:any) {
    if (receiverId === creator.id)
      throw new ConflictException("Conflicts between creater and receiver", {cause: new Error(), description: "creator cannot be receiver"})
    
    const receiver = await this.findOneById(receiverId)
    if (!receiver)
      throw new BadRequestException("User not found", {cause: new Error(), description: "cannot find receiver in database"})

    const originalRequest = await this.getRequestSentOrReceived(creator, receiver)
    if (originalRequest?.status === 'accepted' || originalRequest?.status === 'pending')
      throw new ConflictException("Cannot send friend frequest", {cause: new Error(), description: "A friend request has already been sent or received to your account"})

    const friendRequest = await this.friendRequestRepository.save({creator, receiver, status:'pending'})
    if (!friendRequest)
      throw new InternalServerErrorException('Database error', {cause: new Error(), description: 'cannot create friend request'})

    return res.status(200).send({
      status: friendRequest.status,
      id: friendRequest.id,
      creator:{id:friendRequest.creator.id},
      receiver:{id:friendRequest.receiver.id},
    })
  }

  async getFriendRequestStatus(receiverId: string, creator: User, res: any) {
    if (receiverId === creator.id)
      throw new ConflictException("Conflicts between creater and receiver", {cause: new Error(), description: "creator cannot be receiver"})
    
    const receiver = await this.findOneById(receiverId)
    if (!receiver)
      throw new BadRequestException("User not found", {cause: new Error(), description: "cannot find receiver in database"})

    const friendRequestSent = await this.friendRequestRepository
      .createQueryBuilder('friendRequest')
      .leftJoinAndSelect('friendRequest.creator', 'creator')
      .leftJoinAndSelect('friendRequest.receiver', 'receiver')
      .where('friendRequest.creator = :creator', {creator: creator.id})
      .andWhere('friendRequest.receiver = :receiver', {receiver: receiverId})
      .getOne()

    const friendRequestReceived = await this.friendRequestRepository
      .createQueryBuilder('friendRequest')
      .leftJoinAndSelect('friendRequest.creator', 'creator')
      .leftJoinAndSelect('friendRequest.receiver', 'receiver')
      .where('friendRequest.creator = :creator', {creator: receiverId})
      .andWhere('friendRequest.receiver = :receiver', {receiver: creator.id})
      .getOne()

    if (!friendRequestSent && !friendRequestReceived)
      return res.status(200).send({status: 'undefined'})

    return res.status(200).send({status: friendRequestSent? friendRequestSent.status : friendRequestReceived.status})
  }


  async getFriendRequest(receiverId: string, creator: User, res: any) {
    if (receiverId === creator.id)
      throw new ConflictException("Conflicts between creater and receiver", {cause: new Error(), description: "creator cannot be receiver"})
    
    const receiver = await this.findOneById(receiverId)
    if (!receiver)
      throw new BadRequestException("User not found", {cause: new Error(), description: "cannot find receiver in database"})

    const friendRequestSent = await this.friendRequestRepository
      .createQueryBuilder('friendRequest')
      .leftJoinAndSelect('friendRequest.creator', 'creator')
      .leftJoinAndSelect('friendRequest.receiver', 'receiver')
      .where('friendRequest.creator = :creator', {creator: creator.id})
      .andWhere('friendRequest.receiver = :receiver', {receiver: receiverId})
      .getOne()

    const friendRequestReceived = await this.friendRequestRepository
      .createQueryBuilder('friendRequest')
      .leftJoinAndSelect('friendRequest.creator', 'creator')
      .leftJoinAndSelect('friendRequest.receiver', 'receiver')
      .where('friendRequest.creator = :creator', {creator: receiverId})
      .andWhere('friendRequest.receiver = :receiver', {receiver: creator.id})
      .getOne()
    

    if (!friendRequestSent && !friendRequestReceived)
      return res.status(200).send({status: 'undefined'})
    

    return res.status(200).send(
      {
        status: friendRequestSent?.status? friendRequestSent.status : friendRequestReceived.status,
        isCreator: friendRequestSent?.status ? true : false,
        id: friendRequestSent?.id? friendRequestSent.id : friendRequestReceived.id,
      })
  }

  async getFriendRequestById(friendRequestId: number) {
    return await this.friendRequestRepository
      .createQueryBuilder('friendRequest')
      .leftJoinAndSelect('friendRequest.creator', 'creator')
      .leftJoinAndSelect('friendRequest.receiver', 'receiver')
      .where('friendRequest.id = :id', {id: friendRequestId})
      .getOne()
  }

  async respondToFriendRequest(friendRequestId: number, status: FriendRequestStatus, res: any) {
    const friendRequest = await this.getFriendRequestById(friendRequestId)
    if (!friendRequest)
      throw new BadRequestException('Database error', {cause: new Error(), description: 'cannot find friend request'})

    if (friendRequest.status !== "pending")
      throw new ConflictException('Friend request status', {cause: new Error(), description: 'friend request has already been responded'})

    if (!["accepted", "pending"].includes(status))
      throw new BadRequestException('Invalid status', {cause: new Error(), description: 'status should be "accepted", "pending"'})


    const newFriendRequest = await this.friendRequestRepository.save({...friendRequest, status: status})
    if (!newFriendRequest)
      throw new InternalServerErrorException('Database error', {cause: new Error(), description: 'cannot update friend request'})
    
      return res.status(200).send(newFriendRequest)
  }

  async removeFriend(friendRequestId: number, res: any) {
    const friendRequest = await this.getFriendRequestById(friendRequestId)
    if (!friendRequest)
      throw new BadRequestException('Database error', {cause: new Error(), description: 'cannot find friend request'})

    await this.friendRequestRepository.remove(friendRequest)
    return res.status(200).send(friendRequest)
  }

  async getFriendRequestFromRecipients(user: User, res:any) {
    const friendRequests = await this.friendRequestRepository
      .createQueryBuilder('friendRequest')
      .leftJoinAndSelect('friendRequest.creator', 'creator')
      .leftJoinAndSelect('friendRequest.receiver', 'receiver')
      .where('friendRequest.receiver = :receiver', {receiver: user.id})
      .getMany()

    if (!friendRequests)
      throw new NotFoundException('Friend requests', {cause: new Error(), description: `cannot find any friend requests for user ${user.id}`})
    
    return res.status(200).send(friendRequests)
  }

  async getFriendRequestFromSender(user: User, res:any) {
    const friendRequests = await this.friendRequestRepository
      .createQueryBuilder('friendRequest')
      .leftJoinAndSelect('friendRequest.creator', 'creator')
      .leftJoinAndSelect('friendRequest.receiver', 'receiver')
      .where('friendRequest.creator = :creator', {creator: user.id})
      .getMany()

    if (!friendRequests)
      throw new NotFoundException('Friend requests', {cause: new Error(), description: `cannot find any friend requests for user ${user.id}`})
    
    return res.status(200).send(friendRequests)
  }


  async getFriends(user: User, res:any) {
    const friends = await this.friendRequestRepository
      .createQueryBuilder('friendRequest')
      .leftJoinAndSelect('friendRequest.creator', 'creator')
      .leftJoinAndSelect('friendRequest.receiver', 'receiver')
      .where(subQuery => {
        subQuery.where('friendRequest.creator = :creator', {creator: user.id})
        subQuery.orWhere('friendRequest.receiver = :receiver', {receiver: user.id})
      })
      .where('friendRequest.status = :status', {status: 'accepted'})
      .getMany()
    
    if (!friends)
      throw new NotFoundException('Friend requests', {cause: new Error(), description: `cannot find any friends for user ${user.id}`})
    
    return res.status(200).send(friends)
  }


  async isFriend(targetUserId: string, originalUser:User, res: any) {
    if (targetUserId === originalUser.id)
      throw new ConflictException("Conflicts between target user and original user", {cause: new Error(), description: "a user cannot be his own friend"})

    const targetUser = await this.findOneById(targetUserId)
    if (!targetUser)
      throw new BadRequestException("User not found", {cause: new Error(), description: "cannot find target user in database"})

    const sendRequest = await this.friendRequestRepository
      .createQueryBuilder('friendRequest')
      .leftJoinAndSelect('friendRequest.creator', 'creator')
      .leftJoinAndSelect('friendRequest.receiver', 'receiver')
      .where('friendRequest.creator = :creator', {creator: targetUser.id})
      .andWhere('friendRequest.receiver = :receiver', {receiver: originalUser.id})
      .getOne()
    
    const receivedRequest = await this.friendRequestRepository
      .createQueryBuilder('friendRequest')
      .leftJoinAndSelect('friendRequest.creator', 'creator')
      .leftJoinAndSelect('friendRequest.receiver', 'receiver')
      .where('friendRequest.creator = :creator', {creator: originalUser.id})
      .andWhere('friendRequest.receiver = :receiver', {receiver: targetUser.id})
      .getOne()
    
    return res.status(200).send({isFriend: sendRequest?.status === 'accepted' || receivedRequest?.status === 'accepted'})

  }

}
