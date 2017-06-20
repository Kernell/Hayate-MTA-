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

import { ConsoleCommand } from "./ConsoleCommand";

export class Login extends ConsoleCommand
{
	constructor()
	{
		super();

		this.Name = "login";
	}

	public Execute( player : PlayerInterface, args : any[] ) : Promise< any >
	{
		if( args.length < 2 )
		{
			throw new Exception( "Syntax: /login [email] [password]" );
		}

		let login = args.shift();
		let pass  = args.shift();

		Event.Call( "playerTryLogin", player, login, pass );

		return null;
	}
}
