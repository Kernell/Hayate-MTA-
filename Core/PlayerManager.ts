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

import * as Entity                       from "../Entity";
import ManagerBase                       from "./ManagerBase";
import DatabaseManager                   from "./DatabaseManager";

export default class PlayerManager extends ManagerBase< Entity.Player >
{
	constructor( server : ServerInterface )
	{
		super( server );

		this.Dependency = server.UserManager;

		this.WrapEvent( "playerJoin",     this.OnPlayerJoin );
		this.WrapEvent( "playerQuit",     this.OnPlayerQuit );
		this.WrapEvent( "playerDeath",    this.OnPlayerDeath );
		this.WrapEvent( "playerSpawn",    this.OnPlayerSpawn ); 
		this.WrapEvent( "playerChat",     this.OnPlayerChat );
	}

	public Init() : Promise< any >
	{
		return super.Init().then(
			() =>
			{
				for( let player of mp.players.toArray() )
				{
					this.OnPlayerJoin( Entity.Player.FindOrCreate< Entity.Player >( player ) );
				}
			}
		);
	}

	public Stop() : Promise< any >
	{
		return new Promise(
			( resolve, reject ) =>
			{
				for( let player of this.GetAll() )
				{
					this.OnPlayerQuit( player, "server stopped", "" );
				}

				resolve();
			}
		);
	}

	private async OnPlayerJoin( player : Entity.Player ) : Promise< any >
	{
		this.AddToList( player );

		player.OutputChatBox( "<span style='color: #FF8000;'>Use /login for sign in or /register to sign up</span>" );

		return null;
	}

	private async OnPlayerQuit( player : Entity.Player, reason : string, kickReason : string ) : Promise< any >
	{
		if( player.GetCharacter() != null )
		{
			Event.Call( "playerCharacterLogout", player, player.GetCharacter() );
		}

		this.RemoveFromList( player );

		player.Destroy();
	
		return null;
	}

	private async OnPlayerDeath( player : Entity.Player, reason : string, killer : Entity.Player ) : Promise< any >
	{
		const char = player.GetCharacter();

		if( char )
		{
			char.Spawn( new Vector3( -425.517, 1123.620, 325.8544 ), new Vector3(), 0 );
		}

		return null;
	}

	private async OnPlayerSpawn( player : Entity.Player ) : Promise< any >
	{
		return null;
	}

	private async OnPlayerChat( player : Entity.Player, text : string ) : Promise< any >
	{
		text = text
			.replace( /&/g, "&amp;" )
			.replace( />/g, "&gt;" )
			.replace( /</g, "&lt;" )
			.replace( /"/g, "&quot;" )
			.replace( /'/g, "&#039;" );

		const line = `<span style='color: #E4C1C0;'>[Мир] ${player.GetName()}: ${text}</span>`;

		for( let player of this.GetAll() )
		{
			player.OutputChatBox( line );
		}

		return null;
	}
}
