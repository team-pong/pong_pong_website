import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatDto2, ChatDto6 } from 'src/dto/chat';
import { ErrMsgDto } from 'src/dto/utility';
import { Admin } from 'src/entities/admin';
import { Chat } from 'src/entities/chat';
import { ChatUsers } from 'src/entities/chat-users';
import { Users } from 'src/entities/users';
import { err0, err10, err13, err15, err2, err24, err4, err6, err8, err9 } from 'src/err';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { ChatGateway } from './chat.gateway';
import * as crypto from 'crypto';

@Injectable()
export class ChatService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    @InjectRepository(Users) private usersRepo: Repository<Users>,
    @InjectRepository(Chat) private chatRepo: Repository<Chat>,
    @InjectRepository(ChatUsers) private chatUsersRepo: Repository<ChatUsers>,
    @InjectRepository(Admin) private adminRepo: Repository<Admin>,

    private chatGateway: ChatGateway,
    ){}

  async createChat(owner_id: string, title: string, type: string, passwd: string, max_people: number) {
    if (await this.usersRepo.count({user_id: owner_id}) === 0)  // 존재하지 않은 유저 라면
      return new ErrMsgDto(err2);
    if (type != 'public' && type != 'protected' && type != 'private')  // 존재하지 않은 방 타입이면
      return new ErrMsgDto(err6);
    if (type != 'protected' && passwd != '')  // 방타입이 protected가 아닌데 비밀번호가 있으면
      return new ErrMsgDto(err10);
    if (20 < max_people)  // 채널 최대 인원의 최대값 보다 크면
      return new ErrMsgDto(err15);
    let hashed_password = '';
    if (passwd) {
      hashed_password = crypto.createHash('sha256').update(passwd).digest('base64');
    }
    const newChat = await this.chatRepo.save({owner_id: owner_id, title: title, type: type, passwd: hashed_password, max_people: max_people, current_people: 1});
    await this.chatUsersRepo.save({channel_id: newChat.channel_id, user_id: owner_id})  // 새로만든 채널에 owner 추가

    let chatRoom = new ChatDto2();
    chatRoom.channel_id = newChat.channel_id;
    chatRoom.title = newChat.title;
    chatRoom.type = newChat.type;
    chatRoom.current_people = 1;
    chatRoom.max_people = newChat.max_people;
    return {chatRoom};
  }

  async readChat(){
    const chat = await this.chatRepo.find();  // 모든 채널
    let chatList = { chatList: Array<ChatDto2>() }
    let current_people;
    let idx = -1;
    // 모든 채널의 제목, 타입, 현재인원 ,최대인원, 채널아이디만 담기
    for(var i in chat){
      if (chat[i].type === 'private')  // private 채널이면
        continue ;
      chatList.chatList.push(new ChatDto2());
      chatList.chatList[++idx].title = chat[i].title;
      chatList.chatList[idx].type = chat[i].type;
      current_people = await this.readPeople(chat[i].channel_id);
      chatList.chatList[idx].current_people = current_people;
      chatList.chatList[idx].max_people = chat[i].max_people;
      chatList.chatList[idx].channel_id = chat[i].channel_id;
    }
    return chatList;
  }

  async readOneChat(channel_id: number){
    if (await this.chatRepo.count({channel_id: channel_id}) === 0)  // 존재하지 않은 채널이면
      return new ErrMsgDto(err4);
    const chanel = await this.chatRepo.find({channel_id: channel_id});  // 채널 찾기

    let chatRoom = new ChatDto6();
    chatRoom.title = chanel[0].title;
    chatRoom.type = chanel[0].type;
    chatRoom.passwd = chanel[0].passwd;
    chatRoom.max_people = chanel[0].max_people;
    let current_people;
    current_people = await this.readPeople(channel_id);
    chatRoom.current_people = current_people;
    let owner = await this.usersService.readUsers(chanel[0].owner_id, 'user_id');
    chatRoom.owner_nick = owner["nick"];
    chatRoom.channel_id = chanel[0].channel_id;
    return chatRoom;
  }


  async readTitle(title: string){
    const chat = await this.chatRepo.find();  // 모든 채널
    let chatList = { chatList: Array<ChatDto2>() }
    let current_people;
    let idx = -1;
    // 검색한 제목을 포함하는 채널의 제목, 타입, 현재인원, 최대인원, 채널아이디만 담기
    for(var i in chat){
      if ((chat[i].title.indexOf(title) == -1) || chat[i].type === 'private')  // 검색한 제목이 채널에 포함되지 않거나 private 채널이면
        continue ;
      chatList.chatList.push(new ChatDto2());
      chatList.chatList[++idx].title = chat[i].title;
      chatList.chatList[idx].type = chat[i].type;
      current_people = await this.readPeople(chat[i].channel_id);
      chatList.chatList[idx].current_people = current_people;
      chatList.chatList[idx].max_people = chat[i].max_people;
      chatList.chatList[idx].channel_id = chat[i].channel_id;
    }
    return chatList;
  }
  async readOwner(channel_id: number){
    if (await this.chatRepo.count({channel_id: channel_id}) === 0)  // 존재하지 않은 채널이면
      return new ErrMsgDto(err4);
    const chanel = await this.chatRepo.find({channel_id: channel_id});  // 채널 찾기
    
    return await this.usersService.readUsers(chanel[0].owner_id , 'user_id');
    // return chanel[0].owner_id; 
  }
  async readPeople(channel_id: number){
    if (await this.chatRepo.count({channel_id: channel_id}) === 0)  // 존재하지 않은 채널이면
      return new ErrMsgDto(err4);
    let people = await this.chatUsersRepo.count({channel_id: channel_id});
    return people;
  }

  async checkPasswd(channel_id: number, passwd: string){
    if (await this.chatRepo.count({channel_id: channel_id}) === 0)  // 존재하지 않은 채널이면
      return new ErrMsgDto(err4);
    
    const chanel = await this.chatRepo.findOne({channel_id: channel_id});  // 채널 찾기
    if (chanel.type != 'protected')  // 방타입이 protected가 아니면
      return new ErrMsgDto(err10);
    const hashed_password = crypto.createHash('sha256').update(passwd).digest('base64');
    if (chanel.passwd == hashed_password)
      return true;
    return false;
  }

  async updateChat(channel_id: number, title: string, type: string, passwd: string, max_people: number){
    if (type != 'public' && type != 'protected' && type != 'private')  // 존재하지 않은 방 타입이면
      return new ErrMsgDto(err6);
    if (type != 'protected' && passwd != '')  // 방타입이 protected가 아닌데 비밀번호가 있으면
      return new ErrMsgDto(err10);
    if (20 < max_people)  // 채널 최대 인원의 최대값 보다 크면
      return new ErrMsgDto(err15);
    if (await this.chatRepo.count({channel_id: channel_id}) === 0)  // 존재하지 않은 채널이면
      return new ErrMsgDto(err4);
    let current_people = await this.readPeople(channel_id);
    if (max_people < current_people)
      return new ErrMsgDto(err24);
    const hashed_password = crypto.createHash('sha256').update(passwd).digest('base64');
    // await this.chatRepo.save({channel_id: channel_id, title: title, type: type, passwd: hashed_password, max_people: max_people});
    await this.chatRepo.update({channel_id: channel_id} ,{title: title, type: type, passwd: hashed_password, max_people: max_people});
    return new ErrMsgDto(err0);
  }

  async updateOwner(channel_id: number, owner_id:string){
    if (await this.chatRepo.count({channel_id: channel_id}) === 0)  // 존재하지 않은 채널이면
      return new ErrMsgDto(err4);
    if (await this.usersRepo.count({user_id: owner_id}) === 0)  // 존재하지 않은 유저 라면
      return new ErrMsgDto(err2);
    if (await this.chatUsersRepo.count({channel_id: channel_id, user_id: owner_id}) === 0)  // 채널에 해당 유저가 없으면
      return new ErrMsgDto(err13);
    if (await this.adminRepo.count({user_id: owner_id}) != 0)  // owner가 되려는 유저가 admin 이면
      await this.adminRepo.delete({channel_id: channel_id, user_id: owner_id});
    // await this.chatRepo.save({channel_id: channel_id, owner_id: owner_id});
    await this.chatRepo.update(channel_id, {owner_id: owner_id});
    return new ErrMsgDto(err0);
  }

  async deleteChat(channel_id: number){
    if (await this.chatRepo.count({channel_id: channel_id}) === 0)  // 존재하지 않은 채널이면
      return new ErrMsgDto(err4);
    if (await this.chatUsersRepo.count({channel_id: channel_id}))  // 채널에 사람이 남아 있으면
      return new ErrMsgDto(err8);
    await this.chatRepo.delete({channel_id: channel_id});
    return new ErrMsgDto(err0);
  }

  async emitChat(channel_id: string, userId: string, chatContent: string) {
    const chat = {
      user: userId,
      chat: chatContent,
    };
    this.chatGateway.server.to(channel_id).emit('message', chat);
  }

  async getChannelInfo(channel_id: number){
    if (await this.chatRepo.count({channel_id: channel_id}) === 0)  // 존재하지 않은 채널이면
      throw new ErrMsgDto(err4);
    const chanel = await this.chatRepo.find({channel_id: channel_id});  // 채널 찾기

    let chatRoom = new ChatDto6();
    chatRoom.title = chanel[0].title;
    chatRoom.type = chanel[0].type;
    chatRoom.passwd = chanel[0].passwd;
    chatRoom.max_people = chanel[0].max_people;
    let current_people;
    current_people = await this.readPeople(channel_id);
    chatRoom.current_people = current_people;
    let owner = await this.usersService.readUsers(chanel[0].owner_id, 'user_id');
    chatRoom.owner_nick = owner["nick"];
    chatRoom.channel_id = chanel[0].channel_id;
    return chatRoom;
  }

  async getMaxNumber(room_id: string) {
    const channel = await this.chatRepo.findOne({channel_id: Number(room_id)});
    if (!channel) {
      throw err4;
    }
    return (channel.max_people);
  }
}