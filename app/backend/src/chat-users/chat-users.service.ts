import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatService } from 'src/chat/chat.service';
import { Admin } from 'src/entities/admin';
import { Chat } from 'src/entities/chat';
import { ChatUsers } from 'src/entities/chat-users';
import { Users } from 'src/entities/users';
import { err0, err2, err3, err4, err9 } from 'src/err';
import { Repository } from 'typeorm';

@Injectable()
export class ChatUsersService {
  constructor(
    private chatService: ChatService,
    @InjectRepository(ChatUsers) private chatUsersRepo: Repository<ChatUsers>,
    @InjectRepository(Users) private usersRepo: Repository<Users>,
    @InjectRepository(Chat) private chatRepo: Repository<Chat>,
    @InjectRepository(Admin) private adminRepo: Repository<Admin>,
    ){}

  async createChatUsers(user_id: string, channel_id: number){
    if (await this.usersRepo.count({user_id: user_id}) === 0)  // 존재하지 않은 유저 라면
      return err2;
    if (await this.chatRepo.count({channel_id: channel_id}) === 0)  // 존재하지 않은 채널 이라면
      return err4;
    if (await this.chatUsersRepo.count({user_id: user_id}))  // 다른 채널에 유저가 있다면
      return err9;
    await this.chatUsersRepo.save({user_id: user_id, channel_id: channel_id})
    return err0;
  }

  async readChatUsers(channel_id: number){
    if (await this.chatRepo.count({channel_id: channel_id}) === 0)  // 존재하지 않은 채널 이라면
      return err4;
    const users = await this.chatUsersRepo.find({channel_id: channel_id});  // 해당 채널의 유저들 검색
    let chatUsersList = { chatUsersList: Array<string>() };
    for(var i in users)
      chatUsersList.chatUsersList[i] = users[i].user_id;
    return chatUsersList;
  }

  async deleteChatUsers(user_id: string, channel_id: number){
    if (await this.usersRepo.count({user_id: user_id}) === 0)  // 존재하지 않은 유저 라면
      return err2;
    if (await this.chatRepo.count({channel_id: channel_id}) === 0)  // 존재하지 않은 채널 이라면
      return err4;
    if (await this.chatUsersRepo.count({ user_id: user_id, channel_id: channel_id }) === 0)  // 유저가 해당 채널에 없다면
      return err3;
    await this.chatUsersRepo.delete({ user_id: user_id, channel_id: channel_id });
    if (await this.adminRepo.count({user_id: user_id, channel_id: channel_id}))  // 나간 유저가 admin 이면
      await this.adminRepo.delete({user_id: user_id, channel_id: channel_id});
    if (await this.chatUsersRepo.count({channel_id: channel_id}) === 0)  // 해당 채널에 아무도 없다면
      await this.chatRepo.delete({channel_id: channel_id});
    else{  // 채널에 누군가가 남아있다면
      const owner = await this.chatRepo.find({owner_id: user_id});  // 해당 채널의 owner
      if (owner[0].owner_id == user_id){  // 나간 사람이 owner이라면
        const newOwner = await this.chatUsersRepo.findOne({channel_id: channel_id});  // 채널에 남은 인원중 아무나 뽑기
        await this.chatService.updateOwner(channel_id, newOwner.user_id);  // owner 변경
      }
    }
    return err0;
  }  
}
