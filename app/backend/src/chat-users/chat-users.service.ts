import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ErrMsgDto } from 'src/dto/utility';
import { Admin } from 'src/entities/admin';
import { Chat } from 'src/entities/chat';
import { ChatUsers } from 'src/entities/chat-users';
import { Users } from 'src/entities/users';
import { err0, err13, err2, err4, err9 } from 'src/err';
import { Repository } from 'typeorm';
import axios from 'axios';
import { UsersDto3 } from 'src/dto/users';
import { UsersService } from 'src/users/users.service';
import { ChatService } from 'src/chat/chat.service';
import { Ban } from 'src/entities/ban';
import { Mute } from 'src/entities/mute';

@Injectable()
export class ChatUsersService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    @Inject(forwardRef(() => ChatService))
    private chatService: ChatService,
    @InjectRepository(ChatUsers) private chatUsersRepo: Repository<ChatUsers>,
    @InjectRepository(Users) private usersRepo: Repository<Users>,
    @InjectRepository(Chat) private chatRepo: Repository<Chat>,
    @InjectRepository(Admin) private adminRepo: Repository<Admin>,
    @InjectRepository(Ban) private banRepo: Repository<Ban>,
    @InjectRepository(Mute) private muteRepo: Repository<Mute>,
    ){}

  async createChatUsers(user_id: string, channel_id: number){
    if (await this.usersRepo.count({user_id: user_id}) === 0)  // 존재하지 않은 유저 라면
      return new ErrMsgDto(err2);
    if (await this.chatRepo.count({channel_id: channel_id}) === 0)  // 존재하지 않은 채널 이라면
      return new ErrMsgDto(err4);
    if (await this.chatUsersRepo.count({user_id: user_id}))  // 다른 채널에 유저가 있다면
      return new ErrMsgDto(err9);
    await this.chatUsersRepo.save({user_id: user_id, channel_id: channel_id})
    return new ErrMsgDto(err0);
  }

  async readChatUsers(channel_id: number){
    if (await this.chatRepo.count({channel_id: channel_id}) === 0)  // 존재하지 않은 채널 이라면
      return new ErrMsgDto(err4);
    const users = await this.chatUsersRepo.find({channel_id: channel_id});  // 해당 채널의 유저들 검색
    
    let chatUsersList; 
    chatUsersList = { chatUsersList: Array<UsersDto3>() };
    for(var i in users)
      chatUsersList.chatUsersList[i] = await this.usersService.readUsers(users[i].user_id, 'user_id');
    return chatUsersList;

    // let chatUsersList = { chatUsersList: Array<string>() };
    // for(var i in users)
    //   chatUsersList.chatUsersList[i] = users[i].user_id;
    // return chatUsersList;
  }

  async deleteChatUsers(user_id: string, channel_id: number){
    if (await this.usersRepo.count({user_id: user_id}) === 0)  // 존재하지 않은 유저 라면
      return new ErrMsgDto(err2);
    if (await this.chatRepo.count({channel_id: channel_id}) === 0)  // 존재하지 않은 채널 이라면
      return new ErrMsgDto(err4);
    if (await this.chatUsersRepo.count({ user_id: user_id, channel_id: channel_id }) === 0)  // 유저가 해당 채널에 없다면
      return new ErrMsgDto(err13);
    await this.chatUsersRepo.delete({ user_id: user_id, channel_id: channel_id });
    if (await this.adminRepo.count({user_id: user_id, channel_id: channel_id}))  // 나간 유저가 admin 이면
      await this.adminRepo.delete({user_id: user_id, channel_id: channel_id});
    if (await this.chatUsersRepo.count({channel_id: channel_id}) === 0)  // 해당 채널에 아무도 없다면
      await this.chatRepo.delete({channel_id: channel_id});
    else{  // 채널에 누군가가 남아있다면
      const channel = await this.chatRepo.findOne({channel_id: channel_id});
      if (channel.owner_id == user_id){  // 나간 사람이 owner이라면
        const newOwner = await this.chatUsersRepo.findOne({channel_id: channel_id});  // 채널에 남은 인원중 아무나 뽑기
        await this.chatService.updateOwner(channel_id, newOwner.user_id);
        // await axios.post(`${process.env.BACKEND_SERVER_URL}/chat/owner`, {channel_id: channel_id, owner_id: newOwner.user_id}) // owner변경
      }
    }
    return new ErrMsgDto(err0);
  }

  async addUser(room_id: string, user_id: string) {
    if (await this.usersRepo.count({user_id: user_id}) === 0)  // 존재하지 않은 유저 라면
      throw new ErrMsgDto(err2);
    if (await this.chatRepo.count({channel_id: Number(room_id)}) === 0)  // 존재하지 않은 채널 이라면
      throw new ErrMsgDto(err4);
    await this.chatUsersRepo.save({user_id: user_id, channel_id: Number(room_id)});
  }

  async deleteUser(room_id: string, user_id: string) {
    const rid = Number(room_id);
    if (await this.usersRepo.count({user_id: user_id}) === 0)  // 존재하지 않은 유저 라면
      throw new ErrMsgDto(err2);
    if (await this.chatRepo.count({channel_id: rid}) === 0)  // 존재하지 않은 채널 이라면
      throw new ErrMsgDto(err4);
    if (await this.chatUsersRepo.count({ user_id: user_id, channel_id: rid }) === 0)  // 유저가 해당 채널에 없다면
      throw new ErrMsgDto(err13);
    await this.chatUsersRepo.delete({ user_id: user_id, channel_id: rid }); // 목록에서 제거
    if (await this.adminRepo.count({user_id: user_id, channel_id: rid}))  // 나간 유저가 admin 이면
      await this.adminRepo.delete({user_id: user_id, channel_id: rid}); // 어드민 테이블에서 제거
  }

  async getUserState(user_id: string, room_id: number) {
    const ban = await this.banRepo.count({user_id: user_id, channel_id: room_id});
    const mute = await this.muteRepo.count({user_id: user_id, channel_id: Number(room_id)});
    if (ban) {
      return 'ban';
    } else if (mute) {
      return 'mute';
    } else {
      return 'normal';
    }
  }

  async getUserPosition(user_id: string, room_id: string) {
    const admin = await this.adminRepo.count({user_id: user_id, channel_id: Number(room_id)});
    const owner = await this.chatRepo.count({owner_id: user_id, channel_id: Number(room_id)});
    if (admin) {
      return 'admin';
    } else if (owner) {
      return 'owner';
    } else {
      return 'normal';
    }
  }

  async getUserListInRoom(room_id: string) {
    // 채팅방에 접속해있는 유저 리스트 받아오기
    const rid = Number(room_id)
    // 1. 채팅방 정보 확인.
    if (await this.chatRepo.count({channel_id: rid}) === 0)  // 존재하지 않은 채널 이라면
      throw new ErrMsgDto(err4);
    const ret = []
    // 2. chat-user db에서 user_id 리스트 받아오기
    const users = await this.chatUsersRepo.find({channel_id: rid});  // 해당 채널의 유저들 검색
    // 3. user_id 리스트로 닉네임, 아바타, 채팅방에서의 계급 받아오기 (프론트에서 쓰기 편하게 데이터 )
    for (let user of users) {
      const user_info = await this.usersRepo.findOne({user_id: user.user_id});
      ret.push({
        nick: user_info.nick,
        avatar_url: user_info.avatar_url,
        position: await this.getUserPosition(user.user_id, room_id),
        state: await this.getUserState(user.user_id, Number(room_id)),
        status: user_info.status,
      })
    }
    return ret;
  }

  async getUserNumber(room_id: string) {
    const ret = await this.chatUsersRepo.count({channel_id: Number(room_id)});
    return (ret);
  }
}
