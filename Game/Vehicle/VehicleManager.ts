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

import * as ORM         from "typeorm";
import { Vehicle }      from "../../Entity/Vehicle";
import ManagerBase      from "../../Core/ManagerBase";
import DatabaseManager  from "../../Core/DatabaseManager";

export default class VehicleManager extends ManagerBase< Vehicle >
{
	private Repository : ORM.Repository< Vehicle > = null;

	constructor( server : ServerInterface )
	{
		super( server );

		this.Dependency = server.DatabaseManager;
	}

	public Init() : Promise< any >
	{
		return super.Init().then(
			async () =>
			{
				this.Repository = ( this.Dependency as DatabaseManager ).GetRepository( Vehicle );

				try
				{
					let vehicles = await this.Repository.find();

					for( let vehicle of vehicles )
					{
						vehicle.Create();
					}
				}
				catch( e )
				{
					console.log( e );
				}
			}
		);
	}
}