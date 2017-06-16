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

import * as printf        from "printf";
import * as Config        from "nconf";
import { ConsoleCommand } from "./ConsoleCommand";
import * as Entity        from "../Entity";

export class Vehicle extends ConsoleCommand
{
	constructor( server : ServerInterface )
	{
		super( server );

		this.Name       = "vehicle";
		this.Restricted = true;
	}

	private Option_spawn( player : PlayerInterface, option : string, args : any[] ) : void
	{
		let name = args.shift();

		let temp_max : number = Config.get( "vehicles:temp_max" );

		let id    : number = null;
		let model : number = mp.joaat( name );

		if( VehicleModel[ model ] == null )
		{
			throw new Error( "Модель с именем '" + name + "' не найдена" );
		}

		for( let i = -1; i > -temp_max; --i )
		{
			if( this.Server.VehicleManager.Get( i ) == null )
			{
				id = i;

				break;
			}
		}

		if( id == null )
		{
			throw new Error( "Недостаточно памяти для создания автомобиля" );
		}

		let rotation  = player.GetRotation();
		let position  = player.GetPosition().Offset( 2.5, rotation.Z );
		let dimension = player.GetDimension();
		let color     = new VehicleColor();
		let plate     = printf( "NULL %03d", -id );
		
		rotation.Z += 90.0;

		let vehicle = new Entity.Vehicle( model, position, rotation, dimension, color, plate );

		if( !vehicle.IsValid() )
		{
			throw new Error( "Internal server error" );
		}

		vehicle[ "id" ] = id;

		this.Server.VehicleManager.AddToList( vehicle );

		player.OutputChatBox( vehicle.GetName() + " создан, ID: " + vehicle.GetID() );
	}

	private Option_undefined( player : PlayerInterface, option : string, args : any[] )
	{
		player.OutputChatBox( "Syntax: /" + this.Name + " <option>" );
	}
}
