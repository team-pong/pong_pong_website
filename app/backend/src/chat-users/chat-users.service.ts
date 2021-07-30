import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatService } from 'src/chat/chat.service';
import { Chat } from 'src/entities/chat';
import { ChatUsers } from 'src/entities/chat-users';
import { Users } from 'src/entities/users';
import { Repository } from 'typeorm';

@Injectable()
export class ChatUsersService {
  constructor(
    private chatService: ChatService,
    @InjectRepository(ChatUsers) private chatUsersRepo: Repository<ChatUsers>,
    @InjectRepository(Users) private usersRepo: Repository<Users>,
    @InjectRepository(Chat) private chatRepo: Repository<Chat>,
    ){}

  async createChatUsers(user_id: string, channel_id: number){
    if (await this.usersRepo.count({user_id: user_id}) === 0)  // 존재하지 않은 유저 라면
      return false;
    if (await this.chatRepo.count({channel_id: channel_id}) === 0)  // 존재하지 않은 채널 이라면
      return false;
    if (await this.chatUsersRepo.count({user_id: user_id}))  // 다른 채널에 유저가 있다면
      return false;
    await this.chatUsersRepo.save({user_id: user_id, channel_id: channel_id})
    return true;
  }

  async readChatUsers(channel_id: number){
    const users = await this.chatUsersRepo.find({channel_id: channel_id});  // 해당 채널의 유저들 검색
    let chatUsers = { chatUsers: Array<string>() };
    for(var i in users)
      chatUsers.chatUsers[i] = users[i].user_id;
    return chatUsers;
  }

  async deleteChatUsers(user_id: string, channel_id: number){
    if (await this.usersRepo.count({user_id: user_id}) === 0)  // 존재하지 않은 유저 라면
      return false;
    if (await this.chatRepo.count({channel_id: channel_id}) === 0)  // 존재하지 않은 채널 이라면
      return false;
    if (await this.chatUsersRepo.count({ user_id: user_id, channel_id: channel_id }) === 0)  // 유저가 해당 채널에 없다면
      return false;
    await this.chatUsersRepo.delete({ user_id: user_id, channel_id: channel_id });
    if (await this.chatUsersRepo.count({channel_id: channel_id}) === 0)  // 해당 채널에 아무도 없다면
      await this.chatRepo.delete({channel_id: channel_id});
    else{  // 채널에 누군가가 남아있다면
      const owner = await this.chatRepo.find({owner_id: user_id});  // 해당 채널의 owner
      if (owner[0].owner_id == user_id){  // 나간 사람이 owner이라면
        const newOwner = await this.chatUsersRepo.findOne({channel_id: channel_id});  // 채널에 남은 인원중 아무나 뽑기
        await this.chatService.updateOwner(channel_id, newOwner.user_id);  // owner 변경
      }
    }
    return true;
  }  
}
