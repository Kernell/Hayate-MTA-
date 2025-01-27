﻿/*********************************************************
*
*  Copyright © 2017, Raybit Games.
*
*  All Rights Reserved.
*
*  Redistribution and use in source and binary forms,
*  with or without modification,
*  is permitted only for authors.
*
*********************************************************/

import * as Config                from "nconf";
import * as Entity                from "Entity";
import * as Packets               from "Network/Packets";
import { Server }                 from "Server";
import { PlayerService }          from "Services/PlayerService";
import { DatabaseService }        from "Services/DatabaseService";

export class PlayerLogic
{
	public static async CheckName( connection : IConnection, name : string ) : Promise< any >
	{
		let result = await PlayerService.CheckName( name );

		connection.Send( new Packets.Server.CharacterNameCheckResult( name, result ) );
	}

	public static async PlayerSelected( connection : IConnection, playerId : number ) : Promise< any >
	{
		connection.Player = connection.Account.Players.find( player => player.GetID() == playerId );

		if( connection.Player == null )
		{
			throw new Error( "Invalid player id " + playerId );
		}

		connection.Player.Connection = connection;

		await Server.PlayerService.InitPlayer( connection.Player as Entity.Player );

		connection.Send( new Packets.Server.CharacterInit( connection.Player as Entity.Player ) );

		//Server.QuestLogic.ResendQuestData( connection.Player );
	}

	public static async RemovePlayer( connection : IConnection, playerId : number ) : Promise< any >
	{
		let player = connection.Account.Players.find( player => player.GetID() == playerId ) as Entity.Player;

		if( player == null )
		{
			throw new Error( "Invalid player id " + playerId );
		}

		player.Delete();

		DatabaseService.GetRepository( Entity.Player ).persist( player );

		Server.PartyService.Leave( player );
		//Server.GuildService.LeaveGuild( player, player.GetGuild() );

		connection.Account.Players.remove( player );

		connection.Send( new Packets.Server.CharacterDelete() );
	}
	
	public static async CreateCharacter( connection : IConnection, name : string ) : Promise< any >
	{
		if( !connection.Account.IsGranted( Permission.UnlimitedCharacters ) )
		{
			if( connection.Account.Players.length > Config.get( "characters:max_per_user" ) )
			{
				connection.Send( new Packets.Server.CharacterCreateResult( PlayerCreateResult.CharacterLimit ) );

				return;
			}
		}

		let result = await PlayerService.CheckName( name );

		if( result != PlayerNameCheckResult.Ok )
		{
			connection.Send( new Packets.Server.CharacterCreateResult( PlayerCreateResult.NameCheckFailed ) );

			return;
		}
	
		Server.PlayerService.CreateCharacter( connection, name );
	
		connection.Send( new Packets.Server.CharacterCreateResult( PlayerCreateResult.Ok ) );
	}

	public static async CharacterList( connection : IConnection ) : Promise< void >
	{
		connection.Send( new Packets.Server.CharacterList( connection ) );
	}
	
	public static PlayerEnterWorld( connection : IConnection ) : void
	{
		let player = connection.Player as Entity.Player;

		//Server.MapService.PlayerEnterWorld( player );
		Server.PlayerService.PlayerEnterWorld( player );
		//Server.ControllerService.PlayerEnterWorld( player );

		Server.PartyService.Update( player.Party );
		//Server.GuildService.OnPlayerEnterWorld( player );

		//Server.DuelService.PlayerLeaveWorld( player );
	}

	public static PlayerEndGame( connection : IConnection, player : Entity.Player ) : void
    {
        if( player == null )
		{
			return;
		}

		Server.PlayerService.PlayerEndGame( player );
        //Server.MapService.PlayerLeaveWorld( player );
        //Server.ControllerService.PlayerEndGame( player );

        Server.PartyService.Update( player.Party );

        //Server.DuelService.PlayerLeaveWorld( player );
    }

	public static ProcessChatMessage( connection : IConnection, message : string, type : ChatType ) : void
    {
		message = message
			.replace( /&/g, "&amp;" )
			.replace( />/g, "&gt;" )
			.replace( /</g, "&lt;" )
			.replace( /"/g, "&quot;" )
			.replace( /'/g, "&#039;" );

        if( Server.AdminLogic.ProcessChatMessage( connection, message ) )
		{
            return;
		}

        Server.ChatService.ProcessMessage( connection, message, type );
    }

	public static LevelUp( player : Entity.Player ) : void
	{
         Server.VisibleService.SendPacket( player, new Packets.Server.CharacterLevelUp( player ) );
		// StatsService.UpdateStats( player );
		// QuestEngine.PlayerLevelUp( player );
	}
}
