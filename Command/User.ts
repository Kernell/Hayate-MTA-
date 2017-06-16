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

export class User extends ConsoleCommand
{
	constructor( server : ServerInterface )
	{
		super( server );

		this.Name       = "user";
		this.Restricted = true;
	}

	public Execute( player : PlayerInterface, args : any[] ) : Boolean
	{
		Console.WriteLine( Console.FgMagenta + "[%s] entered command /%s with args: %s" + Console.Reset, player.GetName(), this.GetName(), args.join( ', ' ) );

		return true;
	}
}
