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

export class Entity extends IdentifiedPool implements EntityInterface
{
	public IsValid() : boolean
	{
		return this.entity != null;
	}

	public Destroy() : void
	{
		this.Dispose();
	}

	public GetID() : number
	{
		return this.entity.id;
	}

	public GetEntity() : mp.Entity
	{
		return this.entity;
	}

	public GetType() : string
	{
		return this.entity.type;
	}

	public GetModel() : number
	{
		return this.entity.model;
	}

	public SetModel( model : number ) : void
	{
		this.entity.model = model;
	}

	public GetAlpha() : number
	{
		return this.entity.alpha;
	}

	public SetAlpha( alpha : number ) : void
	{
		this.entity.alpha = alpha;
	}

	public GetPosition() : Vector3
	{
		let position = this.entity.position;

		return new Vector3( position.x, position.y, position.z );
	}

	public SetPosition( position : Vector3 ) : void
	{
		this.entity.position = position;
	}

	public GetRotation() : Vector3
	{
		let rotation = this.entity.rotation;

		return new Vector3( rotation.x, rotation.y, rotation.z );
	}

	public SetRotation( rotation : Vector3 ) : void
	{
		this.entity.rotation = rotation;
	}

	public GetDimension() : number
	{
		return this.entity.dimension;
	}

	public SetDimension( dimension : number ) : void
	{
		this.entity.dimension = dimension;
	}
}
