import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersDto3 } from 'src/dto/users';
import { Users } from 'src/entities/users';
import { Repository } from 'typeorm';
import { achievementsService } from 'src/achievements/achievements.service';
import { AdminService } from 'src/admin/admin.service';
import { BanService } from 'src/ban/ban.service';
import { BlockService } from 'src/block/block.service';
import { DmStoreService } from 'src/dm-store/dm-store.service';
import { FriendService } from 'src/friend/friend.service';
import { MatchService } from 'src/match/match.service';
import { MuteService } from 'src/mute/mute.service';
import { err0, err2, err21, err22, err23 } from 'src/err';
import { ErrMsgDto } from 'src/dto/utility';
import { GlobalService } from 'src/global/global.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users) private usersRepo: Repository<Users>,
    private achievementsService: achievementsService,
    private adminService: AdminService,
    private banService: BanService,
    private blockService: BlockService,
    private dmStoreService: DmStoreService,
    private friendService: FriendService,
    private matchService: MatchService,
    private muteService: MuteService,
    private globalService: GlobalService,
    ){}

  async createUsers(user_id: string, nick: string, avatar_url: string, email: string){
    if (await this.usersRepo.count({user_id: user_id}))  // 이미 존재하는 유저 이면
      return new ErrMsgDto(err2);
    if (await this.usersRepo.count({nick: nick}))  // 중복된 닉네임 이면
      return new ErrMsgDto(err22);
    await this.usersRepo.save({user_id: user_id, nick: nick, avatar_url: avatar_url, two_factor_login: false, email: email})
    return new ErrMsgDto(err0);
  }

  async readUsers(search: string, type: string){
    let user;
    if (type == 'nick'){  // 닉네임으로 검색시
      if (await this.usersRepo.count({nick: search}) === 0)  // 찾으려는 닉네임이 없으면
        return new ErrMsgDto(err21);;
      user = await this.usersRepo.findOne({nick: search});
    }
    else if (type == 'user_id'){  // 유저 아이디로 검색시
      if (await this.usersRepo.count({user_id: search}) === 0)  // 존재하지 않는 유저 이면
        return new ErrMsgDto(err2);
      user = await this.usersRepo.findOne({user_id: search});
    }
    // 유저의 아이디, 닉네임, 아바타 url, 총 게임수, 이긴 게임수, 진 게임수, 래더점수, 유저의 상태 데이터 배열을 profile에 담기
    let profile = new UsersDto3;
    profile.user_id = user.user_id;
    profile.nick = user.nick;
    profile.avatar_url = user.avatar_url;
    profile.total_games = user.total_games;
    profile.win_games = user.win_games;
    profile.loss_games = user.loss_games;
    profile.ladder_level = user.ladder_level;
    profile.status = user.status;
    profile.admin = user.admin;
    return profile;
  }

  async updateUsers(user_id: string, nick: string, avatar_url: string){
    if (await this.usersRepo.count({user_id: user_id}) === 0)  // 존재하지 않는 유저 이면
      return new ErrMsgDto(err2);
    if (await this.usersRepo.count({nick: nick})) {
      return new ErrMsgDto(err22);
    }
    await this.usersRepo.save({user_id: user_id, nick: nick, avatar_url: avatar_url});
    return new ErrMsgDto(err0);
  }

  async updateStatus(user_id: string, status: string){
    if (await this.usersRepo.count({user_id: user_id}) === 0)  // 존재하지 않는 유저 이면
      return new ErrMsgDto(err2);
    if (status != 'online' && status != 'offline' && status != 'ongame')  // 잘못된 유저 상태 라면
      return new ErrMsgDto(err23);
    await this.globalService.emitStatusToOnlineFriends(status, user_id);
    await this.usersRepo.save({user_id: user_id, status: status});
    return new ErrMsgDto(err0);
  }

  async deleteUsers(user_id: string){
    if (await this.usersRepo.count({user_id: user_id}) === 0)  // 존재하지 않은 유저이면
      return new ErrMsgDto(err2);
    await this.achievementsService.deleteAllAchievements(user_id);
    await this.adminService.deleteAllAdmin(user_id);
    await this.banService.deleteBan(user_id);
    await this.blockService.deleteAllBlock(user_id);
    await this.dmStoreService.deleteDmStore(user_id);
    await this.friendService.deleteAllFriend(user_id);
    await this.matchService.deleteMatch(user_id);
    await this.muteService.deleteMute(user_id);
    await this.usersRepo.delete({user_id: user_id});
    return new ErrMsgDto(err0);
  }

  async getAvatarUrl(user_id: string) {
    const user = await this.usersRepo.findOne({user_id: user_id});
    if (user) {
      return (user.avatar_url);
    } else {
      throw (`err2 | ${user_id}`);
    }
  }

  async getUserInfo(user_id: string) {
    const user_info = await this.usersRepo.find({user_id: user_id});
    if (user_info.length == 0) {
      throw new ErrMsgDto(err2);
    }
    return user_info[0];
  }

  async getUserInfoWithNick(user_nick: string) {
    const user_info = await this.usersRepo.findOne({nick: user_nick});
    if (!user_info) {
      throw (`존재하지 않는 닉네임 입니다. | ${user_nick}`);
    }
    return user_info;
  }

  // 유저의 db에 저장된 avatar_url을 업데이트
  async updateUserAvatar(user_id: string, avatar_url: string) {
    await this.usersRepo.update({user_id: user_id}, {avatar_url: avatar_url})
  }
}
