import { IsNotEmpty, IsString } from "class-validator";

type Map = '0' | '1' | '2';
export class GameMapDto {
	@IsString()
	@IsNotEmpty()
	map: Map;
}