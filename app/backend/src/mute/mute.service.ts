import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Bool, ErrMsgDto } from 'src/dto/utility';
import { Admin } from 'src/entities/admin';
import { Chat } from 'src/entities/chat';
import { ChatUsers } from 'src/entities/chat-users';
import { Mute } from 'src/entities/mute';
import { Users } from 'src/entities/users';
import { err0, err13, err14, err2, err20, err4} from 'src/err';
import { Repository } from 'typeorm';

@Injectable()
export class MuteService {
  constructor(
    @InjectRepository(Mute) private muteRepo: Repository<Mute>,
    @InjectRepository(Users) private usersRepo: Repository<Users>,
    @InjectRepository(Chat) private chatRepo: Repository<Chat>,
    @InjectRepository(ChatUsers) private chatUsersRepo: Repository<ChatUsers>,
    @InjectRepository(Admin) private adminRepo: Repository<Admin>,    
    ){}

  async createMute(user_id: string, channel_id: number){
    if (await this.muteRepo.count({user_id: user_id, channel_id: channel_id}))  // 이미 해당 채널의 mute 라면
      return new ErrMsgDto(err20);
    if (await this.usersRepo.count({user_id: user_id}) === 0)  // 존재하지 않은 유저 라면
      return new ErrMsgDto(err2);
    if (await this.chatRepo.count({channel_id: channel_id}) === 0)  // 존재하지 않은 채널 이라면
      return new ErrMsgDto(err4);
    if (await this.chatUsersRepo.count({user_id: user_id, channel_id: channel_id}) === 0)  // 해당 채널에 유저가 없다면
      return new ErrMsgDto(err13);
    await this.muteRepo.save({user_id: user_id, channel_id: channel_id})
    return new ErrMsgDto(err0);
  }

  async isMute(user_id: string, channel_id: number){
    if (await this.usersRepo.count({user_id: user_id}) === 0)  // 존재하지 않은 유저 라면
      return new ErrMsgDto(err2);
    if (await this.chatRepo.count({channel_id: channel_id}) === 0)  // 존재하지 않은 채널 이라면
      return err4;
    if (await this.muteRepo.count({user_id: user_id, channel_id: channel_id}) === 0)  // mute 당하지 않았다면
      return new Bool(false);
    const mute = await this.muteRepo.find({user_id: user_id, channel_id: channel_id});
    const muteTime = mute[0].createdAt;
    muteTime.setSeconds(muteTime.getSeconds() + 60);
    if (muteTime < new Date()){  // mute 당한지 60초가 넘었으면
      await this.muteRepo.delete({user_id: user_id, channel_id: channel_id});
      return new Bool(false);
    }
    return new Bool(true);
  }

  async deleteMute(user_id: string){
    if (await this.usersRepo.count({user_id: user_id}) === 0)  // 존재하지 않은 유저 라면
      return new ErrMsgDto(err2);
    await this.muteRepo.delete({user_id: user_id});
    return new ErrMsgDto(err0);
  }

  // 특정 채널에서 뮤트 해제
  async unMute(user_id: string, room_id: number) {
    //console.log(`unmute query ${user_id}, ${room_id}`)
    await this.muteRepo.delete({user_id: user_id, channel_id: room_id});
  }
}