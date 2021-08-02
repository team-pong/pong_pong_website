import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersDto3 } from 'src/dto/users';
import { Users } from 'src/entities/users';
import { Repository } from 'typeorm';
import { AchivementsService } from 'src/achivements/achivements.service';
import { AdminService } from 'src/admin/admin.service';
import { BanService } from 'src/ban/ban.service';
import { BlockService } from 'src/block/block.service';
import { DmStoreService } from 'src/dm-store/dm-store.service';
import { FriendService } from 'src/friend/friend.service';
import { MatchService } from 'src/match/match.service';
import { MuteService } from 'src/mute/mute.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users) private usersRepo: Repository<Users>,
    private achivementsService: AchivementsService,
    private adminService: AdminService,
    private banService: BanService,
    private blockService: BlockService,
    private dmStoreService: DmStoreService,
    private friendService: FriendService,
    private matchService: MatchService,
    private muteService: MuteService,
    ){}

  async createUsers(user_id: string, nick: string, avatar_url: string){
    if (await this.usersRepo.count({user_id: user_id}))  // 이미 존재하는 유저 이면
      return false;
    if (await this.usersRepo.count({nick: nick}))  // 중복된 닉네임 이면
      return false;
    await this.usersRepo.save({user_id: user_id, nick: nick, avatar_url: avatar_url})
    return true;
  }

  async readUsers(search: string, type: string){
    let user;
    if (type == 'nick')  // 닉네임으로 검색시
      user = await this.usersRepo.findOne({nick: search});
    else if (type == 'user_id')  // 유저 아이디로 검색시
      user = await this.usersRepo.findOne({user_id: search});
    // 유저의 아이디, 닉네임, 아바타 url, 총 게임수, 이긴 게임수, 진 게임수, 래더점수, 유저의 상태 데이터 배열을 profile에 담기
    let profile: UsersDto3;
    profile.user_id = user.user_id;
    profile.nick = user.nick;
    profile.avatar_url = user.avatar_url;
    profile.total_games = user.total_games;
    profile.win_games = user.win_games;
    profile.loss_games = user.loss_games;
    profile.ladder_level = user.ladder_level;
    profile.status = user.status;
    return profile;
  }

  async updateUsers(user_id: string, nick: string, avatar_url: string){
    if (await this.usersRepo.count({user_id: user_id}) === 0)  // 존재하지 않는 유저 이면
      return false;
    if (await this.usersRepo.count({nick: nick}))  // 중복된 닉네임 이면
      return false;
    await this.usersRepo.save({user_id: user_id, nick: nick, avatar_url: avatar_url});
    return true;
  }

  async deleteUsers(user_id: string){
    if (await this.usersRepo.count({user_id: user_id}) === 0)  // 존재하지 않은 유저이면
      return false;
    await this.achivementsService.deleteAllAchievements(user_id);
    await this.adminService.deleteAdmin(user_id);
    await this.banService.deleteBan(user_id);
    await this.blockService.deleteAllBlock(user_id);
    await this.dmStoreService.deleteDmStore(user_id);
    await this.friendService.deleteAllFriend(user_id);
    await this.matchService.deleteMatch(user_id);
    await this.muteService.deleteMute(user_id);
    await this.usersRepo.delete({user_id: user_id});
    return true;
  }
}
